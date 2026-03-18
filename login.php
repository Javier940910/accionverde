<?php
session_start();
require_once 'config/database.php';
require_once 'includes/auth.php';

redirectIfLoggedIn();

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $correo   = trim($_POST['correo'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($correo) || empty($password)) {
        $error = 'Completa todos los campos.';
    } else {
        $db   = Database::getInstance()->getConnection();
        $stmt = $db->prepare('SELECT id, nombre, password, rol, estado FROM usuarios WHERE correo = ?');
        $stmt->bind_param('s', $correo);
        $stmt->execute();
        $result = $stmt->get_result();
        $user   = $result->fetch_assoc();
        $stmt->close();

        if (!$user || !password_verify($password, $user['password'])) {
            $error = 'Correo o contraseña incorrectos.';
        } elseif ($user['estado'] === 'pendiente') {
            $error = 'Tu cuenta está pendiente de aprobación por el administrador.';
        } elseif ($user['estado'] === 'inactivo') {
            $error = 'Tu cuenta ha sido desactivada. Contacta al administrador.';
        } else {
            // Login exitoso — guardar sesión
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['nombre']  = $user['nombre'];
            $_SESSION['role']    = $user['rol'];

            header('Location: dashboard.php');
            exit;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar sesión — Áreas Verdes</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #f0f4f0;
            min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
        }
        .card {
            background: white; border-radius: 12px;
            padding: 36px; width: 100%; max-width: 420px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.1);
        }
        h1 { color: #2e7d32; font-size: 24px; margin-bottom: 6px; }
        p.sub { color: #666; font-size: 14px; margin-bottom: 24px; }
        .alert-error {
            background: #fdecea; color: #c62828;
            border: 1px solid #ef9a9a;
            padding: 12px; border-radius: 8px;
            margin-bottom: 16px; font-size: 14px;
        }
        .form-group { margin-bottom: 16px; }
        label { display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px; }
        input {
            width: 100%; padding: 10px 14px;
            border: 1px solid #ddd; border-radius: 8px;
            font-size: 14px; color: #333;
        }
        input:focus { outline: none; border-color: #2e7d32; }
        .btn {
            width: 100%; padding: 12px;
            background: #2e7d32; color: white;
            border: none; border-radius: 8px;
            font-size: 15px; font-weight: 600;
            cursor: pointer; margin-top: 8px;
        }
        .btn:hover { background: #1b5e20; }
        .register-link { text-align: center; margin-top: 16px; font-size: 13px; color: #666; }
        .register-link a { color: #2e7d32; font-weight: 600; text-decoration: none; }
    </style>
</head>
<body>
<div class="card">
    <h1>🌿 Iniciar sesión</h1>
    <p class="sub">Áreas Verdes y Voluntariado Ambiental</p>

    <?php if ($error): ?>
        <div class="alert-error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <form method="POST" action="login.php">
        <div class="form-group">
            <label>Correo electrónico</label>
            <input type="email" name="correo" value="<?= htmlspecialchars($_POST['correo'] ?? '') ?>" placeholder="correo@ejemplo.com" required autofocus>
        </div>
        <div class="form-group">
            <label>Contraseña</label>
            <input type="password" name="password" placeholder="Tu contraseña" required>
        </div>
        <button type="submit" class="btn">Entrar</button>
    </form>

    <p class="register-link">¿No tienes cuenta? <a href="register.php">Regístrate aquí</a></p>
</div>
</body>
</html>
