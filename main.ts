// Leonida Platinum — a GTA 6 trophy guide and tracker (Node 22, standard library only): the guide is this
// directory's app/ folder, plain static files a browser opens at app/index.html (ES modules, CSS, no build step),
// offline: it loads nothing over the network, and its trophy list and guides are app/data/trophies.json. The program
// hands it in: it copies app/ and screenshots/ from beside this file to /output and writes /output/dossier.json, the
// summary the judge reads (your screenshots, the first load's files and bytes, and your source), with the vendored
// make.fun library. Leave vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to be byte for byte
// what its own copy writes.
//
// The guide itself: all 55 trophies with their official names, descriptions and grades, a cited guide in our own
// words for each, a 5-step roadmap to the platinum, missable flags, and a tracker (localStorage, export/import,
// filters by kind and grade, and a spoiler setting that hides story trophies until earned).
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Clear the output directory's contents first so a stale file from an
// earlier run can never leak into the handed-in entry; the copies below
// rebuild it from scratch, which also keeps repeated runs byte-identical.
// Only the entries inside the directory are removed, never the directory
// itself: in the grader /output is a mount point and the runner cannot
// remove it (no write permission on its parent).
mkdirSync(out, { recursive: true });
for (const entry of readdirSync(out)) rmSync(join(out, entry), { recursive: true, force: true });

cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
