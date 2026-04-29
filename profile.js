/* ============================================================
   profile.js
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
    window.location.href = "home.html";
}

/* PROFILE DATA */
const profileName   = document.getElementById("profile-name");
const profileAvatar = document.getElementById("profile-avatar");

if (user) {
    profileName.textContent   = user.name || user.username;
    profileAvatar.textContent = (user.name || user.username).charAt(0).toUpperCase();
}

document.getElementById("detail-name").textContent     = user?.name     || "-";
document.getElementById("detail-email").textContent    = user?.email    || "-";
document.getElementById("detail-contact").textContent  = user?.contact  || "-";
document.getElementById("detail-location").textContent = user?.location || "-";

/* CONTRIBUTIONS */
const allContributions = JSON.parse(localStorage.getItem("contributions")) || [];
const storedCampaigns  = JSON.parse(localStorage.getItem("userCampaigns")) || [];
const allCampaigns     = [...campaigns, ...storedCampaigns];
const contributions    = allContributions.filter(c => c.username === user?.username);

let totalAmount = 0;

const tableBody = document.getElementById("donation-table-body");
const table     = document.getElementById("donation-table");
const emptyBox  = document.getElementById("no-contributions");

tableBody.innerHTML = "";

if (contributions.length === 0) {
    table.style.display = "none";
    emptyBox.classList.remove("hidden");
} else {
    table.style.display = "table";
    emptyBox.classList.add("hidden");

    contributions.forEach(c => {
        totalAmount += c.amount;

        const matchedCampaign = allCampaigns.find(cam => cam.id == c.campaignId);
        const title = matchedCampaign ? matchedCampaign.title : "Campaign";

        const [date, time] = c.date.split(",");

        tableBody.innerHTML += `
            <tr>
                <td>${title}</td>
                <td>${c.method.toUpperCase()}</td>
                <td>${date}</td>
                <td>${time ? time.trim() : "-"}</td>
                <td>₹${c.amount}</td>
                <td>
                    <button class="view-btn" onclick="viewCampaign(${c.campaignId})">
                        View
                    </button>
                </td>
            </tr>
        `;
    });
}

document.getElementById("donation-count").textContent = contributions.length;
document.getElementById("total-amount").textContent   = "₹" + totalAmount;

/* EDIT MODAL — OPEN */
document.querySelector(".edit-btn").addEventListener("click", () => {
    document.getElementById("edit-modal").classList.remove("hidden");

    document.getElementById("edit-name").value     = user?.name     || "";
    document.getElementById("edit-email").value    = user?.email    || "";
    document.getElementById("edit-contact").value  = user?.contact  || "";
    document.getElementById("edit-location").value = user?.location || "";
});

/* EDIT MODAL — CLOSE */
function closeModal() {
    document.getElementById("edit-modal").classList.add("hidden");
}

/* VALIDATION HELPERS */
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

/* SAVE PROFILE */
function saveProfile() {
    const name     = document.getElementById("edit-name").value.trim();
    const email    = document.getElementById("edit-email").value.trim();
    const contact  = document.getElementById("edit-contact").value.trim();
    const location = document.getElementById("edit-location").value.trim();

    document.getElementById("edit-name-error").textContent    = "";
    document.getElementById("edit-email-error").textContent   = "";
    document.getElementById("edit-contact-error").textContent = "";

    if (!name) {
        document.getElementById("edit-name-error").textContent = "Name is required";
        return;
    }

    if (!email) {
        document.getElementById("edit-email-error").textContent = "Email is required";
        return;
    }

    if (!validateEmail(email)) {
        document.getElementById("edit-email-error").textContent = "Invalid email format";
        return;
    }

    if (contact && !validatePhone(contact)) {
        document.getElementById("edit-contact-error").textContent = "Contact must be 10 digits";
        return;
    }

    const updatedUser = { ...user, name, email, contact, location };

    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

    let users = JSON.parse(localStorage.getItem("users")) || [];
    users = users.map(u => u.username === user.username ? updatedUser : u);
    localStorage.setItem("users", JSON.stringify(users));

    closeModal();
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToastAndReload();
}

/* TOAST + RELOAD */
function showToastAndReload() {
    const toast = document.getElementById("toast");

    toast.classList.remove("hidden");

    setTimeout(() => {
        toast.style.animation = "slideOut 0.4s ease forwards";
    }, 2500);

    setTimeout(() => {
        location.reload();
    }, 3000);
}

/* HELPERS */
function goToCampaigns() {
    window.location.href = "campaigns.html";
}

function viewCampaign(id) {
    window.location.href = `campaigndetails.html?id=${id}`;
}
