// Check if user is premium on page load
document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem("isPremium") !== "yes") {
    alert("Access Denied! Premium Only!");
    window.location.href = "index.html";
  }
  
  // Update user info in header
  const userEmail = localStorage.getItem("premiumUser");
  const userAvatar = localStorage.getItem("userAvatar");
  
  if (userEmail && document.getElementById("userEmail")) {
    document.getElementById("userEmail").textContent = userEmail;
  }
  
  if (userAvatar && document.getElementById("userAvatar")) {
    document.getElementById("userAvatar").textContent = userAvatar;
  }
});

// Logout function for premium pages
function logout() {
  localStorage.removeItem("isPremium");
  localStorage.removeItem("premiumUser");
  localStorage.removeItem("userAvatar");
  window.location.href = "index.html";
}
