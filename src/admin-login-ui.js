function updateAdminLogin(){
  const gate=document.querySelector('.gate');
  if(!gate)return;
  const inputs=[...gate.querySelectorAll('input')];
  const first=inputs.find(i=>i.placeholder==='First name');
  const last=inputs.find(i=>i.placeholder==='Last name');
  const jersey=inputs.find(i=>i.placeholder==='Jersey number');
  if(!first||!last||!jersey)return;
  const isRyan=first.value.trim().toLowerCase()==='ryan'&&last.value.trim().toLowerCase()==='lingbloom';
  jersey.style.display=isRyan?'none':'';
  jersey.required=!isRyan;
  if(isRyan)jersey.value='';
}
document.addEventListener('input',e=>{if(e.target?.placeholder==='First name'||e.target?.placeholder==='Last name')updateAdminLogin()});
new MutationObserver(updateAdminLogin).observe(document.documentElement,{childList:true,subtree:true});
updateAdminLogin();