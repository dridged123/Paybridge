import os
import mysql.connector
from mysql.connector import Error

# =========================
# DATABASE CONFIG (ENV BASED)
# =========================
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "wallet_db"),
    "port": int(os.getenv("DB_PORT", 3306))
}


# =========================
# CONNECT FUNCTION
# =========================
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            **DB_CONFIG,
            autocommit=False  # 🔥 required for transactions
        )

        return connection

    except Error as e:
        print(f"❌ Database connection error: {e}")
        return None


# =========================
# SAFE CURSOR HELPER
# =========================
def get_cursor():
    db = get_db_connection()

    if db is None:
        return None, None

    return db, db.cursor()


# =========================
# TEST CONNECTION (LOCAL ONLY)
# =========================
if __name__ == "__main__":
    db = get_db_connection()

    if db:
        print("✅ Database connected successfully!")
        db.close()
    else:
        print("❌ Database connection failed!")