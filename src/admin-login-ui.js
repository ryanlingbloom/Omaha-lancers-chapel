let lastAdminState=null;

function updateAdminLogin(){
  const gate=document.querySelector('.gate');
  if(!gate)return;
  const inputs=[...gate.querySelectorAll('input')];
  const last=inputs.find(i=>i.placeholder==='Last name');
  const jersey=inputs.find(i=>i.placeholder==='Jersey number');
  if(!last||!jersey)return;

  // Pastor Ryan/admin: Lingbloom never needs a jersey number.
  const isAdminLogin=last.value.trim().toLowerCase()==='lingbloom';

  if(isAdminLogin){
    jersey.required=false;
    jersey.removeAttribute('required');
    jersey.value='';
    jersey.style.setProperty('display','none','important');
    jersey.style.setProperty('visibility','hidden','important');
    jersey.style.setProperty('height','0','important');
    jersey.style.setProperty('min-height','0','important');
    jersey.style.setProperty('padding','0','important');
    jersey.style.setProperty('margin','0','important');
    jersey.style.setProperty('border','0','important');
    jersey.setAttribute('aria-hidden','true');
    jersey.tabIndex=-1;
  }else{
    jersey.required=true;
    jersey.setAttribute('required','');
    jersey.style.removeProperty('display');
    jersey.style.removeProperty('visibility');
    jersey.style.removeProperty('height');
    jersey.style.removeProperty('min-height');
    jersey.style.removeProperty('padding');
    jersey.style.removeProperty('margin');
    jersey.style.removeProperty('border');
    jersey.removeAttribute('aria-hidden');
    jersey.tabIndex=0;
  }
  lastAdminState=isAdminLogin;
}

function reapplyAdminLogin(){
  updateAdminLogin();
  requestAnimationFrame(updateAdminLogin);
  setTimeout(updateAdminLogin,0);
  setTimeout(updateAdminLogin,75);
}

document.addEventListener('input',e=>{
  if(e.target?.placeholder==='First name'||e.target?.placeholder==='Last name')reapplyAdminLogin();
},true);
document.addEventListener('change',e=>{
  if(e.target?.placeholder==='First name'||e.target?.placeholder==='Last name')reapplyAdminLogin();
},true);
document.addEventListener('blur',e=>{
  if(e.target?.placeholder==='Last name')reapplyAdminLogin();
},true);

new MutationObserver(()=>requestAnimationFrame(updateAdminLogin)).observe(document.documentElement,{childList:true,subtree:true,attributes:false});
setInterval(()=>{if(document.querySelector('.gate'))updateAdminLogin()},150);
updateAdminLogin();