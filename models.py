"""
models.py — Modelos Pydantic para validación de datos
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


# ── Enums ──────────────────────────────────────────────
class TipoUsuario(str, Enum):
    ciudadano = "ciudadano"
    convenio  = "convenio"

class CategoriaReporte(str, Enum):
    basura          = "basura"
    vegetacion      = "vegetacion"
    infraestructura = "infraestructura"
    contaminacion   = "contaminacion"
    otro            = "otro"

class TipoIntervencion(str, Enum):
    limpieza_manual   = "limpieza_manual"
    limpieza_mecanica = "limpieza_mecanica"
    restauracion      = "restauracion"

class TipoActividad(str, Enum):
    limpieza_manual   = "limpieza_manual"
    limpieza_mecanica = "limpieza_mecanica"
    restauracion      = "restauracion"
    siembra           = "siembra"


# ── Auth ───────────────────────────────────────────────
class RegisterCiudadano(BaseModel):
    tipo_usuario: TipoUsuario = TipoUsuario.ciudadano
    nombre:       str
    correo:       EmailStr
    password:     str
    telefono:     Optional[str] = None
    localidad:    Optional[str] = None

class RegisterConvenio(BaseModel):
    tipo_usuario:       TipoUsuario = TipoUsuario.convenio
    nombre:             str
    correo:             EmailStr
    password:           str
    nit:                str
    razon_social:       str
    cargo:              str
    correo_corporativo: EmailStr

class LoginRequest(BaseModel):
    correo:   EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    rol:          str
    nombre:       str


# ── Parques ────────────────────────────────────────────
class ParqueCreate(BaseModel):
    localidad_id: int
    nombre:       str
    descripcion:  Optional[str] = None
    direccion:    Optional[str] = None
    latitud:      Optional[float] = None
    longitud:     Optional[float] = None
    tipo:         Optional[str] = "parque_urbano"


# ── Reportes ───────────────────────────────────────────
class ReporteCreate(BaseModel):
    parque_id:    int
    descripcion:  str
    categoria:    CategoriaReporte
    intervencion: TipoIntervencion


# ── Voluntariados ──────────────────────────────────────
class VoluntariadoCreate(BaseModel):
    parque_id:       int
    titulo:          str
    descripcion:     str
    fecha:           str   # YYYY-MM-DD
    hora:            str   # HH:MM
    duracion_horas:  float
    cupos_total:     int
    edad_minima:     int = 18
    tipo_actividad:  TipoActividad
