/* ════════════════════════════════════════════════════════════ */
/* EXTERNAL JAVASCRIPT FILE - Main functionality */
/* ════════════════════════════════════════════════════════════ */

/* ── PRODUCTS TOGGLE FUNCTIONALITY (Resume Page) ── */
document.addEventListener("DOMContentLoaded", function () {
  // Get products toggle button and toggle section
  const productsToggle = document.getElementById("productsToggle");
  const productsSection = document.getElementById("productsSection");
  
  // Add click listener to toggle products section visibility
  if (productsToggle && productsSection) {
    productsToggle.addEventListener("click", function () {
      console.log("Products toggle clicked"); // DEBUG
      productsSection.classList.toggle("open");
      productsToggle.classList.toggle("open");
    });
  }
});

/* ── DROPDOWN MENU FUNCTIONALITY (Resume Page) ── */
document.addEventListener("DOMContentLoaded", function () {
  // Get product dropdown button and menu
  const btn = document.getElementById("productDropdown");
  const menu = document.getElementById("dropdownMenu");

  // Toggle dropdown on button click
  if (btn && menu) {
    btn.addEventListener("click", function (e) {
      console.log("Product dropdown clicked"); // DEBUG
      e.preventDefault();
      e.stopPropagation();
      menu.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function () {
      menu.classList.remove("show");
    });
  }
});