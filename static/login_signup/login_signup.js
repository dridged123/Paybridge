// =========================
// CONFIG (SINGLE APP ✅)
// =========================
const API_URL = "http://127.0.0.1:5000/api";
const DASHBOARD_URL = "http://127.0.0.1:5000/dashboard";
const LOGIN_URL = "http://127.0.0.1:5000";


// =========================
// HELPER: SHOW MESSAGE
// =========================
function showMessage(message, type = "info") {
    const msg = document.getElementById("msg");
    if (!msg) return;

    msg.innerText = message;
    msg.className = type;
}


// =========================
// HELPER: BUTTON LOADING
// =========================
function setLoading(isLoading, mode = "login") {
    const btn = document.querySelector("button[type='submit']");
    if (!btn) return;

    btn.disabled = isLoading;

    if (mode === "signup") {
        btn.innerText = isLoading ? "Creating..." : "Sign Up";
    } else {
        btn.innerText = isLoading ? "Please wait..." : "Login";
    }
}


// =========================
// LOGIN FUNCTION
// =========================
async function login() {
    console.log("🔐 Login triggered");

    const username = document.getElementById("username")?.value.trim();
    const mpin = document.getElementById("mpin")?.value.trim();

    // VALIDATION
    if (!username || !mpin) {
        showMessage("Please fill all fields", "error");
        return;
    }

    if (!/^\d{4}$/.test(mpin)) {
        showMessage("MPIN must be exactly 4 digits", "error");
        return;
    }

    try {
        setLoading(true, "login");
        showMessage("Logging in...", "loading");

        const res = await fetch(`${API_URL}/login`, {
            method: "POST", // ✅ FIXED
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, mpin })
        });

        const data = await res.json();
        console.log("LOGIN RESPONSE:", data);

        if (res.ok && data.user_id) {
            localStorage.clear();
            localStorage.setItem("user_id", data.user_id);

            showMessage("Login successful!", "success");

            setTimeout(() => {
                window.location.href = DASHBOARD_URL;
            }, 500);

        } else {
            showMessage(data.error || "Invalid username or MPIN", "error");
        }

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        showMessage("Server offline or connection error.", "error");
    }

    setLoading(false, "login");
}


// =========================
// SIGNUP FUNCTION
// =========================
async function signup() {
    console.log("📝 Signup triggered");

    const username = document.getElementById("username")?.value.trim();
    const mpin = document.getElementById("mpin")?.value.trim();

    // VALIDATION
    if (!username || !mpin) {
        showMessage("Please fill all fields", "error");
        return;
    }

    if (!/^\d{4}$/.test(mpin)) {
        showMessage("MPIN must be exactly 4 digits", "error");
        return;
    }

    try {
        setLoading(true, "signup");
        showMessage("Creating account...", "loading");

        const res = await fetch(`${API_URL}/signup`, {
            method: "POST", // ✅ FIXED
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, mpin })
        });

        const data = await res.json();
        console.log("SIGNUP RESPONSE:", data);

        if (res.ok) {
            showMessage("Signup successful! Please login.", "success");

            setTimeout(() => {
                window.location.href = LOGIN_URL;
            }, 800);

        } else {
            showMessage(data.error || "Signup failed", "error");
        }

    } catch (error) {
        console.error("SIGNUP ERROR:", error);
        showMessage("Server offline or connection error.", "error");
    }

    setLoading(false, "signup");
}


// =========================
// AUTO SESSION CHECK
// =========================
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Auth page loaded");

    const user_id = localStorage.getItem("user_id");

    // auto redirect if logged in
    if (user_id && window.location.pathname === "/") {
        console.log("✅ Session found → redirecting to dashboard");
        window.location.href = DASHBOARD_URL;
    }
});