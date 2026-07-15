import { projects } from '../data/projects';
import { DOM, state, showToastNotification, toggleSystemTheme } from '../utils/dom';

declare const lucide: any;

interface CmdItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'projects' | 'navigation' | 'actions';
  icon: string;
  action: () => void;
}

let commandList: CmdItem[] = [];

export function initCommandPaletteDynamicList() {
  commandList = [];

  // 1. Add Navigation Anchors
  const navs: { t: string; sub: string; target: string; icon: string }[] = [
    { t: "Navigate: Projects Catalog", sub: "Browse software solutions", target: "#projects", icon: "folder" },
    { t: "Navigate: Product Roadmap", sub: "View active engineering pipelines", target: "#roadmap", icon: "milestone" },
    { t: "Navigate: Telemetry Feed", sub: "Chronological release commits", target: "#activity", icon: "activity" },
    { t: "Navigate: About Engine", sub: "Core developer background", target: "#about", icon: "user" },
    { t: "Navigate: Transmission Console", sub: "Open connection dispatch form", target: "#contact", icon: "send" }
  ];

  navs.forEach(n => {
    commandList.push({
      id: `nav-${n.target}`,
      title: n.t,
      subtitle: n.sub,
      category: 'navigation',
      icon: n.icon,
      action: () => {
        closeCommandPalette();
        window.location.hash = n.target;
        const targetEl = document.querySelector(n.target);
        if (targetEl) targetEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // 2. Add Projects Details shortcuts
  projects.forEach(proj => {
    commandList.push({
      id: `proj-${proj.id}`,
      title: `Project: Explore ${proj.name}`,
      subtitle: proj.tagline,
      category: 'projects',
      icon: proj.platformIcon || 'laptop',
      action: () => {
        closeCommandPalette();
        if (window.openProjectDetailsModal) {
          window.openProjectDetailsModal(proj.id);
        }
      }
    });
    
    // Add specific direct actions for released projects (e.g. downloads)
    if (proj.roadmapStage === "Released" && proj.downloadAssets) {
      const d = proj.downloadAssets;
      const downloadUrl = d.windows || d.android || d.linux || d.mac || d.cli || "";
      if (downloadUrl) {
        commandList.push({
          id: `download-${proj.id}`,
          title: `Action: Download ${proj.name}`,
          subtitle: `Get latest ${proj.version} build assets`,
          category: 'actions',
          icon: 'download',
          action: () => {
            closeCommandPalette();
            if (d.cli) {
              navigator.clipboard.writeText(d.cli);
              showToastNotification(`Copied CLI install command for ${proj.name}!`);
            } else {
              window.open(downloadUrl, "_blank");
              showToastNotification(`Redirecting to download ${proj.name} release!`);
            }
          }
        });
      }
    }
  });

  // 3. Add General Console Actions
  commandList.push({
    id: "action-theme",
    title: "Action: Toggle Theme Mode",
    subtitle: "Switch between Dark and Light interfaces",
    category: "actions",
    icon: "sun",
    action: () => {
      closeCommandPalette();
      toggleSystemTheme();
    }
  });

  commandList.push({
    id: "action-share",
    title: "Action: Copy Hub Link",
    subtitle: "Share the hub portal address with colleagues",
    category: "actions",
    icon: "copy",
    action: () => {
      closeCommandPalette();
      if (window.copyCoreLink) {
        window.copyCoreLink();
      }
    }
  });

  commandList.push({
    id: "action-reset",
    title: "Action: Reset Search Index",
    subtitle: "Reset all dashboard filters, sorts, and query terms",
    category: "actions",
    icon: "refresh-cw",
    action: () => {
      closeCommandPalette();
      if (window.resetSearchEngine) {
        window.resetSearchEngine();
      }
    }
  });
}

export function openCommandPalette() {
  if (!DOM.cmdPalette || !DOM.cmdInput) return;
  DOM.cmdPalette.classList.add("open");
  DOM.cmdInput.value = "";
  state.selectedCmdIndex = 0;
  
  // Set focus
  setTimeout(() => {
    DOM.cmdInput.focus();
    renderCmdResults("");
  }, 50);
}

export function closeCommandPalette() {
  if (DOM.cmdPalette) {
    DOM.cmdPalette.classList.remove("open");
  }
}

export function renderCmdResults(query: string) {
  if (!DOM.cmdResultsWrapper) return;
  DOM.cmdResultsWrapper.innerHTML = "";
  
  const q = query.toLowerCase().trim();
  
  const matches = commandList.filter(item => {
    if (!q) return true;
    return item.title.toLowerCase().includes(q) || 
           item.subtitle.toLowerCase().includes(q) || 
           item.category.toLowerCase().includes(q);
  });

  if (matches.length === 0) {
    DOM.cmdResultsWrapper.innerHTML = `
      <div class="cmd-empty-state">
        <i data-lucide="help-circle" style="width:24px; height:24px; margin-bottom:8px; color:var(--text-muted);"></i>
        <p>No console bindings found matching '${query}'</p>
      </div>
    `;
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
    return;
  }

  // Bound index constraint safety
  if (state.selectedCmdIndex >= matches.length) {
    state.selectedCmdIndex = matches.length - 1;
  }
  if (state.selectedCmdIndex < 0) {
    state.selectedCmdIndex = 0;
  }

  matches.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = `cmd-result-item ${index === state.selectedCmdIndex ? 'active' : ''}`;
    row.id = `cmd-item-${item.id}`;
    
    row.onclick = () => {
      item.action();
    };

    row.onmouseenter = () => {
      state.selectedCmdIndex = index;
      // Refresh active class across sibling rows
      const items = DOM.cmdResultsWrapper.querySelectorAll(".cmd-result-item");
      items.forEach((it, i) => {
        if (i === index) it.classList.add("active");
        else it.classList.remove("active");
      });
    };

    row.innerHTML = `
      <i data-lucide="${item.icon}" class="cmd-item-icon"></i>
      <div class="cmd-item-info">
        <div class="cmd-item-title">${item.title}</div>
        <div class="cmd-item-subtitle">${item.subtitle}</div>
      </div>
      <div class="cmd-item-badge">${item.category.toUpperCase()}</div>
    `;

    DOM.cmdResultsWrapper.appendChild(row);
  });

  // Handle active row auto-scroll view alignment
  const activeEl = DOM.cmdResultsWrapper.querySelector(".cmd-result-item.active") as HTMLElement;
  if (activeEl) {
    activeEl.scrollIntoView({ block: "nearest" });
  }

  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

export function handleCmdInputKeydown(e: KeyboardEvent, query: string) {
  const q = query.toLowerCase().trim();
  const matches = commandList.filter(item => {
    if (!q) return true;
    return item.title.toLowerCase().includes(q) || 
           item.subtitle.toLowerCase().includes(q) || 
           item.category.toLowerCase().includes(q);
  });

  if (matches.length === 0) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    state.selectedCmdIndex = (state.selectedCmdIndex + 1) % matches.length;
    renderCmdResults(query);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    state.selectedCmdIndex = (state.selectedCmdIndex - 1 + matches.length) % matches.length;
    renderCmdResults(query);
  } else if (e.key === "Enter") {
    e.preventDefault();
    const activeItem = matches[state.selectedCmdIndex];
    if (activeItem) {
      activeItem.action();
    }
  } else if (e.key === "Escape") {
    e.preventDefault();
    closeCommandPalette();
  }
}

// Global hookups
declare global {
  interface Window {
    openCommandPalette: typeof openCommandPalette;
    closeCommandPalette: typeof closeCommandPalette;
  }
}

window.openCommandPalette = openCommandPalette;
window.closeCommandPalette = closeCommandPalette;
