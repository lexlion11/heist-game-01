// Entry point for the make.fun game heist: hands game/ and screenshots/ to the grader's /output.
//
// What it does, in short: resolve the output directory (MAKEFUN_OUTPUT_DIR outside the grader's
// container, /output inside it), wipe any stale game/ and screenshots/ already sitting there so an
// old build can never leak into this run, copy the fresh game/ and screenshots/ across, sanity
// check the sizes against the scorer's caps before writing the dossier, then write dossier.json
// with the vendored make.fun library and print a one-line summary of what was handed in.
//
// Serve the game locally with `node serve.ts`, then open http://localhost:8080.
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** Count files and total bytes under a directory, recursively. */
function treeStats(dir: string): { files: number; bytes: number } {
  let files = 0;
  let bytes = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const sub = treeStats(path);
      files += sub.files;
      bytes += sub.bytes;
    } else if (entry.isFile()) {
      files += 1;
      bytes += statSync(path).size;
    }
  }
  return { files, bytes };
}

/** Human-readable byte count, e.g. 48 MiB or 1.2 KiB. */
function fmt(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${bytes} B`;
}

/** Remove a directory if it exists, so stale files from a previous run can't survive. */
function cleanDir(path: string): void {
  if (existsSync(path)) rmSync(path, { recursive: true, force: true });
}

try {
  // The grader's caps, mirrored here so we can refuse a bad entry before the scorer does.
  const caps = {
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  };

  const gameSrc = join(here, 'game');
  const shotsSrc = join(here, 'screenshots');
  const gameDst = join(out, 'game');
  const shotsDst = join(out, 'screenshots');

  // Source sanity: game/index.html is required by the gate, screenshots/ must hold 3-4 images.
  if (!existsSync(gameSrc)) throw new Error(`missing game/ directory beside main.ts: ${gameSrc}`);
  if (!existsSync(join(gameSrc, 'index.html'))) throw new Error('game/index.html is required but was not found');
  if (!existsSync(shotsSrc)) throw new Error(`missing screenshots/ directory beside main.ts: ${shotsSrc}`);

  const shots = readdirSync(shotsSrc).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort();
  if (shots.length < 3 || shots.length > caps.screenshots.max) {
    throw new Error(`expected 3-${caps.screenshots.max} screenshots, found ${shots.length}`);
  }
  for (const name of shots) {
    const size = statSync(join(shotsSrc, name)).size;
    if (size > caps.screenshots.max_bytes) {
      throw new Error(`screenshot ${name} is ${fmt(size)}, over the ${fmt(caps.screenshots.max_bytes)} cap`);
    }
  }

  // Game tree checks: file count, total bytes, and per-path length, before copying.
  const game = treeStats(gameSrc);
  if (game.files > caps.game_max_files) {
    throw new Error(`game/ has ${game.files} files, over the ${caps.game_max_files} cap`);
  }
  if (game.bytes > caps.game_max_bytes) {
    throw new Error(`game/ is ${fmt(game.bytes)}, over the ${fmt(caps.game_max_bytes)} cap`);
  }
  for (const name of readdirSync(gameSrc, { withFileTypes: true, recursive: true })) {
    if (name.isFile()) {
      const rel = relative(gameSrc, join(name.parentPath ?? gameSrc, name.name));
      if (Buffer.byteLength(rel) > caps.game_path_max_bytes) {
        throw new Error(`game path ${rel} exceeds the ${caps.game_path_max_bytes}-byte cap`);
      }
    }
  }

  // Fresh output: wipe stale game/ and screenshots/, then copy the current ones.
  mkdirSync(out, { recursive: true });
  cleanDir(gameDst);
  cleanDir(shotsDst);
  cpSync(gameSrc, gameDst, { recursive: true });
  mkdirSync(shotsDst, { recursive: true });
  cpSync(shotsSrc, shotsDst, { recursive: true });

  // The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
  // scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of game
  // files, in all, or a path under game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap, its
  // screenshots/ and dossier.json).
  writeFileSync(
    join(out, 'dossier.json'),
    buildDossier(out, {
      text_max_bytes: 163840,
      screenshots: { max: 4, max_bytes: 262144 },
      game_max_files: 993,
      game_max_bytes: 50331648,
      game_path_max_bytes: 1000,
    }),
  );

  const dossierBytes = statSync(join(out, 'dossier.json')).size;
  console.log(
    `handed in: game/ (${game.files} files, ${fmt(game.bytes)}), ` +
      `${shots.length} screenshots (${fmt(treeStats(shotsDst).bytes)}), ` +
      `dossier.json (${fmt(dossierBytes)}) -> ${out}`,
  );
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`main.ts: failed to hand in the entry: ${msg}`);
  process.exit(1);
}
