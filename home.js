/* ============================================================
   home.js
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

/* FAQ TOGGLE */
const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
        item.classList.toggle("active");
    });
});
