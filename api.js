/**
 * api.js — Helper para llamar a la FastAPI desde el frontend
 * Maneja el token JWT automáticamente en todas las peticiones
 */

const API = "http://localhost:8000";

// ── Token ──────────────────────────────────────────────
function getToken()         { return localStorage.getItem("token"); }
function setToken(token)    { localStorage.setItem("token", token); }
function removeToken()      { localStorage.removeItem("token"); }
function getUser()          { return JSON.parse(localStorage.getItem("user") || "null"); }
function setUser(user)      { localStorage.setItem("user", JSON.stringify(user)); }
function getRol()           { return getUser()?.rol || null; }
function isLoggedIn()       { return !!getToken(); }

function logout() {
    removeToken();
    localStorage.removeItem("user");
    window.location.href = "/login.html";
}

// ── Fetch con token automático ─────────────────────────
async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = { "Content-Type": "application/json", ...options.headers };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(API + path, { ...options, headers });

    if (res.status === 401) { logout(); return; }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || "Error en la solicitud");
    return data;
}

// ── Auth ───────────────────────────────────────────────
async function login(correo, password) {
    const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ correo, password })
    });
    setToken(data.access_token);
    setUser({ nombre: data.nombre, rol: data.rol });
    return data;
}

async function registerCiudadano(form) {
    return await apiFetch("/auth/register/ciudadano", {
        method: "POST",
        body: JSON.stringify(form)
    });
}

async function registerConvenio(form) {
    return await apiFetch("/auth/register/convenio", {
        method: "POST",
        body: JSON.stringify(form)
    });
}

// ── Localidades y parques ──────────────────────────────
async function getLocalidades() {
    return await apiFetch("/localidades");
}

async function getParques(localidadId) {
    return await apiFetch(`/localidades/${localidadId}/parques`);
}

async function getParque(parqueId) {
    return await apiFetch(`/parques/${parqueId}`);
}

// ── Reportes ───────────────────────────────────────────
async function crearReporte(formData) {
    const token = getToken();
    const res = await fetch(API + "/reportes", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData   // FormData con fotos — NO usar Content-Type JSON
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || "Error al crear reporte");
    return data;
}

async function getReportes(parqueId) {
    return await apiFetch(`/parques/${parqueId}/reportes`);
}

async function resolverReporte(reporteId) {
    return await apiFetch(`/reportes/${reporteId}/resolver`, { method: "PUT" });
}

// ── Voluntariados ──────────────────────────────────────
async function getVoluntariados(parqueId) {
    return await apiFetch(`/parques/${parqueId}/voluntariados`);
}

async function inscribirse(volId) {
    return await apiFetch(`/voluntariados/${volId}/inscribirse`, { method: "POST" });
}

async function getMisVoluntariados() {
    return await apiFetch("/mis-voluntariados");
}

// ── Proteger páginas ───────────────────────────────────
function requireAuth(redirectTo = "/login.html") {
    if (!isLoggedIn()) window.location.href = redirectTo;
}

function requireRol(rol, redirectTo = "/dashboard.html") {
    requireAuth();
    if (getRol() !== rol) window.location.href = redirectTo;
}

// ── Render navbar dinámico ─────────────────────────────
function renderNavbar() {
    const user = getUser();
    if (!user) return;
    const nav = document.getElementById("navbar-user");
    if (nav) {
        nav.innerHTML = `
            <span>${user.nombre}</span>
            <span class="role-badge">${user.rol}</span>
            <a href="#" onclick="logout()" class="nav-link">Salir</a>
        `;
    }
}
