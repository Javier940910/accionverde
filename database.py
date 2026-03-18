"""
database.py — Conexión Singleton a MySQL
Garantiza una sola instancia de conexión en toda la aplicación.
"""
import mysql.connector
from mysql.connector import MySQLConnection

class Database:
    _instance: "Database | None" = None
    _connection: MySQLConnection | None = None

    # Configuración de conexión
    HOST     = "localhost"
    USER     = "root"
    PASSWORD = ""
    DBNAME   = "areas_verdes"

    def __new__(cls) -> "Database":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._connect()
        return cls._instance

    def _connect(self) -> None:
        self._connection = mysql.connector.connect(
            host=self.HOST,
            user=self.USER,
            password=self.PASSWORD,
            database=self.DBNAME,
            charset="utf8mb4",
            autocommit=True,
        )

    def get_connection(self) -> MySQLConnection:
        # Reconectar si se perdió la conexión
        if not self._connection.is_connected():
            self._connect()
        return self._connection

    def get_cursor(self, dictionary: bool = True):
        """Devuelve un cursor. dictionary=True retorna filas como dict."""
        return self.get_connection().cursor(dictionary=dictionary)


# Helper para usar en los routers
def get_db() -> Database:
    return Database()
