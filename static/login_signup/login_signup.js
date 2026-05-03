// =========================
// CONFIG (PRODUCTION READY ✅)
// =========================
const API_URL = "/api";
const DASHBOARD_URL = "/dashboard";
const LOGIN_URL = "/";


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
    const username = document.getElementById("username")?.value.trim();
    const mpin = document.getElementById("mpin")?.value.trim();

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
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, mpin })
        });

        const data = await res.json();

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
        console.error(error);
        showMessage("Server error. Try again.", "error");
    }

    setLoading(false, "login");
}


// =========================
// SIGNUP FUNCTION
// =========================
async function signup() {
    const username = document.getElementById("username")?.value.trim();
    const mpin = document.getElementById("mpin")?.value.trim();

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
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, mpin })
        });

        const data = await res.json();

        if (res.ok) {
            showMessage("Signup successful! Redirecting...", "success");

            setTimeout(() => {
                window.location.href = LOGIN_URL;
            }, 800);

        } else {
            showMessage(data.error || "Signup failed", "error");
        }

    } catch (error) {
        console.error(error);
        showMessage("Server error. Try again.", "error");
    }

    setLoading(false, "signup");
}


// =========================
// AUTO SESSION CHECK
// =========================
document.addEventListener("DOMContentLoaded", () => {
    const user_id = localStorage.getItem("user_id");

    if (user_id && window.location.pathname === "/") {
        window.location.href = DASHBOARD_URL;
    }
});
