import {readFile,readdir,stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const release=JSON.parse(await readFile(new URL('../src/release.json',import.meta.url),'utf8'));
const isRelease=process.argv.includes('--release');
function url(value){if(value===null)return;const parsed=new URL(value);assert.equal(parsed.protocol,'https:','Release links must use HTTPS');assert(!parsed.username&&!parsed.password,'Release links must not contain credentials');assert(!['example.com','localhost'].includes(parsed.hostname),'Do not ship placeholder release URLs');}
assert.match(release.version,/^\d+\.\d+\.\d+/);
assert.equal(new Set(release.platforms.map(p=>p.id)).size,release.platforms.length);
for(const field of ['sourceUrl','releaseNotesUrl'])url(release[field]);
for(const p of release.platforms){for(const field of ['id','name','detail','status','note'])assert.equal(typeof p[field],'string');url(p.url);}
if(isRelease){assert(release.sourceUrl,'Set sourceUrl before publishing the release website');assert(release.platforms.some(p=>p.url),'Add at least one published installer URL');}
const root=new URL('../dist/',import.meta.url);
let files=0,total=0;
async function scan(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())await scan(file);else{const size=(await stat(file)).size;assert(size<=25*1024*1024,`${file} exceeds Cloudflare Pages asset limit`);files++;total+=size;}}}
await scan(root.pathname);
assert(files<20000);
const html=await readFile(new URL('index.html',root),'utf8');assert(html.includes('Your agents.'));assert(!html.includes('src="/src/'),'Production page must use bundled scripts');
console.log(`OK: ${files} static files, ${(total/1024).toFixed(0)} KiB. Release links ${release.platforms.some(p=>p.url)?'configured':'intentionally unpublished'}.`);
