import { readFile, writeFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';
const svg = await readFile(new URL('../public/social.svg', import.meta.url), 'utf8');
const png = new Resvg(svg, { font: { defaultFontFamily: 'Arial', loadSystemFonts: true } }).render().asPng();
await writeFile(new URL('../public/social.png', import.meta.url), png);
console.log('Generated 1200 × 630 social.png');
