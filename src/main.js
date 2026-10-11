import './style.css';
import release from './release.json';

const $ = (selector) => document.querySelector(selector);
const scenarios = {
  review: { parent: 'Codex', worker: 'Pi', task: 'a code review', policy: 'can use', prompt: 'Get a second opinion on this change.', working: 'reviewing the change', result: 'Review complete. I found an edge case in the error handling and suggested a test.', followup: 'Which test would you add?', answer: 'I’d add a test for an empty response, alongside the error-handling change I just reviewed.' },
  research: { parent: 'Pi', worker: 'OpenCode', task: 'research', policy: 'can use', prompt: 'Find out how authentication works in this project.', working: 'exploring the project', result: 'Research complete. I mapped the sign-in flow and found the session middleware.', followup: 'Where is the best place to start?', answer: 'Start with the session middleware I found. It connects the sign-in handler to the protected routes.' },
  build: { parent: 'OpenCode', worker: 'DeepSeek', task: 'implementation', policy: 'should use', prompt: 'Implement the input validation from this plan.', working: 'implementing the validation', result: 'Implementation complete. The validation and its boundary-case tests are ready for review.', followup: 'What edge cases did you cover?', answer: 'For the validation I just added, I covered empty input, unexpected types, and the maximum allowed length.' },
};
const harnesses = ['Codex', 'Pi', 'OpenCode', 'DeepSeek'];
let selected = 'review';
let worker = scenarios[selected].worker;
let enabled = true;
let timer;
let runVersion = 0;
let running = false;
let completed = false;
let activeScenario;

function renderRule() {
  const s = scenarios[selected];
  const sentence = $('#rule-sentence');
  sentence.replaceChildren();
  const text = (value) => document.createTextNode(value);
  const token = (value, color) => {const node=document.createElement('span');node.className=`token ${color}`;node.textContent=value;return node;};
  sentence.append(text('When '), token(s.parent, 'purple'), text(' needs '), token(s.task, 'orange'), text(', it '), token(s.policy, 'orange'), text(' '));
  const picker = document.createElement('details');
  picker.className = 'picker blue';
  const summary = document.createElement('summary');summary.textContent=worker;summary.setAttribute('aria-label','Choose example worker');
  const menu = document.createElement('div');menu.className='picker-menu';menu.setAttribute('role','group');menu.setAttribute('aria-label','Example worker harness');
  for (const name of harnesses.filter(name=>name!==s.parent)) {
    const option=document.createElement('button');option.textContent=name;option.type='button';option.setAttribute('role','radio');option.setAttribute('aria-checked',String(name===worker));
    option.addEventListener('click',()=>{worker=name;resetSession();renderRule();$('#rule-sentence summary').focus();});menu.append(option);
  }
  picker.append(summary,menu);sentence.append(picker,text(' / '),token('Auto','blue'),text(' in '),token('its own','green'),text(' harness.'));
  sentence.classList.toggle('rule-off',!enabled);
  $('#try-rule').disabled=!enabled;
  $('#demo-rule-status').textContent=enabled?'Example rule · nothing is applied to your agents':'Example rule is off · enable it to try a handoff';
}
for(const button of document.querySelectorAll('[data-scenario]')) button.addEventListener('click',()=>{
  selected=button.dataset.scenario;worker=scenarios[selected].worker;
  for(const tab of document.querySelectorAll('[data-scenario]'))tab.setAttribute('aria-pressed',String(tab===button));
  resetSession();renderRule();
});
$('#demo-enabled').addEventListener('click',()=>{enabled=!enabled;$('#demo-enabled').setAttribute('aria-checked',String(enabled));renderRule();});
document.addEventListener('click',event=>{for(const picker of document.querySelectorAll('.picker[open]'))if(!picker.contains(event.target))picker.open=false;});
document.addEventListener('keydown',event=>{if(event.key==='Escape')for(const picker of document.querySelectorAll('.picker[open]')){picker.open=false;picker.querySelector('summary').focus();}});

function message(role,content) {
  const item=document.createElement('div');item.className='message';
  const label=document.createElement('span');label.className='message-role';label.textContent=role.toUpperCase();
  const p=document.createElement('p');p.textContent=content;item.append(label,p);return item;
}
function eventLine(content,complete=false) {
  const item=document.createElement('div');item.className='job-event';
  const dot=document.createElement('span');dot.className='status-dot';
  const label=document.createTextNode(content);const icon=document.createElement('span');icon.textContent=complete?'✓':'↗';item.append(dot,label,icon);return item;
}
function resetSession(){
  clearTimeout(timer);runVersion++;running=false;completed=false;activeScenario=null;
  $('#run-story').disabled=false;$('#run-story').textContent='Play handoff ↗';$('#follow-up').disabled=true;$('#follow-up').textContent='Ask a follow-up ↳';
  const s=scenarios[selected];$('#session-parent').textContent=s.parent;
  $('#session-messages').replaceChildren(message('You',s.prompt),message(s.parent,`I’ve asked ${worker} to help. I’ll continue with the independent work.`),eventLine(`${worker} works in the background`));
}
function runHandoff(scroll=false){
  if(running)return;
  clearTimeout(timer);const id=++runVersion;running=true;completed=false;activeScenario={...scenarios[selected],worker};
  const s=activeScenario;$('#session-parent').textContent=s.parent;
  $('#session-messages').replaceChildren(message('You',s.prompt),message(s.parent,`I’ve handed this to ${s.worker}. I’ll keep working on the next independent step.`),eventLine(`${s.worker} is ${s.working}`));
  $('#run-story').disabled=true;$('#run-story').textContent='Working…';$('#follow-up').disabled=true;$('#follow-up').textContent='Ask a follow-up ↳';
  if(scroll)$('#session-demo').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
  timer=setTimeout(()=>{if(id!==runVersion)return;running=false;completed=true;$('#session-messages').replaceChildren(message(s.parent,`I continued while ${s.worker} worked.`),message(s.worker,s.result),eventLine('Result returned to the parent session',true));$('#run-story').disabled=false;$('#run-story').textContent='Replay ↗';$('#follow-up').disabled=false;},1800);
}
$('#try-rule').addEventListener('click',()=>runHandoff(true));
$('#run-story').addEventListener('click',()=>runHandoff());
$('#follow-up').addEventListener('click',()=>{
  if(!completed||!activeScenario)return;const s=activeScenario;
  $('#session-messages').replaceChildren(message(s.parent,s.followup),message(s.worker,s.answer),eventLine('Same worker conversation · context retained',true));
  $('#follow-up').disabled=true;$('#follow-up').textContent='Context retained ✓';
});

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
