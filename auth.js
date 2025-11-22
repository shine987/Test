// Google Auth Initialization
function handleCredentialResponse(response) {
  const data = parseJwt(response.credential);
  localStorage.setItem("premiumUser", data.email); // save login email

  // Allowed Premium Email List
  const allowedPremium = [
    "premium1@gmail.com",
    "premium2@gmail.com"
  ];

  if (allowedPremium.includes(data.email)) {
    localStorage.setItem("isPremium", "yes");
    alert("Premium Login Successful!");
  } else {
    localStorage.setItem("isPremium", "no");
    alert("You are not a premium user.");
  }

  location.reload();
}

// Decode JWT token
function parseJwt(token) {
  return JSON.parse(atob(token.split('.')[1]));
}

// Logout function
function logout() {
  localStorage.removeItem("isPremium");
  localStorage.removeItem("premiumUser");
  alert("Logged out!");
  location.href = "index.html";
}
