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
  const ps=devotion.querySelectorAll(':scope > p'); const question=ps[ps.length-1]?.textContent?.trim()||''; const ref=document.querySelector('.word-card .reference')?.textContent?.trim()||''; const title=devotion.querySelector('h2')?.textContent?.trim()||'';
  const {data:devos}=await supabase.from('devotions').select('id,reference,title,question,created_at').eq('published',true).order('created_at',{ascending:false}).limit(50);
  const current=(devos||[]).find(d=>String(d.reference||'').trim()===ref&&String(d.question||'').trim()===question)||(devos||[]).find(d=>String(d.title||'').trim()===title&&String(d.reference||'').trim()===ref)||(devos||[])[0];
  const devotionId=current?.id||null;
  let mine=null;
  if(devotionId){const {data}=await supabase.from('daily_reflections').select('*').eq('user_id',session.user.id).eq('devotion_id',devotionId).maybeSingle();mine=data||null;}
  if(devotion.querySelector('.reflection-box'))return;
  const box=document.createElement('div');box.className='reflection-box';
  box.innerHTML=`<div class="reflection-editor" ${mine?'hidden style="display:none"':''}><label>Your private reflection</label><textarea placeholder="Write what you’re thinking…"></textarea><button class="save-reflection">Save Reflection</button><small>Private to you. Pastor Ryan and teammates cannot see this.</small></div>${mine?'<small class="reflection-saved-note">Reflection saved. Find it under Profile → Update Profile → Questions.</small>':''}`;
  const editor=box.querySelector('.reflection-editor'); const ta=box.querySelector('textarea'); if(ta)ta.value=''; const save=box.querySelector('.save-reflection');
  if(save)save.onclick=async()=>{const response=ta.value.trim();if(!response)return;save.disabled=true;const payload={user_id:session.user.id,reflection_date:day(),devotion_id:devotionId,scripture_reference:ref,question,response,updated_at:new Date().toISOString()};let query;if(devotionId)query=supabase.from('daily_reflections').upsert(payload,{onConflict:'user_id,devotion_id'});else query=supabase.from('daily_reflections').upsert(payload,{onConflict:'user_id,reflection_date'});const {error}=await query;save.disabled=false;if(error){save.textContent='Try again';return;}editor.hidden=true;editor.style.display='none';const note=document.createElement('small');note.className='reflection-saved-note';note.textContent='Reflection saved. Find it under Profile → Update Profile → Questions.';box.appendChild(note);};
  devotion.appendChild(box);
 } finally {mounting=false}
}
const observer=new MutationObserver(()=>mount());observer.observe(document.documentElement,{childList:true,subtree:true});mount();