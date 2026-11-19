// Tracker state: what the player has earned, saved in localStorage, plus the
// filters and the spoiler setting. No network is used; the data comes from
// app/data/trophies.json, fetched from the same static server.
export const EARNED_KEY = 'leonida-platinum-earned-v1';
export const SETTINGS_KEY = 'leonida-platinum-settings-v1';

export const KIND_LABELS = {
  all: 'All kinds',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  side: 'Side quests',
  online: 'Online',
};

export function loadEarned(trophies) {
  let earned = new Set();
  try {
    const raw = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    if (Array.isArray(raw)) {
      const valid = new Set(trophies.map((t) => t.id));
      earned = new Set(raw.filter((id) => valid.has(id)));
    }
  } catch {
    earned = new Set();
  }
  return earned;
}

export function saveEarned(earned) {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function loadSettings() {
  const fallback = { spoiler: false, kind: 'all', grade: 'all', search: '' };
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    return { ...fallback, ...raw };
  } catch {
    return fallback;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function trophyIsHiddenBySpoiler(trophy, earned, spoilerOn) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.id);
}

export function trophyMatchesFilters(trophy, earned, settings) {
  if (settings.kind === 'missable' && !trophy.missable) return false;
  if (settings.kind === 'online') return false;
  if (settings.kind !== 'all' && settings.kind !== 'missable' && trophy.kind !== settings.kind) return false;
  if (settings.grade !== 'all' && trophy.grade !== settings.grade) return false;
  if (settings.search) {
    const hay = `${trophy.name} ${trophy.description}`.toLowerCase();
    if (!hay.includes(settings.search.toLowerCase())) return false;
  }
  return true;
}

export function countByGrade(trophies, earned) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) {
    if (earned.has(t.id)) counts[t.grade] += 1;
  }
  return counts;
}

// Build one trophy card. The checkbox toggles earned; clicking anywhere else
// on the card opens the guide in the detail panel beside the list.
export function buildTrophyCard(trophy, earned, spoilerOn, callbacks) {
  const li = document.createElement('li');
  li.className = 'trophy-card';
  if (earned.has(trophy.id)) li.classList.add('is-earned');
  if (callbacks.openId === trophy.id) li.classList.add('is-open');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.id);
  box.setAttribute('aria-label', `Earned: ${trophy.name}`);
  box.addEventListener('change', () => callbacks.onToggle(trophy.id, box.checked));
  box.addEventListener('click', (event) => event.stopPropagation());

  const body = document.createElement('div');
  const name = document.createElement('p');
  name.className = 'trophy-name';
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  if (trophyIsHiddenBySpoiler(trophy, earned, spoilerOn)) {
    name.textContent = 'Hidden story trophy';
    desc.textContent = 'Hidden until earned — turn off the spoiler setting or earn this trophy to reveal it.';
    desc.classList.add('spoiler-hidden');
  } else {
    name.textContent = trophy.name;
    desc.textContent = trophy.description;
  }
  body.append(name, desc);

  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  const gradeTag = document.createElement('span');
  gradeTag.className = `tag grade-${trophy.grade}`;
  gradeTag.textContent = gradeLabel(trophy.grade);
  tags.append(gradeTag);
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  tags.append(kindTag);
  if (trophy.hidden) {
    const hiddenTag = document.createElement('span');
    hiddenTag.className = 'tag hidden';
    hiddenTag.textContent = 'Hidden';
    tags.append(hiddenTag);
  }
  if (trophy.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable';
    missTag.textContent = 'Missable';
    tags.append(missTag);
  }
  body.append(tags);
  if (trophy.missable && !trophyIsHiddenBySpoiler(trophy, earned, spoilerOn)) {
    const note = document.createElement('p');
    note.className = 'missable-note';
    note.textContent = trophy.missable_reason;
    body.append(note);
  }

  const open = document.createElement('span');
  open.className = 'tag';
  open.textContent = 'Guide →';
  li.append(box, body, open);
  li.addEventListener('click', () => callbacks.onOpen(trophy.id));
  return li;
}

export function renderTrophyList(listEl, trophies, earned, settings, callbacks) {
  listEl.replaceChildren();
  const shown = trophies.filter((t) => trophyMatchesFilters(t, earned, settings));
  for (const trophy of shown) {
    listEl.append(buildTrophyCard(trophy, earned, settings.spoiler, callbacks));
  }
  return shown.length;
}
