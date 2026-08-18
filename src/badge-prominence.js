import { createClient } from '@supabase/supabase-js';
const supabase=createClient('https://jpfnhwolttfisawfthbf.supabase.co','sb_publishable_vsHZotBHUEePBvunVgTWWQ_fIImlhYY',{auth:{persistSession:true,autoRefreshToken:true,storageKey:'lancers-chapel-session'}});
const BADGES=[
  {milestone:1,icon:'🟠',name:'FIRST STEP'},
  {milestone:7,icon:'🔥',name:'ONE WEEK'},
  {milestone:25,icon:'⚡',name:'LOCKED IN'},
  {milestone:50,icon:'🏆',name:'FIFTY STRONG'},
  {milestone:100,icon:'🐐',name:'GOAT'}
];
let running=false,cacheAt=0,highestByUser=new Map(),timer=null;
function style(){if(document.getElementById('badge-prominence-css'))return;const s=document.createElement('style');s.id='badge-prominence-css';s.textContent=`
.player-badge-pill{display:inline-flex;align-items:center;gap:4px;padding:3px 7px;border-radius:999px;background:#2a190d;border:1px solid #ef6c00;color:#ffb36e;font-size:9px;font-weight:900;line-height:1;white-space:nowrap;box-shadow:0 0 0 1px rgba(239,108,0,.08)}
.player-badge-pill .badge-emoji{font-size:13px;line-height:1}.player-badge-pill.goat{background:linear-gradient(135deg,#3a2607,#181818);border-color:#f5b642;color:#ffe19a;box-shadow:0 0 18px rgba(245,182,66,.18)}
.home-badge-display{display:flex;align-items:center;gap:8px;margin-top:9px;min-height:30px}.home-badge-display .player-badge-pill{font-size:11px;padding:7px 10px}.home-badge-display .badge-emoji{font-size:18px}.home-badge-label{font-size:9px;letter-spacing:.08em;color:#777;font-weight:900}
.message .player-badge-pill{margin-left:6px;vertical-align:middle;transform:translateY(-1px)}
`;
document.head.appendChild(s)}
function topBadge(milestones=[]){const max=Math.max(0,...milestones.map(Number));return [...BADGES].reverse().find(b=>max>=b.milestone)||null}
function pill(b){if(!b)return'';return `<span class="player-badge-pill ${b.milestone===100?'goat':''}" data-badge="${b.milestone}" title="${b.name} · ${b.milestone} day 3/3 milestone"><span class="badge-emoji">${b.icon}</span><span>${b.name}</span></span>`}
async function loadBadges(){if(Date.now()-cacheAt<15000&&highestByUser.size)return;const {data}=await supabase.from('daily_three_milestone_log').select('user_id,milestone');const groups=new Map();for(const r of data||[]){if(!groups.has(r.user_id))groups.set(r.user_id,[]);groups.get(r.user_id).push(Number(r.milestone))}highestByUser=new Map([...groups].map(([id,arr])=>[id,topBadge(arr)]));cacheAt=Date.now()}
async function applyHome(){const box=document.getElementById('home-circles');if(!box)return;const {data:{session}}=await supabase.auth.getSession();if(!session)return;const b=highestByUser.get(session.user.id);let el=box.querySelector('.home-badge-display');if(!b){el?.remove();return}if(!el){el=document.createElement('div');el.className='home-badge-display';const head=box.querySelector('.home-circles-head > div')||box.querySelector('.home-circles-head');head?.appendChild(el)}const current=el.querySelector('.player-badge-pill')?.dataset.badge;if(current===String(b.milestone))return;el.innerHTML=`<span class="home-badge-label">TOP BADGE</span>${pill(b)}`}
async function applyChat(){const list=document.querySelector('.chat-panel .message-list');if(!list)return;const {data:msgs}=await supabase.from('messages').select('id,user_id,created_at').order('created_at',{ascending:true}).limit(150);const nodes=[...list.querySelectorAll(':scope > .message')];nodes.forEach((node,i)=>{const row=(msgs||[])[i];if(!row)return;const b=highestByUser.get(row.user_id);const existing=node.querySelector('.player-badge-pill.chat-badge');if(!b){existing?.remove();return}if(existing?.dataset.badge===String(b.milestone))return;existing?.remove();const anchor=node.querySelector('strong')||node.querySelector('.message-author')||node.querySelector('header');if(!anchor)return;const wrap=document.createElement('span');wrap.innerHTML=pill(b);const badge=wrap.firstElementChild;if(badge){badge.classList.add('chat-badge');anchor.insertAdjacentElement('afterend',badge)}})}
async function run(){if(running)return;running=true;try{style();await loadBadges();await Promise.all([applyHome(),applyChat()])}finally{running=false}}
function schedule(){clearTimeout(timer);timer=setTimeout(run,220)}
window.addEventListener('load',()=>setTimeout(run,700));
new MutationObserver(records=>{const external=records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>!(n.nodeType===1&&(n.matches?.('.player-badge-pill,.home-badge-display')||n.closest?.('.home-badge-display')))));if(external)schedule()}).observe(document.documentElement,{childList:true,subtree:true});
supabase.auth.onAuthStateChange(()=>{cacheAt=0;setTimeout(run,300)});
setInterval(run,12000);
