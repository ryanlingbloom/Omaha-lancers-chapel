import { createClient } from '@supabase/supabase-js';

const supabase=createClient('https://jpfnhwolttfisawfthbf.supabase.co','sb_publishable_vsHZotBHUEePBvunVgTWWQ_fIImlhYY',{auth:{persistSession:true,autoRefreshToken:true,storageKey:'lancers-chapel-session'}});
const BADGES=[
  {milestone:1,icon:'🟠',name:'FIRST STEP'},
  {milestone:7,icon:'🔥',name:'ONE WEEK'},
  {milestone:25,icon:'⚡',name:'LOCKED IN'},
  {milestone:50,icon:'🏆',name:'FIFTY STRONG'},
  {milestone:100,icon:'🐐',name:'GOAT'}
];
let busy=false,lastKey='',timer=null;

function styles(){
  if(document.getElementById('checkin-badges-css'))return;
  const s=document.createElement('style');
  s.id='checkin-badges-css';
  s.textContent=`
    .home-milestones{display:none!important}
    .checkin-achievements{margin-top:14px;padding-top:13px;border-top:1px solid #2e2e2e;display:flex;align-items:center;justify-content:space-between;gap:12px}
    .checkin-achievement-side{display:flex;align-items:center;gap:8px;min-width:0}
    .checkin-achievement-icon{font-size:24px;line-height:1;flex:0 0 auto}
    .checkin-achievement-copy{min-width:0}
    .checkin-achievement-copy small{display:block;font-size:8px;font-weight:900;letter-spacing:.08em;color:#888;margin-bottom:2px}
    .checkin-achievement-copy strong{display:block;font-size:11px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .checkin-achievement-copy span{display:block;font-size:9px;color:#999;margin-top:2px}
    .checkin-achievement-next{opacity:.7;text-align:right}
    .checkin-achievement-next .checkin-achievement-side{justify-content:flex-end}
    @media(max-width:390px){.checkin-achievements{align-items:flex-start;flex-direction:column}.checkin-achievement-next{text-align:left}.checkin-achievement-next .checkin-achievement-side{justify-content:flex-start}}
  `;
  document.head.appendChild(s);
}

async function render(){
  if(busy)return;
  const box=document.querySelector('.checkin');
  if(!box)return;
  busy=true;
  try{
    const {data:{session}}=await supabase.auth.getSession();
    if(!session)return;
    const {data}=await supabase.from('daily_three_milestone_log').select('milestone').eq('user_id',session.user.id);
    const earned=(data||[]).map(x=>Number(x.milestone));
    const highest=[...BADGES].reverse().find(b=>earned.includes(b.milestone))||null;
    const next=BADGES.find(b=>!earned.includes(b.milestone))||null;
    const key=`${session.user.id}:${highest?.milestone||0}:${next?.milestone||0}`;
    let el=box.querySelector('.checkin-achievements');
    if(!el){el=document.createElement('div');el.className='checkin-achievements';box.appendChild(el)}
    if(lastKey===key&&el.dataset.key===key)return;
    lastKey=key;el.dataset.key=key;
    el.innerHTML=`
      <div class="checkin-achievement-side">
        <div class="checkin-achievement-icon">${highest?.icon||'○'}</div>
        <div class="checkin-achievement-copy">
          <small>${highest?'MILESTONE UNLOCKED':'MILESTONE'}</small>
          <strong>${highest?.name||'Close all 3 circles'}</strong>
          <span>${highest?`${highest.milestone} day${highest.milestone===1?'':'s'} of 3/3`:'Earn your first badge'}</span>
        </div>
      </div>
      <div class="checkin-achievement-next">
        <div class="checkin-achievement-side">
          <div class="checkin-achievement-icon">${next?.icon||'🐐'}</div>
          <div class="checkin-achievement-copy">
            <small>${next?'NEXT BADGE':'ALL BADGES UNLOCKED'}</small>
            <strong>${next?.name||'GOAT STATUS'}</strong>
            <span>${next?`Unlock at ${next.milestone} day${next.milestone===1?'':'s'} of 3/3`:'100-day milestone reached'}</span>
          </div>
        </div>
      </div>`;
  } finally {busy=false}
}

function schedule(){clearTimeout(timer);timer=setTimeout(render,250)}
styles();
window.addEventListener('load',()=>setTimeout(render,900));
new MutationObserver(records=>{
  const needs=records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&!n.matches?.('.checkin-achievements')&&!n.closest?.('.checkin-achievements')));
  if(needs)schedule();
}).observe(document.documentElement,{childList:true,subtree:true});
supabase.auth.onAuthStateChange(()=>{lastKey='';setTimeout(render,300)});
setInterval(render,15000);
