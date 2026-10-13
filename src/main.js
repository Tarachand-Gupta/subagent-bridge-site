import './style.css';
import release from './release.json';

const $ = (selector) => document.querySelector(selector);
const scenarios = {
  review: { parent: 'Codex', worker: 'Pi', task: 'a code review', policy: 'can use', prompt: 'Get a second opinion on this change.', working: 'reviewing the change', result: 'Review complete. I found an edge case in the error handling and suggested a test.', followup: 'Which test would you add?', answer: 'I’d add a test for an empty response, alongside the error-handling change I just reviewed.' },
  research: { parent: 'Pi', worker: 'OpenCode', task: 'research', policy: 'can use', prompt: 'Find out how authentication works in this project.', working: 'exploring the project', result: 'Research complete. I mapped the sign-in flow and found the session middleware.', followup: 'Where is the best place to start?', answer: 'Start with the session middleware I found. It connects the sign-in handler to the protected routes.' },
  build: { parent: 'OpenCode', worker: 'DeepSeek', task: 'implementation', policy: 'should use', prompt: 'Implement the input validation from this plan.', working: 'implementing the validation', result: 'Implementation complete. The validation and its boundary-case tests are ready for review.', followup: 'What edge cases did you cover?', answer: 'For the validation I just added, I covered empty input, unexpected types, and the maximum allowed length.' },
};
const harnesses = ['Codex', 'Pi', 'OpenCode', 'DeepSeek'];
const icons={Codex:'/icons/codex.png',Pi:'/icons/pi.svg',OpenCode:'/icons/opencode.png',DeepSeek:'/icons/deepseek.ico'};
// Illustrative choices, never presented as the visitor's discovered models.
const catalogue={Codex:['GPT-6.1 Sol'],Pi:['Qwen3.8 Max','DeepSeek V4 Flash'],OpenCode:['Kimi K2.7 Code','GLM 5.3 Flash'],DeepSeek:['DeepSeek V4 Pro','DeepSeek V4 Flash']};
const tasks=['a code review','research','implementation','debugging','a general task'];
let selected='review',rule={...scenarios.review,models:[],thinking:'Auto'},enabled=true;
let timer,runVersion=0,running=false,completed=false,activeScenario,openMenu;
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
 for(const choice of list){const item=typeof choice==='string'?{name:choice,value:choice}:choice;const option=element('button','rule-option');option.type='button';option.setAttribute('role',multiple?'menuitemcheckbox':'menuitemradio');const checked=item.checked??(item.value===value);option.setAttribute('aria-checked',String(checked));const check=element('span','option-check',checked?'✓':'');check.setAttribute('aria-hidden','true');option.append(check);if(icons[item.value])option.append(agentIcon(item.value));option.append(element('span','option-name',item.name));option.onclick=()=>{closeMenu();onChange(item.value);renderRule();resetSession();const next=[...document.querySelectorAll('[data-field]')].find(e=>e.dataset.field===label);next?.focus();if(multiple)next?.click();};menu.append(option);}
 const done=element('button','menu-done','Done');done.type='button';done.onclick=()=>closeMenu(true);menu.append(done);document.body.append(menu);button.setAttribute('aria-expanded','true');openMenu={menu,button};placeMenu();menu.querySelector('[aria-checked="true"],.rule-option')?.focus();
 menu.onkeydown=e=>{const buttons=[...menu.querySelectorAll('button')],index=buttons.indexOf(document.activeElement);let target;if(e.key==='ArrowDown')target=(index+1)%buttons.length;if(e.key==='ArrowUp')target=(index-1+buttons.length)%buttons.length;if(e.key==='Home')target=0;if(e.key==='End')target=buttons.length-1;if(target!==undefined){e.preventDefault();buttons[target].focus();}if(e.key==='Tab')closeMenu();};
 };button.onclick=show;button.onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();show();}};return button;
}
function renderRule(){
 closeMenu();const sentence=$('#rule-sentence');sentence.replaceChildren();const word=t=>element('span','sentence-word',t);
 sentence.append(word('When'),picker('Parent harness',rule.parent,'purple',harnesses,v=>{rule.parent=v;if(v===rule.worker){rule.worker=harnesses.find(h=>h!==v);rule.models=[];}},{icon:true}),word('needs'),picker('Task',rule.task,'orange',tasks,v=>{rule.task=v;const match=Object.entries(scenarios).find(([,s])=>s.task===v);selected=match?.[0]||'custom';}),word('it'),picker('Delegation policy',rule.policy,'orange',['can use','should use'],v=>rule.policy=v));
 sentence.append(picker('Worker harness',rule.worker,'blue',()=>harnesses.filter(h=>h!==rule.parent),v=>{rule.worker=v;rule.models=[];rule.thinking='Auto';},{icon:true}),word('with'),picker('Models',rule.models.length?rule.models.join(', '):'Auto','blue',()=>[{name:'Auto · harness default',value:'Auto',checked:!rule.models.length},...catalogue[rule.worker].map(name=>({name,value:name,checked:rule.models.includes(name)}))],v=>{if(v==='Auto')rule.models=[];else rule.models=rule.models.includes(v)?rule.models.filter(m=>m!==v):[...rule.models,v];},{multiple:true,hint:'Example models · choose one or more alternatives'}),word('and'),picker('Thinking',rule.thinking,'green',['Auto','Low','Medium','High'],v=>rule.thinking=v,{hint:'Example levels · the app uses each model’s supported controls'}),word('thinking, in its own harness.'));
 sentence.classList.toggle('rule-off',!enabled);$('#try-rule').disabled=!enabled;$('#run-story').disabled=!enabled||running;
 $('#demo-rule-status').textContent=enabled?'Interactive example · changes stay in this demo':'Rule is off · turn it on to try a handoff';
 for(const tab of document.querySelectorAll('[data-scenario]'))tab.setAttribute('aria-pressed',String(tab.dataset.scenario===selected));
}
for(const button of document.querySelectorAll('[data-scenario]'))button.addEventListener('click',()=>{selected=button.dataset.scenario;rule={...scenarios[selected],models:[],thinking:'Auto'};renderRule();resetSession();});
$('#demo-enabled').addEventListener('click',()=>{enabled=!enabled;$('#demo-enabled').setAttribute('aria-checked',String(enabled));renderRule();resetSession();});
document.addEventListener('pointerdown',event=>{if(openMenu&&!openMenu.menu.contains(event.target)&&!openMenu.button.contains(event.target))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu(true);});
window.addEventListener('resize',placeMenu);window.addEventListener('scroll',placeMenu,true);

function message(role,content){const item=element('div','message');const label=element('span','message-role');if(icons[role])label.append(agentIcon(role));label.append(document.createTextNode(role.toUpperCase()));item.append(label,element('p','',content));return item;}
function eventLine(content,complete=false){const item=element('div','job-event');item.append(element('span','status-dot'),document.createTextNode(content),element('span','',complete?'✓':'↗'));return item;}
function scenario(){const s=Object.values(scenarios).find(s=>s.task===rule.task)||{prompt:`Help with ${rule.task} in this project.`,working:`working on ${rule.task}`,result:`The ${rule.task} is complete. My findings and suggested next steps are ready to review.`,followup:'What should I look at first?',answer:`Start with the findings from the ${rule.task} I just completed. I still have the project context from that work.`};return {...s,parent:rule.parent,worker:rule.worker,task:rule.task,policy:rule.policy,models:rule.models,thinking:rule.thinking};}
function workerDescription(s){return `${s.worker}${s.models.length?' / '+s.models[0]:''}${s.thinking!=='Auto'?' · '+s.thinking.toLowerCase()+' thinking':''}`;}
function resetSession(){clearTimeout(timer);runVersion++;running=false;completed=false;activeScenario=null;$('#run-story').disabled=!enabled;$('#run-story').textContent='Play handoff ↗';$('#follow-up').disabled=true;$('#follow-up').textContent='Ask a follow-up ↳';const s=scenario();$('#session-parent').textContent=s.parent;$('#session-messages').replaceChildren(message('You',s.prompt),message(s.parent,enabled?`${s.policy==='should use'?'This rule requires delegation.':'This rule allows delegation.'} I can hand this to ${workerDescription(s)}.`:'This rule is off. Turn it on to try the handoff.'),eventLine(enabled?'Ready for a background handoff':'Delegation paused'));}
function runHandoff(scroll=false){if(running||!enabled)return;clearTimeout(timer);const id=++runVersion;running=true;completed=false;activeScenario=structuredClone(scenario());const s=activeScenario;$('#session-parent').textContent=s.parent;$('#session-messages').replaceChildren(message('You',s.prompt),message(s.parent,`I’ve handed this to ${workerDescription(s)}. I’ll keep working on the next independent step.`),eventLine(`${s.worker} is ${s.working}`));$('#run-story').disabled=true;$('#run-story').textContent='Working…';$('#follow-up').disabled=true;$('#follow-up').textContent='Ask a follow-up ↳';if(scroll)$('#session-demo').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});timer=setTimeout(()=>{if(id!==runVersion)return;running=false;completed=true;$('#session-messages').replaceChildren(message(s.parent,`I continued while ${s.worker} worked.`),message(s.worker,s.result),eventLine('Result returned to the parent session',true));$('#run-story').disabled=false;$('#run-story').textContent='Replay ↗';$('#follow-up').disabled=false;},1800);}
$('#try-rule').addEventListener('click',()=>runHandoff(true));$('#run-story').addEventListener('click',()=>runHandoff());
$('#follow-up').addEventListener('click',()=>{if(!completed||!activeScenario)return;const s=activeScenario;$('#session-messages').replaceChildren(message(s.parent,s.followup),message(s.worker,s.answer),eventLine('Same worker conversation · context retained',true));$('#follow-up').disabled=true;$('#follow-up').textContent='Context retained ✓';});

// Release URLs are explicit. No guessed URLs, automatic downloads, or tracking.
function httpsUrl(value){try{const u=new URL(value);return u.protocol==='https:'?u.href:null;}catch{return null;}}
$('#release-version').textContent=release.version;
for(const platform of release.platforms){
  const card=document.createElement('article');card.className='download-card';
  const top=document.createElement('div');top.className='platform-top';const h=document.createElement('h3');h.textContent=platform.name;
  const icon=document.createElement('span');icon.className='platform-icon';icon.setAttribute('aria-hidden','true');icon.textContent={macos:'⌘',windows:'⊞',linux:'›_'}[platform.id]||'↗';top.append(h,icon);
  const detail=document.createElement('p');detail.className='platform-detail';detail.textContent=platform.detail;
  const url=httpsUrl(platform.url);const action=document.createElement(url?'a':'span');action.className=url?'button':'download-state';action.textContent=url?`Download for ${platform.name} ↓`:platform.status;if(url){action.href=url;action.rel='noopener';}
  const note=document.createElement('p');note.textContent=platform.note;card.append(top,detail,action,note);$('#downloads').append(card);
}
for(const [selector,value]of[['#source-link',release.sourceUrl],['#notes-link',release.releaseNotesUrl]]){const url=httpsUrl(value);if(url){$(selector).href=url;$(selector).hidden=false;}}
renderRule();resetSession();
