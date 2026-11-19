// Bootstraps the guide: loads the trophy data and the roadmap, wires the
// tabs, filters, spoiler setting and progress export/import, and keeps the
// progress bar and counters in step with the tracker state.
import {
  KIND_LABELS,
  countByGrade,
  loadEarned,
  loadSettings,
  renderTrophyList,
  saveEarned,
  saveSettings,
} from './tracker.js';
import { renderDetail, renderMissableList, renderRoadmap } from './guide.js';

const listEl = document.getElementById('trophy-list');
const detailEl = document.getElementById('detail');
const roadmapEl = document.getElementById('roadmap');
const missableEl = document.getElementById('missable-list');
const progressCount = document.getElementById('progress-count');
const progressFill = document.getElementById('progress-fill');
const progressDetail = document.getElementById('progress-detail');
const listMeta = document.getElementById('list-meta');
const searchInput = document.getElementById('search');
const gradeSelect = document.getElementById('grade');
const spoilerBox = document.getElementById('spoiler');
const kindFilters = document.getElementById('kind-filters');

const trophiesDoc = await (await fetch('data/trophies.json')).json();
const roadmapDoc = await (await fetch('data/roadmap.json')).json();
const trophies = trophiesDoc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

const earned = loadEarned(trophies);
const settings = loadSettings();
let openId = null;

function renderProgress() {
  const counts = countByGrade(trophies, earned);
  progressCount.textContent = `${earned.size} of ${trophies.length} earned`;
  progressFill.style.width = `${(earned.size / trophies.length) * 100}%`;
  progressDetail.textContent =
    `${counts.platinum} platinum · ${counts.gold} gold · ${counts.silver} silver · ${counts.bronze} bronze`;
}

function renderAll() {
  renderProgress();
  const shown = renderTrophyList(listEl, trophies, earned, settings, {
    openId,
    onToggle: (id, checked) => {
      if (checked) earned.add(id);
      else earned.delete(id);
      saveEarned(earned);
      renderAll();
    },
    onOpen: (id) => {
      openId = id;
      renderAll();
    },
  });
  listMeta.textContent =
    settings.kind === 'online'
      ? 'No online trophies — all 55 are single-player, so this filter is empty on purpose.'
      : `Showing ${shown} of ${trophies.length} trophies.`;
  renderDetail(detailEl, openId === null ? null : byId.get(openId), earned, settings.spoiler);
  renderRoadmap(roadmapEl, roadmapDoc, trophies, earned, (id) => {
    openId = id;
    showView('tracker');
    renderAll();
    document.querySelector(`.trophy-card input[aria-label="Earned: ${byId.get(id).name}"]`)?.closest('.trophy-card')?.scrollIntoView({ block: 'center' });
  });
  renderMissableList(missableEl, trophies, earned, settings, {
    openId,
    onToggle: (id, checked) => {
      if (checked) earned.add(id);
      else earned.delete(id);
      saveEarned(earned);
      renderAll();
    },
    onOpen: (id) => {
      openId = id;
      showView('tracker');
      renderAll();
    },
  });
}

function showView(view) {
  for (const button of document.querySelectorAll('.tab')) {
    button.classList.toggle('is-active', button.dataset.view === view);
  }
  for (const section of document.querySelectorAll('.view')) {
    section.classList.toggle('is-active', section.id === `view-${view}`);
  }
  if (location.hash !== `#${view}`) history.replaceState(null, '', `#${view}`);
}

for (const button of document.querySelectorAll('.tab')) {
  button.addEventListener('click', () => showView(button.dataset.view));
}
window.addEventListener('hashchange', () => {
  const view = location.hash.replace('#', '');
  if (['tracker', 'roadmap', 'missable'].includes(view)) showView(view);
});

function buildKindFilters() {
  kindFilters.replaceChildren();
  for (const [kind, label] of Object.entries(KIND_LABELS)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'kind-btn';
    if (settings.kind === kind) button.classList.add('is-active');
    button.textContent = label;
    button.addEventListener('click', () => {
      settings.kind = kind;
      saveSettings(settings);
      buildKindFilters();
      renderAll();
    });
    kindFilters.append(button);
  }
}

searchInput.value = settings.search;
gradeSelect.value = settings.grade;
spoilerBox.checked = settings.spoiler;
searchInput.addEventListener('input', () => {
  settings.search = searchInput.value;
  saveSettings(settings);
  renderAll();
});
gradeSelect.addEventListener('change', () => {
  settings.grade = gradeSelect.value;
  saveSettings(settings);
  renderAll();
});
spoilerBox.addEventListener('change', () => {
  settings.spoiler = spoilerBox.checked;
  saveSettings(settings);
  renderAll();
});

function downloadProgress() {
  const payload = {
    app: 'leonida-platinum',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    spoiler: settings.spoiler,
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

document.getElementById('export').addEventListener('click', downloadProgress);
document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const payload = JSON.parse(await file.text());
    const ids = Array.isArray(payload) ? payload : payload.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list in file');
    const valid = new Set(trophies.map((t) => t.id));
    const imported = ids.filter((id) => valid.has(id));
    earned.clear();
    for (const id of imported) earned.add(id);
    saveEarned(earned);
    if (typeof payload.spoiler === 'boolean') {
      settings.spoiler = payload.spoiler;
      spoilerBox.checked = payload.spoiler;
      saveSettings(settings);
    }
    renderAll();
  } catch (error) {
    listMeta.textContent = `Could not import that file: ${error.message}`;
  }
  event.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (!window.confirm('Clear all earned trophies?')) return;
  earned.clear();
  saveEarned(earned);
  openId = null;
  renderAll();
});

buildKindFilters();
const startView = location.hash.replace('#', '');
if (['tracker', 'roadmap', 'missable'].includes(startView)) showView(startView);
renderAll();
