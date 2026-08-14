let lastAdminState=null;

function updateAdminLogin(){
  const gate=document.querySelector('.gate');
  if(!gate)return;
  const inputs=[...gate.querySelectorAll('input')];
  const first=inputs.find(i=>i.placeholder==='First name');
  const last=inputs.find(i=>i.placeholder==='Last name');
  const jersey=inputs.find(i=>i.placeholder==='Jersey number');
  if(!first||!last||!jersey)return;

  // Lingbloom is the Pastor Ryan/admin login. Ryan Test and every player
  // still use a normal last name and therefore keep the jersey field.
  const isAdminLogin=last.value.trim().toLowerCase()==='lingbloom';

  if(isAdminLogin){
    jersey.required=false;
    jersey.removeAttribute('required');
    jersey.value='';
    jersey.style.setProperty('display','none','important');
    jersey.style.setProperty('visibility','hidden','important');
    jersey.style.setProperty('height','0','important');
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
    jersey.style.removeProperty('padding');
    jersey.style.removeProperty('margin');
    jersey.style.removeProperty('border');
    jersey.removeAttribute('aria-hidden');
    jersey.tabIndex=0;
  }
  lastAdminState=isAdminLogin;
}

// Capture input before React can redraw, then re-apply just after the redraw.
document.addEventListener('input',e=>{
  if(e.target?.placeholder==='First name'||e.target?.placeholder==='Last name'){
    updateAdminLogin();
    requestAnimationFrame(updateAdminLogin);
    setTimeout(updateAdminLogin,0);
  }
},true);

new MutationObserver(()=>requestAnimationFrame(updateAdminLogin)).observe(document.documentElement,{childList:true,subtree:true,attributes:false});

// Small watchdog while the login screen is visible. This stops React/iOS
// from restoring the jersey field after an input repaint.
setInterval(()=>{if(document.querySelector('.gate'))updateAdminLogin()},250);
updateAdminLogin();