<?php
session_start();
require_once 'config/database.php';
require_once 'includes/auth.php';

requireLogin();

$rol    = getUserRole();
$nombre = $_SESSION['nombre'];
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel — Áreas Verdes</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', sans-serif; background: #f0f4f0; min-height: 100vh; }
        header {
            background: #2e7d32; color: white;
            padding: 16px 32px;
            display: flex; align-items: center; justify-content: space-between;
        }
        header h1 { font-size: 20px; }
        header .user-info { font-size: 14px; display: flex; align-items: center; gap: 16px; }
        .badge {
            background: rgba(255,255,255,0.2);
            padding: 4px 10px; border-radius: 20px; font-size: 12px;
        }
        header a { color: white; text-decoration: none; font-size: 13px; }
        header a:hover { text-decoration: underline; }
        main { padding: 32px; max-width: 1100px; margin: 0 auto; }
        h2 { color: #1b5e20; margin-bottom: 24px; font-size: 22px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
        .card {
            background: white; border-radius: 12px;
            padding: 24px; text-align: center;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            text-decoration: none; color: inherit;
            transition: transform 0.2s, box-shadow 0.2s;
            display: block;
        }
        .card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); }
        .card .icon { font-size: 36px; margin-bottom: 12px; }
        .card h3 { font-size: 15px; color: #2e7d32; margin-bottom: 6px; }
        .card p  { font-size: 12px; color: #888; }
    </style>
</head>
<body>

<header>
    <h1>🌿 Áreas Verdes</h1>
    <div class="user-info">
        <span>Hola, <strong><?= htmlspecialchars($nombre) ?></strong></span>
        <span class="badge"><?= htmlspecialchars($rol) ?></span>
        <a href="logout.php">Cerrar sesión</a>
    </div>
</header>

<main>
    <?php if ($rol === 'ciudadano'): ?>

        <h2>¿Qué quieres hacer hoy?</h2>
        <div class="grid">
            <a href="localidades.php" class="card">
                <div class="icon">🗺️</div>
                <h3>Ver localidades</h3>
                <p>Explora localidades y sus parques</p>
            </a>
            <a href="reportes/crear.php" class="card">
                <div class="icon">📋</div>
                <h3>Crear reporte</h3>
                <p>Reporta un problema en un parque</p>
            </a>
            <a href="voluntariados/mis_voluntariados.php" class="card">
                <div class="icon">🙋</div>
                <h3>Mis voluntariados</h3>
                <p>Consulta tu historial y certificados</p>
            </a>
            <a href="perfil.php" class="card">
                <div class="icon">👤</div>
                <h3>Mi perfil</h3>
                <p>Datos personales y privacidad</p>
            </a>
        </div>

    <?php elseif ($rol === 'convenio'): ?>

        <h2>Panel del Convenio</h2>
        <div class="grid">
            <a href="localidades.php" class="card">
                <div class="icon">🗺️</div>
                <h3>Localidades</h3>
                <p>Gestiona parques en tus localidades</p>
            </a>
            <a href="parques/crear.php" class="card">
                <div class="icon">🌳</div>
                <h3>Agregar parque</h3>
                <p>Registra un nuevo parque</p>
            </a>
            <a href="reportes/gestionar.php" class="card">
                <div class="icon">📋</div>
                <h3>Gestionar reportes</h3>
                <p>Ver y resolver reportes ciudadanos</p>
            </a>
            <a href="voluntariados/crear.php" class="card">
                <div class="icon">📣</div>
                <h3>Publicar voluntariado</h3>
                <p>Crea una actividad en un parque</p>
            </a>
            <a href="voluntariados/asistencia.php" class="card">
                <div class="icon">✅</div>
                <h3>Registrar asistencia</h3>
                <p>Valida participantes por ID</p>
            </a>
        </div>

    <?php elseif ($rol === 'administrador'): ?>

        <h2>Panel de Administración</h2>
        <div class="grid">
            <a href="admin/convenios.php" class="card">
                <div class="icon">🏢</div>
                <h3>Aprobar convenios</h3>
                <p>Revisa solicitudes pendientes</p>
            </a>
            <a href="admin/usuarios.php" class="card">
                <div class="icon">👥</div>
                <h3>Usuarios</h3>
                <p>Gestiona todos los usuarios</p>
            </a>
            <a href="admin/localidades.php" class="card">
                <div class="icon">🗺️</div>
                <h3>Localidades</h3>
                <p>Administra las localidades base</p>
            </a>
        </div>

    <?php endif; ?>
</main>

</body>
</html>
