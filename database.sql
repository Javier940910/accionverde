-- ============================================================
-- BASE DE DATOS: areas_verdes
-- Aplicación de Gestión de Áreas Verdes y Voluntariado
-- ============================================================

CREATE DATABASE IF NOT EXISTS areas_verdes
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE areas_verdes;

-- ============================================================
-- TABLA: usuarios
-- Ciudadanos, representantes de convenio y administradores
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    nombre              VARCHAR(150)    NOT NULL,
    correo              VARCHAR(150)    NOT NULL UNIQUE,
    password            VARCHAR(255)    NOT NULL,
    rol                 ENUM('ciudadano', 'convenio', 'administrador') NOT NULL DEFAULT 'ciudadano',
    estado              ENUM('activo', 'pendiente', 'inactivo') NOT NULL DEFAULT 'activo',

    -- Campos ciudadano
    telefono            VARCHAR(20)     NULL,
    localidad           VARCHAR(100)    NULL,

    -- Campos convenio
    nit                 VARCHAR(30)     NULL,
    razon_social        VARCHAR(200)    NULL,
    cargo               VARCHAR(100)    NULL,
    correo_corporativo  VARCHAR(150)    NULL,

    -- Preferencias de privacidad (Derecho de Oposición — ARCO)
    notif_correo        TINYINT(1)      NOT NULL DEFAULT 1,
    visible_estadisticas TINYINT(1)     NOT NULL DEFAULT 1,
    nombre_visible      TINYINT(1)      NOT NULL DEFAULT 1,

    -- Control
    anonimizado         TINYINT(1)      NOT NULL DEFAULT 0,
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: localidades
-- Zonas geográficas que contienen parques
-- ============================================================
CREATE TABLE IF NOT EXISTS localidades (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100)    NOT NULL,
    imagen      VARCHAR(255)    NULL,
    activa      TINYINT(1)      NOT NULL DEFAULT 1,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: parques
-- Áreas verdes dentro de una localidad
-- ============================================================
CREATE TABLE IF NOT EXISTS parques (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    localidad_id    INT             NOT NULL,
    convenio_id     INT             NULL,           -- Quién lo agregó
    nombre          VARCHAR(150)    NOT NULL,
    descripcion     TEXT            NULL,
    direccion       VARCHAR(255)    NULL,
    latitud         DECIMAL(10,8)   NULL,
    longitud        DECIMAL(11,8)   NULL,
    tipo            ENUM('parque_urbano', 'zona_verde', 'bosque_urbano', 'plaza', 'otro') DEFAULT 'parque_urbano',
    imagen          VARCHAR(255)    NULL,
    es_area_protegida TINYINT(1)    NOT NULL DEFAULT 0,  -- Validación RUNAP
    estado          ENUM('activo', 'pendiente', 'inactivo') NOT NULL DEFAULT 'activo',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (localidad_id) REFERENCES localidades(id) ON DELETE CASCADE,
    FOREIGN KEY (convenio_id)  REFERENCES usuarios(id)    ON DELETE SET NULL
);

-- ============================================================
-- TABLA: reportes
-- Problemas reportados por ciudadanos en parques
-- ============================================================
CREATE TABLE IF NOT EXISTS reportes (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    parque_id       INT             NOT NULL,
    usuario_id      INT             NOT NULL,
    descripcion     TEXT            NOT NULL,
    categoria       ENUM('basura', 'vegetacion', 'infraestructura', 'contaminacion', 'otro') NOT NULL,
    intervencion    ENUM('limpieza_manual', 'limpieza_mecanica', 'restauracion') NOT NULL,
    estado          ENUM('pendiente', 'resuelto') NOT NULL DEFAULT 'pendiente',
    resuelto_por    INT             NULL,           -- ID del convenio que lo resolvió
    resuelto_at     TIMESTAMP       NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (parque_id)    REFERENCES parques(id)   ON DELETE CASCADE,
    FOREIGN KEY (usuario_id)   REFERENCES usuarios(id)  ON DELETE CASCADE,
    FOREIGN KEY (resuelto_por) REFERENCES usuarios(id)  ON DELETE SET NULL
);

-- ============================================================
-- TABLA: reporte_fotos
-- Hasta 3 fotos por reporte
-- ============================================================
CREATE TABLE IF NOT EXISTS reporte_fotos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    reporte_id  INT             NOT NULL,
    ruta        VARCHAR(255)    NOT NULL,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: voluntariados
-- Actividades publicadas por convenios en parques
-- ============================================================
CREATE TABLE IF NOT EXISTS voluntariados (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    parque_id           INT             NOT NULL,
    convenio_id         INT             NOT NULL,
    titulo              VARCHAR(200)    NOT NULL,
    descripcion         TEXT            NOT NULL,
    fecha               DATE            NOT NULL,
    hora                TIME            NOT NULL,
    duracion_horas      DECIMAL(4,1)    NOT NULL,
    cupos_total         INT             NOT NULL,
    cupos_disponibles   INT             NOT NULL,
    edad_minima         INT             NOT NULL DEFAULT 18,
    tipo_actividad      ENUM('limpieza_manual', 'limpieza_mecanica', 'restauracion', 'siembra') NOT NULL,
    token_enlace        VARCHAR(64)     NULL UNIQUE,   -- Enlace compartible
    estado              ENUM('activo', 'finalizado', 'cancelado') NOT NULL DEFAULT 'activo',
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (parque_id)   REFERENCES parques(id)   ON DELETE CASCADE,
    FOREIGN KEY (convenio_id) REFERENCES usuarios(id)  ON DELETE CASCADE
);

-- ============================================================
-- TABLA: inscripciones
-- Ciudadanos inscritos a voluntariados
-- ============================================================
CREATE TABLE IF NOT EXISTS inscripciones (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    voluntariado_id INT             NOT NULL,
    usuario_id      INT             NOT NULL,
    estado          ENUM('inscrito', 'asistio', 'no_asistio') NOT NULL DEFAULT 'inscrito',
    hora_entrada    TIME            NULL,
    hora_salida     TIME            NULL,
    horas_efectivas DECIMAL(4,1)    NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_inscripcion (voluntariado_id, usuario_id),
    FOREIGN KEY (voluntariado_id) REFERENCES voluntariados(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id)      REFERENCES usuarios(id)      ON DELETE CASCADE
);

-- ============================================================
-- TABLA: certificados
-- Certificados PDF generados tras validar asistencia
-- ============================================================
CREATE TABLE IF NOT EXISTS certificados (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    inscripcion_id  INT             NOT NULL UNIQUE,
    ruta_pdf        VARCHAR(255)    NOT NULL,
    horas_servicio  DECIMAL(4,1)    NOT NULL,
    emitido_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLA: solicitudes_eliminacion
-- Para el Derecho de Cancelación (ARCO — Ley 1581/2012)
-- ============================================================
CREATE TABLE IF NOT EXISTS solicitudes_eliminacion (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT             NOT NULL,
    estado          ENUM('pendiente', 'completada') NOT NULL DEFAULT 'pendiente',
    solicitado_at   TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    completado_at   TIMESTAMP       NULL,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Administrador por defecto (contraseña: Admin1234)
INSERT INTO usuarios (nombre, correo, password, rol, estado)
VALUES (
    'Administrador',
    'admin@areasverdes.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'administrador',
    'activo'
);

-- Localidades de ejemplo (Bogotá)
INSERT INTO localidades (nombre) VALUES
    ('Usaquén'),
    ('Chapinero'),
    ('Santa Fe'),
    ('San Cristóbal'),
    ('Usme'),
    ('Tunjuelito'),
    ('Bosa'),
    ('Kennedy'),
    ('Fontibón'),
    ('Engativá'),
    ('Suba'),
    ('Barrios Unidos'),
    ('Teusaquillo'),
    ('Los Mártires'),
    ('Antonio Nariño'),
    ('Puente Aranda'),
    ('La Candelaria'),
    ('Rafael Uribe Uribe'),
    ('Ciudad Bolívar'),
    ('Sumapaz');
