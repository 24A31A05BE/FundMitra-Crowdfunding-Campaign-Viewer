/* ============================================================
   campaigns.js
   ============================================================ */

/* NAV STATE */
const navUser = document.getElementById("nav-user");
const user = JSON.parse(localStorage.getItem("loggedInUser"));

let storedCampaigns = JSON.parse(localStorage.getItem("userCampaigns")) || [];
let showMyCampaigns = false;

let allCampaigns = [...campaigns, ...storedCampaigns];

if (user) {
    document.getElementById("my-campaigns-btn").style.display = "block";

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

/* CAMPAIGNS LOGIC */
const container = document.getElementById("cards-container");
const searchInput = document.querySelector(".search-bar");
const filterButtons = document.querySelectorAll(".filter-btn");

let selectedCategories = [];
let selectedStatus = [];

function renderCampaigns(data) {
    container.innerHTML = "";

    data.forEach(campaign => {
        const percent = Math.min(
            Math.round((campaign.raisedAmount / campaign.goalAmount) * 100),
            100
        );

        let daysText = `${campaign.daysLeft}d`;

        if (campaign.raisedAmount >= campaign.goalAmount) {
            daysText = "Done";
        } else if (campaign.daysLeft <= 3) {
            daysText = `<span class="ending-soon">${campaign.daysLeft}d</span>`;
        }

        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <img src="${campaign.image}" class="card-image">

            <div class="card-content">
                <h3>${campaign.title}</h3>
                <p>${campaign.shortDescription}</p>

                <div class="progress-bar">
                    <div class="progress-fill" style="width:${percent}%"></div>
                </div>

                <div class="funding-row">
                    <span class="funding-percent">${percent}% funded</span>
                    <span class="funding-raised">₹${(campaign.raisedAmount/1000).toFixed(1)}K raised</span>
                </div>

                <div class="stats-row">
                    <div>
                        <strong>₹${(campaign.goalAmount/1000).toFixed(1)}K</strong>
                        <p>GOAL</p>
                    </div>

                    <div>
                        <strong>${campaign.backers}</strong>
                        <p>BACKERS</p>
                    </div>

                    <div>
                        <strong>${daysText}</strong>
                        <p>LEFT</p>
                    </div>
                </div>
            </div>

            <button onclick="openCampaign(${campaign.id})">View Campaign</button>
        `;

        container.appendChild(card);
    });
}

function openCampaign(id) {
    window.location.href = "campaigndetails.html?id=" + id;
}

function filterCampaigns() {
    const searchText = searchInput.value.toLowerCase();

    let filtered = allCampaigns.filter(campaign => {
        const matchesSearch =
            campaign.title.toLowerCase().includes(searchText) ||
            campaign.shortDescription.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategories.length === 0 ||
            selectedCategories.includes(campaign.category.toLowerCase());

        let status = "active";
        if (campaign.raisedAmount >= campaign.goalAmount) status = "funded";
        else if (campaign.daysLeft <= 3) status = "ending";

        const matchesStatus =
            selectedStatus.length === 0 ||
            selectedStatus.includes(status);

        const matchesMine = !showMyCampaigns ||
            (user && campaign.creatorName === user.name);

        return matchesSearch && matchesCategory && matchesStatus && matchesMine;
    });

    renderCampaigns(filtered);
}

const categoryFilters = ["All","Health","Education","Social","Emergency","Environment","Creative","Innovation","Other"];
const statusFilters = ["Active","Funded","Ending Soon"];

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const text = btn.innerText;

        if (categoryFilters.includes(text)) {
            if (text === "All") {
                selectedCategories = [];
                filterButtons.forEach(b => {
                    if (categoryFilters.includes(b.innerText)) b.classList.remove("active");
                });
                btn.classList.add("active");
            } else {
                filterButtons.forEach(b => {
                    if (b.innerText === "All") b.classList.remove("active");
                });

                btn.classList.toggle("active");

                if (selectedCategories.includes(text.toLowerCase())) {
                    selectedCategories = selectedCategories.filter(c => c !== text.toLowerCase());
                } else {
                    selectedCategories.push(text.toLowerCase());
                }

                if (selectedCategories.length === 0) {
                    filterButtons.forEach(b => {
                        if (b.innerText === "All") b.classList.add("active");
                    });
                }
            }
        }

        if (statusFilters.includes(text)) {
            btn.classList.toggle("active");

            let mapped = text.toLowerCase();
            if (mapped === "ending soon") mapped = "ending";

            if (selectedStatus.includes(mapped)) {
                selectedStatus = selectedStatus.filter(s => s !== mapped);
            } else {
                selectedStatus.push(mapped);
            }
        }

        if (text === "My Campaigns") {
            showMyCampaigns = !showMyCampaigns;
            btn.classList.toggle("active");
            filterCampaigns();
            return;
        }

        filterCampaigns();
    });
});

searchInput.addEventListener("input", filterCampaigns);

renderCampaigns(allCampaigns);
