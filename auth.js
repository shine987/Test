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
    alert("Premium Login Successful!");
  } else {
    localStorage.setItem("isPremium", "no");
    alert("You are not a premium user.");
  }

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
  alert("Logged out!");
  location.href = "index.html";
}
