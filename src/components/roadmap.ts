import { projects } from '../data/projects';
import { DOM } from '../utils/dom';

declare const lucide: any;

export function renderRoadmapBoard() {
  const columns = {
    "Ideas": DOM.roadmapCardsIdeas,
    "Planning": DOM.roadmapCardsPlanning,
    "Development": DOM.roadmapCardsDevelopment,
    "Testing": DOM.roadmapCardsTesting,
    "Released": DOM.roadmapCardsReleased,
    "Archived": DOM.roadmapCardsArchived
  };

  // Reset columns
  Object.values(columns).forEach(col => {
    if (col) col.innerHTML = "";
  });

  // Track counts
  const stageCounts: Record<string, number> = { 
    Ideas: 0, 
    Planning: 0, 
    Development: 0, 
    Testing: 0, 
    Released: 0, 
    Archived: 0 
  };

  projects.forEach(proj => {
    const stage = proj.roadmapStage;
    const targetCol = columns[stage as keyof typeof columns];
    
    if (targetCol) {
      stageCounts[stage]++;
      
      const item = document.createElement("div");
      item.className = "roadmap-item-card";
      item.id = `roadmap-item-${proj.id}`;
      item.onclick = () => {
        if (window.openProjectDetailsModal) {
          window.openProjectDetailsModal(proj.id);
        }
      };
      
      item.innerHTML = `
        <div class="roadmap-item-title">${proj.name}</div>
        <div class="roadmap-item-desc">${proj.tagline}</div>
        <div class="roadmap-item-meta">
          <span class="roadmap-item-platform">
            <i data-lucide="${proj.platformIcon}" style="width:12px; height:12px;"></i>
            ${proj.platform.split(" & ")[0]}
          </span>
          <span class="roadmap-item-progress">${stage === "Released" ? proj.version : proj.progress + "%"}</span>
        </div>
      `;
      
      targetCol.appendChild(item);
    }
  });

  // Update counts in DOM headers
  Object.keys(stageCounts).forEach(stage => {
    const colHeaderCount = document.querySelector(`.roadmap-col[data-stage="${stage}"] .roadmap-col-count`);
    if (colHeaderCount) colHeaderCount.textContent = stageCounts[stage].toString();
  });

  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}
