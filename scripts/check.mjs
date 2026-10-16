import {readFile,readdir,stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const release=JSON.parse(await readFile(new URL('../src/release.json',import.meta.url),'utf8'));
const isRelease=process.argv.includes('--release');
function url(value){if(value===null)return;const parsed=new URL(value);assert.equal(parsed.protocol,'https:','Release links must use HTTPS');assert(!parsed.username&&!parsed.password,'Release links must not contain credentials');assert(!['example.com','localhost'].includes(parsed.hostname),'Do not ship placeholder release URLs');}
assert.match(release.version,/^\d+\.\d+\.\d+/);
assert.equal(new Set(release.platforms.map(p=>p.id)).size,release.platforms.length);
for(const field of ['sourceUrl','releaseNotesUrl'])url(release[field]);
assert(release.cli,'Configure the CLI release alongside the desktop release');
for(const field of ['url','guideUrl']){assert(release.cli[field],`Missing CLI ${field}`);url(release.cli[field]);}
assert.equal(release.cli.requires,'Node.js 22.13+');
assert(release.cli.url.endsWith(`/v${release.version}/subagent-bridge-local-${release.version}.tgz`),'CLI package must match the desktop release');
assert(release.cli.guideUrl.includes(`/v${release.version}/docs/cli.md`),'CLI guide must match the release');
for(const p of release.platforms){for(const field of ['id','name','detail','status','note'])assert.equal(typeof p[field],'string');url(p.url);}
if(isRelease){assert(release.sourceUrl,'Set sourceUrl before publishing the release website');assert(release.platforms.some(p=>p.url),'Add at least one published installer URL');}
const root=new URL('../dist/',import.meta.url);
let files=0,total=0;
async function scan(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())await scan(file);else{const size=(await stat(file)).size;assert(size<=25*1024*1024,`${file} exceeds Cloudflare Pages asset limit`);files++;total+=size;}}}
await scan(root.pathname);
assert(files<20000);
const html=await readFile(new URL('index.html',root),'utf8');
assert(html.includes('Your favorite agents.<br><span>Now your subagents.</span>'));
assert(!html.includes('src="/src/'),'Production page must use bundled scripts');
assert(html.includes('<details class="install-notes">'),'Install notes must be collapsed initially');
assert(html.includes(release.cli.url),'Static CLI fallback must match release metadata');
assert(html.includes(release.cli.guideUrl),'Static CLI guide must match release metadata');
assert(html.includes(release.platforms.find(p=>p.id==='macos').url),'Static macOS fallback must match release metadata');
const canonical='https://tarachand-gupta.github.io/subagent-bridge-site/';
const metadata=Object.fromEntries([...html.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]+)"/g)].map(m=>[m[1],m[2]]));
assert(html.includes(`<link rel="canonical" href="${canonical}"`));
assert.equal(metadata['og:url'],canonical);
assert.equal(metadata['og:image'],`${canonical}social.png`);
assert.equal(metadata['twitter:image'],metadata['og:image']);
assert.equal(metadata['twitter:card'],'summary_large_image');
assert.equal(metadata['twitter:creator'],'@am_tarachand');
for(const key of ['og:title','og:description','og:site_name','og:type','og:locale','og:image:alt','twitter:title','twitter:description','twitter:image:alt'])assert(metadata[key],`Missing ${key}`);
const png=await readFile(new URL('social.png',root));
assert.equal(png.subarray(1,4).toString(),'PNG');
assert.equal(png.readUInt32BE(16),1200);
assert.equal(png.readUInt32BE(20),630);
assert(png.length<5*1024*1024);
// Check every statically referenced asset at both root and repository-base builds.
const base=process.env.PAGES_BASE_PATH||'./';
for(const [,href] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
 if(/^(?:https?:|#)/.test(href))continue;
 assert(href.startsWith(base),`Asset outside deployment base: ${href}`);
 await stat(new URL(href.slice(base.length),root));
}
console.log(`OK: ${files} static files, ${(total/1024).toFixed(0)} KiB. Release links ${release.platforms.some(p=>p.url)?'configured':'intentionally unpublished'}.`);
