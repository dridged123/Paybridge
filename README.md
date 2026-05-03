💳 PayBridge Enterprise System

📌 Overview

PayBridge is a web-based financial system that supports:

- User Authentication (Login & Signup)
- Wallet Balance Management
- Deposit & Withdrawal Transactions
- Transaction History (Notification System)

This system follows an enterprise integration architecture using modular components within a unified Flask application.

---

🏗️ System Architecture

- Frontend: HTML, CSS, JavaScript
- Backend: Python (Flask)
- Database: MySQL
- API Design: RESTful endpoints

---

⚙️ Features

- Secure Login & Signup (MPIN-based)
- Real-time balance update
- Transaction processing (Deposit/Withdraw)
- Notification logging per user
- Clean and responsive UI

---

🧪 How to Run (Local)

1. Clone the repository

git clone https://github.com/YOUR_USERNAME/paybridge-system.git
cd paybridge-system

2. Install dependencies

pip install -r requirements.txt

3. Setup database

Create a MySQL database named "wallet_db", then run:

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    mpin VARCHAR(10),
    balance DECIMAL(10,2)
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

4. Run the app

python app.py

5. Open in browser

http://127.0.0.1:5000

---

🌐 Deployment

This system can be deployed using platforms like:

- Render
- Railway
- VPS (optional)

---

👨‍💻 Author

- CAPSTONE GROUP 11 C (BSIT)
- ENTERPRISE INTEGRATION PROJECT
