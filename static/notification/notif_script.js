const LOGIN_URL = "http://127.0.0.1:5000";

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {

    const user_id = localStorage.getItem("user_id");

    if (!user_id) {
        alert("Session expired. Please login again.");
        window.location.href = LOGIN_URL;
        return;
    }

    const userInfo = document.getElementById("user-info");
    if (userInfo) {
        userInfo.innerText = "User #" + user_id;
    }

    document.getElementById("back-btn")?.addEventListener("click", () => {
        window.location.href = "/dashboard";
    });

    loadLogs();

    // refresh every 3 seconds (not 2 para less spam)
    setInterval(loadLogs, 3000);
});


// =========================
// LOAD LOGS (FIXED)
// =========================
async function loadLogs() {
    const user_id = localStorage.getItem("user_id");
    const list = document.getElementById("log-list");

    if (!list || !user_id) return;

    try {
        const res = await fetch(`/api/notifications/${user_id}`);

        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            list.innerHTML = '<p class="empty-text">No transactions yet...</p>';
            return;
        }

        list.innerHTML = "";

        data.forEach(item => {

            const div = document.createElement("div");
            div.className = "log-item";

            const msg = item.msg || "No message";
            const time = item.time || "";

            const isDeposit =
                msg.toLowerCase().includes("deposit");

            div.innerHTML = `
                <div class="log-left">
                    <span class="log-time">${time}</span>
                    <span class="log-msg">${msg}</span>
                </div>

                <div class="log-right ${isDeposit ? 'deposit' : 'withdraw'}">
                    ${isDeposit ? '+' : '-'}
                </div>
            `;

            list.appendChild(div);
        });

    } catch (err) {
        console.error("❌ Fetch error:", err);

        list.innerHTML = `
            <p style="color:red;">⚠️ Unable to load transactions</p>
        `;
    }
}