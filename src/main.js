import './style.css';
import release from './release.json';

const $ = (selector) => document.querySelector(selector);
const scenarios = {
 review:{parent:'Codex',worker:'Pi',task:'a code review',policy:'can use'},
 research:{parent:'Pi',worker:'OpenCode',task:'research',policy:'can use'},
 build:{parent:'OpenCode',worker:'DeepSeek',task:'implementation',policy:'should use'},
};
const harnesses = ['Codex', 'Pi', 'OpenCode', 'DeepSeek', 'Claude Code'];
const icons={Codex:'/icons/codex.png',Pi:'/icons/pi.svg',OpenCode:'/icons/opencode.png',DeepSeek:'/icons/deepseek.ico','Claude Code':'/icons/claude.png'};
// Illustrative choices, never presented as the visitor's discovered models.
const catalogue={Codex:['GPT-6.1 Sol'],Pi:['Qwen3.8 Max','DeepSeek V4 Flash'],OpenCode:['Kimi K2.7 Code','GLM 5.3 Flash'],DeepSeek:['DeepSeek V4 Pro','DeepSeek V4 Flash'],'Claude Code':['Opus','Sonnet','Haiku']};
const tasks=['a code review','research','implementation','debugging','a general task'];
let selected='review',rule={...scenarios.review,models:[],thinking:'Auto'},enabled=true;
let openMenu;
const element=(tag,className,text)=>{const e=document.createElement(tag);e.className=className||'';if(text!==undefined)e.textContent=text;return e;};
function agentIcon(name){const img=element('img','harness-icon');img.src=icons[name];img.alt='';img.width=24;img.height=24;return img;}
function closeMenu(focus=false){if(!openMenu)return;const {menu,button}=openMenu;menu.remove();button.setAttribute('aria-expanded','false');openMenu=null;if(focus)button.focus();}
function placeMenu(){if(!openMenu)return;const {menu,button}=openMenu,r=button.getBoundingClientRect(),gap=8,margin=12;const below=innerHeight-r.bottom-gap-margin,above=r.top-gap-margin;menu.style.maxHeight=`${Math.max(100,Math.max(below,above))}px`;const height=menu.offsetHeight;menu.style.left=`${Math.max(margin,Math.min(r.left,innerWidth-menu.offsetWidth-margin))}px`;menu.style.top=`${below>=height||below>=above?r.bottom+gap:Math.max(margin,r.top-gap-height)}px`;}
function picker(label,value,color,choices,onChange,{multiple=false,hint='',icon=false}={}){
 const button=element('button',`rule-picker ${color}`);button.type='button';button.dataset.field=label;button.setAttribute('aria-label',label);button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');
 const caption=element('span','picker-caption',value);if(icon&&icons[value])button.append(agentIcon(value));button.append(caption);
 const arrow=element('span','picker-chevron');arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<svg viewBox="0 0 12 12"><path d="m3 4.5 3 3 3-3"/></svg>';button.append(arrow);button.title=value;
 const show=()=>{if(openMenu?.button===button){closeMenu();return;}closeMenu();const menu=element('div','rule-menu');menu.setAttribute('role','menu');menu.setAttribute('aria-label',label);if(hint)menu.append(element('p','menu-hint',hint));
 const list=typeof choices==='function'?choices():choices;
 for(const choice of list){const item=typeof choice==='string'?{name:choice,value:choice}:choice;const option=element('button','rule-option');option.type='button';option.setAttribute('role',multiple?'menuitemcheckbox':'menuitemradio');const checked=item.checked??(item.value===value);option.setAttribute('aria-checked',String(checked));const check=element('span','option-check',checked?'✓':'');check.setAttribute('aria-hidden','true');option.append(check);if(icons[item.value])option.append(agentIcon(item.value));option.append(element('span','option-name',item.name));option.onclick=()=>{closeMenu();onChange(item.value);renderRule();const next=[...document.querySelectorAll('[data-field]')].find(e=>e.dataset.field===label);next?.focus();if(multiple)next?.click();};menu.append(option);}
 const done=element('button','menu-done','Done');done.type='button';done.onclick=()=>closeMenu(true);menu.append(done);document.body.append(menu);button.setAttribute('aria-expanded','true');openMenu={menu,button};placeMenu();menu.querySelector('[aria-checked="true"],.rule-option')?.focus();
 menu.onkeydown=e=>{const buttons=[...menu.querySelectorAll('button')],index=buttons.indexOf(document.activeElement);let target;if(e.key==='ArrowDown')target=(index+1)%buttons.length;if(e.key==='ArrowUp')target=(index-1+buttons.length)%buttons.length;if(e.key==='Home')target=0;if(e.key==='End')target=buttons.length-1;if(target!==undefined){e.preventDefault();buttons[target].focus();}if(e.key==='Tab')closeMenu();};
 };button.onclick=show;button.onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();show();}};return button;
}
function renderRule(){
 closeMenu();const sentence=$('#rule-sentence');sentence.replaceChildren();const word=t=>element('span','sentence-word',t);
 sentence.append(word('When'),picker('Parent harness',rule.parent,'purple',harnesses,v=>{rule.parent=v;if(v===rule.worker){rule.worker=harnesses.find(h=>h!==v);rule.models=[];}},{icon:true}),word('needs'),picker('Task',rule.task,'orange',tasks,v=>{rule.task=v;const match=Object.entries(scenarios).find(([,s])=>s.task===v);selected=match?.[0]||'custom';}),word('it'),picker('Delegation policy',rule.policy,'orange',['can use','should use'],v=>rule.policy=v));
 sentence.append(picker('Worker harness',rule.worker,'blue',()=>harnesses.filter(h=>h!==rule.parent),v=>{rule.worker=v;rule.models=[];rule.thinking='Auto';},{icon:true}),word('with'),picker('Models',rule.models.length?rule.models.join(', '):'Auto','blue',()=>[{name:'Auto · harness default',value:'Auto',checked:!rule.models.length},...catalogue[rule.worker].map(name=>({name,value:name,checked:rule.models.includes(name)}))],v=>{if(v==='Auto')rule.models=[];else rule.models=rule.models.includes(v)?rule.models.filter(m=>m!==v):[...rule.models,v];},{multiple:true,hint:'Example models · choose one or more alternatives'}),word('and'),picker('Thinking',rule.thinking,'green',['Auto','Low','Medium','High'],v=>rule.thinking=v,{hint:'Example levels · the app uses each model’s supported controls'}),word('thinking, in its own harness.'));
 sentence.classList.toggle('rule-off',!enabled);
 $('#demo-rule-status').textContent=enabled?'Interactive example · changes stay in this demo':'Rule is off · your choices are kept';
 for(const tab of document.querySelectorAll('[data-scenario]'))tab.setAttribute('aria-pressed',String(tab.dataset.scenario===selected));
}
for(const button of document.querySelectorAll('[data-scenario]'))button.addEventListener('click',()=>{selected=button.dataset.scenario;rule={...scenarios[selected],models:[],thinking:'Auto'};renderRule();});
$('#demo-enabled').addEventListener('click',()=>{enabled=!enabled;$('#demo-enabled').setAttribute('aria-checked',String(enabled));renderRule();});
document.addEventListener('pointerdown',event=>{if(openMenu&&!openMenu.menu.contains(event.target)&&!openMenu.button.contains(event.target))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu(true);});
window.addEventListener('resize',placeMenu);window.addEventListener('scroll',placeMenu,true);

$('#reset-rule').addEventListener('click',()=>{selected='review';rule={...scenarios.review,models:[],thinking:'Auto'};enabled=true;$('#demo-enabled').setAttribute('aria-checked','true');renderRule();});

// Release URLs are explicit. No guessed URLs, automatic downloads, or tracking.
function httpsUrl(value){try{const u=new URL(value);return u.protocol==='https:'?u.href:null;}catch{return null;}}
$('#release-version').textContent=release.version;
const mac=release.platforms.find(p=>p.id==='macos');
const macUrl=httpsUrl(mac?.url);
const download=element(macUrl?'a':'button','button mac-download-button');
const apple=element('img','button-icon');apple.src='/icons/apple.svg';apple.alt='';apple.width=20;apple.height=20;download.append(apple,document.createTextNode('Download for macOS'));
if(macUrl){download.href=macUrl;download.rel='noopener';}else{download.disabled=true;download.setAttribute('aria-describedby','mac-release-status');}
$('#downloads').append(download,element('p','mac-detail',mac?.detail||'Apple Silicon · .dmg'));
const status=element('p','mac-release-status',macUrl?'Unsigned early preview.':mac?.status||'Public download being prepared');status.id='mac-release-status';$('#downloads').append(status);
const sourceUrl=httpsUrl(release.sourceUrl);
if(sourceUrl){for(const a of document.querySelectorAll('[data-source-link]')){a.href=sourceUrl;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','View Harness Bridge source on GitLab');}$('#source-cta').textContent='Source on GitLab';$('#source-status').textContent='Explore the code, suggest an improvement, or help build the next integration. Found a bug? Open an issue or tag @am_tarachand on X.';}
const notesUrl=httpsUrl(release.releaseNotesUrl);if(notesUrl){$('#notes-link').href=notesUrl;$('#notes-link').hidden=false;}
renderRule();
