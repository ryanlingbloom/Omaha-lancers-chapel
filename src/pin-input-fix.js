function fixPinInputs(){
  const root=document.getElementById('player-onboarding');
  if(!root)return;
  for(const input of root.querySelectorAll('.pin-one,.pin-two')){
    if(input.dataset.nativePin==='1')continue;
    const clean=input.cloneNode(true);
    clean.dataset.nativePin='1';
    clean.type='text';
    clean.inputMode='numeric';
    clean.pattern='[0-9]*';
    clean.autocomplete='off';
    clean.readOnly=false;
    clean.disabled=false;
    clean.style.pointerEvents='auto';
    clean.style.userSelect='text';
    clean.style.webkitUserSelect='text';
    clean.addEventListener('input',()=>{clean.value=clean.value.replace(/\D/g,'').slice(0,8)});
    input.replaceWith(clean);
  }
}
const observer=new MutationObserver(()=>fixPinInputs());
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',fixPinInputs);
setInterval(fixPinInputs,500);
