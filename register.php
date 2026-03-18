<?php
session_start();
require_once 'config/database.php';
require_once 'includes/auth.php';

redirectIfLoggedIn();

$error   = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $db   = Database::getInstance()->getConnection();
    $tipo = $_POST['tipo_usuario'] ?? '';

    // Campos comunes
    $nombre   = trim($_POST['nombre'] ?? '');
    $correo   = trim($_POST['correo'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm  = $_POST['confirm_password'] ?? '';

    // Validaciones básicas
    if (empty($nombre) || empty($correo) || empty($password)) {
        $error = 'Todos los campos son obligatorios.';
    } elseif (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        $error = 'El correo no tiene un formato válido.';
    } elseif ($password !== $confirm) {
        $error = 'Las contraseñas no coinciden.';
    } elseif (strlen($password) < 8) {
        $error = 'La contraseña debe tener al menos 8 caracteres.';
    } else {
        // Verificar si el correo ya existe
        $stmt = $db->prepare('SELECT id FROM usuarios WHERE correo = ?');
        $stmt->bind_param('s', $correo);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $error = 'Ya existe una cuenta con ese correo.';
        } else {
            $stmt->close();
            $hash = password_hash($password, PASSWORD_BCRYPT);

            if ($tipo === 'ciudadano') {
                $telefono  = trim($_POST['telefono'] ?? '');
                $localidad = trim($_POST['localidad'] ?? '');

                $stmt = $db->prepare(
                    'INSERT INTO usuarios (nombre, correo, password, rol, telefono, localidad)
                     VALUES (?, ?, ?, "ciudadano", ?, ?)'
                );
                $stmt->bind_param('sssss', $nombre, $correo, $hash, $telefono, $localidad);

            } elseif ($tipo === 'convenio') {
                $nit           = trim($_POST['nit'] ?? '');
                $razon_social  = trim($_POST['razon_social'] ?? '');
                $cargo         = trim($_POST['cargo'] ?? '');
                $correo_corp   = trim($_POST['correo_corporativo'] ?? '');

                // Insertar usuario con rol convenio (pendiente de aprobación)
                $stmt = $db->prepare(
                    'INSERT INTO usuarios (nombre, correo, password, rol, nit, razon_social, cargo, correo_corporativo, estado)
                     VALUES (?, ?, ?, "convenio", ?, ?, ?, ?, "pendiente")'
                );
                $stmt->bind_param('sssssss', $nombre, $correo, $hash, $nit, $razon_social, $cargo, $correo_corp);
            } else {
                $error = 'Tipo de usuario no válido.';
            }

            if (empty($error)) {
                if ($stmt->execute()) {
                    if ($tipo === 'ciudadano') {
                        $success = '¡Cuenta creada exitosamente! Ya puedes iniciar sesión.';
                    } else {
                        $success = '¡Solicitud enviada! El administrador aprobará tu cuenta pronto.';
                    }
                } else {
                    $error = 'Error al crear la cuenta. Intenta de nuevo.';
                }
                $stmt->close();
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro — Áreas Verdes</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: #f0f4f0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .card {
            background: white;
            border-radius: 12px;
            padding: 36px;
            width: 100%;
            max-width: 500px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.1);
        }
        h1 { color: #2e7d32; font-size: 24px; margin-bottom: 6px; }
        p.sub { color: #666; font-size: 14px; margin-bottom: 24px; }
        .alert { padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; }
        .alert-error   { background: #fdecea; color: #c62828; border: 1px solid #ef9a9a; }
        .alert-success { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }
        .form-group { margin-bottom: 16px; }
        label { display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px; }
        input, select {
            width: 100%; padding: 10px 14px;
            border: 1px solid #ddd; border-radius: 8px;
            font-size: 14px; color: #333;
            transition: border-color 0.2s;
        }
        input:focus, select:focus { outline: none; border-color: #2e7d32; }
        .fields-ciudadano, .fields-convenio { display: none; }
        .btn {
            width: 100%; padding: 12px;
            background: #2e7d32; color: white;
            border: none; border-radius: 8px;
            font-size: 15px; font-weight: 600;
            cursor: pointer; margin-top: 8px;
            transition: background 0.2s;
        }
        .btn:hover { background: #1b5e20; }
        .login-link { text-align: center; margin-top: 16px; font-size: 13px; color: #666; }
        .login-link a { color: #2e7d32; font-weight: 600; text-decoration: none; }
        .divider { border: none; border-top: 1px solid #eee; margin: 20px 0; }
    </style>
</head>
<body>
<div class="card">
    <h1>🌿 Crear cuenta</h1>
    <p class="sub">Áreas Verdes y Voluntariado Ambiental</p>

    <?php if ($error): ?>
        <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>
    <?php if ($success): ?>
        <div class="alert alert-success"><?= htmlspecialchars($success) ?></div>
    <?php endif; ?>

    <form method="POST" action="register.php">

        <!-- Tipo de usuario -->
        <div class="form-group">
            <label for="tipo_usuario">Soy...</label>
            <select name="tipo_usuario" id="tipo_usuario" onchange="toggleFields()" required>
                <option value="">Selecciona tu tipo de usuario</option>
                <option value="ciudadano" <?= ($_POST['tipo_usuario'] ?? '') === 'ciudadano' ? 'selected' : '' ?>>Ciudadano</option>
                <option value="convenio" <?= ($_POST['tipo_usuario'] ?? '') === 'convenio' ? 'selected' : '' ?>>Representante de Convenio</option>
            </select>
        </div>

        <hr class="divider">

        <!-- Campos comunes -->
        <div class="form-group">
            <label>Nombre completo</label>
            <input type="text" name="nombre" value="<?= htmlspecialchars($_POST['nombre'] ?? '') ?>" placeholder="Tu nombre completo" required>
        </div>
        <div class="form-group">
            <label>Correo electrónico</label>
            <input type="email" name="correo" value="<?= htmlspecialchars($_POST['correo'] ?? '') ?>" placeholder="correo@ejemplo.com" required>
        </div>
        <div class="form-group">
            <label>Contraseña</label>
            <input type="password" name="password" placeholder="Mínimo 8 caracteres" required>
        </div>
        <div class="form-group">
            <label>Confirmar contraseña</label>
            <input type="password" name="confirm_password" placeholder="Repite tu contraseña" required>
        </div>

        <!-- Campos solo ciudadano -->
        <div class="fields-ciudadano" id="fields-ciudadano">
            <hr class="divider">
            <div class="form-group">
                <label>Teléfono</label>
                <input type="text" name="telefono" value="<?= htmlspecialchars($_POST['telefono'] ?? '') ?>" placeholder="Ej: 3001234567">
            </div>
            <div class="form-group">
                <label>Localidad de residencia</label>
                <input type="text" name="localidad" value="<?= htmlspecialchars($_POST['localidad'] ?? '') ?>" placeholder="Ej: Usaquén, Chapinero...">
            </div>
        </div>

        <!-- Campos solo convenio -->
        <div class="fields-convenio" id="fields-convenio">
            <hr class="divider">
            <div class="form-group">
                <label>NIT de la organización</label>
                <input type="text" name="nit" value="<?= htmlspecialchars($_POST['nit'] ?? '') ?>" placeholder="Ej: 900123456-1">
            </div>
            <div class="form-group">
                <label>Razón social</label>
                <input type="text" name="razon_social" value="<?= htmlspecialchars($_POST['razon_social'] ?? '') ?>" placeholder="Nombre legal de la organización">
            </div>
            <div class="form-group">
                <label>Cargo del representante</label>
                <input type="text" name="cargo" value="<?= htmlspecialchars($_POST['cargo'] ?? '') ?>" placeholder="Ej: Gerente, Director...">
            </div>
            <div class="form-group">
                <label>Correo corporativo</label>
                <input type="email" name="correo_corporativo" value="<?= htmlspecialchars($_POST['correo_corporativo'] ?? '') ?>" placeholder="nombre@empresa.com">
            </div>
        </div>

        <button type="submit" class="btn">Crear cuenta</button>
    </form>

    <p class="login-link">¿Ya tienes cuenta? <a href="login.php">Inicia sesión</a></p>
</div>

<script>
function toggleFields() {
    const tipo = document.getElementById('tipo_usuario').value;
    document.getElementById('fields-ciudadano').style.display = tipo === 'ciudadano' ? 'block' : 'none';
    document.getElementById('fields-convenio').style.display  = tipo === 'convenio'  ? 'block' : 'none';
}
// Restaurar campos si hay error de validación
toggleFields();
</script>
</body>
</html>
