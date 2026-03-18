<?php
/**
 * Funciones de autenticación y manejo de sesiones
 */

function isLoggedIn(): bool {
    return isset($_SESSION['user_id']);
}

function getUserRole(): string {
    return $_SESSION['role'] ?? '';
}

function requireLogin(): void {
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}

function requireRole(string $role): void {
    requireLogin();
    if (getUserRole() !== $role) {
        header('Location: dashboard.php');
        exit;
    }
}

function redirectIfLoggedIn(): void {
    if (isLoggedIn()) {
        header('Location: dashboard.php');
        exit;
    }
}
