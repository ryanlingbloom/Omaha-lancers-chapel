import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jpfnhwolttfisawfthbf.supabase.co','sb_publishable_vsHZotBHUEePBvunVgTWWQ_fIImlhYY',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'lancers-chapel-session'}});
let running=false;

function addStyles(){
  if(document.getElementById('lancers-enhancement-styles'))return;
  const style=document.createElement('style'); style.id='lancers-enhancement-styles';
  style.textContent=`
  .daily-three{margin:18px 0 22px;padding:18px 14px;background:linear-gradient(180deg,#171717,#101010);border:1px solid #2b2b2b;border-radius:18px}.daily-three-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:16px}.daily-three-head h2{margin:3px 0 0;font-size:20px}.daily-three-head small{color:#9b9b9b}.daily-rings{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.daily-ring-wrap{display:flex;flex-direction:column;align-items:center;text-align:center;gap:7px}.daily-ring{width:82px;height:82px;border-radius:50%;border:5px solid #343434;background:#111;color:#eee;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:.18s ease;box-shadow:inset 0 0 0 3px #111;cursor:pointer}.daily-ring.done{border-color:#ef6c00;background:radial-gradient(circle at 50% 42%,#3a210e,#17110d);box-shadow:0 0 0 2px rgba(239,108,0,.14),inset 0 0 0 3px #111}.daily-ring .ring-check{font-size:22px;line-height:1;font-weight:900}.daily-ring .ring-streak{font-size:11px;margin-top:5px;color:#aaa}.daily-ring.done .ring-streak{color:#ffb36e}.daily-ring-wrap strong{font-size:12px;line-height:1.15}.daily-ring-wrap small{font-size:10px;color:#858585;line-height:1.2}.daily-ring:disabled{cursor:default;opacity:1}@media(max-width:380px){.daily-ring{width:72px;height:72px}.daily-rings{gap:6px}.daily-ring-wrap strong{font-size:11px}}
  .live-rsvp-roster{margin-top:20px;padding-top:18px;border-top:1px solid rgba(255,255,255,.12)}.live-rsvp-roster h3{margin:0 0 10px}.rsvp-summary{display:flex;gap:14px;margin-bottom:10px}.rsvp-summary b{color:#65d483}.rsvp-summary span{color:#ff7777}.rsvp-names{display:flex;flex-direction:column;gap:6px}.rsvp-names span{font-size:14px}.live-rsvp-roster details{margin-top:12px}.live-rsvp-roster details span{display:block;padding:4px 0}.clickable-player{cursor:pointer}.view-profile-button{margin-left:auto!important;background:#ef6c00!important;color:white!important;border:0!important;border-radius:8px!important;padding:8px 10px!important}.profile-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px}.profile-modal{position:relative;width:min(520px,100%);max-height:85vh;overflow:auto;background:#151515;border:1px solid #333;border-radius:18px;padding:24px;color:#fff}.profile-modal h2{margin:6px 0 20px}.profile-modal>div{padding:10px 0;border-top:1px solid #2b2b2b}.profile-modal p{margin:4px 0 0;color:#ccc}.profile-close{position:absolute;right:14px;top:10px;border:0;background:transparent;color:#fff;font-size:30px}`;
  document.head.appendChild(style);
}

async function sessionProfile(){
  const {data:{session}}=await supabase.auth.getSession();
  if(!session)return null;
  const {data}=await supabase.from('profiles').select('*').eq('id',session.user.id).maybeSingle();
  return data||null;
}

function chicagoDay(date=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(date)}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function streakFromDays(rawDays){
  const days=[...new Set(rawDays.filter(Boolean))].sort().reverse();
  const today=chicagoDay(); let cursor=new Date(`${today}T12:00:00`), count=0;
  if(!days.includes(today))cursor.setDate(cursor.getDate()-1);
  for(const day of days){const expected=chicagoDay(cursor);if(day===expected){count++;cursor.setDate(cursor.getDate()-1)}else if(day<expected)break}
  return count;
}

async function enhanceDailyThree(){
  const welcome=document.querySelector('.welcome'); if(!welcome)return;
  const profile=await sessionProfile(); if(!profile)return;
  let box=document.getElementById('daily-three');
  if(!box){box=document.createElement('section');box.id='daily-three';box.className='daily-three';welcome.insertAdjacentElement('afterend',box)}
  const today=chicagoDay();
  const [{data:checks},{data:actions}]=await Promise.all([
    supabase.from('checkins').select('checkin_day,created_at').eq('user_id',profile.id).order('created_at',{ascending:false}).limit(120),
    supabase.from('daily_spiritual_actions').select('*').eq('user_id',profile.id).order('action_date',{ascending:false}).limit(120)
  ]);
  const checkDays=(checks||[]).map(c=>c.checkin_day||chicagoDay(new Date(c.created_at)));
  const current=(actions||[]).find(a=>a.action_date===today)||{};
  const readDays=(actions||[]).filter(a=>a.read_bible).map(a=>a.action_date);
  const encourageDays=(actions||[]).filter(a=>a.encouraged_teammate).map(a=>a.action_date);
  const values=[
    {key:'checkin',label:'Checked In',done:checkDays.includes(today),streak:streakFromDays(checkDays),hint:'Daily check-in'},
    {key:'read_bible',label:'Read Bible',done:!!current.read_bible,streak:streakFromDays(readDays),hint:'Today’s devotion'},
    {key:'encouraged_teammate',label:'Encouraged',done:!!current.encouraged_teammate,streak:streakFromDays(encourageDays),hint:'A teammate'}
  ];
  box.innerHTML=`<div class="daily-three-head"><div><span class="eyebrow">TODAY</span><h2>3 Ways to Show Up</h2></div><small>${values.filter(v=>v.done).length}/3 complete</small></div><div class="daily-rings">${values.map(v=>`<div class="daily-ring-wrap"><button type="button" class="daily-ring ${v.done?'done':''}" data-action="${v.key}" aria-pressed="${v.done}"><span class="ring-check">${v.done?'✓':'○'}</span><span class="ring-streak">🔥 ${v.streak} day${v.streak===1?'':'s'}</span></button><strong>${v.label}</strong><small>${v.hint}</small></div>`).join('')}</div>`;
  for(const btn of box.querySelectorAll('.daily-ring')){
    btn.onclick=async()=>{
      const key=btn.dataset.action;
      if(key==='checkin'){
        document.querySelector('.checkin')?.scrollIntoView({behavior:'smooth',block:'center'}); return;
      }
      btn.disabled=true;
      const was=btn.getAttribute('aria-pressed')==='true';
      const payload={user_id:profile.id,action_date:today,[key]:!was,updated_at:new Date().toISOString()};
      const {error}=await supabase.from('daily_spiritual_actions').upsert(payload,{onConflict:'user_id,action_date'});
      if(error)alert(error.message); else await enhanceDailyThree();
      btn.disabled=false;
    };
  }
}

async function enhanceChapel(){
  const card=document.querySelector('.feature-event'); if(!card)return;
  const {data:event}=await supabase.from('chapel_events').select('id').gte('starts_at',new Date(Date.now()-2*3600000).toISOString()).order('starts_at',{ascending:true}).limit(1).maybeSingle();
  if(!event)return;
  const {data:rows}=await supabase.rpc('chapel_rsvp_roster',{p_event_id:event.id});
  let box=document.getElementById('chapel-rsvp-roster');
  if(!box){box=document.createElement('div');box.id='chapel-rsvp-roster';box.className='live-rsvp-roster';card.appendChild(box)}
  const yes=(rows||[]).filter(r=>r.attending===true), no=(rows||[]).filter(r=>r.attending===false);
  box.innerHTML=`<h3>Chapel RSVP</h3><div class="rsvp-summary"><b>${yes.length} coming</b><span>${no.length} can't make it</span></div><div class="rsvp-names">${yes.length?yes.map(r=>`<span>✓ ${escapeHtml(r.display_name)}${r.jersey_number&&r.display_name!=='Pastor Ryan'?` #${escapeHtml(r.jersey_number)}`:''}</span>`).join(''):'<span>No RSVPs yet.</span>'}</div>${no.length?`<details><summary>Can't make it (${no.length})</summary>${no.map(r=>`<span>${escapeHtml(r.display_name)}</span>`).join('')}</details>`:''}`;
}

async function enhanceAdminPlayers(){
  const roster=document.querySelector('.player-roster'); if(!roster)return;
  const profile=await sessionProfile(); if(profile?.role!=='admin')return;
  const {data:players}=await supabase.from('profiles').select('id,display_name,jersey_number,first_name,last_name').eq('role','player').eq('approved',true);
  const {data:details}=await supabase.from('player_profiles').select('*');
  for(const article of roster.querySelectorAll('article')){
    if(article.dataset.profileReady)continue;
    const text=article.textContent||'';
    const p=(players||[]).find(x=>text.includes(x.display_name)); if(!p)continue;
    article.dataset.profileReady='1'; article.classList.add('clickable-player');
    const btn=document.createElement('button'); btn.type='button'; btn.className='view-profile-button'; btn.textContent='View Profile';
    btn.onclick=e=>{e.stopPropagation();showProfile(p,(details||[]).find(d=>d.user_id===p.id));};
    const remove=[...article.querySelectorAll('button')].find(b=>b.textContent.includes('Remove')); if(remove)article.insertBefore(btn,remove); else article.appendChild(btn);
    article.onclick=e=>{if(e.target.tagName!=='BUTTON')showProfile(p,(details||[]).find(d=>d.user_id===p.id));};
  }
}

function showProfile(p,d={}){
  document.getElementById('player-profile-modal')?.remove();
  const modal=document.createElement('div');modal.id='player-profile-modal';modal.className='profile-modal-backdrop';
  const fields=[['Hometown',d?.hometown],['Pregame routine',d?.pregame_routine],['Pregame song',d?.pregame_song],['Favorite snack',d?.favorite_snack],['Favorite restaurant',d?.favorite_restaurant],['Teammate fact',d?.teammate_fact]];
  modal.innerHTML=`<div class="profile-modal"><button class="profile-close">×</button><span class="eyebrow">PLAYER PROFILE</span><h2>#${escapeHtml(p.jersey_number||'—')} · ${escapeHtml(p.display_name)}</h2>${fields.map(([k,v])=>`<div><strong>${k}</strong><p>${escapeHtml(v||'Not added yet')}</p></div>`).join('')}</div>`;
  modal.querySelector('.profile-close').onclick=()=>modal.remove(); modal.onclick=e=>{if(e.target===modal)modal.remove()}; document.body.appendChild(modal);
}

async function fixAdminCheckinNames(){
  const list=document.querySelector('.checkin-admin'); if(!list)return;
  const profile=await sessionProfile(); if(profile?.role!=='admin')return;
  const {data:checks}=await supabase.from('checkins').select('user_id,created_at').eq('checkin_day',chicagoDay()).order('created_at',{ascending:false});
  const ids=[...new Set((checks||[]).map(c=>c.user_id))]; if(!ids.length)return;
  const {data:people}=await supabase.from('profiles').select('id,display_name,role').in('id',ids);
  const articles=[...list.querySelectorAll('article')];
  articles.forEach((a,i)=>{const c=checks?.[i];const p=(people||[]).find(x=>x.id===c?.user_id);const strong=a.querySelector('strong');if(strong&&p)strong.textContent=p.role==='admin'?'Pastor Ryan':p.display_name;});
}

async function run(){if(running)return;running=true;try{addStyles();await enhanceDailyThree();await enhanceChapel();await enhanceAdminPlayers();await fixAdminCheckinNames();}finally{running=false}}
const observer=new MutationObserver(()=>setTimeout(run,80));observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',run);setInterval(run,1800);
