from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import psycopg2
import os

app = Flask(__name__)
CORS(app)

# =========================
# DATABASE (POSTGRES - RENDER)
# =========================
DATABASE_URL = os.getenv("DATABASE_URL")

print("DATABASE_URL:", DATABASE_URL)  # debug

def get_db():
    try:
        return psycopg2.connect(DATABASE_URL, sslmode='require')
    except Exception as e:
        print("❌ DB ERROR:", e)
        return None


# =========================
# AUTO CREATE TABLES 🔥
# =========================
def init_db():
    db = get_db()
    if db is None:
        print("❌ Cannot connect to DB")
        return

    cursor = db.cursor()

    try:
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            mpin VARCHAR(10) NOT NULL,
            balance NUMERIC(10,2) DEFAULT 0.00
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        db.commit()
        print("✅ Tables ready")

    except Exception as e:
        db.rollback()
        print("❌ INIT DB ERROR:", e)

    finally:
        cursor.close()
        db.close()


# 🔥 IMPORTANT (for Render / gunicorn)
init_db()


# =========================
# UI ROUTES
# =========================
@app.route('/')
def login_page():
    return render_template('login.html')


@app.route('/signup')
def signup_page():
    return render_template('signup.html')


@app.route('/dashboard')
def dashboard():
    return render_template('index.html')


@app.route('/notifications')
def notifications_page():
    return render_template('notif_dashboard.html')


# =========================
# AUTH
# =========================
@app.route('/api/signup', methods=['POST'])
def signup():
    db = get_db()
    if db is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = db.cursor()

    try:
        data = request.get_json() or {}
        username = data.get('username')
        mpin = data.get('mpin')

        if not username or not mpin:
            return jsonify({"error": "Missing fields"}), 400

        if not mpin.isdigit() or len(mpin) != 4:
            return jsonify({"error": "MPIN must be 4 digits"}), 400

        cursor.execute("SELECT id FROM users WHERE username=%s", (username,))
        if cursor.fetchone():
            return jsonify({"error": "Username exists"}), 400

        cursor.execute(
            "INSERT INTO users (username, mpin, balance) VALUES (%s, %s, %s)",
            (username, mpin, 0.00)
        )

        db.commit()
        return jsonify({"message": "Signup successful"})

    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()


@app.route('/api/login', methods=['POST'])
def login():
    db = get_db()
    if db is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = db.cursor()

    try:
        data = request.get_json() or {}
        username = data.get('username')
        mpin = data.get('mpin')

        cursor.execute(
            "SELECT id FROM users WHERE username=%s AND mpin=%s",
            (username, mpin)
        )

        user = cursor.fetchone()

        if user:
            return jsonify({"user_id": user[0]})

        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()


# =========================
# BALANCE
# =========================
@app.route('/api/balance/<int:user_id>')
def get_balance(user_id):
    db = get_db()
    if db is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = db.cursor()

    try:
        cursor.execute("SELECT balance FROM users WHERE id=%s", (user_id,))
        result = cursor.fetchone()

        if result:
            return jsonify({"balance": float(result[0])})

        return jsonify({"error": "User not found"}), 404

    finally:
        cursor.close()
        db.close()


# =========================
# TRANSACTION
# =========================
@app.route('/api/transaction', methods=['POST'])
def transaction():
    db = get_db()
    if db is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = db.cursor()

    try:
        data = request.get_json() or {}

        user_id = int(data.get('user_id'))
        amount = float(data.get('amount'))
        t_type = data.get('type')

        if amount <= 0:
            return jsonify({"error": "Invalid amount"}), 400

        if t_type not in ["deposit", "withdraw"]:
            return jsonify({"error": "Invalid type"}), 400

        cursor.execute(
            "SELECT balance, username FROM users WHERE id=%s FOR UPDATE",
            (user_id,)
        )

        result = cursor.fetchone()

        if not result:
            db.rollback()
            return jsonify({"error": "User not found"}), 404

        balance, username = float(result[0]), result[1]

        if t_type == "withdraw":
            if balance < amount:
                db.rollback()
                return jsonify({"error": "Insufficient balance"}), 400
            balance -= amount
        else:
            balance += amount

        balance = round(balance, 2)

        cursor.execute(
            "UPDATE users SET balance=%s WHERE id=%s",
            (balance, user_id)
        )

        message = f"{username} | {t_type.upper()} ₱{amount:.2f} | Balance: ₱{balance:.2f}"

        cursor.execute(
            "INSERT INTO notifications (user_id, message) VALUES (%s, %s)",
            (user_id, message)
        )

        db.commit()

        return jsonify({
            "status": "success",
            "balance": balance
        })

    except Exception as e:
        db.rollback()
        print("❌ TRANSACTION ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()


# =========================
# NOTIFICATIONS
# =========================
@app.route('/api/notifications/<int:user_id>')
def get_notifications(user_id):
    db = get_db()
    if db is None:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = db.cursor()

    try:
        cursor.execute(
            "SELECT message, created_at FROM notifications WHERE user_id=%s ORDER BY id DESC",
            (user_id,)
        )

        rows = cursor.fetchall()

        return jsonify([
            {"msg": r[0], "time": str(r[1])}
            for r in rows
        ])

    finally:
        cursor.close()
        db.close()


# =========================
# HEALTH CHECK
# =========================
@app.route('/health')
def health():
    return jsonify({"status": "ok"})


# =========================
# LOCAL RUN ONLY
# =========================
if __name__ == '__main__':
    print("🚀 PayBridge running...")
    app.run(host="0.0.0.0", port=5000, debug=True)