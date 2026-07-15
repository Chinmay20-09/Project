import { projects } from './data/projects';
import tailwindcss from '@tailwindcss/vite';
import { 
  DOM, 
  state, 
  loadSavedTheme, 
  toggleSystemTheme, 
  showToastNotification, 
  updateThemeIcon 
} from './utils/dom';
import { 
  openProjectDetailsModal, 
  closeProjectDetailsModal, 
  switchModalTab 
} from './components/modal';
import { 
  renderProjectCatalog, 
  filterProjects, 
  resetSearchEngine, 
  renderCurrentlyShipping, 
  renderProjectPage 
} from './components/catalog';
import { renderRoadmapBoard } from './components/roadmap';
import { renderGlobalActivityFeed } from './components/activity';
import { 
  initCommandPaletteDynamicList, 
  openCommandPalette, 
  closeCommandPalette, 
  renderCmdResults, 
  handleCmdInputKeydown 
} from './components/cmdPalette';

declare const lucide: any;

/* ==========================================================================
   INTERACTIVE STATS COUNTUP
   ========================================================================== */
function initStatsCounters() {
  const statCards = document.querySelectorAll(".stat-card");
  
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const targetVal = parseInt(entry.target.getAttribute("data-stat-target") || "0");
        const numberEl = entry.target.querySelector(".stat-number") as HTMLElement;
        
        if (numberEl && targetVal > 0) {
          animateCountUp(numberEl, targetVal);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  statCards.forEach(c => counterObserver.observe(c));
}

function animateCountUp(element: HTMLElement, target: number) {
  let start = 0;
  const duration = 1500; // ms
  const stepTime = Math.abs(Math.floor(duration / target));
  
  // Safeguard step speed on massive numbers
  const increment = target > 500 ? Math.ceil(target / 100) : 1;
  
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = start.toLocaleString();
    }
  }, Math.max(stepTime, 10));
}

/* ==========================================================================
   SCROLL INTERSECTION REVEALS
   ========================================================================== */
function initScrollAnimations() {
  const cards = document.querySelectorAll(".animate-on-scroll");
  
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("appear");
      }
    });
  }, { threshold: 0.05 });

  cards.forEach(card => scrollObserver.observe(card));
}

/* ==========================================================================
   DISTRIBUTION HUB ROUTER
   ========================================================================== */
export function handleRouting() {
  const hash = window.location.hash || "";
  
  if (hash.startsWith("#/project/")) {
    const projectId = hash.replace("#/project/", "");
    const matchedProject = projects.find(p => p.id === projectId);
    if (matchedProject) {
      showProjectPage(projectId);
      return;
    }
  }
  
  showHomepage();
}

function showHomepage() {
  if (DOM.projectRoot) DOM.projectRoot.classList.add("hidden");
  if (DOM.homepageRoot) DOM.homepageRoot.classList.remove("hidden");
  document.title = "Chinmay Kolte // CORE Software Hub";
  renderCurrentlyShipping();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showProjectPage(projectId: string) {
  if (DOM.homepageRoot) DOM.homepageRoot.classList.add("hidden");
  if (DOM.projectRoot) {
    DOM.projectRoot.classList.remove("hidden");
    renderProjectPage(projectId);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ==========================================================================
   GLOBAL SYSTEM INITIALIZATION
   ========================================================================== */
function setupGlobalEventListeners() {
  // Mobile Nav Toggle
  if (DOM.mobileMenuToggle && DOM.mobileMenu) {
    DOM.mobileMenuToggle.addEventListener("click", () => {
      DOM.mobileMenu.classList.toggle("open");
    });

    // Close Mobile menu when clicking overlay links
    DOM.mobileMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        DOM.mobileMenu.classList.remove("open");
      });
    });
  }

  // Search Engine input listener
  if (DOM.projectSearch) {
    DOM.projectSearch.addEventListener("input", (e) => {
      const val = (e.target as HTMLInputElement).value;
      state.searchQuery = val;
      
      if (DOM.clearSearch) {
        if (val.length > 0) {
          DOM.clearSearch.style.display = "flex";
        } else {
          DOM.clearSearch.style.display = "none";
        }
      }
      
      renderProjectCatalog();
    });
  }

  // Clear search engine click listener
  if (DOM.clearSearch && DOM.projectSearch) {
    DOM.clearSearch.addEventListener("click", () => {
      DOM.projectSearch.value = "";
      DOM.clearSearch.style.display = "none";
      state.searchQuery = "";
      renderProjectCatalog();
    });
  }

  // Sorting listener
  if (DOM.projectSort) {
    DOM.projectSort.addEventListener("change", (e) => {
      state.sortBy = (e.target as HTMLSelectElement).value;
      renderProjectCatalog();
    });
  }

  // Filter click listener group
  if (DOM.filterStatusGroup) {
    const filterBtns = DOM.filterStatusGroup.querySelectorAll(".filter-btn");
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-filter") || "all";
        filterProjects(filter);
      });
    });
  }

  // View Mode switches
  if (DOM.viewGrid && DOM.viewList) {
    DOM.viewGrid.addEventListener("click", () => {
      state.viewMode = "grid";
      DOM.viewGrid.classList.add("active");
      DOM.viewList.classList.remove("active");
      renderProjectCatalog();
    });

    DOM.viewList.addEventListener("click", () => {
      state.viewMode = "list";
      DOM.viewList.classList.add("active");
      DOM.viewGrid.classList.remove("active");
      renderProjectCatalog();
    });
  }

  // Modal handlers
  if (DOM.modalCloseBtn) {
    DOM.modalCloseBtn.addEventListener("click", closeProjectDetailsModal);
  }
  
  if (DOM.projectModal) {
    DOM.projectModal.addEventListener("click", (e) => {
      if (e.target === DOM.projectModal) {
        closeProjectDetailsModal();
      }
    });
  }

  // Modal tab buttons
  if (DOM.modalTabButtons) {
    DOM.modalTabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab") || "overview";
        switchModalTab(tab);
      });
    });
  }

  // Theme Toggler
  if (DOM.themeBtn) {
    DOM.themeBtn.addEventListener("click", toggleSystemTheme);
  }

  // Command palette inputs & window events
  if (DOM.cmdTrigger) {
    DOM.cmdTrigger.addEventListener("click", openCommandPalette);
  }
  
  if (DOM.cmdPalette) {
    DOM.cmdPalette.addEventListener("click", (e) => {
      if (e.target === DOM.cmdPalette) {
        closeCommandPalette();
      }
    });
  }

  if (DOM.cmdInput) {
    DOM.cmdInput.addEventListener("input", (e) => {
      const val = (e.target as HTMLInputElement).value;
      renderCmdResults(val);
    });
  }

  // Keyboard Navigation Router
  window.addEventListener("keydown", (e) => {
    // 1. Trigger Command Palette Ctrl + K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (DOM.cmdPalette) {
        if (DOM.cmdPalette.classList.contains("open")) {
          closeCommandPalette();
        } else {
          openCommandPalette();
        }
      }
    }
    
    // 2. ESC closes overlays
    if (e.key === "Escape") {
      if (DOM.cmdPalette && DOM.cmdPalette.classList.contains("open")) {
        closeCommandPalette();
      }
      if (DOM.projectModal && DOM.projectModal.classList.contains("open")) {
        closeProjectDetailsModal();
      }
    }

    // Command palette keyboard navigation handling
    if (DOM.cmdPalette && DOM.cmdPalette.classList.contains("open") && DOM.cmdInput) {
      handleCmdInputKeydown(e, DOM.cmdInput.value);
    }
  });

  // Background Ambient Mouse tracker
  if (DOM.mouseGlow) {
    window.addEventListener("mousemove", (e) => {
      DOM.mouseGlow.style.opacity = "1";
      DOM.mouseGlow.style.left = `${e.clientX}px`;
      DOM.mouseGlow.style.top = `${e.clientY}px`;
    });

    document.addEventListener("mouseleave", () => {
      DOM.mouseGlow.style.opacity = "0";
    });
  }

  // Sticky header scrolled checker
  if (DOM.navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        DOM.navbar.classList.add("scrolled");
      } else {
        DOM.navbar.classList.remove("scrolled");
      }
    });
  }

  // Contact Form submit hijack
  if (DOM.contactForm && DOM.formSubmitBtn && DOM.formFeedback) {
    DOM.contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      DOM.formSubmitBtn.disabled = true;
      DOM.formSubmitBtn.innerHTML = `<i data-lucide="loader-2" class="animate-spin" style="width: 14px; height: 14px;"></i> Encrypting & Dispatching Payload...`;
      
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }

      // Mock network transmission
      setTimeout(() => {
        if (DOM.formSubmitBtn && DOM.formFeedback && DOM.contactForm) {
          DOM.formSubmitBtn.disabled = false;
          DOM.formSubmitBtn.innerHTML = `<i data-lucide="send"></i> Dispatch Message`;
          
          if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
          }

          // Display validation feedback
          DOM.formFeedback.className = "form-feedback success";
          DOM.formFeedback.textContent = "TRANSMISSION SECURE: Your message has been encrypted and routed safely to Kolte's direct terminal.";
          DOM.formFeedback.style.display = "block";
          
          showToastNotification("Payload dispatched successfully!");
          DOM.contactForm.reset();
          
          setTimeout(() => {
            if (DOM.formFeedback) {
              DOM.formFeedback.style.display = "none";
            }
          }, 8000);
        }
      }, 2000);
    });
  }

  // Routing and page toggle listener
  window.addEventListener("hashchange", handleRouting);
}

// Kickstart central processes on document loaded
function initApp() {
  // Load Theme
  loadSavedTheme();
  
  // Render Everything
  renderProjectCatalog();
  renderRoadmapBoard();
  renderGlobalActivityFeed();
  initCommandPaletteDynamicList();
  
  // Set Up Event Handlers
  setupGlobalEventListeners();

  // Initialize router
  handleRouting();

  // Initialize animations
  initStatsCounters();
  initScrollAnimations();

  // Dismount Loader Screen
  if (DOM.loadingScreen) {
    DOM.loadingScreen.classList.add("fade-out");
    setTimeout(() => {
      DOM.loadingScreen.style.display = "none";
    }, 600);
  }
}

// Trigger initialization
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

declare global {
  interface Window {
    handleRouting: typeof handleRouting;
  }
}
window.handleRouting = handleRouting;
