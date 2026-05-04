// =========================
// CONFIG (RENDER READY)
// =========================
const LOGIN_URL = "/";


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

    // BUTTON EVENTS
    const depBtn = document.getElementById("deposit-btn");
    const witBtn = document.getElementById("withdraw-btn");
    const refBtn = document.getElementById("refresh-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const historyBtn = document.getElementById("view-history-btn");

    if (depBtn) depBtn.addEventListener("click", () => sendTransaction("deposit"));
    if (witBtn) witBtn.addEventListener("click", () => sendTransaction("withdraw"));
    if (refBtn) refBtn.addEventListener("click", getBal);
    if (logoutBtn) logoutBtn.addEventListener("click", logout);

    if (historyBtn) {
        historyBtn.addEventListener("click", () => {
            window.location.href = "/notifications";
        });
    }

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
// GET USER
// =========================
async function getUser() {
    const user_id = localStorage.getItem("user_id");

    try {
        const res = await fetch(`/api/user/${user_id}`);
        if (!res.ok) throw new Error("User fetch failed");

        const data = await res.json();

        const nameEl = document.getElementById("username-display");
        if (data.username && nameEl) {
            nameEl.innerText = "Welcome, " + data.username;
        }

    } catch (e) {
        console.error("❌ User error:", e);
    }
}


// =========================
// GET BALANCE
// =========================
async function getBal() {
    const user_id = localStorage.getItem("user_id");
    const status = document.getElementById("status");

    try {
        const res = await fetch(`/api/balance/${user_id}`);
        if (!res.ok) throw new Error("Balance fetch failed");

        const data = await res.json();

        const balEl = document.getElementById("bal");

        if (data.balance !== undefined && balEl) {
            balEl.innerText =
                `₱ ${Number(data.balance).toLocaleString("en-US", {
                    minimumFractionDigits: 2
                })}`;
        }

        if (status) {
            status.innerText = "System Online";
            status.style.color = "#27ae60";
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
// TRANSACTION
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
        const res = await fetch("/api/transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: Number(user_id),
                amount: amount,
                type: type
            })
        });

        let data;
        try {
            data = await res.json();
        } catch {
            data = { error: "Invalid server response" };
        }

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
            const errMsg = data.error || "Transaction failed";

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

    } finally {
        toggleButtons(false);
    }
}


// =========================
// BUTTON TOGGLE (FIXED ❌➡️✅)
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
