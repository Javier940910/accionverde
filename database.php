<?php
/**
 * Conexión a la base de datos — Patrón Singleton
 * Garantiza una sola instancia de conexión en toda la aplicación
 */
class Database {
    private static $instance = null;
    private $connection;

    private $host     = 'localhost';
    private $dbname   = 'areas_verdes';
    private $username = 'root';
    private $password = '';

    // Constructor privado: nadie puede hacer new Database() desde afuera
    private function __construct() {
        $this->connection = new mysqli(
            $this->host,
            $this->username,
            $this->password,
            $this->dbname
        );

        if ($this->connection->connect_error) {
            die('Error de conexión: ' . $this->connection->connect_error);
        }

        $this->connection->set_charset('utf8mb4');
    }

    // Método estático para obtener la única instancia
    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    // Devuelve el objeto mysqli para hacer queries
    public function getConnection(): mysqli {
        return $this->connection;
    }

    // Evitar clonación y deserialización (parte del patrón Singleton)
    private function __clone() {}
    public function __wakeup() {}
}
