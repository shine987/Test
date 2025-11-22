if (localStorage.getItem("isPremium") !== "yes") {
  alert("Access Denied! Premium Only!");
  window.location.href = "index.html";
}
