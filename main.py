"""
main.py — Aplicación principal FastAPI
Áreas Verdes y Voluntariado Ambiental
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.routers import auth, localidades, reportes

app = FastAPI(
    title="Áreas Verdes API",
    description="API para gestión de áreas verdes y voluntariado ambiental",
    version="1.0.0"
)

# ── CORS (permite que el frontend llame a la API) ──────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # En producción: cambiar por la URL del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(localidades.router)
app.include_router(reportes.router)

# ── Servir archivos estáticos del frontend ─────────────
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
