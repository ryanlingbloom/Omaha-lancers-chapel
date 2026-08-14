import { createClient } from '@supabase/supabase-js';
const supabase=createClient('https://jpfnhwolttfisawfthbf.supabase.co','sb_publishable_vsHZotBHUEePBvunVgTWWQ_fIImlhYY',{auth:{persistSession:true,storageKey:'lancers-chapel-session'}});
const gameKeys=['2026-09-04-sioux-city','2026-09-05-sioux-city','2026-09-06-des-moines','2026-09-10-lincoln','2026-09-11-lincoln','2026-09-19-chicago','2026-09-20-madison','2026-09-25-des-moines','2026-09-26-des-moines','2026-10-02-des-moines','2026-10-10-cedar-rapids','2026-10-16-tri-city','2026-10-17-tri-city','2026-10-23-sioux-falls','2026-10-24-tri-city','2026-10-30-lincoln','2026-10-31-lincoln'];
let running=false;
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
async function run(){
 if(running)return; running=true;
 try{
  const page=document.querySelector('.games-page'); if(!page)return;
  const {data:{session}}=await supabase.auth.getSession(); if(!session)return;
  const {data:me}=await supabase.from('profiles').select('role').eq('id',session.user.id).maybeSingle(); if(me?.role!=='admin')return;
  const pagerText=page.querySelector('.pager span')?.textContent||'1 / 1'; const currentPage=Math.max(1,parseInt(pagerText,10)||1); const start=(currentPage-1)*5;
  const [{data:rsvps},{data:people}]=await Promise.all([supabase.from('game_prayer_rsvps').select('*'),supabase.from('profiles').select('id,display_name,jersey_number,role')]);
  const peopleMap=new Map((people||[]).map(p=>[p.id,p]));
  const cards=[...page.querySelectorAll('.games-list article')];
  cards.forEach((card,i)=>{
   const prayer=card.querySelector('.game-prayer'); if(!prayer)return;
   const key=gameKeys[start+i]; if(!key)return;
   const rows=(rsvps||[]).filter(r=>r.game_key===key);
   const accepted=rows.filter(r=>r.status==='accept').map(r=>peopleMap.get(r.user_id)).filter(Boolean);
   const declined=rows.filter(r=>r.status==='decline').map(r=>peopleMap.get(r.user_id)).filter(Boolean);
   let box=prayer.querySelector('.prayer-rsvp-roster'); if(!box){box=document.createElement('div');box.className='prayer-rsvp-roster';prayer.appendChild(box)}
   box.innerHTML=`<strong>RSVPs</strong><span>${accepted.length} coming · ${declined.length} declined</span>${accepted.length?`<div>${accepted.map(p=>`✓ ${esc(p.role==='admin'?'Pastor Ryan':p.display_name)}${p.role!=='admin'&&p.jersey_number?` #${esc(p.jersey_number)}`:''}`).join('<br>')}</div>`:'<div>No one accepted yet.</div>'}${declined.length?`<details><summary>Declined (${declined.length})</summary>${declined.map(p=>`<div>${esc(p.role==='admin'?'Pastor Ryan':p.display_name)}</div>`).join('')}</details>`:''}`;
  });
 } finally {running=false}
}
const observer=new MutationObserver(()=>setTimeout(run,80));observer.observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',run);setInterval(run,2000);