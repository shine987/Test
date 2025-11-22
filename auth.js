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
    showNotification("Premium Login Successful!", "success");
  } else {
    localStorage.setItem("isPremium", "no");
    showNotification("You are not a premium user.", "warning");
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
      <div class="user-badge premium">
        <i class="fas fa-crown"></i>
        <span>${premiumUser}</span>
      </div>
    `;
  } else if (premiumUser) {
    userInfo.innerHTML = `
      <div class="user-badge standard">
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
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()">&times;</button>
  `;
  
  // Add styles if not already added
  if (!document.querySelector('#notification-styles')) {
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
      }
      .notification.success { background: #4caf50; }
      .notification.warning { background: #ff9800; }
      .notification.info { background: #2196f3; }
      .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: 15px;
      }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(styles);
  }
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}
