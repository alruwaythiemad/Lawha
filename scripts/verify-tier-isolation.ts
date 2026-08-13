// AC3 build-time check: apps/player's bundle must contain no console (px)
// typography tier, and apps/console's bundle must contain no player (vmin)
// tier. Matches the generated `.type-{tierName}` class names (see
// packages/tokens/src/typography-css.ts) rather than raw px/vmin numbers —
// numeric px values (e.g. 16px spacing) are common and would make a
// number-based check noisy with false positives.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { consoleTypography, playerTypography } from '@lawha/tokens';

const CONSOLE_BUILD_DIR = join(import.meta.dirname, '..', 'apps', 'console', '.next');
const PLAYER_BUILD_DIR = join(import.meta.dirname, '..', 'apps', 'player', 'dist');
const SCANNABLE_EXTENSIONS = new Set(['.css', '.js', '.mjs']);

function walk(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (SCANNABLE_EXTENSIONS.has(fullPath.slice(fullPath.lastIndexOf('.')))) {
      files.push(fullPath);
    }
  }
  return files;
}

function dirExists(dir: string): boolean {
  try {
    return statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

function findForbiddenClassNames(buildDir: string, forbiddenTierNames: string[]): string[] {
  const forbiddenClasses = forbiddenTierNames.map((name) => `type-${name}`);
  const hits: string[] = [];

  const files = walk(buildDir);
  if (files.length === 0) {
    // An empty scan isn't "verified" — it's "never actually checked
    // anything." Fail loudly rather than let this masquerade as a pass.
    throw new Error(`No scannable files (${[...SCANNABLE_EXTENSIONS].join(', ')}) found in ${buildDir} — cannot verify tier isolation.`);
  }

  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    for (const className of forbiddenClasses) {
      if (content.includes(className)) {
        hits.push(`${className} found in ${file}`);
      }
    }
  }

  return hits;
}

function main() {
  if (!dirExists(CONSOLE_BUILD_DIR)) {
    console.error(`Missing ${CONSOLE_BUILD_DIR} — run "pnpm --filter @lawha/console build" first.`);
    process.exit(1);
  }
  if (!dirExists(PLAYER_BUILD_DIR)) {
    console.error(`Missing ${PLAYER_BUILD_DIR} — run "pnpm --filter @lawha/player build" first.`);
    process.exit(1);
  }

  let playerTierNamesInConsole: string[];
  let consoleTierNamesInPlayer: string[];
  try {
    playerTierNamesInConsole = findForbiddenClassNames(CONSOLE_BUILD_DIR, Object.keys(playerTypography));
    consoleTierNamesInPlayer = findForbiddenClassNames(PLAYER_BUILD_DIR, Object.keys(consoleTypography));
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }

  const failures = [...playerTierNamesInConsole, ...consoleTierNamesInPlayer];

  if (failures.length > 0) {
    console.error('Tier isolation violated (AC3):');
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    process.exit(1);
  }

  console.log('Tier isolation verified: no console tier in the player bundle, no player tier in the console bundle.');
}

main();
