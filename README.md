[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/Arcazero/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/Arcazero/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Platinum — GTA 6 Trophy Guide & Tracker

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every trophy with its official name, description and grade, a guide in our own words that cites its sources, a 5-step roadmap to the platinum, and a missable-trophy warning for the one trophy that may be missed (the Chapter 1 balcony meditation).

The tracker saves progress in the browser (localStorage), exports it to a file and imports it back, filters by kind (story, missable, collectibles, activities, side quests, online) and grade, and has a spoiler setting that hides story trophy names and descriptions until they are earned. There are no online trophies — all 55 are single-player. The app loads nothing from the network and works with the network off.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080.

## Layout

- `app/index.html` — the page: tracker, roadmap and missable views.
- `app/app.js` — boots the app and wires the controls.
- `app/tracker.js` — progress state, filters and the spoiler setting.
- `app/guide.js` — the guide detail panel, the roadmap and the missable list.
- `app/style.css` — the look (original design, no game artwork).
- `app/data/trophies.json` — the official 55 trophies with guides and sources.
- `app/data/roadmap.json` — the 5 roadmap steps.
- `main.ts` — hands the entry in (copies `app/` and `screenshots/`, writes `dossier.json`).
