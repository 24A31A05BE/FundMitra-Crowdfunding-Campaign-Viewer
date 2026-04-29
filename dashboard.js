/* ============================================================
   dashboard.js
   ============================================================ */

const DEFAULT_IMAGE = "images/default-campaign-image.png";

/* NAV STATE */
const navUser = document.getElementById("nav-user");
const user = JSON.parse(localStorage.getItem("loggedInUser"));

if (user) {
    navUser.innerHTML = `
        <div class="profile-wrapper">
            <div class="profile-icon" id="profile-toggle">
                ${user.name.charAt(0).toUpperCase()}
            </div>
            <div class="profile-dropdown" id="profile-dropdown">
                <p class="profile-name">${user.name}</p>
                <div class="dropdown-item" onclick="goToProfile()">
                    <span class="material-icons">account_circle</span>
                    Profile
                </div>
                <div class="dropdown-item" onclick="logout()">
                    <span class="material-icons">logout</span>
                    Logout
                </div>
            </div>
        </div>
    `;
} else {
    navUser.innerHTML = `
        <a href="login.html" class="login-btn">Login / Signup</a>
    `;
}

const toggle = document.getElementById("profile-toggle");
const dropdown = document.getElementById("profile-dropdown");

if (toggle && dropdown) {
    toggle.addEventListener("click", () => {
        dropdown.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
        if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove("show");
        }
    });
}

function goToProfile() {
    window.location.href = "profile.html";
}

function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.reload();
}

/* TOAST ON RETURN */
const toastMessage = localStorage.getItem("showToast");
if (toastMessage) {
    showToast(toastMessage);
    localStorage.removeItem("showToast");
}

/* DASHBOARD DATA */
const dashboard = document.getElementById("dashboard-content");
const userCampaigns = JSON.parse(localStorage.getItem("userCampaigns")) || [];
const allCampaigns = [...campaigns, ...userCampaigns];

let myCampaigns = [];
if (user) {
    myCampaigns = allCampaigns.filter(c =>
        c.creatorName.toLowerCase() === user.name.toLowerCase()
    );
}

/* STATE 1: NOT LOGGED IN */
if (!user) {
    dashboard.innerHTML = `
        <div class="dashboard-card">
            <h2>Please login to view or create your own campaigns</h2>
            <p class="demo-text">
                For demo account login with username: DemoUser, password: DemoUser123
            </p>
        </div>
    `;
}

/* STATE 2: LOGGED IN, NO CAMPAIGNS */
else if (myCampaigns.length === 0) {
    dashboard.innerHTML = `
        <div class="dashboard-card">
            <h2>You haven't started any campaigns yet</h2>
            <p>Start your first campaign and make an impact 🚀</p>

            <button class="start-btn" onclick="createCampaign()">
                Start Your First Campaign
            </button>
            <p class="demo-text">
                For demo account login with username: DemoUser, password: DemoUser123
            </p>
        </div>
    `;
}

/* STATE 3: HAS CAMPAIGNS */
else {
    const totalRaised    = myCampaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
    const totalBackers   = myCampaigns.reduce((sum, c) => sum + c.backers, 0);
    const activeCampaigns = myCampaigns.filter(c => c.daysLeft > 0).length;
    const avgFunding = Math.round(
        myCampaigns.reduce((sum, c) => sum + (c.raisedAmount / c.goalAmount * 100), 0)
        / myCampaigns.length
    );

    dashboard.innerHTML = `
        <div class="dashboard-wrapper">

            <div class="dashboard-header">
                <h2>Welcome, ${user.name} 👋</h2>

                <div class="header-actions">
                    <button class="new-btn" onclick="viewContributions()">
                        View Your Contributions
                    </button>
                    <button class="new-btn" onclick="createCampaign()">
                        + New Campaign
                    </button>
                </div>
            </div>

            <h3 class="section-title">Here is a summary of your campaigns</h3>

            <div class="summary-grid">
                <div class="summary-card">
                    <h3>₹${totalRaised}</h3>
                    <p>Total Raised</p>
                </div>
                <div class="summary-card">
                    <h3>${totalBackers}</h3>
                    <p>Total Backers</p>
                </div>
                <div class="summary-card">
                    <h3>${activeCampaigns}</h3>
                    <p>Active Campaigns</p>
                </div>
                <div class="summary-card">
                    <h3>${avgFunding}%</h3>
                    <p>Avg Funding</p>
                </div>
            </div>

            <h3 class="section-title">Analytics</h3>
            <div class="analytics-grid">
                <div class="chart-box">
                    <canvas id="categoryChart"></canvas>
                </div>
                <div class="chart-box">
                    <canvas id="comparisonChart"></canvas>
                </div>
            </div>

            <h3 class="section-title">Overall Campaign Data</h3>
            <div class="table-container">
                <table class="campaign-table">
                    <thead>
                        <tr>
                            <th>Campaign</th>
                            <th>Category</th>
                            <th>Raised</th>
                            <th>Funded</th>
                            <th>Backers</th>
                            <th>Days Left</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${myCampaigns.map(c => {
                            const isUser  = userCampaigns.some(u => u.id === c.id);
                            const percent = Math.round((c.raisedAmount / c.goalAmount) * 100);
                            const status  = c.daysLeft > 0 ? "Active" : "Completed";

                            return `
                            <tr>
                                <td class="campaign-name">${c.title}</td>
                                <td>${c.category}</td>
                                <td>₹${c.raisedAmount}</td>
                                <td>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width:${percent}%"></div>
                                    </div>
                                    <span class="percent-text">${percent}%</span>
                                </td>
                                <td>${c.backers}</td>
                                <td>${c.daysLeft}d</td>
                                <td>
                                    <span class="status ${status.toLowerCase()}">${status}</span>
                                </td>
                                <td class="actions">
                                    <div class="actions-inner">
                                        <button onclick="openCampaign(${c.id})">View</button>
                                        <button onclick="editCampaign(${c.id}, ${isUser}, event)">Edit</button>
                                        <button onclick="deleteCampaign(${c.id}, ${isUser}, event)">Delete</button>
                                    </div>
                                </td>
                            </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>

        </div>
    `;

    /* CHARTS */
    const categoryMap = {};
    myCampaigns.forEach(c => {
        if (!categoryMap[c.category]) categoryMap[c.category] = 0;
        categoryMap[c.category] += c.raisedAmount;
    });

    const categoryLabels = Object.keys(categoryMap);
    const categoryValues = Object.values(categoryMap);
    const campaignNames  = myCampaigns.map(c => c.title);
    const raisedData     = myCampaigns.map(c => c.raisedAmount);
    const goalData       = myCampaigns.map(c => c.goalAmount);

    if (document.getElementById("categoryChart")) {
        new Chart(document.getElementById("categoryChart"), {
            type: "doughnut",
            data: {
                labels: categoryLabels,
                datasets: [{
                    data: categoryValues,
                    backgroundColor: ["#2d604d","#3f8f73","#6fbfa5","#9ed8c4","#cfeee3"],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } }
            }
        });
    }

    if (document.getElementById("comparisonChart")) {
        new Chart(document.getElementById("comparisonChart"), {
            type: "bar",
            data: {
                labels: campaignNames,
                datasets: [
                    { label: "Raised", data: raisedData, backgroundColor: "#2d604d" },
                    { label: "Goal",   data: goalData,   backgroundColor: "#9ed8c4" }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { display: false }, grid: { display: false } },
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

/* NAVIGATION HELPERS */
function goToLogin() {
    window.location.href = "login.html";
}

function viewCampaigns() {
    window.location.href = "campaigns.html";
}

function viewContributions() {
    window.location.href = "profile.html";
}

function openCampaign(id) {
    window.location.href = `campaigndetails.html?id=${id}`;
}

/* TOAST */
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 5000);
}

/* ACTION TOOLTIP */
function showActionTooltip(button, message) {
    const tooltip = document.createElement("div");
    tooltip.className = "action-tooltip";
    tooltip.innerText = message;

    button.parentElement.style.position = "relative";
    button.parentElement.appendChild(tooltip);

    setTimeout(() => tooltip.classList.add("show"), 10);
    setTimeout(() => tooltip.remove(), 2500);
}
