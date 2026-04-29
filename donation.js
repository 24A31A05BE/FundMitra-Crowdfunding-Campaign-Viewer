/* ============================================================
   donation.js
   Depends on: campaigndetails.js (uses `campaign`, `user`,
   `saveCampaignState`, `updateFundingUI` from that file)
   ============================================================ */

/* OPEN MODAL */
function handleDonate() {
	if (campaign.raisedAmount >= campaign.goalAmount) return;
    const guestFields = document.getElementById("guest-fields");

    if (user) {
        guestFields.style.display = "none";
    } else {
        guestFields.style.display = "block";
    }

    document.getElementById("donation-overlay").style.display = "flex";
}

/* CLOSE MODAL */
function closeModal() {
    document.getElementById("donation-overlay").style.display = "none";
}

/* QUICK AMOUNT */
function setAmount(value) {
    document.getElementById("donation-amount").value = value;
}

/* DONATE ALERT */
function showDonateAlert(message) {
    const alertBox = document.getElementById("donate-alert");
    alertBox.textContent = message;
    alertBox.style.opacity = "1";

    setTimeout(() => {
        alertBox.style.opacity = "0";
    }, 3000);
}

/* PAYMENT FIELDS — render based on selected method */
function updatePaymentFields() {
    const method = document.querySelector('input[name="payment"]:checked').value;
    const container = document.getElementById("payment-details");

    if (method === "upi") {
        container.innerHTML = `
            <input type="text" id="upi-input" placeholder="Enter phone number">
            <div class="error-text" id="upi-error"></div>
        `;
    }

    if (method === "card") {
        container.innerHTML = `
            <input type="text" id="card-number" placeholder="Card Number">
            <div class="error-text" id="card-error"></div>
            <input type="password" id="card-pin" placeholder="PIN">
            <div class="error-text" id="pin-error"></div>
        `;
    }

    if (method === "netbanking") {
        container.innerHTML = `
            <input type="text" id="bank-id" placeholder="Account ID">
            <div class="error-text" id="bank-error"></div>
        `;
    }
}

setTimeout(updatePaymentFields, 100);

/* PROCESS PAYMENT */
function processPayment() {
    const amount = document.getElementById("donation-amount").value;
    const method = document.querySelector('input[name="payment"]:checked').value;
    let donorName = "";

    document.querySelectorAll(".error-text").forEach(e => e.textContent = "");

    const amountError = document.getElementById("amount-error");

    if (!amount || amount <= 0) {
        amountError.textContent = "Enter a valid amount";
        return;
    }

    const contactInput = document.getElementById("guest-contact");
    const contactError = document.getElementById("contact-error");

    if (!user) {
        const contact = contactInput.value.trim();

        if (!contact) {
            contactError.textContent = "Enter email or phone";
            return;
        }

        const isPhone = /^\d{10}$/.test(contact);
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);

        if (!isPhone && !isEmail) {
            contactError.textContent = "Enter valid email or 10-digit phone";
            return;
        }

        const guestNameInput = document.getElementById("guest-name").value.trim();
        donorName = guestNameInput || "Anonymous";
    } else {
        donorName = user.username;
    }

    let valid = true;

    if (method === "upi") {
        const upi = document.getElementById("upi-input").value.trim();
        if (!/^\d{10}$/.test(upi)) {
            document.getElementById("upi-error").textContent = "Enter valid 10-digit phone number";
            valid = false;
        }
    }

    if (method === "card") {
        const card = document.getElementById("card-number").value.trim();
        const pin  = document.getElementById("card-pin").value.trim();

        if (!/^\d{16}$/.test(card)) {
            document.getElementById("card-error").textContent = "Enter valid 16-digit card number";
            valid = false;
        }

        if (!/^\d{4}$/.test(pin)) {
            document.getElementById("pin-error").textContent = "Enter 4-digit PIN";
            valid = false;
        }
    }

    if (method === "netbanking") {
        const bank = document.getElementById("bank-id").value.trim();
        if (bank.length < 6) {
            document.getElementById("bank-error").textContent = "Account ID must be at least 6 characters";
            valid = false;
        }
    }

    if (!valid) return;

    /* UPDATE CAMPAIGN DATA */
    campaign.raisedAmount += Number(amount);
    campaign.backers += 1;

    if (!campaign.recentBackers) campaign.recentBackers = [];

    campaign.recentBackers.unshift({
        name: donorName,
        amount: Number(amount),
        timeAgo: "Just now"
    });

    saveCampaignState();

    /* SAVE CONTRIBUTION TO STORAGE */
    let contributions = JSON.parse(localStorage.getItem("contributions")) || [];

    contributions.unshift({
        campaignId: campaign.id,
        amount: Number(amount),
        method: method,
        date: new Date().toLocaleString(),
        username: user ? user.username : "guest"
    });

    localStorage.setItem("contributions", JSON.stringify(contributions));

    /* UPDATE FUNDING UI */
    updateFundingUI();

    /* CLOSE MODAL + SHOW TOAST */
    document.getElementById("donation-overlay").style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
    showSuccessToast();
}

/* SUCCESS TOAST */
function showSuccessToast() {
    const toast = document.getElementById("success-toast");

    toast.classList.remove("hide");
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("hide");
    }, 5000);
}
