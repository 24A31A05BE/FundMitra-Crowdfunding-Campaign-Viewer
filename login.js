/* ============================================================
   login.js  — no navbar (login page has none)
   ============================================================ */

/* TAB SWITCH */
function switchTab(tab) {
    document.getElementById("tab-login").classList.remove("active");
    document.getElementById("tab-signup").classList.remove("active");
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));

    if (tab === "login") {
        document.getElementById("tab-login").classList.add("active");
        document.getElementById("login-section").classList.add("active");
    } else {
        document.getElementById("tab-signup").classList.add("active");
        document.getElementById("signup-step1").classList.add("active");
    }
}

/* PASSWORD TOGGLE */
function togglePassword(id, icon) {
    const input = document.getElementById(id);

    if (input.type === "password") {
        input.type = "text";
        icon.textContent = "visibility_off";
    } else {
        input.type = "password";
        icon.textContent = "visibility";
    }
}

/* VALIDATION HELPERS */
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password);
}

function validatePhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

/* STORAGE HELPERS */
function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

/* LOGIN */
function loginUser() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    const users = getUsers();
    const user  = users.find(u => u.username === username && u.password === password);

    if (!user) {
        document.getElementById("login-pass-error").textContent = "Invalid username or password";
        return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(user));
    window.location.href = "index.html";
}

/* SIGNUP — STEP 1 */
let tempUser = {};

function nextSignup() {
    const name     = document.getElementById("name").value.trim();
    const email    = document.getElementById("email").value.trim();
    const contact  = document.getElementById("contact").value.trim();
    const location = document.getElementById("location").value.trim();

    document.getElementById("email-error").textContent = "";

    if (!name) {
        document.getElementById("email-error").textContent = "Name is required";
        return;
    }

    if (!validateEmail(email)) {
        document.getElementById("email-error").textContent = "Invalid email format";
        return;
    }

    if (contact && !validatePhone(contact)) {
        document.getElementById("email-error").textContent = "Contact must be 10 digits";
        return;
    }

    tempUser.name     = name;
    tempUser.email    = email;
    tempUser.contact  = contact || "";
    tempUser.location = location || "";

    document.getElementById("signup-step1").classList.remove("active");
    document.getElementById("signup-step2").classList.add("active");
}

function backToSignup() {
    document.getElementById("signup-step2").classList.remove("active");
    document.getElementById("signup-step1").classList.add("active");
}

/* SIGNUP — STEP 2 (create account) */
function createAccount() {
    const username = document.getElementById("new-username").value.trim();
    const password = document.getElementById("new-password").value;
    const confirm  = document.getElementById("confirm-password").value;

    document.getElementById("username-error").textContent = "";
    document.getElementById("password-error").textContent = "";
    document.getElementById("confirm-error").textContent  = "";

    const users = getUsers();

    if (!username) {
        document.getElementById("username-error").textContent = "Username is required";
        return;
    }

    if (users.some(u => u.username === username)) {
        document.getElementById("username-error").textContent = "Username already taken";
        return;
    }

    if (!validatePassword(password)) {
        document.getElementById("password-error").textContent =
            "Password must be 8+ chars with uppercase, lowercase & number";
        return;
    }

    if (password !== confirm) {
        document.getElementById("confirm-error").textContent = "Passwords do not match";
        return;
    }

    tempUser.username = username;
    tempUser.password = password;

    users.push(tempUser);
    saveUsers(users);

    localStorage.setItem("loggedInUser", JSON.stringify(tempUser));
    window.location.href = "index.html";
}
