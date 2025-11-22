// Google login callback
function handleCredentialResponse(response) {
  const data = parseJwt(response.credential);
  localStorage.setItem("premiumUser", data.email);
  
  // Extract first letter for avatar
  const firstLetter = data.name ? data.name.charAt(0).toUpperCase() : data.email.charAt(0).toUpperCase();
  localStorage.setItem("userAvatar", firstLetter);

  // Premium users list
  const allowedPremium = [
    "ooooshine1@gmail.com",
    "ooooshine2@gmail.com"
  ];

  if (allowedPremium.includes(data.email)) {
    localStorage.setItem("isPremium", "yes");
    showStatus("Premium Login Successful!", "success");
  } else {
    localStorage.setItem("isPremium", "no");
    showStatus("You are not a premium user.", "error");
  }

  checkLoginStatus();
}

// Check login status and update UI
function checkLoginStatus() {
  const isPremium = localStorage.getItem("isPremium");
  const userEmail = localStorage.getItem("premiumUser");
  const userAvatar = localStorage.getItem("userAvatar");
  
  if (userEmail) {
    document.getElementById("userEmail").textContent = userEmail;
    document.getElementById("userAvatar").textContent = userAvatar || "U";
    
    if (isPremium === "yes") {
      document.getElementById("loginSection").classList.add("hidden");
      document.getElementById("premiumSection").classList.remove("hidden");
      document.getElementById("loginStatus").classList.add("hidden");
    } else {
      document.getElementById("loginSection").classList.remove("hidden");
      document.getElementById("premiumSection").classList.add("hidden");
    }
  } else {
    document.getElementById("loginSection").classList.remove("hidden");
    document.getElementById("premiumSection").classList.add("hidden");
    document.getElementById("userEmail").textContent = "Not logged in";
    document.getElementById("userAvatar").textContent = "U";
  }
}

// Show status message
function showStatus(message, type) {
  const statusElement = document.getElementById("loginStatus");
  statusElement.textContent = message;
  statusElement.classList.remove("hidden", "status-success", "status-error");
  statusElement.classList.add(`status-${type}`);
  
  setTimeout(() => {
    statusElement.classList.add("hidden");
  }, 5000);
}

// Decode JWT
function parseJwt(token) {
  return JSON.parse(atob(token.split('.')[1]));
}

// Logout
function logout() {
  localStorage.removeItem("isPremium");
  localStorage.removeItem("premiumUser");
  localStorage.removeItem("userAvatar");
  showStatus("Successfully logged out!", "success");
  setTimeout(() => {
    checkLoginStatus();
  }, 1500);
}
