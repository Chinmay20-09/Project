import { projects } from '../data/projects';
import { DOM, state, getStatusBadgeClass, getStatusLabel, showToastNotification, formatActivityDate } from '../utils/dom';

declare const lucide: any;

export function openProjectDetailsModal(projectId: string) {
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;

  state.activeProject = proj;

  // Set header details
  if (DOM.modalTitle) DOM.modalTitle.textContent = proj.name;
  if (DOM.modalTagline) DOM.modalTagline.textContent = proj.tagline;
  if (DOM.modalVersion) DOM.modalVersion.innerHTML = `<i data-lucide="tag"></i> Version ${proj.version}`;
  if (DOM.modalPlatform) DOM.modalPlatform.innerHTML = `<i data-lucide="${proj.platformIcon}"></i> ${proj.platform}`;
  if (DOM.modalUpdated) DOM.modalUpdated.innerHTML = `<i data-lucide="calendar"></i> Updated ${proj.lastUpdated}`;
  
  // Set Status Badge
  if (DOM.modalStatus) {
    DOM.modalStatus.className = `modal-badge-status ${getStatusBadgeClass(proj.status)}`;
    DOM.modalStatus.textContent = getStatusLabel(proj.status);
  }

  // Fallback covers in modal
  if (DOM.modalImageWrapper) {
    DOM.modalImageWrapper.style.background = proj.colorTheme || "var(--accent-gradient)";
    DOM.modalImageWrapper.innerHTML = `
      <div style="width:100%; height:100%; background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)); display:flex; align-items:flex-end; padding:24px;">
        <span style="font-family: var(--font-mono); font-size:0.875rem; letter-spacing:0.1em; color:rgba(255,255,255,0.7);">
          SECURE INTEGRATION NODE // ${proj.id.toUpperCase()}
        </span>
      </div>
    `;
  }

  // Populate Description
  if (DOM.modalDescriptionFull) DOM.modalDescriptionFull.textContent = proj.description;

  // Populate Features List
  if (DOM.modalFeaturesList) {
    DOM.modalFeaturesList.innerHTML = "";
    proj.expectedFeatures.forEach(feat => {
      const li = document.createElement("li");
      li.innerHTML = `<i data-lucide="check-circle-2"></i> <span>${feat}</span>`;
      DOM.modalFeaturesList.appendChild(li);
    });
  }

  // Populate Sidebar Links
  if (DOM.modalQuickLinks) {
    DOM.modalQuickLinks.innerHTML = "";
    const dAssets = proj.downloadAssets;
    
    // Find primary file downloads
    let primaryDownloadLink = "";
    let primaryDownloadLabel = "Download Executable";
    
    if (dAssets) {
      if (dAssets.android) { primaryDownloadLink = dAssets.android; primaryDownloadLabel = "Download APK Build"; }
      else if (dAssets.windows) { primaryDownloadLink = dAssets.windows; primaryDownloadLabel = "Download MSI Installer"; }
      else if (dAssets.linux) { primaryDownloadLink = dAssets.linux; primaryDownloadLabel = "Download Linux Tar"; }
      else if (dAssets.cli) { primaryDownloadLink = "#"; primaryDownloadLabel = "CLI: npm run"; }
    }

    if (primaryDownloadLink) {
      const btn = document.createElement("button");
      btn.className = "btn btn-primary btn-sm";
      btn.innerHTML = `<i data-lucide="download"></i> ${primaryDownloadLabel}`;
      btn.onclick = () => {
        if (proj.downloadAssets && proj.downloadAssets.cli) {
          navigator.clipboard.writeText(proj.downloadAssets.cli);
          showToastNotification("Copied CLI install command!");
        } else if (primaryDownloadLink) {
          window.open(primaryDownloadLink, "_blank");
        }
      };
      DOM.modalQuickLinks.appendChild(btn);
    }

    // GitHub Link
    if (proj.githubUrl) {
      const btn = document.createElement("a");
      btn.className = "btn btn-secondary btn-sm";
      btn.href = proj.githubUrl;
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
      btn.innerHTML = `<i data-lucide="github"></i> Source Code`;
      DOM.modalQuickLinks.appendChild(btn);
    }

    // Documentation Link
    if (proj.documentationUrl) {
      const btn = document.createElement("a");
      btn.className = "btn btn-outline btn-sm";
      btn.href = proj.documentationUrl;
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
      btn.innerHTML = `<i data-lucide="book-open"></i> Technical Docs`;
      DOM.modalQuickLinks.appendChild(btn);
    }
  }

  // Set Progress Bar
  if (DOM.modalProgressBar) DOM.modalProgressBar.style.width = `${proj.progress}%`;
  if (DOM.modalProgressText) DOM.modalProgressText.textContent = `${proj.progress}%`;
  if (DOM.modalDetailPlatform) DOM.modalDetailPlatform.textContent = proj.platform;

  // Render Technology Tab Grid
  if (DOM.modalTechGrid) {
    DOM.modalTechGrid.innerHTML = "";
    proj.techStack.forEach(t => {
      const cell = document.createElement("div");
      cell.className = "tech-modal-card";
      cell.innerHTML = `
        <h4>${t.name}</h4>
        <p>${t.category}</p>
        <span class="tech-modal-badge">${t.badge}</span>
      `;
      DOM.modalTechGrid.appendChild(cell);
    });
  }

  // Render Changelogs Tab
  if (DOM.modalChangelogContainer) {
    DOM.modalChangelogContainer.innerHTML = "";
    proj.changelog.forEach(history => {
      const block = document.createElement("div");
      block.className = "changelog-release-block";
      
      const changesArr = history.changes || [];
      const addedArr = history.added || [];
      const improvedArr = history.improved || [];
      const fixedArr = history.fixed || [];

      const mergedList: string[] = [];
      addedArr.forEach(item => mergedList.push(`Added: ${item}`));
      improvedArr.forEach(item => mergedList.push(`Improved: ${item}`));
      fixedArr.forEach(item => mergedList.push(`Fixed: ${item}`));
      if (mergedList.length === 0) {
        if (changesArr.length > 0) {
          mergedList.push(...changesArr);
        } else {
          mergedList.push("Maintenance and stability updates.");
        }
      }

      block.innerHTML = `
        <div class="changelog-release-title">${history.version} <span>Released on ${history.date}</span></div>
        <div class="changelog-release-desc">
          <ul style="list-style: disc; margin-left: 20px; padding: 4px 0;">
            ${mergedList.map(c => `<li style="margin-bottom:4px;">${c}</li>`).join('')}
          </ul>
        </div>
      `;
      DOM.modalChangelogContainer.appendChild(block);
    });
  }

  // Bug tracking configure
  if (DOM.modalBugLink) DOM.modalBugLink.href = proj.bugReportUrl || "https://github.com/Chinmay20-09";
  if (DOM.modalFeatureLink) DOM.modalFeatureLink.href = proj.featureRequestUrl || "https://github.com/Chinmay20-09";

  // Known issues parsing
  if (DOM.modalIssuesList) {
    DOM.modalIssuesList.innerHTML = "";
    if (proj.knownIssues && proj.knownIssues.length > 0) {
      proj.knownIssues.forEach(is => {
        const li = document.createElement("li");
        li.innerHTML = `<i data-lucide="alert-triangle"></i> <span>${is}</span>`;
        DOM.modalIssuesList.appendChild(li);
      });
    } else {
      DOM.modalIssuesList.innerHTML = `<li><i data-lucide="check" style="color:var(--accent-green);"></i> <span>No critical known bugs are pending.</span></li>`;
    }
  }

  // Reset Modal Tabs state to Overview
  switchModalTab("overview");

  // Launch overlay
  if (DOM.projectModal) {
    DOM.projectModal.classList.add("open");
  }
  document.body.style.overflow = "hidden"; // Block body scroll
  
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

export function closeProjectDetailsModal() {
  if (DOM.projectModal) {
    DOM.projectModal.classList.remove("open");
  }
  document.body.style.overflow = ""; // Restore body scroll
  state.activeProject = null;
}

export function switchModalTab(tabId: string) {
  // Toggle buttons active classes
  if (DOM.modalTabButtons) {
    DOM.modalTabButtons.forEach(btn => {
      if (btn.getAttribute("data-tab") === tabId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  // Toggle panes
  if (DOM.modalTabPanes) {
    DOM.modalTabPanes.forEach(pane => {
      const paneId = pane.id.replace("modal-pane-", "");
      if (paneId === tabId) {
        pane.classList.add("active");
      } else {
        pane.classList.remove("active");
      }
    });
  }
}

// Register on global window scope for inline HTML handlers
declare global {
  interface Window {
    openProjectDetailsModal: typeof openProjectDetailsModal;
    closeProjectDetailsModal: typeof closeProjectDetailsModal;
    switchModalTab: typeof switchModalTab;
  }
}

window.openProjectDetailsModal = openProjectDetailsModal;
window.closeProjectDetailsModal = closeProjectDetailsModal;
window.switchModalTab = switchModalTab;
