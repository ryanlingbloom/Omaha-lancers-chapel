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
function milestoneCopy(n){
  if(n===1)return{icon:'🏆',title:'FIRST 3/3!',sub:'You closed all three circles for the first time.',line:'That is how a rhythm starts. Keep showing up.'};
  if(n===7)return{icon:'🔥',title:'ONE FULL WEEK!',sub:'7 straight days of 3/3.',line:'A week of checking in, reading Scripture, and building up a teammate.'};
  if(n===25)return{icon:'🏆',title:'25 DAYS — 3/3',sub:'Twenty-five straight days.',line:'Consistency is becoming character. Keep going.'};
  if(n===50)return{icon:'🔥🏆',title:'50 DAYS — 3/3',sub:'Fifty straight days.',line:'This is a serious rhythm now. Huge milestone.'};
  return{icon:'🏆🔥',title:'100 DAYS — 3/3!',sub:'One hundred straight days.',line:'That is incredible consistency. Celebrate this one.'};
}
function styles(){
  if(document.getElementById('home-circles-css'))return;
  const s=document.createElement('style');s.id='home-circles-css';s.textContent=`
  .home-circles{margin:18px 0 22px;padding:18px 14px;background:#141414;border:1px solid #2d2d2d;border-radius:18px}.home-circles-head{display:flex;justify-content:space-between;align-items:end;gap:12px;margin-bottom:16px}.home-circles-head h2{margin:3px 0 0;font-size:20px}.home-circles-head small{color:#999}.home-circles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.home-circle-wrap{text-align:center;display:flex;flex-direction:column;align-items:center;gap:7px}.home-circle{width:82px;height:82px;border-radius:50%;border:5px solid #363636;background:#101010;color:#eee;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer}.home-circle.done{border-color:#ef6c00;background:#25170d}.home-circle .mark{font-size:22px;font-weight:900;line-height:1}.home-circle .streak{font-size:11px;color:#aaa;margin-top:5px}.home-circle.done .streak{color:#ffb36e}.home-circle-wrap strong{font-size:12px;line-height:1.15}.home-circle-wrap small{font-size:10px;color:#858585;line-height:1.2}
  .three-milestone-backdrop{position:fixed;inset:0;z-index:30000;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;padding:22px;animation:milestoneFade .25s ease}.three-milestone-card{position:relative;width:min(440px,100%);overflow:hidden;text-align:center;background:radial-gradient(circle at top,#42200b 0,#17110d 40%,#0c0c0c 72%);border:2px solid #ef6c00;border-radius:24px;padding:34px 22px 24px;box-shadow:0 0 60px rgba(239,108,0,.35)}.three-milestone-burst{font-size:64px;line-height:1;margin-bottom:10px;animation:milestonePop .55s cubic-bezier(.2,.9,.3,1.35)}.three-milestone-kicker{display:block;color:#ff9a46;font-size:11px;font-weight:900;letter-spacing:1.8px;margin-bottom:8px}.three-milestone-card h2{font-size:34px;line-height:1.05;margin:0 0 12px}.three-milestone-card h3{font-size:19px;margin:0 0 10px;color:#fff}.three-milestone-card p{color:#bbb;line-height:1.5;margin:0 auto 22px;max-width:340px}.three-milestone-card button{width:100%;border:0;border-radius:12px;background:#ef6c00;color:#080808;font-weight:900;padding:13px;font-size:15px}.three-confetti{position:absolute;inset:0;pointer-events:none;overflow:hidden}.three-confetti i{position:absolute;top:-15%;font-style:normal;font-size:22px;animation:confettiFall 2.3s linear infinite}.three-confetti i:nth-child(1){left:8%;animation-delay:.1s}.three-confetti i:nth-child(2){left:21%;animation-delay:.7s}.three-confetti i:nth-child(3){left:37%;animation-delay:.3s}.three-confetti i:nth-child(4){left:53%;animation-delay:1s}.three-confetti i:nth-child(5){left:68%;animation-delay:.4s}.three-confetti i:nth-child(6){left:84%;animation-delay:.8s}@keyframes milestoneFade{from{opacity:0}to{opacity:1}}@keyframes milestonePop{0%{transform:scale(.55);opacity:0}100%{transform:scale(1);opacity:1}}@keyframes confettiFall{0%{transform:translateY(-30px) rotate(0);opacity:0}10%{opacity:1}100%{transform:translateY(600px) rotate(600deg);opacity:0}}
  @media(max-width:380px){.home-circle{width:72px;height:72px}.home-circles-grid{gap:6px}.home-circle-wrap strong{font-size:11px}.three-milestone-card h2{font-size:29px}}`;
  document.head.appendChild(s);
}
function showMilestone(row){
  if(!row||document.getElementById('three-milestone'))return;
  const seenKey=`lancers-3of3-milestone-${row.user_id}-${row.milestone}`;
  if(localStorage.getItem(seenKey))return;
  const c=milestoneCopy(Number(row.milestone));
  const root=document.createElement('div');root.id='three-milestone';root.className='three-milestone-backdrop';
  root.innerHTML=`<div class="three-milestone-card"><div class="three-confetti"><i>●</i><i>★</i><i>●</i><i>★</i><i>●</i><i>★</i></div><div class="three-milestone-burst">${c.icon}</div><span class="three-milestone-kicker">MILESTONE UNLOCKED</span><h2>${c.title}</h2><h3>${c.sub}</h3><p>${c.line}</p><button>LET'S GO</button></div>`;
  document.body.appendChild(root);
  root.querySelector('button').onclick=()=>{localStorage.setItem(seenKey,'1');root.remove()};
}
async function maybeCelebrate(session){
  const {data}=await supabase.from('daily_three_milestone_log').select('user_id,milestone,completion_day,created_at').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(data)showMilestone(data);
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
      if(error)alert(error.message);else{await new Promise(r=>setTimeout(r,250));await render();await maybeCelebrate(session)}
      btn.disabled=false;
    };
    await maybeCelebrate(session);
  }finally{running=false}
}
styles();
new MutationObserver(()=>setTimeout(render,50)).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',render);
supabase.auth.onAuthStateChange(()=>setTimeout(render,250));
setInterval(render,1200);
