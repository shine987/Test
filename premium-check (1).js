// Check if user is premium on premium pages
if (localStorage.getItem("isPremium") !== "yes") {
  alert("Access Denied! Premium Only!");
  window.location.href = "index.html";
}