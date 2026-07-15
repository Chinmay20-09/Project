import { projects } from '../data/projects';
import { DOM, formatActivityDate } from '../utils/dom';

declare const lucide: any;

interface ActivityEvent {
  projectId: string;
  projectName: string;
  accentColor?: string;
  version: string;
  date: string;
  changes: string[];
  eventType: 'feature' | 'hotfix' | 'release' | string;
}

export function renderGlobalActivityFeed() {
  if (!DOM.activityTimeline) return;
  DOM.activityTimeline.innerHTML = "";

  const events: ActivityEvent[] = [];
  
  projects.forEach(proj => {
    if (proj.changelog && proj.changelog.length > 0) {
      proj.changelog.forEach(change => {
        // Classify activity event type based on version
        let eventType = "feature";
        if (change.version.includes("rc") || change.version.includes("alpha") || change.version.includes("beta")) {
          eventType = "hotfix";
        } else if (parseFloat(change.version.replace(/[^\d.]/g, '')) >= 1.0) {
          eventType = "release";
        }

        // Construct changes dynamically from added, improved, and fixed if they exist
        const mergedChanges: string[] = [];
        if (change.added && change.added.length > 0) {
          change.added.forEach(item => mergedChanges.push(`Added: ${item}`));
        }
        if (change.improved && change.improved.length > 0) {
          change.improved.forEach(item => mergedChanges.push(`Improved: ${item}`));
        }
        if (change.fixed && change.fixed.length > 0) {
          change.fixed.forEach(item => mergedChanges.push(`Fixed: ${item}`));
        }
        // Fallback if they are not defined or are empty
        if (mergedChanges.length === 0) {
          if (change.changes && Array.isArray(change.changes)) {
            mergedChanges.push(...change.changes);
          } else {
            mergedChanges.push("Maintenance and stability updates.");
          }
        }

        events.push({
          projectId: proj.id,
          projectName: proj.name,
          accentColor: proj.accentColor,
          version: change.version,
          date: change.date,
          changes: mergedChanges,
          eventType: eventType
        });
      });
    }
  });

  // Sort activity feed by date desc
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  events.forEach(ev => {
    const eventEl = document.createElement("div");
    eventEl.className = "activity-event";
    eventEl.id = `activity-event-${ev.projectId}-${ev.version}`;
    
    let nodeClass = "node-feature";
    let badgeClass = "badge-feature";
    let badgeText = "Update Node";
    
    if (ev.eventType === "release") {
      nodeClass = "node-release";
      badgeClass = "badge-release";
      badgeText = "Production Release";
    } else if (ev.eventType === "hotfix") {
      nodeClass = "node-hotfix";
      badgeClass = "badge-hotfix";
      badgeText = "Testing Build";
    }

    eventEl.innerHTML = `
      <div class="activity-node ${nodeClass}"></div>
      <div class="activity-header">
        <span class="activity-date">${formatActivityDate(ev.date)}</span>
        <span class="activity-badge ${badgeClass}">${badgeText}</span>
        <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">
          COMPILER // ${ev.projectId.toUpperCase()}
        </span>
      </div>
      <div class="activity-card">
        <h3 class="activity-title">${ev.projectName} <span>${ev.version}</span></h3>
        <div class="activity-body">
          <ul class="activity-changes-list">
            ${ev.changes.map(ch => `<li>${ch}</li>`).join('')}
          </ul>
        </div>
        <div class="activity-footer">
          <a href="#" class="activity-footer-link" onclick="openProjectDetailsModal('${ev.projectId}'); return false;">
            <i data-lucide="info" style="width:14px; height:14px;"></i> Details
          </a>
          <a href="#" class="activity-footer-link" onclick="copyProjectLinkToClipboard('${ev.projectId}'); return false;">
            <i data-lucide="copy" style="width:14px; height:14px;"></i> Share
          </a>
        </div>
      </div>
    `;

    DOM.activityTimeline.appendChild(eventEl);
  });

  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}
