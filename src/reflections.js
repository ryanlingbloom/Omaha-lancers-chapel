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
  const {data:active}=await supabase.from('devotions').select('id,devotion_date').eq('published',true).order('created_at',{ascending:false}).limit(1).maybeSingle();
  const devotionId=active?.id||null;
  const {data:rows}=await supabase.from('daily_reflections').select('*').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(150);
  const mine=devotionId?(rows||[]).find(r=>r.devotion_id===devotionId):(rows||[]).find(r=>r.reflection_date===day()&&r.scripture_reference===ref);
  if(devotion.querySelector('.reflection-box'))return;
  const box=document.createElement('div');box.className='reflection-box';
  box.innerHTML=`<div class="reflection-editor" ${mine?'hidden style="display:none"':''}><label>Your private reflection</label><textarea placeholder="Write what you’re thinking…"></textarea><button class="save-reflection">Save Reflection</button><small>Private to you. Pastor Ryan and teammates cannot see this.</small></div>`;
  const editor=box.querySelector('.reflection-editor'); const ta=box.querySelector('textarea'); const save=box.querySelector('.save-reflection');
  save.onclick=async()=>{const response=ta.value.trim();if(!response)return;save.disabled=true;const payload={user_id:session.user.id,reflection_date:active?.devotion_date||day(),devotion_id:devotionId,scripture_reference:ref,question,response,updated_at:new Date().toISOString()};let q;if(devotionId)q=supabase.from('daily_reflections').upsert(payload,{onConflict:'user_id,devotion_id'});else q=supabase.from('daily_reflections').upsert(payload,{onConflict:'user_id,reflection_date'});const {error}=await q;save.disabled=false;if(error){save.textContent='Try again';return;}editor.hidden=true;editor.style.display='none';};
  devotion.appendChild(box);
 } finally {mounting=false}
}
const observer=new MutationObserver(()=>mount());observer.observe(document.documentElement,{childList:true,subtree:true});mount();