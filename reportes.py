"""
routers/reportes.py — Endpoints de reportes y voluntariados
POST /reportes                        (ciudadano)
GET  /parques/{id}/reportes           (convenio)
PUT  /reportes/{id}/resolver          (convenio)
POST /voluntariados                   (convenio)
GET  /parques/{id}/voluntariados      (todos)
POST /voluntariados/{id}/inscribirse  (ciudadano)
GET  /mis-voluntariados               (ciudadano)
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
import os, secrets

from backend.database import get_db
from backend.models import VoluntariadoCreate
from backend.routers.auth import get_current_user, require_role

router = APIRouter(tags=["Reportes y Voluntariados"])

UPLOAD_DIR = "frontend/assets/img/reportes"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ── Crear reporte (ciudadano) ──────────────────────────
@router.post("/reportes", status_code=201)
async def crear_reporte(
    parque_id:    int   = Form(...),
    descripcion:  str   = Form(...),
    categoria:    str   = Form(...),
    intervencion: str   = Form(...),
    fotos:        List[UploadFile] = File(...),
    current_user: dict  = Depends(require_role("ciudadano"))
):
    if not fotos or fotos[0].filename == "":
        raise HTTPException(status_code=400, detail="Debes adjuntar al menos una fotografía")

    if len(fotos) > 3:
        fotos = fotos[:3]

    db         = get_db()
    cursor     = db.get_cursor()
    usuario_id = int(current_user["sub"])

    cursor.execute("""
        INSERT INTO reportes (parque_id, usuario_id, descripcion, categoria, intervencion)
        VALUES (%s, %s, %s, %s, %s)
    """, (parque_id, usuario_id, descripcion, categoria, intervencion))

    reporte_id = db.get_connection().cursor().lastrowid

    # Guardar fotos
    allowed = {"image/jpeg", "image/png", "image/webp"}
    for i, foto in enumerate(fotos):
        if foto.content_type not in allowed:
            continue
        ext      = foto.filename.rsplit(".", 1)[-1]
        filename = f"r{reporte_id}_{i+1}.{ext}"
        with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
            f.write(await foto.read())
        cursor.execute(
            "INSERT INTO reporte_fotos (reporte_id, ruta) VALUES (%s, %s)",
            (reporte_id, filename)
        )

    cursor.close()
    return {"mensaje": "Reporte enviado correctamente"}


# ── Ver reportes de un parque (convenio) ───────────────
@router.get("/parques/{parque_id}/reportes")
def get_reportes(
    parque_id: int,
    current_user: dict = Depends(require_role("convenio"))
):
    db     = get_db()
    cursor = db.get_cursor()

    # Pendientes: más antiguos primero
    cursor.execute("""
        SELECT r.*, u.nombre AS ciudadano_nombre,
               GROUP_CONCAT(f.ruta) AS fotos
        FROM reportes r
        JOIN usuarios u ON r.usuario_id = u.id
        LEFT JOIN reporte_fotos f ON f.reporte_id = r.id
        WHERE r.parque_id = %s AND r.estado = 'pendiente'
        GROUP BY r.id
        ORDER BY r.created_at ASC
    """, (parque_id,))
    pendientes = cursor.fetchall()

    # Resueltos: más recientes primero
    cursor.execute("""
        SELECT r.*, u.nombre AS ciudadano_nombre,
               GROUP_CONCAT(f.ruta) AS fotos
        FROM reportes r
        JOIN usuarios u ON r.usuario_id = u.id
        LEFT JOIN reporte_fotos f ON f.reporte_id = r.id
        WHERE r.parque_id = %s AND r.estado = 'resuelto'
        GROUP BY r.id
        ORDER BY r.resuelto_at DESC
        LIMIT 20
    """, (parque_id,))
    resueltos = cursor.fetchall()
    cursor.close()

    return {"pendientes": pendientes, "resueltos": resueltos}


# ── Resolver reporte (convenio) ────────────────────────
@router.put("/reportes/{reporte_id}/resolver")
def resolver_reporte(
    reporte_id: int,
    current_user: dict = Depends(require_role("convenio"))
):
    db           = get_db()
    cursor       = db.get_cursor()
    convenio_id  = int(current_user["sub"])

    cursor.execute("""
        UPDATE reportes SET estado = 'resuelto', resuelto_por = %s, resuelto_at = NOW()
        WHERE id = %s AND parque_id IN (
            SELECT id FROM parques WHERE convenio_id = %s
        )
    """, (convenio_id, reporte_id, convenio_id))

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Reporte no encontrado o sin permisos")

    cursor.close()
    return {"mensaje": "Reporte marcado como resuelto"}


# ── Crear voluntariado (convenio) ──────────────────────
@router.post("/voluntariados", status_code=201)
def crear_voluntariado(
    data: VoluntariadoCreate,
    current_user: dict = Depends(require_role("convenio"))
):
    db          = get_db()
    cursor      = db.get_cursor()
    convenio_id = int(current_user["sub"])
    token       = secrets.token_urlsafe(32)

    cursor.execute("""
        INSERT INTO voluntariados
        (parque_id, convenio_id, titulo, descripcion, fecha, hora,
         duracion_horas, cupos_total, cupos_disponibles, edad_minima, tipo_actividad, token_enlace)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        data.parque_id, convenio_id, data.titulo, data.descripcion,
        data.fecha, data.hora, data.duracion_horas,
        data.cupos_total, data.cupos_total,
        data.edad_minima, data.tipo_actividad, token
    ))
    cursor.close()
    return {"mensaje": "Voluntariado publicado exitosamente", "token_enlace": token}


# ── Ver voluntariados de un parque ─────────────────────
@router.get("/parques/{parque_id}/voluntariados")
def get_voluntariados(parque_id: int, _: dict = Depends(get_current_user)):
    db     = get_db()
    cursor = db.get_cursor()
    cursor.execute("""
        SELECT v.*, u.razon_social, u.nombre AS convenio_nombre
        FROM voluntariados v
        JOIN usuarios u ON v.convenio_id = u.id
        WHERE v.parque_id = %s AND v.estado = 'activo' AND v.fecha >= CURDATE()
        ORDER BY v.fecha ASC
    """, (parque_id,))
    voluntariados = cursor.fetchall()
    cursor.close()
    return voluntariados


# ── Inscribirse a voluntariado (ciudadano) ─────────────
@router.post("/voluntariados/{vol_id}/inscribirse", status_code=201)
def inscribirse(
    vol_id: int,
    current_user: dict = Depends(require_role("ciudadano"))
):
    db         = get_db()
    cursor     = db.get_cursor()
    usuario_id = int(current_user["sub"])

    # Obtener voluntariado
    cursor.execute(
        "SELECT * FROM voluntariados WHERE id = %s AND estado = 'activo' AND fecha >= CURDATE()",
        (vol_id,)
    )
    vol = cursor.fetchone()
    if not vol:
        raise HTTPException(status_code=404, detail="Voluntariado no encontrado o ya finalizó")

    if vol["cupos_disponibles"] <= 0:
        raise HTTPException(status_code=400, detail="No hay cupos disponibles")

    # Verificar si ya está inscrito
    cursor.execute(
        "SELECT id FROM inscripciones WHERE voluntariado_id = %s AND usuario_id = %s",
        (vol_id, usuario_id)
    )
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Ya estás inscrito en este voluntariado")

    # Insertar inscripción y decrementar cupo
    cursor.execute(
        "INSERT INTO inscripciones (voluntariado_id, usuario_id) VALUES (%s, %s)",
        (vol_id, usuario_id)
    )
    cursor.execute(
        "UPDATE voluntariados SET cupos_disponibles = cupos_disponibles - 1 WHERE id = %s",
        (vol_id,)
    )
    cursor.close()
    return {"mensaje": "¡Inscripción exitosa! Recibirás un recordatorio 24h antes del evento."}


# ── Historial del ciudadano ────────────────────────────
@router.get("/mis-voluntariados")
def mis_voluntariados(current_user: dict = Depends(require_role("ciudadano"))):
    db         = get_db()
    cursor     = db.get_cursor()
    usuario_id = int(current_user["sub"])

    cursor.execute("""
        SELECT v.titulo, v.fecha, v.hora, p.nombre AS parque,
               u.razon_social AS organizacion,
               i.estado, i.horas_efectivas
        FROM inscripciones i
        JOIN voluntariados v ON i.voluntariado_id = v.id
        JOIN parques p ON v.parque_id = p.id
        JOIN usuarios u ON v.convenio_id = u.id
        WHERE i.usuario_id = %s
        ORDER BY v.fecha DESC
    """, (usuario_id,))
    historial = cursor.fetchall()
    cursor.close()
    return historial
