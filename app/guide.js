// Guide views: the detail panel beside the checklist, the roadmap to the
// platinum, and the missable-trophies list. Every guide cites its sources
// with a name and a link; nothing here is copied from another guide.
import { gradeLabel, renderTrophyList, trophyIsHiddenBySpoiler } from './tracker.js';

export function renderDetail(detailEl, trophy, earned, spoilerOn) {
  detailEl.replaceChildren();
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'detail-empty';
    empty.textContent = 'Select a trophy to read its guide and sources.';
    detailEl.append(empty);
    return;
  }

  const heading = document.createElement('h2');
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  if (trophyIsHiddenBySpoiler(trophy, earned, spoilerOn)) {
    heading.textContent = 'Hidden story trophy';
    desc.textContent = 'Hidden until earned — turn off the spoiler setting or earn this trophy to reveal it.';
    desc.classList.add('spoiler-hidden');
    detailEl.append(heading, desc);
    return;
  }
  heading.textContent = trophy.name;
  desc.textContent = trophy.description;
  detailEl.append(heading, desc);

  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  const parts = [`${gradeLabel(trophy.grade)} trophy`, trophy.kind, trophy.hidden ? 'hidden on PlayStation' : 'visible on PlayStation'];
  if (trophy.missable) parts.push('potentially missable');
  parts.push(`roadmap step ${trophy.stage}`);
  meta.textContent = parts.join(' · ');
  detailEl.append(meta);

  if (trophy.missable) {
    const warn = document.createElement('p');
    warn.className = 'missable-note';
    warn.textContent = trophy.missable_reason;
    detailEl.append(warn);
  }

  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = trophy.guide;
  detailEl.append(guide);

  const sources = document.createElement('div');
  sources.className = 'detail-sources';
  const sourcesHeading = document.createElement('h3');
  sourcesHeading.textContent = 'Sources';
  sources.append(sourcesHeading);
  const list = document.createElement('ul');
  for (const source of trophy.sources ?? []) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.name;
    link.rel = 'noopener';
    item.append(link);
    list.append(item);
  }
  sources.append(list);
  detailEl.append(sources);
}

export function renderRoadmap(roadmapEl, roadmap, trophies, earned, onOpenTrophy) {
  roadmapEl.replaceChildren();
  const byId = new Map(trophies.map((t) => [t.id, t]));
  for (const step of roadmap.stages) {
    const item = document.createElement('li');
    item.className = 'roadmap-step';
    const heading = document.createElement('h3');
    heading.textContent = step.title;
    const hours = document.createElement('p');
    hours.className = 'roadmap-hours';
    hours.textContent = step.hours;
    const summary = document.createElement('p');
    summary.textContent = step.summary;
    const chips = document.createElement('div');
    chips.className = 'roadmap-trophies';
    for (const id of step.trophies) {
      const trophy = byId.get(id);
      if (!trophy) continue;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `tag grade-${trophy.grade}`;
      chip.textContent = `${earned.has(id) ? '✓ ' : ''}${trophy.name}`;
      chip.addEventListener('click', () => onOpenTrophy(id));
      chips.append(chip);
    }
    item.append(heading, hours, summary, chips);
    roadmapEl.append(item);
  }
}

export function renderMissableList(listEl, trophies, earned, settings, callbacks) {
  const missable = trophies.filter((t) => t.missable);
  // Render the missable trophies with the same cards as the tracker.
  renderTrophyList(
    listEl,
    missable,
    earned,
    { ...settings, kind: 'all', grade: 'all', search: '' },
    callbacks,
  );
}
