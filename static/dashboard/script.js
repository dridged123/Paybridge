// =========================
// CONFIG
// =========================
const LOGIN_URL = "http://127.0.0.1:5000";

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {

    const user_id = localStorage.getItem("user_id");

    // 🔐 FORCE LOGIN
    if (!user_id) {
        window.location.href = LOGIN_URL;
        return;
    }

    const userDisplay = document.getElementById("user-id-display");
    if (userDisplay) {
        userDisplay.innerText = "Account ID: #" + user_id;
    }

    // BUTTON EVENTS (SAFE)
    document.getElementById("deposit-btn")?.addEventListener("click", () => sendTransaction("deposit"));
    document.getElementById("withdraw-btn")?.addEventListener("click", () => sendTransaction("withdraw"));
    document.getElementById("refresh-btn")?.addEventListener("click", getBal);
    document.getElementById("logout-btn")?.addEventListener("click", logout);

    document.getElementById("view-history-btn")?.addEventListener("click", () => {
        window.location.href = "/notifications";
    });

    // INITIAL LOAD
    getUser();
    getBal();
});


// =========================
// TOAST
// =========================
function showToast(message, type = "success") {
    const container = document.getElementById("notification-toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "🔔";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "❌";

    toast.innerHTML = `
        <span>${icon}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}


// =========================
// GET USER (SAFE + NO CRASH)
// =========================
async function getUser() {
    const user_id = localStorage.getItem("user_id");

    try {
        const res = await fetch(`/api/user/${user_id}`);

        if (!res.ok) throw new Error("User fetch failed");

        const data = await res.json();

        if (data.username) {
            document.getElementById("username-display").innerText =
                "Welcome, " + data.username;
        }

    } catch (e) {
        console.error("❌ User error:", e);
    }
}


// =========================
// GET BALANCE (SAFE)
// =========================
async function getBal() {
    const user_id = localStorage.getItem("user_id");
    const status = document.getElementById("status");

    try {
        const res = await fetch(`/api/balance/${user_id}`);

        if (!res.ok) throw new Error("Balance fetch failed");

        const data = await res.json();

        if (data.balance !== undefined) {
            const balEl = document.getElementById("bal");

            if (balEl) {
                balEl.innerText =
                    `₱ ${Number(data.balance).toLocaleString("en-US", {
                        minimumFractionDigits: 2
                    })}`;
            }

            if (status) {
                status.innerText = "System Online";
                status.style.color = "#27ae60";
            }
        }

    } catch (e) {
        console.error("❌ Balance error:", e);

        if (status) {
            status.innerText = "Connection Error";
            status.style.color = "#e74c3c";
        }
    }
}


// =========================
// TRANSACTION (NO REGEX BUG)
// =========================
async function sendTransaction(type) {
    const user_id = localStorage.getItem("user_id");
    const amtInput = document.getElementById("amt");
    const status = document.getElementById("status");

    const amount = parseFloat(amtInput?.value);

    // VALIDATION
    if (!amount || amount <= 0) {
        showToast("Enter valid amount", "error");
        return;
    }

    if (status) {
        status.innerText = "Processing...";
        status.style.color = "#f39c12";
    }

    toggleButtons(true);

    try {
        const res = await fetch(`/api/transaction`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user_id, amount, type })
        });

        const data = await res.json();

        if (res.ok) {
            const msg =
                type === "deposit"
                    ? "Deposit successful 💰"
                    : "Withdrawal successful 💸";

            if (status) {
                status.innerText = msg;
                status.style.color = "#27ae60";
            }

            if (amtInput) amtInput.value = "";

            showToast(msg, "success");
            getBal();

        } else {
            const errMsg = data.error || data.message || "Transaction failed";

            if (status) {
                status.innerText = errMsg;
                status.style.color = "#e74c3c";
            }

            showToast(errMsg, "error");
        }

    } catch (e) {
        console.error("❌ Transaction error:", e);

        if (status) {
            status.innerText = "Connection Error";
            status.style.color = "#e74c3c";
        }

        showToast("Connection error", "error");
    }

    toggleButtons(false);
}


// =========================
// BUTTON TOGGLE
// =========================
function toggleButtons(disabled) {
    const dep = document.getElementById("deposit-btn");
    const wit = document.getElementById("withdraw-btn");

    if (dep) dep.disabled = disabled;
    if (wit) wit.disabled = disabled;
}


// =========================
// LOGOUT
// =========================
function logout() {
    localStorage.clear();
    window.location.href = "/";
}