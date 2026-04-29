/* ============================================================
   campaigndetails.js
   ============================================================ */

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

/* LOAD CAMPAIGNS FROM STORAGE */
let storedCampaigns = JSON.parse(localStorage.getItem("userCampaigns")) || [];
let allCampaigns = [...campaigns, ...storedCampaigns];

/* LOAD OVERRIDES */
let campaignOverrides = JSON.parse(localStorage.getItem("campaignOverrides")) || {};

/* APPLY OVERRIDES */
allCampaigns = allCampaigns.map(c => {
    if (campaignOverrides[c.id]) {
        return { ...c, ...campaignOverrides[c.id] };
    }
    return c;
});

/* SAVE HELPER */
function saveCampaignState() {
    if (!campaignOverrides[campaign.id]) campaignOverrides[campaign.id] = {};
    campaignOverrides[campaign.id].raisedAmount = campaign.raisedAmount;
    campaignOverrides[campaign.id].backers = campaign.backers;
    campaignOverrides[campaign.id].recentBackers = campaign.recentBackers;
    campaignOverrides[campaign.id].comments = campaign.comments;
    localStorage.setItem("campaignOverrides", JSON.stringify(campaignOverrides));
}

/* LOAD CAMPAIGN */
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let campaign = allCampaigns.find(c => c.id == id) || allCampaigns[0];

/* STATUS */
let status = "Active";
if (campaign.raisedAmount >= campaign.goalAmount) status = "Funded";
else if (campaign.daysLeft <= 3) status = "Ending Soon";

/* DISPLAY */
document.getElementById("campaign-title").textContent = campaign.title;
document.getElementById("campaign-image").src = campaign.image || "";
document.getElementById("category-tag").textContent = campaign.category;
document.getElementById("status-tag").textContent = status;
document.getElementById("creator-name").textContent = campaign.creatorName;
document.getElementById("creator-img").textContent = campaign.creatorName.charAt(0).toUpperCase();

/* INITIAL TAB */
showDescription();

/* TABS */
function switchTab(e, tab) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    e.target.classList.add("active");

    if (tab === "desc") showDescription();
    if (tab === "updates") showUpdates();
    if (tab === "backers") showBackers();
    if (tab === "comments") showComments();
}

/* DESCRIPTION */
function showDescription() {
    const content = document.getElementById("feed-content");
    const text = campaign.fullDescription.replace(/\n/g, "<br>");
    content.innerHTML = `<p>${text}</p>`;
}

/* UPDATES */
function showUpdates() {
    const content = document.getElementById("feed-content");

    if (!campaign.updates || campaign.updates.length === 0) {
        content.innerHTML = "<p>No updates yet.</p>";
        return;
    }

    let html = "";
    campaign.updates.forEach(update => {
        html += `
            <div class="update-card">
                <div class="update-date">${update.date}</div>
                <div class="update-title">${update.title}</div>
                <div class="update-content">${update.content}</div>
            </div>
        `;
    });

    content.innerHTML = html;
}

/* BACKERS */
function showBackers() {
    const content = document.getElementById("feed-content");

    if (!campaign.recentBackers || campaign.recentBackers.length === 0) {
        content.innerHTML = "<p>No donors yet.</p>";
        return;
    }

    let html = "";
    campaign.recentBackers.forEach(b => {
        const initial = b.name.charAt(0).toUpperCase();
        html += `
            <div class="backer-card">
                <div class="backer-left">
                    <div class="backer-avatar">${initial}</div>
                    <div class="backer-info">
                        <div class="backer-name">${b.name}</div>
                        <div class="backer-time">${b.timeAgo}</div>
                    </div>
                </div>
                <div class="backer-amount">₹${b.amount.toLocaleString()}</div>
            </div>
        `;
    });

    content.innerHTML = html;
}

/* COMMENTS */
function showComments() {
    const content = document.getElementById("feed-content");

    let html = `
        <div class="comment-box">
            <input type="text" id="comment-input" placeholder="Leave a comment...">
            <div class="comment-btn" onclick="postComment()">➤</div>
            <div id="comment-alert" class="comment-alert"></div>
        </div>
    `;

    if (!campaign.comments || campaign.comments.length === 0) {
        html += "<p>No comments yet.</p>";
        content.innerHTML = html;
        return;
    }

    campaign.comments.forEach(c => {
        const initial = c.author.charAt(0).toUpperCase();
        html += `
            <div class="comment-item">
                <div class="comment-top">
                    <div class="comment-avatar">${initial}</div>
                    <div>
                        <span class="comment-name">${c.author}</span>
                        <span class="comment-time">${c.timeAgo}</span>
                    </div>
                </div>
                <div class="comment-text">${c.text}</div>
            </div>
        `;
    });

    content.innerHTML = html;
}

function postComment() {
    const input = document.getElementById("comment-input");
    const text = input.value.trim();

    if (!text) return;

    if (!user) {
        showCommentAlert("Please login to comment");
        return;
    }

    if (!campaign.comments) campaign.comments = [];

    campaign.comments.unshift({
        author: user.username,
        text: text,
        timeAgo: "Just now"
    });

    saveCampaignState();
    input.value = "";
    showComments();
}

function showCommentAlert(message) {
    const alertBox = document.getElementById("comment-alert");
    alertBox.textContent = message;
    alertBox.style.opacity = "1";

    setTimeout(() => {
        alertBox.style.opacity = "0";
    }, 3000);
}

/* FUNDING UI */
function updateFundingUI() {
    const percent = Math.min(
        Math.round((campaign.raisedAmount / campaign.goalAmount) * 100),
        100
    );

    document.getElementById("funding-percent").textContent = percent + "%";
    document.getElementById("progress-fill").style.width = percent + "%";
    document.getElementById("raised-amount").textContent = "₹" + campaign.raisedAmount.toLocaleString();
    document.getElementById("goal-amount").textContent = "₹" + campaign.goalAmount.toLocaleString();
    document.getElementById("backers").textContent = campaign.backers.toLocaleString();
    document.getElementById("days-left").textContent = campaign.daysLeft;
}

updateFundingUI();

//disabling donate for funded camapaigns
if (campaign.raisedAmount >= campaign.goalAmount) {
    const donateBtn = document.querySelector(".donate-btn");
    donateBtn.textContent = "Goal Reached 🎉";
    donateBtn.disabled = true;
	donateBtn.style.color = "#2d604d";
    donateBtn.style.background = "#eee";
    donateBtn.style.borderColor = "#2d604d";
    donateBtn.style.cursor = "not-allowed";
}

/* COUNTDOWN TIMER */
const endDate = new Date();
endDate.setHours(0, 0, 0, 0);
endDate.setDate(endDate.getDate() + campaign.daysLeft);

function updateTimer() {
    const diff = endDate - new Date();

    if (diff <= 0) {
        document.getElementById("time-values").textContent = "00:00:00:00";
        return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById("time-values").textContent =
        `${days.toString().padStart(2, '0')}:` +
        `${hours.toString().padStart(2, '0')}:` +
        `${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}`;
}

updateTimer();
setInterval(updateTimer, 1000);
