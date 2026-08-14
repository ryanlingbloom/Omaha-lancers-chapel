import { createClient } from '@supabase/supabase-js';
const supabase=createClient('https://jpfnhwolttfisawfthbf.supabase.co','sb_publishable_vsHZotBHUEePBvunVgTWWQ_fIImlhYY',{auth:{persistSession:true,storageKey:'lancers-chapel-session'}});
const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let mounting=false;
async function mount(){
 const devotion=document.querySelector('.word-card .devotion'); if(!devotion)return;
 const existing=devotion.querySelectorAll('.reflection-box'); if(existing.length){[...existing].slice(1).forEach(x=>x.remove());return}
 if(mounting)return; mounting=true;
 try{
  const {data:{session}}=await supabase.auth.getSession(); if(!session)return;
  if(devotion.querySelector('.reflection-box'))return;
  const ps=devotion.querySelectorAll(':scope > p'); const question=ps[ps.length-1]?.textContent?.trim()||''; const ref=document.querySelector('.word-card .reference')?.textContent?.trim()||'';
  const {data:rows}=await supabase.from('daily_reflections').select('*').eq('user_id',session.user.id).order('reflection_date',{ascending:false}).limit(100); const mine=(rows||[]).find(r=>r.reflection_date===day());
  if(devotion.querySelector('.reflection-box'))return;
  const box=document.createElement('div');box.className='reflection-box';box.innerHTML=`<label>Your private reflection</label><textarea placeholder="Write what you’re thinking…"></textarea><button class="save-reflection">${mine?.response?'Saved ✓':'Save Reflection'}</button><small>Private to you. Pastor Ryan and teammates cannot see this.</small><button class="history-link">My Reflections</button><div class="reflection-history" hidden></div>`;
  const ta=box.querySelector('textarea');ta.value=mine?.response||''; const save=box.querySelector('.save-reflection');
  ta.addEventListener('input',()=>save.textContent='Save Reflection');
  save.onclick=async()=>{const response=ta.value.trim();if(!response)return;save.disabled=true;const {error}=await supabase.from('daily_reflections').upsert({user_id:session.user.id,reflection_date:day(),scripture_reference:ref,question,response,updated_at:new Date().toISOString()},{onConflict:'user_id,reflection_date'});save.disabled=false;save.textContent=error?'Try again':'Saved ✓';};
  const hist=box.querySelector('.reflection-history');box.querySelector('.history-link').onclick=async e=>{hist.hidden=!hist.hidden;e.currentTarget.textContent=hist.hidden?'My Reflections':'Hide My Reflections';if(!hist.hidden){const {data}=await supabase.from('daily_reflections').select('*').eq('user_id',session.user.id).order('reflection_date',{ascending:false}).limit(100);hist.innerHTML=(data||[]).map(r=>`<article><strong>${r.reflection_date} · ${r.scripture_reference||'Scripture'}</strong><p>${r.question||''}</p><span>${r.response||''}</span></article>`).join('')||'<p>No saved reflections yet.</p>';}};
  devotion.appendChild(box);
 } finally {mounting=false}
}
const observer=new MutationObserver(()=>mount());observer.observe(document.documentElement,{childList:true,subtree:true});mount();