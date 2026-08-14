import { createClient } from '@supabase/supabase-js';
const supabase=createClient('https://jpfnhwolttfisawfthbf.supabase.co','sb_publishable_vsHZotBHUEePBvunVgTWWQ_fIImlhYY',{auth:{persistSession:true,storageKey:'lancers-chapel-session'}});
let adding=false;
async function ensureRyanTab(){
 if(adding)return; adding=true;
 try{
  const nav=document.querySelector('.bottom-nav'); if(!nav)return;
  const {data:{session}}=await supabase.auth.getSession(); if(!session)return;
  const {data:profile}=await supabase.from('profiles').select('role,display_name').eq('id',session.user.id).maybeSingle(); if(profile?.role!=='admin')return;
  nav.classList.remove('five'); nav.classList.add('six');
  if(nav.querySelector('[data-admin-ryan-preview]'))return;
  const adminBtn=[...nav.querySelectorAll('button')].find(b=>b.textContent.trim()==='Admin');
  if(!adminBtn)return;
  const btn=document.createElement('button');btn.type='button';btn.dataset.adminRyanPreview='1';btn.innerHTML='<span>◉</span>Ryan';
  btn.onclick=()=>showRyanPreview(profile,session.user.id,btn);
  nav.insertBefore(btn,adminBtn);
 } finally {adding=false}
}
function showRyanPreview(profile,userId,btn){
 const content=document.querySelector('.content'); if(!content)return;
 for(const b of document.querySelectorAll('.bottom-nav button'))b.classList.remove('active');btn.classList.add('active');
 content.innerHTML=`<section class="private-page admin-ryan-preview"><div class="private-hero"><span class="lock">PLAYER VIEW · PRIVATE TO PASTOR RYAN</span><h1>Talk to Pastor Ryan</h1><p>Prayer request, question, or something you want to talk through. This does not post to team chat.</p></div><div class="request-form"><label>What do you need?</label><div class="choice-row"><button class="active" data-kind="Prayer request">Prayer request</button><button data-kind="I need to talk">I need to talk</button><button data-kind="Ask a question">Ask a question</button></div><label>Your message</label><textarea placeholder="Write your message…"></textarea><label class="toggle"><input type="checkbox">Send anonymously</label><button class="primary send-preview">Send to Pastor Ryan</button><p class="privacy-note">Admin preview: sending here creates a real private request so you can verify the player flow.</p></div></section>`;
 let kind='Prayer request';
 for(const k of content.querySelectorAll('[data-kind]'))k.onclick=()=>{kind=k.dataset.kind;for(const x of content.querySelectorAll('[data-kind]'))x.classList.toggle('active',x===k)};
 content.querySelector('.send-preview').onclick=async()=>{const textarea=content.querySelector('textarea'),body=textarea.value.trim();if(!body)return;const anonymous=content.querySelector('input[type="checkbox"]').checked;const send=content.querySelector('.send-preview');send.disabled=true;send.textContent='Sending…';const {error}=await supabase.from('private_requests').insert({user_id:userId,sender_name:profile.display_name||'Pastor Ryan',kind,body,anonymous});if(error){alert(error.message);send.disabled=false;send.textContent='Send to Pastor Ryan';return;}content.innerHTML='<section class="private-page"><div class="success-card"><span>✓</span><h2>Sent privately</h2><p>The player-facing Ryan flow worked.</p></div></section>';};
}
const observer=new MutationObserver(()=>setTimeout(ensureRyanTab,50));observer.observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('load',ensureRyanTab);setInterval(ensureRyanTab,1500);