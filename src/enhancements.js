import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jpfnhwolttfisawfthbf.supabase.co','sb_publishable_vsHZotBHUEePBvunVgTWWQ_fIImlhYY',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'lancers-chapel-session'}});
let running=false;

async function sessionProfile(){
  const {data:{session}}=await supabase.auth.getSession();
  if(!session)return null;
  const {data}=await supabase.from('profiles').select('*').eq('id',session.user.id).maybeSingle();
  return data||null;
}

async function enhanceChapel(){
  const card=document.querySelector('.feature-event');
  if(!card||document.getElementById('chapel-rsvp-roster'))return;
  const {data:event}=await supabase.from('chapel_events').select('id').gte('starts_at',new Date(Date.now()-2*3600000).toISOString()).order('starts_at',{ascending:true}).limit(1).maybeSingle();
  if(!event)return;
  const {data:rows}=await supabase.rpc('chapel_rsvp_roster',{p_event_id:event.id});
  const box=document.createElement('div'); box.id='chapel-rsvp-roster'; box.className='live-rsvp-roster';
  const yes=(rows||[]).filter(r=>r.attending), no=(rows||[]).filter(r=>!r.attending);
  box.innerHTML=`<h3>Chapel RSVP</h3><div class="rsvp-summary"><b>${yes.length} coming</b><span>${no.length} can't make it</span></div><div class="rsvp-names">${yes.length?yes.map(r=>`<span>✓ ${escapeHtml(r.display_name)}${r.jersey_number?` #${escapeHtml(r.jersey_number)}`:''}</span>`).join(''):'<span>No player RSVPs yet.</span>'}</div>${no.length?`<details><summary>Can't make it (${no.length})</summary>${no.map(r=>`<span>${escapeHtml(r.display_name)}</span>`).join('')}</details>`:''}`;
  card.appendChild(box);
}

async function enhanceAdminPlayers(){
  const roster=document.querySelector('.player-roster');
  if(!roster)return;
  const profile=await sessionProfile(); if(profile?.role!=='admin')return;
  const {data:players}=await supabase.from('profiles').select('id,display_name,jersey_number,first_name,last_name').eq('role','player').eq('approved',true);
  const {data:details}=await supabase.from('player_profiles').select('*');
  for(const article of roster.querySelectorAll('article')){
    if(article.dataset.profileReady)return;
    const text=article.textContent||'';
    const p=(players||[]).find(x=>text.includes(x.display_name)); if(!p)continue;
    article.dataset.profileReady='1'; article.classList.add('clickable-player');
    const btn=document.createElement('button'); btn.type='button'; btn.className='view-profile-button'; btn.textContent='View Profile';
    btn.onclick=e=>{e.stopPropagation();showProfile(p,(details||[]).find(d=>d.user_id===p.id));};
    const remove=article.querySelector('button'); if(remove)article.insertBefore(btn,remove); else article.appendChild(btn);
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

function chicagoDay(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

async function run(){if(running)return;running=true;try{await enhanceChapel();await enhanceAdminPlayers();await fixAdminCheckinNames();}finally{running=false}}
const observer=new MutationObserver(()=>setTimeout(run,50));observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',run);setInterval(run,2500);
