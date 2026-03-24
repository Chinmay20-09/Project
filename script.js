
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("productDropdown");
  const menu = document.getElementById("dropdownMenu");

  if (btn && menu) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      menu.classList.toggle("show");
    });

    document.addEventListener("click", function () {
      menu.classList.remove("show");
    });
  }
});