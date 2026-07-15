import { AppState } from '../types';

// Let TypeScript know about global Lucide library loaded in index.html
declare const lucide: any;

export const DOM = {
  homepageRoot: document.getElementById("homepage-root") as HTMLElement,
  projectRoot: document.getElementById("project-root") as HTMLElement,
  currentlyShippingWrapper: document.getElementById("currently-shipping-wrapper") as HTMLElement,
  loadingScreen: document.getElementById("loading-screen") as HTMLElement,
  loaderBar: document.getElementById("loader-bar") as HTMLElement,
  loaderStatus: document.getElementById("loader-status") as HTMLElement,
  mouseGlow: document.getElementById("mouse-glow") as HTMLElement,
  navbar: document.getElementById("navbar") as HTMLElement,
  mobileMenuToggle: document.getElementById("mobile-menu-toggle") as HTMLElement,
  mobileMenu: document.getElementById("mobile-menu") as HTMLElement,
  projectsWrapper: document.getElementById("projects-wrapper") as HTMLElement,
  projectSearch: document.getElementById("project-search") as HTMLInputElement,
  clearSearch: document.getElementById("clear-search") as HTMLElement,
  filterStatusGroup: document.getElementById("filter-status-group") as HTMLElement,
  projectSort: document.getElementById("project-sort") as HTMLSelectElement,
  viewGrid: document.getElementById("view-grid") as HTMLElement,
  viewList: document.getElementById("view-list") as HTMLElement,
  
  // Roadmap columns
  roadmapCardsIdeas: document.getElementById("roadmap-cards-ideas") as HTMLElement,
  roadmapCardsPlanning: document.getElementById("roadmap-cards-planning") as HTMLElement,
  roadmapCardsDevelopment: document.getElementById("roadmap-cards-development") as HTMLElement,
  roadmapCardsTesting: document.getElementById("roadmap-cards-testing") as HTMLElement,
  roadmapCardsReleased: document.getElementById("roadmap-cards-released") as HTMLElement,
  roadmapCardsArchived: document.getElementById("roadmap-cards-archived") as HTMLElement,
  
  // Activity Feed
  activityTimeline: document.getElementById("activity-timeline-wrapper") as HTMLElement,
  
  // Contact Form
  contactForm: document.getElementById("contact-form") as HTMLFormElement,
  formSubmitBtn: document.getElementById("form-submit-btn") as HTMLButtonElement,
  formFeedback: document.getElementById("form-feedback") as HTMLElement,
  
  // Project Modal
  projectModal: document.getElementById("project-modal") as HTMLElement,
  modalCloseBtn: document.getElementById("modal-close-btn") as HTMLElement,
  modalTitle: document.getElementById("modal-title") as HTMLElement,
  modalTagline: document.getElementById("modal-tagline") as HTMLElement,
  modalStatus: document.getElementById("modal-status") as HTMLElement,
  modalPlatform: document.getElementById("modal-platform") as HTMLElement,
  modalVersion: document.getElementById("modal-version") as HTMLElement,
  modalUpdated: document.getElementById("modal-updated") as HTMLElement,
  modalImageWrapper: document.getElementById("modal-image-wrapper") as HTMLElement,
  modalDescriptionFull: document.getElementById("modal-description-full") as HTMLElement,
  modalFeaturesList: document.getElementById("modal-features-list") as HTMLElement,
  modalQuickLinks: document.getElementById("modal-quick-links") as HTMLElement,
  modalProgressBar: document.getElementById("modal-progress-bar") as HTMLElement,
  modalProgressText: document.getElementById("modal-progress-text") as HTMLElement,
  modalDetailPlatform: document.getElementById("modal-detail-platform") as HTMLElement,
  modalTechGrid: document.getElementById("modal-tech-grid") as HTMLElement,
  modalChangelogContainer: document.getElementById("modal-changelog-container") as HTMLElement,
  modalBugLink: document.getElementById("modal-bug-link") as HTMLAnchorElement,
  modalFeatureLink: document.getElementById("modal-feature-link") as HTMLAnchorElement,
  modalIssuesList: document.getElementById("modal-issues-list") as HTMLElement,
  modalTabsGroup: document.querySelector(".modal-tabs") as HTMLElement,
  modalTabButtons: document.querySelectorAll(".modal-tab-btn") as NodeListOf<HTMLElement>,
  modalTabPanes: document.querySelectorAll(".modal-tab-pane") as NodeListOf<HTMLElement>,
  
  // Command Palette
  cmdPalette: document.getElementById("cmd-palette") as HTMLElement,
  cmdTrigger: document.getElementById("cmd-trigger") as HTMLElement,
  cmdInput: document.getElementById("cmd-input") as HTMLInputElement,
  cmdResultsWrapper: document.getElementById("cmd-results-wrapper") as HTMLElement,
  cmdProjectsSection: document.getElementById("cmd-projects-section") as HTMLElement,
  
  // Theme Switcher
  themeBtn: document.getElementById("theme-btn") as HTMLElement,
  
  // Toast
  toast: document.getElementById("toast") as HTMLElement,
  toastMsg: document.getElementById("toast-msg") as HTMLElement,
  toastIcon: document.getElementById("toast-icon") as HTMLElement
};

export const state: AppState = {
  activeFilter: "all",
  searchQuery: "",
  sortBy: "newest",
  viewMode: "grid",
  activeProject: null,
  selectedCmdIndex: 0
};

export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case "stable": return "status-stable";
    case "beta": return "status-beta";
    case "alpha": return "status-alpha";
    case "paused": return "status-paused";
    case "archived": return "status-archived";
    default: return "status-alpha";
  }
}

export function getStatusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case "stable": return "🟢 Stable";
    case "beta": return "🟡 Beta Build";
    case "alpha": return "🟠 Alpha Node";
    case "paused": return "🔴 Paused";
    case "archived": return "⚫ Archived";
    default: return "🟠 Development";
  }
}

export function formatActivityDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', options);
}

export function showToastNotification(message: string, type: 'success' | 'error' = 'success') {
  if (!DOM.toastMsg || !DOM.toast || !DOM.toastIcon) return;
  DOM.toastMsg.textContent = message;
  
  if (type === "success") {
    DOM.toast.style.borderColor = "var(--accent-blue)";
    DOM.toastIcon.setAttribute("data-lucide", "check-circle");
    DOM.toastIcon.style.color = "var(--accent-blue)";
  } else {
    DOM.toast.style.borderColor = "var(--accent-red)";
    DOM.toastIcon.setAttribute("data-lucide", "alert-circle");
    DOM.toastIcon.style.color = "var(--accent-red)";
  }
  
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
  
  DOM.toast.classList.add("show");
  
  setTimeout(() => {
    DOM.toast.classList.remove("show");
  }, 4000);
}

export function updateThemeIcon(theme: string) {
  const darkIcon = document.querySelector(".theme-icon-dark") as HTMLElement;
  const lightIcon = document.querySelector(".theme-icon-light") as HTMLElement;
  
  if (!darkIcon || !lightIcon) return;
  
  if (theme === "light") {
    darkIcon.style.display = "none";
    lightIcon.style.display = "block";
  } else {
    darkIcon.style.display = "block";
    lightIcon.style.display = "none";
  }
}

export function toggleSystemTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("core-theme", newTheme);
  
  updateThemeIcon(newTheme);
  showToastNotification(`System theme toggled to ${newTheme.toUpperCase()}`);
}

export function loadSavedTheme() {
  const saved = localStorage.getItem("core-theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
  updateThemeIcon(saved);
}
