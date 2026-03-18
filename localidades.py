"""
routers/localidades.py — Endpoints de localidades y parques
GET  /localidades
GET  /localidades/{id}/parques
POST /parques              (solo convenio)
GET  /parques/{id}
"""
from fastapi import APIRouter, HTTPException, Depends
from backend.database import get_db
from backend.models import ParqueCreate
from backend.routers.auth import get_current_user, require_role

router = APIRouter(tags=["Localidades y Parques"])


# ── Listar localidades activas ─────────────────────────
@router.get("/localidades")
def get_localidades(_: dict = Depends(get_current_user)):
    db     = get_db()
    cursor = db.get_cursor()
    cursor.execute("SELECT id, nombre, imagen FROM localidades WHERE activa = 1 ORDER BY nombre ASC")
    localidades = cursor.fetchall()
    cursor.close()
    return localidades


# ── Parques de una localidad ───────────────────────────
@router.get("/localidades/{localidad_id}/parques")
def get_parques(localidad_id: int, _: dict = Depends(get_current_user)):
    db     = get_db()
    cursor = db.get_cursor()
    cursor.execute("""
        SELECT p.*,
            (SELECT COUNT(*) FROM reportes r
             WHERE r.parque_id = p.id AND r.estado = 'pendiente') AS reportes_activos,
            (SELECT COUNT(*) FROM voluntariados v
             WHERE v.parque_id = p.id AND v.estado = 'activo' AND v.fecha >= CURDATE()) AS voluntariados_activos,
            (SELECT COUNT(*) FROM voluntariados v
             WHERE v.parque_id = p.id AND v.estado = 'activo'
               AND v.fecha >= CURDATE()
               AND v.created_at >= DATE_SUB(NOW(), INTERVAL 48 HOUR)) AS voluntariados_nuevos
        FROM parques p
        WHERE p.localidad_id = %s AND p.estado = 'activo'
        ORDER BY p.nombre ASC
    """, (localidad_id,))
    parques = cursor.fetchall()
    cursor.close()
    return parques


# ── Detalle de un parque ───────────────────────────────
@router.get("/parques/{parque_id}")
def get_parque(parque_id: int, _: dict = Depends(get_current_user)):
    db     = get_db()
    cursor = db.get_cursor()
    cursor.execute("""
        SELECT p.*, l.nombre AS localidad_nombre
        FROM parques p
        JOIN localidades l ON p.localidad_id = l.id
        WHERE p.id = %s AND p.estado = 'activo'
    """, (parque_id,))
    parque = cursor.fetchone()
    cursor.close()
    if not parque:
        raise HTTPException(status_code=404, detail="Parque no encontrado")
    return parque


# ── Crear parque (solo convenio) ───────────────────────
@router.post("/parques", status_code=201)
def crear_parque(
    data: ParqueCreate,
    current_user: dict = Depends(require_role("convenio"))
):
    db     = get_db()
    cursor = db.get_cursor()

    # Verificar duplicados en radio ~100m usando diferencia de coordenadas
    if data.latitud and data.longitud:
        cursor.execute("""
            SELECT id, nombre FROM parques
            WHERE ABS(latitud  - %s) < 0.0009
              AND ABS(longitud - %s) < 0.0009
              AND estado = 'activo'
        """, (data.latitud, data.longitud))
        duplicado = cursor.fetchone()
        if duplicado:
            raise HTTPException(
                status_code=400,
                detail=f"Ya existe el parque '{duplicado['nombre']}' a menos de 100m de esa ubicación"
            )

    convenio_id = int(current_user["sub"])
    cursor.execute("""
        INSERT INTO parques (localidad_id, convenio_id, nombre, descripcion, direccion, latitud, longitud, tipo)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        data.localidad_id, convenio_id, data.nombre,
        data.descripcion, data.direccion,
        data.latitud, data.longitud, data.tipo
    ))
    cursor.close()
    return {"mensaje": "Parque creado exitosamente"}
