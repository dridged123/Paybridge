import os
import psycopg2

# =========================
# DATABASE URL (FROM RENDER)
# =========================
DATABASE_URL = os.getenv("DATABASE_URL")


# =========================
# CONNECT FUNCTION
# =========================
def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        return conn
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return None


# =========================
# SAFE CURSOR
# =========================
def get_cursor():
    db = get_db_connection()
    if db is None:
        return None, None
    return db, db.cursor()


# =========================
# TEST CONNECTION
# =========================
if __name__ == "__main__":
    db = get_db_connection()

    if db:
        print("✅ PostgreSQL connected successfully!")
        db.close()
    else:
        print("❌ Database connection failed!")