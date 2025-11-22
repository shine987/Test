// Google login callback
function handleCredentialResponse(response) {
  const data = parseJwt(response.credential);
  localStorage.setItem("premiumUser", data.email);

  // Premium users list
  const allowedPremium = [
    "ooooshine1@gmail.com",
    "ooooshine2@gmail.com"
  ];

  if (allowedPremium.includes(data.email)) {
    localStorage.setItem("isPremium", "yes");
    showNotification("Premium Login Successful! Welcome to JFT Premium.", "success");
  } else {
    localStorage.setItem("isPremium", "no");
    showNotification("You are logged in but don't have premium access.", "info");
  }

  // Update UI
  updateUserInfo();
  location.reload();
}

// Decode JWT
function parseJwt(token) {
  return JSON.parse(atob(token.split('.')[1]));
}

// Logout
function logout() {
  localStorage.removeItem("isPremium");
  localStorage.removeItem("premiumUser");
  showNotification("Logged out successfully!", "info");
  setTimeout(() => {
    location.href = "index.html";
  }, 1000);
}

// Update user info display
function updateUserInfo() {
  const userInfo = document.getElementById("user-info");
  const premiumUser = localStorage.getItem("premiumUser");
  const isPremium = localStorage.getItem("isPremium");
  
  if (premiumUser && isPremium === "yes") {
    userInfo.innerHTML = `
      <div class="user-status premium">
        <i class="fas fa-crown"></i>
        <span>${premiumUser}</span>
      </div>
    `;
  } else if (premiumUser) {
    userInfo.innerHTML = `
      <div class="user-status standard">
        <i class="fas fa-user"></i>
        <span>${premiumUser}</span>
      </div>
    `;
  } else {
    userInfo.innerHTML = '';
  }
}

// Show notification
function showNotification(message, type) {
  // Remove existing notification if any
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification`;
  notification.style.background = type === 'success' ? 'linear-gradient(135deg, rgba(72, 187, 120, 0.9), rgba(56, 161, 105, 0.9))' : 'linear-gradient(135deg, rgba(66, 153, 225, 0.9), rgba(49, 130, 206, 0.9))';
  notification.innerHTML = `
    <div class="notification-header">
      <div class="notification-content">
        <span>${message}</span>
      </div>
      <button class="close-btn" onclick="this.parentElement.parentElement.remove()">
        &times;
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}
