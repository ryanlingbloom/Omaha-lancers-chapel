import { createClient } from '@supabase/supabase-js';
const supabase=createClient('https://jpfnhwolttfisawfthbf.supabase.co','sb_publishable_vsHZotBHUEePBvunVgTWWQ_fIImlhYY',{auth:{persistSession:true,storageKey:'lancers-chapel-session'}});
const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
let mounting=false;
function escapeHtml(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
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
  const box=document.createElement('div');box.className='reflection-box';
  box.innerHTML=`<div class="reflection-editor" ${mine?'hidden style="display:none"':''}><label>Your private reflection</label><textarea placeholder="Write what you’re thinking…"></textarea><button class="save-reflection">Save Reflection</button><small>Private to you. Pastor Ryan and teammates cannot see this.</small></div><button class="history-link">My Reflections</button><div class="reflection-history" hidden style="display:none"></div>`;
  const editor=box.querySelector('.reflection-editor'); const ta=box.querySelector('textarea');ta.value=mine?.response||''; const save=box.querySelector('.save-reflection');
  save.onclick=async()=>{const response=ta.value.trim();if(!response)return;save.disabled=true;const {error}=await supabase.from('daily_reflections').upsert({user_id:session.user.id,reflection_date:day(),scripture_reference:ref,question,response,updated_at:new Date().toISOString()},{onConflict:'user_id,reflection_date'});save.disabled=false;if(error){save.textContent='Try again';return;}editor.hidden=true;editor.style.display='none';await openHistory();};
  const hist=box.querySelector('.reflection-history');const historyBtn=box.querySelector('.history-link');
  async function openHistory(){
    const {data}=await supabase.from('daily_reflections').select('*').eq('user_id',session.user.id).order('reflection_date',{ascending:false}).limit(100);
    hist.innerHTML=(data||[]).map(r=>`<article><strong>${escapeHtml(r.reflection_date)} · ${escapeHtml(r.scripture_reference||'Scripture')}</strong><p>${escapeHtml(r.question||'')}</p><span>${escapeHtml(r.response||'')}</span></article>`).join('')||'<p>No saved reflections yet.</p>';
    hist.hidden=false;hist.style.display='grid';historyBtn.textContent='Hide My Reflections';
  }
  historyBtn.onclick=async()=>{const opening=hist.style.display==='none';if(opening)await openHistory();else{hist.hidden=true;hist.style.display='none';historyBtn.textContent='My Reflections';}};
  devotion.appendChild(box);
 } finally {mounting=false}
}
const observer=new MutationObserver(()=>mount());observer.observe(document.documentElement,{childList:true,subtree:true});mount();