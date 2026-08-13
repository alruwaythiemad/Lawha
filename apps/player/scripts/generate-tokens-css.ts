import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { generateTokenCss, generateTypographyCss, playerTypography } from '@lawha/tokens';

const outDir = fileURLToPath(new URL('../src/generated/', import.meta.url));
mkdirSync(outDir, { recursive: true });

writeFileSync(`${outDir}tokens.css`, `${generateTokenCss({ includeDarkTheme: false })}\n`);
writeFileSync(`${outDir}typography.css`, `${generateTypographyCss(playerTypography)}\n`);

console.log('Generated apps/player/src/generated/{tokens,typography}.css');
