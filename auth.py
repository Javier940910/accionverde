"""
routers/auth.py — Endpoints de autenticación
POST /auth/register
POST /auth/login
GET  /auth/me
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional

from backend.database import get_db
from backend.models import RegisterCiudadano, RegisterConvenio, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Autenticación"])

# ── Configuración JWT ──────────────────────────────────
SECRET_KEY  = "clave_secreta_cambiar_en_produccion_2026"
ALGORITHM   = "HS256"
TOKEN_EXPIRY_HOURS = 8

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ── Helpers ────────────────────────────────────────────
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")

def require_role(role: str):
    def checker(user: dict = Depends(get_current_user)):
        if user.get("rol") != role:
            raise HTTPException(status_code=403, detail=f"Se requiere rol: {role}")
        return user
    return checker


# ── Registro ciudadano ─────────────────────────────────
@router.post("/register/ciudadano", status_code=201)
def register_ciudadano(data: RegisterCiudadano):
    db     = get_db()
    cursor = db.get_cursor()

    # Verificar correo duplicado
    cursor.execute("SELECT id FROM usuarios WHERE correo = %s", (data.correo,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Ya existe una cuenta con ese correo")

    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres")

    hashed = hash_password(data.password)
    cursor.execute(
        """INSERT INTO usuarios (nombre, correo, password, rol, telefono, localidad, estado)
           VALUES (%s, %s, %s, 'ciudadano', %s, %s, 'activo')""",
        (data.nombre, data.correo, hashed, data.telefono, data.localidad)
    )
    cursor.close()
    return {"mensaje": "Cuenta creada exitosamente. Ya puedes iniciar sesión."}


# ── Registro convenio ──────────────────────────────────
@router.post("/register/convenio", status_code=201)
def register_convenio(data: RegisterConvenio):
    db     = get_db()
    cursor = db.get_cursor()

    cursor.execute("SELECT id FROM usuarios WHERE correo = %s", (data.correo,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Ya existe una cuenta con ese correo")

    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres")

    hashed = hash_password(data.password)
    cursor.execute(
        """INSERT INTO usuarios
           (nombre, correo, password, rol, nit, razon_social, cargo, correo_corporativo, estado)
           VALUES (%s, %s, %s, 'convenio', %s, %s, %s, %s, 'pendiente')""",
        (data.nombre, data.correo, hashed, data.nit,
         data.razon_social, data.cargo, data.correo_corporativo)
    )
    cursor.close()
    return {"mensaje": "Solicitud enviada. El administrador aprobará tu cuenta pronto."}


# ── Login ──────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest):
    db     = get_db()
    cursor = db.get_cursor()

    cursor.execute(
        "SELECT id, nombre, password, rol, estado FROM usuarios WHERE correo = %s",
        (data.correo,)
    )
    user = cursor.fetchone()
    cursor.close()

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")

    if user["estado"] == "pendiente":
        raise HTTPException(status_code=403, detail="Tu cuenta está pendiente de aprobación")

    if user["estado"] == "inactivo":
        raise HTTPException(status_code=403, detail="Tu cuenta ha sido desactivada")

    token = create_token({
        "sub":    str(user["id"]),
        "nombre": user["nombre"],
        "rol":    user["rol"]
    })

    return TokenResponse(
        access_token=token,
        rol=user["rol"],
        nombre=user["nombre"]
    )


# ── Perfil del usuario actual ──────────────────────────
@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    db     = get_db()
    cursor = db.get_cursor()
    cursor.execute(
        "SELECT id, nombre, correo, rol, telefono, localidad, razon_social, nit FROM usuarios WHERE id = %s",
        (current_user["sub"],)
    )
    user = cursor.fetchone()
    cursor.close()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user
