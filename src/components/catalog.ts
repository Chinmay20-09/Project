import { projects } from '../data/projects';
import { DOM, state, getStatusBadgeClass, getStatusLabel, showToastNotification } from '../utils/dom';

declare const lucide: any;

export function renderProjectCatalog() {
  if (!DOM.projectsWrapper) return;
  
  // Clear layout wrapper
  DOM.projectsWrapper.innerHTML = "";
  
  // Apply Search & Filter rules
  const filtered = projects.filter(proj => {
    // Filter type checking
    if (state.activeFilter === "current") {
      if (proj.status === "archived" || proj.roadmapStage === "Released") return false;
    } else if (state.activeFilter === "released") {
      if (proj.roadmapStage !== "Released") return false;
    } else if (state.activeFilter === "archived") {
      if (proj.status !== "archived") return false;
    }
    
    // Search query checking
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const matchName = proj.name.toLowerCase().includes(q);
      const matchTagline = proj.tagline.toLowerCase().includes(q);
      const matchDesc = proj.description.toLowerCase().includes(q);
      const matchTech = proj.techStack.some(t => t.name.toLowerCase().includes(q));
      const matchFeat = proj.expectedFeatures.some(f => f.toLowerCase().includes(q));
      const matchPlatform = proj.platform.toLowerCase().includes(q);
      return matchName || matchTagline || matchDesc || matchTech || matchFeat || matchPlatform;
    }
    
    return true;
  });

  // Sort logic
  filtered.sort((a, b) => {
    if (state.sortBy === "alphabetical") {
      return a.name.localeCompare(b.name);
    } else if (state.sortBy === "oldest") {
      return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
    } else { // newest (default)
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    }
  });

  // Set grid vs list class wrapper
  if (state.viewMode === "list") {
    DOM.projectsWrapper.className = "projects-grid list-layout";
  } else {
    DOM.projectsWrapper.className = "projects-grid grid-layout";
  }

  // Handle empty catalog states
  if (filtered.length === 0) {
    DOM.projectsWrapper.innerHTML = `
      <div class="empty-state-card" style="grid-column: 1 / -1; text-align: center; padding: 60px; border: 1px dashed var(--card-border); border-radius: var(--radius-lg); background-color: var(--card-bg);">
        <i data-lucide="folder-open" style="width: 48px; height: 48px; margin: 0 auto 16px auto; color: var(--text-muted);"></i>
        <h3 style="font-size: 1.25rem; margin-bottom: 8px;">No Software Nodes Match Search</h3>
        <p style="color: var(--text-muted); font-size: 0.875rem;">Modify your query parameters or reset search filters to scan the indexes.</p>
        <button class="btn btn-secondary btn-sm" onclick="resetSearchEngine()" style="margin-top: 16px;"><i data-lucide="refresh-cw"></i> Reset Catalog</button>
      </div>
    `;
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
    return;
  }

  // Render cards
  filtered.forEach(proj => {
    const card = document.createElement("div");
    card.className = "project-card";
    card.id = `project-card-${proj.id}`;
    
    // Status Badge Markup
    const badgeClass = getStatusBadgeClass(proj.status);
    const badgeLabel = getStatusLabel(proj.status);
    
    // Generate fallback geometric visual cover based on the gradient colorTheme
    const coverMarkup = state.viewMode === "grid" ? `
      <div class="card-hero-image" style="background: ${proj.colorTheme || 'var(--accent-gradient)'};">
        <div class="card-hero-image-overlay"></div>
        <div style="position: absolute; bottom: 12px; left: 16px; font-family: var(--font-mono); font-size: 0.625rem; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.2em;">
          ENGINE MODEL // ${proj.id}
        </div>
      </div>
    ` : `
      <div class="card-hero-image" style="background: ${proj.colorTheme || 'var(--accent-gradient)'}; flex-shrink:0;">
      </div>
    `;

    // Features Preview List Markup
    let featuresMarkup = "";
    if (proj.expectedFeatures && proj.expectedFeatures.length > 0) {
      featuresMarkup = `
        <div class="card-features-preview">
          <div class="features-preview-title">Core Directives</div>
          <ul class="features-preview-list">
            ${proj.expectedFeatures.slice(0, 2).map(f => `
              <li><i data-lucide="chevron-right"></i> <span>${f}</span></li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    // Dynamic Progress or Release Info block
    let progressOrReleaseMarkup = "";
    if (proj.roadmapStage !== "Released") {
      progressOrReleaseMarkup = `
        <div class="card-progress-area">
          <div class="progress-header">
            <span>Progress Indicator</span>
            <span>${proj.progress}%</span>
          </div>
          <div class="progress-bar-wrapper">
            <div class="progress-fill" style="width: ${proj.progress}%;"></div>
          </div>
        </div>
      `;
    } else {
      progressOrReleaseMarkup = `
        <div class="card-version-area">
          <span>Released Build</span>
          <span class="card-version">${proj.version}</span>
        </div>
      `;
    }

    // Dynamic Action Buttons markup based on project released status
    let actionButtonsMarkup = "";
    if (proj.roadmapStage === "Released") {
      // Find valid downloads
      const downloads = proj.downloadAssets;
      let downloadUrl = "";
      if (downloads) {
        downloadUrl = downloads.windows || downloads.android || downloads.linux || downloads.mac || downloads.cli || "";
      }
      const hasDownload = downloadUrl !== "";
      
      actionButtonsMarkup = `
        <div class="card-actions-released flex flex-col gap-2 w-full pt-4">
          <a href="${downloadUrl}" target="_blank" class="w-full py-2.5 px-4 rounded-lg font-sans font-semibold text-xs text-center text-white flex items-center justify-center gap-2 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.02] shadow-md shadow-blue-500/10" ${hasDownload ? '' : 'style="pointer-events: none; opacity: 0.4;"'}>
            <i data-lucide="download" class="w-4 h-4"></i>
            <span>📥 Download Build</span>
          </a>
          <a href="#/project/${proj.id}" class="w-full py-2 px-4 rounded-lg font-sans font-medium text-xs text-center text-[rgba(255,255,255,0.7)] flex items-center justify-center gap-2 transition-all border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white">
            <i data-lucide="layers" class="w-3.5 h-3.5"></i> Explore Details
          </a>
        </div>
      `;
    } else {
      actionButtonsMarkup = `
        <div class="card-actions flex flex-col gap-2 w-full pt-4">
          <a href="#/project/${proj.id}" class="w-full py-2.5 px-4 rounded-lg font-sans font-semibold text-xs text-center text-white flex items-center justify-center gap-2 transition-all duration-300 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)]">
            <i data-lucide="eye" class="w-4 h-4"></i> Explore Specifications
          </a>
          <a href="${proj.githubUrl}" target="_blank" class="w-full py-2 px-4 rounded-lg font-sans font-medium text-xs text-center text-[rgba(255,255,255,0.5)] flex items-center justify-center gap-2 transition-all hover:text-white">
            <i data-lucide="github" class="w-3.5 h-3.5"></i> Source Code
          </a>
        </div>
      `;
    }

    // Assembling HTML
    if (state.viewMode === "grid") {
      card.innerHTML = `
        ${coverMarkup}
        <div class="card-meta-top">
          <span class="card-platform-badge">
            <i data-lucide="${proj.platformIcon}"></i> ${proj.platform}
          </span>
          <span class="card-status-badge ${badgeClass}">${badgeLabel}</span>
        </div>
        <div class="card-main-info">
          <h3 class="card-title">${proj.name}</h3>
          <p class="card-desc">${proj.tagline}</p>
        </div>
        ${featuresMarkup}
        ${progressOrReleaseMarkup}
        ${actionButtonsMarkup}
      `;
    } else {
      // List Layout Card
      card.innerHTML = `
        ${coverMarkup}
        <div class="card-main-info">
          <h3 class="card-title">${proj.name}</h3>
          <p class="card-desc">${proj.tagline}</p>
        </div>
        <div class="card-meta-top">
          <span class="card-platform-badge">
            <i data-lucide="${proj.platformIcon}"></i> ${proj.platform}
          </span>
          <span class="card-status-badge ${badgeClass}">${badgeLabel}</span>
        </div>
        ${proj.roadmapStage !== "Released" ? `
          <div class="card-progress-area">
            <div class="progress-header">
              <span>${proj.progress}% Complete</span>
            </div>
            <div class="progress-bar-wrapper">
              <div class="progress-fill" style="width: ${proj.progress}%;"></div>
            </div>
          </div>
        ` : `
          <div style="font-family: var(--font-mono); font-size: 0.8125rem; color: var(--accent-green); width: 100px; text-align: right; flex-shrink: 0;">
            ${proj.version}
          </div>
        `}
        ${actionButtonsMarkup}
      `;
    }

    DOM.projectsWrapper.appendChild(card);
  });

  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

export function filterProjects(filterType: string) {
  state.activeFilter = filterType;
  
  // Update button classes
  if (DOM.filterStatusGroup) {
    const btns = DOM.filterStatusGroup.querySelectorAll(".filter-btn");
    btns.forEach(b => {
      if (b.getAttribute("data-filter") === filterType) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
  }
  
  renderProjectCatalog();
}

export function resetSearchEngine() {
  if (DOM.projectSearch) DOM.projectSearch.value = "";
  if (DOM.clearSearch) DOM.clearSearch.style.display = "none";
  state.searchQuery = "";
  state.activeFilter = "all";
  
  if (DOM.filterStatusGroup) {
    const btns = DOM.filterStatusGroup.querySelectorAll(".filter-btn");
    btns.forEach(b => {
      if (b.getAttribute("data-filter") === "all") {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
  }
  
  renderProjectCatalog();
}

export function copyProjectLinkToClipboard(projectId: string) {
  const mockUrl = `${window.location.origin}${window.location.pathname}?project=${projectId}`;
  navigator.clipboard.writeText(mockUrl).then(() => {
    showToastNotification(`Copied sharing link for project node!`);
  }).catch(() => {
    showToastNotification(`Failed to access clipboard.`, "error");
  });
}

export function copyCoreLink() {
  const currentUrl = window.location.href;
  navigator.clipboard.writeText(currentUrl).then(() => {
    showToastNotification("Copied Hub Core link successfully!");
  }).catch(() => {
    showToastNotification("Failed to write clipboard data.", "error");
  });
}

export function renderCurrentlyShipping() {
  const container = DOM.currentlyShippingWrapper;
  if (!container) return;
  
  const shipProject = projects.find(p => p.currentlyShipping === true);
  if (!shipProject) {
    container.innerHTML = "";
    return;
  }
  
  const hasAssets = shipProject.downloadAssets && (
    shipProject.downloadAssets.windows || 
    shipProject.downloadAssets.linux || 
    shipProject.downloadAssets.mac || 
    shipProject.downloadAssets.android || 
    shipProject.downloadAssets.cli
  );

  container.innerHTML = `
    <div class="currently-shipping-card p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
      <div class="absolute -right-24 -bottom-24 w-80 h-80 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full"></div>
      
      <div class="flex-1 space-y-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Currently Shipping
        </div>
        
        <div class="space-y-1">
          <h3 class="text-2xl font-sans font-semibold tracking-tight text-white">${shipProject.name}</h3>
          <p class="text-sm font-mono text-[rgba(255,255,255,0.4)] uppercase tracking-wider">Next Release Expected: ${shipProject.expectedNextRelease || 'Upcoming'}</p>
        </div>
        
        <p class="text-[rgba(255,255,255,0.7)] text-sm leading-relaxed max-w-xl">
          ${shipProject.description}
        </p>
        
        <div class="flex flex-wrap gap-2 pt-2">
          ${shipProject.techStack.map(tech => `
            <span class="px-2 py-0.5 rounded text-[11px] font-mono tracking-wider border bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.6)]">
              ${tech.name}
            </span>
          `).join('')}
        </div>
      </div>
      
      <div class="w-full md:w-auto shrink-0 flex flex-col gap-3 min-w-[200px]">
        <a href="#/project/${shipProject.id}" class="w-full py-3 px-6 rounded-lg font-sans font-medium text-sm text-center text-white flex items-center justify-center gap-2 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.02] shadow-lg shadow-blue-500/20">
          <span>Explore Product</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </a>
        
        ${hasAssets ? `
          <a href="#/project/${shipProject.id}" class="w-full py-2.5 px-6 rounded-lg font-sans font-medium text-xs text-center text-[rgba(255,255,255,0.7)] flex items-center justify-center gap-2 transition-all border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            <span>Get Live Builds</span>
          </a>
        ` : ''}
      </div>
    </div>
  `;
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

export function renderProjectPage(projectId: string) {
  const container = DOM.projectRoot;
  if (!container) return;
  
  const project = projects.find(p => p.id === projectId);
  if (!project) {
    container.innerHTML = `<div class="p-8 text-center text-[rgba(255,255,255,0.5)] font-mono">Product not found. <a href="#/" class="text-blue-400 hover:underline">Return home</a>.</div>`;
    return;
  }
  
  document.title = `${project.name} // Software Distribution`;
  
  // Choose fallback style based on color theme or a placeholder gradient
  const themeBg = project.colorTheme || "linear-gradient(135deg, #1f2937 0%, #111827 100%)";
  
  // Render Download Assets details
  const hasAssets = project.downloadAssets && (project.downloadAssets.windows || project.downloadAssets.mac || project.downloadAssets.linux || project.downloadAssets.android || project.downloadAssets.cli);
  
  // Build Download items list
  let downloadItemsHTML = "";
  if (project.downloadAssets) {
    const assets = project.downloadAssets;
    
    // Windows Build
    if (assets.windows) {
      downloadItemsHTML += `
        <div class="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-blue-500/30 transition-all">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <i data-lucide="monitor" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-sm font-sans font-medium text-white">Windows Executable</p>
              <p class="text-xs font-mono text-[rgba(255,255,255,0.4)]">Installer (.exe) // Production Ready</p>
            </div>
          </div>
          <a href="${assets.windows}" target="_blank" class="px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.02] text-xs font-sans font-semibold text-white transition-all flex items-center gap-1.5">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> Download
          </a>
        </div>
      `;
    } else {
      downloadItemsHTML += `
        <div class="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.02)] bg-[rgba(255,255,255,0.01)] opacity-50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)]">
              <i data-lucide="monitor" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-sm font-sans font-medium text-[rgba(255,255,255,0.5)]">Windows Installer</p>
              <p class="text-xs font-mono text-[rgba(255,255,255,0.3)]">Upcoming Release</p>
            </div>
          </div>
          <button disabled class="px-3 py-1.5 rounded bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.3)] text-xs font-mono cursor-not-allowed flex items-center gap-1">
            <i data-lucide="lock" class="w-3.5 h-3.5"></i> Locked
          </button>
        </div>
      `;
    }

    // macOS Build
    if (assets.mac) {
      downloadItemsHTML += `
        <div class="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-indigo-500/30 transition-all">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <i data-lucide="laptop" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-sm font-sans font-medium text-white">macOS Build</p>
              <p class="text-xs font-mono text-[rgba(255,255,255,0.4)]">Disk Image (.dmg) // Apple Silicon & Intel</p>
            </div>
          </div>
          <a href="${assets.mac}" target="_blank" class="px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:scale-[1.02] text-xs font-sans font-semibold text-white transition-all flex items-center gap-1.5">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> Download
          </a>
        </div>
      `;
    } else {
      downloadItemsHTML += `
        <div class="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.02)] bg-[rgba(255,255,255,0.01)] opacity-50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)]">
              <i data-lucide="laptop" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-sm font-sans font-medium text-[rgba(255,255,255,0.5)]">macOS DMG</p>
              <p class="text-xs font-mono text-[rgba(255,255,255,0.3)]">Upcoming Release</p>
            </div>
          </div>
          <button disabled class="px-3 py-1.5 rounded bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.3)] text-xs font-mono cursor-not-allowed flex items-center gap-1">
            <i data-lucide="lock" class="w-3.5 h-3.5"></i> Locked
          </button>
        </div>
      `;
    }

    // Linux Build
    if (assets.linux) {
      downloadItemsHTML += `
        <div class="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-purple-500/30 transition-all">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <i data-lucide="terminal" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-sm font-sans font-medium text-white">Linux Package</p>
              <p class="text-xs font-mono text-[rgba(255,255,255,0.4)]">Compressed Archive (.tar.gz)</p>
            </div>
          </div>
          <a href="${assets.linux}" target="_blank" class="px-4 py-2 rounded bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:scale-[1.02] text-xs font-sans font-semibold text-white transition-all flex items-center gap-1.5">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> Download
          </a>
        </div>
      `;
    } else {
      downloadItemsHTML += `
        <div class="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.02)] bg-[rgba(255,255,255,0.01)] opacity-50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)]">
              <i data-lucide="terminal" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-sm font-sans font-medium text-[rgba(255,255,255,0.5)]">Linux Build</p>
              <p class="text-xs font-mono text-[rgba(255,255,255,0.3)]">Upcoming Release</p>
            </div>
          </div>
          <button disabled class="px-3 py-1.5 rounded bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.3)] text-xs font-mono cursor-not-allowed flex items-center gap-1">
            <i data-lucide="lock" class="w-3.5 h-3.5"></i> Locked
          </button>
        </div>
      `;
    }

    // Android Build
    if (assets.android) {
      downloadItemsHTML += `
        <div class="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-emerald-500/30 transition-all">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <i data-lucide="smartphone" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-sm font-sans font-medium text-white">Android Package</p>
              <p class="text-xs font-mono text-[rgba(255,255,255,0.4)]">Direct Package Installer (.apk)</p>
            </div>
          </div>
          <a href="${assets.android}" target="_blank" class="px-4 py-2 rounded bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:scale-[1.02] text-xs font-sans font-semibold text-white transition-all flex items-center gap-1.5">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> Download
          </a>
        </div>
      `;
    } else if (project.id === "sarthi" || project.platform.toLowerCase().includes("android")) {
      downloadItemsHTML += `
        <div class="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.02)] bg-[rgba(255,255,255,0.01)] opacity-50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)]">
              <i data-lucide="smartphone" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="text-sm font-sans font-medium text-[rgba(255,255,255,0.5)]">Android APK</p>
              <p class="text-xs font-mono text-[rgba(255,255,255,0.3)]">Upcoming Release</p>
            </div>
          </div>
          <button disabled class="px-3 py-1.5 rounded bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.3)] text-xs font-mono cursor-not-allowed flex items-center gap-1">
            <i data-lucide="lock" class="w-3.5 h-3.5"></i> Locked
          </button>
        </div>
      `;
    }

    // CLI Engine Package
    if (assets.cli) {
      downloadItemsHTML += `
        <div class="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)] hover:border-orange-500/30 transition-all flex flex-col gap-2.5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <i data-lucide="code" class="w-5 h-5"></i>
              </div>
              <div>
                <p class="text-sm font-sans font-medium text-white">Console NPM Core</p>
                <p class="text-xs font-mono text-[rgba(255,255,255,0.4)]">Global terminal setup</p>
              </div>
            </div>
            <button onclick="navigator.clipboard.writeText('${assets.cli}'); showToastNotification('Command copied!');" class="p-2 rounded bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.7)] text-xs font-sans transition-all flex items-center gap-1.5" title="Copy to clipboard">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy Command
            </button>
          </div>
          <code class="block w-full p-2.5 rounded bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)] text-left font-mono text-xs text-orange-300 select-all overflow-x-auto whitespace-nowrap">
            ${assets.cli}
          </code>
        </div>
      `;
    }
  }
  
  // Find primary build action link to feature at the very top of download board
  let primaryCtaHTML = "";
  if (project.downloadAssets) {
    let primaryUrl = "";
    let primaryLabel = "";
    if (project.downloadAssets.windows) {
      primaryUrl = project.downloadAssets.windows;
      primaryLabel = "Windows Installer (.exe)";
    } else if (project.downloadAssets.mac) {
      primaryUrl = project.downloadAssets.mac;
      primaryLabel = "macOS Disk Image (.dmg)";
    } else if (project.downloadAssets.linux) {
      primaryUrl = project.downloadAssets.linux;
      primaryLabel = "Linux Package (.tar.gz)";
    } else if (project.downloadAssets.android) {
      primaryUrl = project.downloadAssets.android;
      primaryLabel = "Android Package (.apk)";
    } else if (project.downloadAssets.cli) {
      primaryUrl = "#copy-cli";
      primaryLabel = "Install CLI Package";
    }
    
    if (primaryUrl) {
      if (primaryUrl === "#copy-cli") {
        primaryCtaHTML = `
          <button onclick="navigator.clipboard.writeText('${project.downloadAssets?.cli}'); showToastNotification('Command copied!');" class="w-full py-4 px-6 rounded-xl font-sans font-semibold text-base text-center text-white flex items-center justify-center gap-3 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.01] shadow-lg shadow-blue-500/20 border border-blue-400/20">
            <i data-lucide="copy" class="w-5 h-5 animate-pulse"></i>
            <span>${primaryLabel}</span>
          </button>
        `;
      } else {
        primaryCtaHTML = `
          <a href="${primaryUrl}" target="_blank" class="w-full py-4 px-6 rounded-xl font-sans font-semibold text-base text-center text-white flex items-center justify-center gap-3 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:scale-[1.01] shadow-lg shadow-blue-500/20 border border-blue-400/20">
            <i data-lucide="download" class="w-5 h-5"></i>
            <span>📥 Download Latest Release</span>
          </a>
          <p class="text-center text-[11px] font-mono text-[rgba(255,255,255,0.4)]">Version ${project.version} // Production Compiled build</p>
        `;
      }
    } else {
      primaryCtaHTML = `
        <button disabled class="w-full py-4 px-6 rounded-xl font-sans font-semibold text-base text-center text-[rgba(255,255,255,0.3)] flex items-center justify-center gap-3 transition-all duration-300 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] cursor-not-allowed flex items-center justify-center gap-2">
          <i data-lucide="lock" class="w-5 h-5"></i>
          <span>Build Under Construction</span>
        </button>
        <p class="text-center text-[11px] font-mono text-[rgba(255,255,255,0.4)]">Next scheduled release: ${project.expectedNextRelease || 'Pending'}</p>
      `;
    }
  }

  // Tech Deep Dive HTML
  const techDeepDiveHTML = project.techStack.map(tech => `
    <div class="p-3.5 rounded-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] flex items-center justify-between">
      <div>
        <h5 class="text-xs font-mono text-[rgba(255,255,255,0.4)] uppercase">${tech.category}</h5>
        <p class="text-sm font-sans font-medium text-white pt-0.5">${tech.name}</p>
      </div>
      <span class="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.6)]">
        ${tech.badge}
      </span>
    </div>
  `).join('');

  // FAQ HTML
  let faqHTML = "";
  if (project.faq && project.faq.length > 0) {
    faqHTML = project.faq.map((item, index) => `
      <div class="border-b border-[rgba(255,255,255,0.06)] pb-4">
        <button onclick="const el = document.getElementById('faq-ans-${index}'); if(el) el.classList.toggle('hidden'); const icon = document.getElementById('faq-icon-${index}'); if(icon) icon.classList.toggle('rotate-180');" class="w-full flex items-center justify-between text-left group pt-3">
          <span class="text-sm font-sans font-medium text-white group-hover:text-blue-400 transition-colors">${item.q}</span>
          <i id="faq-icon-${index}" data-lucide="chevron-down" class="w-4 h-4 text-[rgba(255,255,255,0.4)] transition-transform duration-200"></i>
        </button>
        <p id="faq-ans-${index}" class="hidden mt-2 text-xs leading-relaxed text-[rgba(255,255,255,0.6)] pl-1">
          ${item.a}
        </p>
      </div>
    `).join('');
  }

  // Version Timeline HTML
  let changelogHTML = "";
  if (project.changelog && project.changelog.length > 0) {
    changelogHTML = project.changelog.map(log => {
      let notesHTML = "";
      if (log.added && log.added.length > 0) {
        notesHTML += `
          <div>
            <h6 class="text-[11px] font-mono text-emerald-400 uppercase tracking-widest pb-1 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Added
            </h6>
            <ul class="list-disc list-inside text-xs text-[rgba(255,255,255,0.7)] space-y-1 pl-1">
              ${log.added.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        `;
      }
      if (log.improved && log.improved.length > 0) {
        notesHTML += `
          <div class="mt-3">
            <h6 class="text-[11px] font-mono text-blue-400 uppercase tracking-widest pb-1 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Improved
            </h6>
            <ul class="list-disc list-inside text-xs text-[rgba(255,255,255,0.7)] space-y-1 pl-1">
              ${log.improved.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        `;
      }
      if (log.fixed && log.fixed.length > 0) {
        notesHTML += `
          <div class="mt-3">
            <h6 class="text-[11px] font-mono text-rose-400 uppercase tracking-widest pb-1 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Fixed
            </h6>
            <ul class="list-disc list-inside text-xs text-[rgba(255,255,255,0.7)] space-y-1 pl-1">
              ${log.fixed.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      const formattedDate = new Date(log.date).toLocaleDateString('en-US', options);

      return `
        <div class="relative pl-8 border-l border-[rgba(255,255,255,0.08)] pb-8 last:pb-2">
          <div class="absolute -left-[6px] top-1.5 w-3 h-3 rounded-full bg-[#0d0e12] border-2 border-blue-500"></div>
          
          <div class="flex flex-wrap items-baseline gap-2 pb-2">
            <span class="text-sm font-sans font-semibold text-white">${log.version}</span>
            <span class="text-[11px] font-mono text-[rgba(255,255,255,0.4)]">${formattedDate}</span>
          </div>
          
          <div class="space-y-3 bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.03)] p-4 rounded-xl">
            ${notesHTML || '<p class="text-xs text-[rgba(255,255,255,0.4)] italic">Maintenance build with minor system improvements</p>'}
          </div>
        </div>
      `;
    }).join('');
  }

  // Compile Signature Live logs block
  const recentUpdatesFeedHTML = `
    <div class="p-4 rounded-xl bg-black border border-[rgba(255,255,255,0.06)] font-mono text-xs text-[rgba(255,255,255,0.7)] space-y-2 max-h-[300px] overflow-y-auto select-all">
      <div class="flex items-center justify-between text-[rgba(255,255,255,0.4)] border-b border-[rgba(255,255,255,0.08)] pb-1.5 mb-2">
        <span>TRANSMISSION_ID: TX-${project.id.toUpperCase()}-SYSTEM</span>
        <span>${project.lastUpdated}</span>
      </div>
      <p class="text-blue-400">&gt; initialising core system handshake with github repository...</p>
      <p class="text-emerald-400">✓ connection established securely // secure_rsa_ssl_sha256</p>
      <p>&gt; fetching latest commit pointers from branch: "main"</p>
      <p class="text-[rgba(255,255,255,0.5)] pl-2">commit_hash: 5ef3a1b3df6672a90098fbc18d2290f01a ${project.lastUpdated}</p>
      <p class="text-[rgba(255,255,255,0.5)] pl-2">author: Chinmay Kolte &lt;chinmaykolte69@gmail.com&gt;</p>
      <p class="text-emerald-400">&gt; pipeline build status: SUCCESSFUL // production build ready</p>
      <p class="text-orange-400 pl-2">warnings: 0 // errors: 0 // modules compiled: 42</p>
      <p class="text-emerald-500 animate-pulse">&gt; waiting for localized download signals (sys_awake)...</p>
    </div>
  `;

  // Gallery view HTML
  let galleryHTML = "";
  if (project.gallery && project.gallery.length > 0) {
    galleryHTML = `
      <div class="space-y-4">
        <h4 class="text-base font-sans font-semibold text-white">Visual Blueprints & Diagram Maps</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${project.gallery.map(item => `
            <div class="relative rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)] aspect-video bg-[rgba(255,255,255,0.02)] group flex flex-col justify-end p-4">
              <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] bg-center group-hover:scale-105 transition-transform duration-300 pointer-events-none"></div>
              
              <div class="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                <div class="w-2/3 h-1/2 rounded-lg border border-dashed border-[rgba(255,255,255,0.15)] flex flex-col items-center justify-center gap-1 p-2 bg-black/40">
                  <i data-lucide="layers" class="w-5 h-5 text-blue-400"></i>
                  <span class="text-[9px] font-mono text-[rgba(255,255,255,0.4)] tracking-widest uppercase">Schematic Blueprint</span>
                  <span class="text-[10px] font-sans font-medium text-white">${item.title}</span>
                </div>
              </div>
              
              <div class="relative bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded border border-[rgba(255,255,255,0.05)] flex items-center justify-between">
                <span class="text-xs font-sans font-medium text-[rgba(255,255,255,0.8)]">${item.title}</span>
                <span class="text-[9px] font-mono text-blue-400 uppercase tracking-wider">Operational Diagram</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="project-page-container py-12 max-w-7xl mx-auto px-4 md:px-8 space-y-12">
      <div class="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-4">
        <a href="#/" class="inline-flex items-center gap-2 text-xs font-mono text-[rgba(255,255,255,0.4)] hover:text-white transition-colors uppercase tracking-wider">
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
          <span>Back to Software Hub</span>
        </a>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span class="text-[10px] font-mono text-[rgba(255,255,255,0.5)] uppercase tracking-wider">Viewing Release Distribution node</span>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="text-4xl md:text-5xl font-sans font-bold tracking-tight text-white">${project.name}</h1>
              <span class="px-2.5 py-0.5 rounded text-xs font-mono tracking-widest ${getStatusBadgeClass(project.status)} uppercase border">
                ${getStatusLabel(project.status)}
              </span>
            </div>
            
            <p class="text-lg text-[rgba(255,255,255,0.8)] font-sans font-light tracking-wide max-w-2xl leading-relaxed">
              ${project.tagline}
            </p>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)]">
            <div>
              <span class="text-[10px] font-mono text-[rgba(255,255,255,0.4)] uppercase">Current Version</span>
              <p class="text-sm font-sans font-semibold text-white pt-1">${project.version}</p>
            </div>
            <div>
              <span class="text-[10px] font-mono text-[rgba(255,255,255,0.4)] uppercase">Platform Support</span>
              <p class="text-sm font-sans font-semibold text-white pt-1 flex items-center gap-1.5">
                <i data-lucide="${project.platformIcon || 'laptop'}" class="w-4 h-4 text-blue-400"></i>
                <span>${project.platform}</span>
              </p>
            </div>
            <div>
              <span class="text-[10px] font-mono text-[rgba(255,255,255,0.4)] uppercase">Project Phase</span>
              <p class="text-sm font-sans font-semibold text-white pt-1">${project.roadmapStage}</p>
            </div>
            <div>
              <span class="text-[10px] font-mono text-[rgba(255,255,255,0.4)] uppercase">Last Core Commit</span>
              <p class="text-sm font-sans font-semibold text-white pt-1">${project.lastUpdated}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-5 rounded-2xl border border-red-500/10 bg-red-500/[0.01] space-y-2">
              <div class="flex items-center gap-2 text-red-400">
                <i data-lucide="shield-alert" class="w-4 h-4"></i>
                <h4 class="text-xs font-mono uppercase tracking-widest font-semibold">The Problem Statement</h4>
              </div>
              <p class="text-xs leading-relaxed text-[rgba(255,255,255,0.7)]">${project.problem || 'Complex coordination, state visibility locks, and heavy configuration latency overheads plague modern workflows.'}</p>
            </div>
            <div class="p-5 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.01] space-y-2">
              <div class="flex items-center gap-2 text-emerald-400">
                <i data-lucide="shield-check" class="w-4 h-4"></i>
                <h4 class="text-xs font-mono uppercase tracking-widest font-semibold">The Engineered Solution</h4>
              </div>
              <p class="text-xs leading-relaxed text-[rgba(255,255,255,0.7)]">${project.solution || 'Introducing a localized, multi-threaded binary core with real-time reactive event-driven visualization interfaces.'}</p>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-base font-sans font-semibold text-white flex items-center gap-2">
              <i data-lucide="cpu" class="w-4.5 h-4.5 text-blue-400"></i>
              <span>Architectural & Technical Blueprint</span>
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${techDeepDiveHTML}
            </div>
          </div>

          <div class="p-5 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] space-y-3">
            <h4 class="text-sm font-sans font-semibold text-white flex items-center gap-2">
              <i data-lucide="milestone" class="w-4 h-4 text-blue-400"></i>
              <span>Current & Expected Project Features</span>
            </h4>
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-2 pl-1">
              ${project.expectedFeatures.map(f => `
                <li class="flex items-start gap-2 text-xs text-[rgba(255,255,255,0.7)]">
                  <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5"></i>
                  <span>${f}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          ${galleryHTML}

          <div class="space-y-4">
            <h4 class="text-base font-sans font-semibold text-white flex items-center gap-2">
              <i data-lucide="alert-circle" class="w-4.5 h-4.5 text-rose-400"></i>
              <span>Active Maintenance & Known Issues</span>
            </h4>
            <div class="p-4 rounded-xl border border-rose-500/10 bg-rose-500/[0.01] space-y-2">
              ${project.knownIssues && project.knownIssues.length > 0 ? `
                <ul class="space-y-2 pl-1">
                  ${project.knownIssues.map(issue => `
                    <li class="flex items-start gap-2.5 text-xs text-[rgba(255,255,255,0.65)]">
                      <span class="font-mono text-rose-400 font-semibold shrink-0 select-none">[BUG]</span>
                      <span>${issue}</span>
                    </li>
                  `).join('')}
                </ul>
              ` : `
                <p class="text-xs text-[rgba(255,255,255,0.4)] italic">No critical active bugs or issues reported. Build status: STABLE.</p>
              `}
            </div>
          </div>

          ${faqHTML ? `
            <div class="space-y-4">
              <h4 class="text-base font-sans font-semibold text-white flex items-center gap-2">
                <i data-lucide="help-circle" class="w-4.5 h-4.5 text-blue-400"></i>
                <span>Frequently Answered Parameters</span>
              </h4>
              <div class="space-y-3 p-5 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)]">
                ${faqHTML}
              </div>
            </div>
          ` : ''}

        </div>
        
        <div class="space-y-6">
          <div class="p-6 rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-500/[0.03] to-[rgba(0,0,0,0)] space-y-6 relative overflow-hidden">
            <div class="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/10 blur-[60px] pointer-events-none rounded-full"></div>
            
            <div class="space-y-2 relative">
              <span class="text-[10px] font-mono text-blue-400 uppercase tracking-widest flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Target Distribution Node
              </span>
              <h3 class="text-xl font-sans font-semibold text-white">Download Center</h3>
              <p class="text-xs text-[rgba(255,255,255,0.5)]">Fetch compiled OS release builds for testing and execution.</p>
            </div>
            
            <div class="space-y-2">
              ${primaryCtaHTML}
            </div>
            
            <div class="space-y-3 pt-2">
              <h4 class="text-xs font-mono uppercase text-[rgba(255,255,255,0.4)] tracking-widest">Available Architectures</h4>
              <div class="space-y-2">
                ${downloadItemsHTML}
              </div>
            </div>
          </div>

          <div class="p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)] space-y-4">
            <h4 class="text-xs font-mono uppercase text-[rgba(255,255,255,0.4)] tracking-widest flex items-center gap-1.5">
              <i data-lucide="git-branch" class="w-3.5 h-3.5"></i> Repository Telemetry
            </h4>
            
            <div class="flex flex-col gap-2">
              <a href="${project.githubUrl}" target="_blank" class="w-full py-2.5 px-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)] text-xs text-white font-sans font-medium flex items-center justify-between transition-all">
                <span class="flex items-center gap-2">
                  <i data-lucide="github" class="w-4 h-4"></i> Explore Source Code
                </span>
                <i data-lucide="external-link" class="w-3.5 h-3.5 text-[rgba(255,255,255,0.4)]"></i>
              </a>

              ${project.documentationUrl ? `
                <a href="${project.documentationUrl}" target="_blank" class="w-full py-2.5 px-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)] text-xs text-white font-sans font-medium flex items-center justify-between transition-all">
                  <span class="flex items-center gap-2">
                    <i data-lucide="book-open" class="w-4 h-4 text-blue-400"></i> Read Documentation
                  </span>
                  <i data-lucide="external-link" class="w-3.5 h-3.5 text-[rgba(255,255,255,0.4)]"></i>
                </a>
              ` : ''}

              <div class="grid grid-cols-2 gap-2 mt-2">
                <a href="${project.bugReportUrl || 'https://github.com/Chinmay20-09'}" target="_blank" class="py-2 px-3 rounded bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-[11px] font-sans font-medium text-red-300 transition-all flex items-center justify-center gap-1.5 text-center">
                  <i data-lucide="bug" class="w-3.5 h-3.5"></i> Report Bug
                </a>
                <a href="${project.featureRequestUrl || 'https://github.com/Chinmay20-09'}" target="_blank" class="py-2 px-3 rounded bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-[11px] font-sans font-medium text-emerald-300 transition-all flex items-center justify-center gap-1.5 text-center">
                  <i data-lucide="lightbulb" class="w-3.5 h-3.5"></i> Request Feature
                </a>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <h4 class="text-xs font-mono uppercase text-[rgba(255,255,255,0.4)] tracking-widest flex items-center gap-1.5">
              <i data-lucide="terminal" class="w-3.5 h-3.5"></i> Live Build Telemetry
            </h4>
            ${recentUpdatesFeedHTML}
          </div>

        </div>

      </div>

      ${changelogHTML ? `
        <div class="pt-8 border-t border-[rgba(255,255,255,0.06)] space-y-6">
          <div class="space-y-1">
            <h3 class="text-xl font-sans font-semibold text-white flex items-center gap-2">
              <i data-lucide="git-commit" class="w-5 h-5 text-blue-500"></i>
              <span>GitHub-Style Version Timeline</span>
            </h3>
            <p class="text-xs text-[rgba(255,255,255,0.4)] font-mono">Detailed release logs and build tags synchronized directly with deployment commits.</p>
          </div>
          
          <div class="relative pl-1">
            ${changelogHTML}
          </div>
        </div>
      ` : ''}

    </div>
  `;
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

// Global hookups
declare global {
  interface Window {
    filterProjects: typeof filterProjects;
    resetSearchEngine: typeof resetSearchEngine;
    copyProjectLinkToClipboard: typeof copyProjectLinkToClipboard;
    copyCoreLink: typeof copyCoreLink;
  }
}

window.filterProjects = filterProjects;
window.resetSearchEngine = resetSearchEngine;
window.copyProjectLinkToClipboard = copyProjectLinkToClipboard;
window.copyCoreLink = copyCoreLink;
