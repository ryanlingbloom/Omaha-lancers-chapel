import { createClient } from '@supabase/supabase-js';

const supabase=createClient('https://jpfnhwolttfisawfthbf.supabase.co','sb_publishable_vsHZotBHUEePBvunVgTWWQ_fIImlhYY',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'lancers-chapel-session'}});
let running=false;

function day(date=new Date()){
  return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}
function streak(raw){
  const days=[...new Set((raw||[]).filter(Boolean))].sort().reverse();
  let cursor=new Date(`${day()}T12:00:00`),count=0;
  if(!days.includes(day())) cursor.setDate(cursor.getDate()-1);
  for(const d of days){const expected=day(cursor);if(d===expected){count++;cursor.setDate(cursor.getDate()-1)}else if(d<expected)break}
  return count;
}
function styles(){
  if(document.getElementById('home-circles-css'))return;
  const s=document.createElement('style');s.id='home-circles-css';s.textContent=`
  .home-circles{margin:18px 0 22px;padding:18px 14px;background:#141414;border:1px solid #2d2d2d;border-radius:18px}.home-circles-head{display:flex;justify-content:space-between;align-items:end;gap:12px;margin-bottom:16px}.home-circles-head h2{margin:3px 0 0;font-size:20px}.home-circles-head small{color:#999}.home-circles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.home-circle-wrap{text-align:center;display:flex;flex-direction:column;align-items:center;gap:7px}.home-circle{width:82px;height:82px;border-radius:50%;border:5px solid #363636;background:#101010;color:#eee;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer}.home-circle.done{border-color:#ef6c00;background:#25170d}.home-circle .mark{font-size:22px;font-weight:900;line-height:1}.home-circle .streak{font-size:11px;color:#aaa;margin-top:5px}.home-circle.done .streak{color:#ffb36e}.home-circle-wrap strong{font-size:12px;line-height:1.15}.home-circle-wrap small{font-size:10px;color:#858585;line-height:1.2}@media(max-width:380px){.home-circle{width:72px;height:72px}.home-circles-grid{gap:6px}.home-circle-wrap strong{font-size:11px}}`;
  document.head.appendChild(s);
}
async function render(){
  if(running)return;running=true;
  try{
    const welcome=document.querySelector('.welcome');if(!welcome)return;
    const {data:{session}}=await supabase.auth.getSession();if(!session)return;
    const [{data:checks},{data:actions}]=await Promise.all([
      supabase.from('checkins').select('checkin_day,created_at').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(180),
      supabase.from('daily_spiritual_actions').select('action_date,read_bible,encouraged_teammate').eq('user_id',session.user.id).order('action_date',{ascending:false}).limit(180)
    ]);
    const today=day();
    const checkDays=(checks||[]).map(c=>c.checkin_day||day(new Date(c.created_at)));
    const todayAction=(actions||[]).find(a=>a.action_date===today)||{};
    const readDays=(actions||[]).filter(a=>a.read_bible).map(a=>a.action_date);
    const encourageDays=(actions||[]).filter(a=>a.encouraged_teammate).map(a=>a.action_date);
    const vals=[
      {key:'checkin',label:'Checked In',hint:'Daily check-in',done:checkDays.includes(today),streak:streak(checkDays)},
      {key:'read_bible',label:'Read Bible/Devotion',hint:'Today’s Word',done:!!todayAction.read_bible,streak:streak(readDays)},
      {key:'encouraged_teammate',label:'Encouraged a Teammate',hint:'Build someone up',done:!!todayAction.encouraged_teammate,streak:streak(encourageDays)}
    ];
    document.getElementById('daily-three')?.remove();
    let box=document.getElementById('home-circles');if(!box){box=document.createElement('section');box.id='home-circles';box.className='home-circles';welcome.insertAdjacentElement('afterend',box)}
    box.innerHTML=`<div class="home-circles-head"><div><span class="eyebrow">TODAY</span><h2>3 Ways to Show Up</h2></div><small>${vals.filter(v=>v.done).length}/3 complete</small></div><div class="home-circles-grid">${vals.map(v=>`<div class="home-circle-wrap"><button type="button" class="home-circle ${v.done?'done':''}" data-key="${v.key}" aria-pressed="${v.done}"><span class="mark">${v.done?'✓':'○'}</span><span class="streak">🔥 ${v.streak} day${v.streak===1?'':'s'}</span></button><strong>${v.label}</strong><small>${v.hint}</small></div>`).join('')}</div>`;
    for(const btn of box.querySelectorAll('.home-circle')) btn.onclick=async()=>{
      const key=btn.dataset.key;
      if(key==='checkin'){document.querySelector('.checkin')?.scrollIntoView({behavior:'smooth',block:'center'});return;}
      btn.disabled=true;
      const current=btn.getAttribute('aria-pressed')==='true';
      const existing=(actions||[]).find(a=>a.action_date===today)||{};
      const payload={user_id:session.user.id,action_date:today,read_bible:!!existing.read_bible,encouraged_teammate:!!existing.encouraged_teammate,updated_at:new Date().toISOString(),[key]:!current};
      const {error}=await supabase.from('daily_spiritual_actions').upsert(payload,{onConflict:'user_id,action_date'});
      if(error)alert(error.message);else await render();
      btn.disabled=false;
    };
  }finally{running=false}
}
styles();
new MutationObserver(()=>setTimeout(render,50)).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',render);
supabase.auth.onAuthStateChange(()=>setTimeout(render,250));
setInterval(render,1200);
