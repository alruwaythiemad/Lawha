import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { generateTokenCss, generateTypographyCss, consoleTypography } from '@lawha/tokens';

const outDir = fileURLToPath(new URL('../app/generated/', import.meta.url));
mkdirSync(outDir, { recursive: true });

writeFileSync(`${outDir}tokens.css`, `${generateTokenCss()}\n`);
writeFileSync(`${outDir}typography.css`, `${generateTypographyCss(consoleTypography)}\n`);

console.log('Generated apps/console/app/generated/{tokens,typography}.css');
