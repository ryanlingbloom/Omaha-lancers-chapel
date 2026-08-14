const STORAGE_KEY='lancers-chapel-session';
const RECOVERY_KEY='lancers-boot-recovery';

function clearLocalAuthSession(){
  try{localStorage.removeItem(STORAGE_KEY)}catch{}
  try{
    for(let i=localStorage.length-1;i>=0;i--){
      const key=localStorage.key(i);
      if(key&&key.includes('auth-token')) localStorage.removeItem(key);
    }
  }catch{}
}

setTimeout(()=>{
  const loading=document.querySelector('.loading');
  if(!loading)return;
  const alreadyRecovered=sessionStorage.getItem(RECOVERY_KEY)==='1';
  if(!alreadyRecovered){
    sessionStorage.setItem(RECOVERY_KEY,'1');
    clearLocalAuthSession();
    const url=new URL(location.href);
    url.searchParams.set('freshLogin',Date.now().toString());
    location.replace(url.toString());
    return;
  }
  loading.innerHTML='<div style="text-align:center;padding:24px"><strong style="display:block;margin-bottom:12px">Lancers Chapel needs a fresh sign-in.</strong><button id="fresh-login-button" style="border:0;border-radius:10px;background:#f47a22;color:#080808;font-weight:900;padding:12px 18px">Go to Sign In</button></div>';
  document.getElementById('fresh-login-button')?.addEventListener('click',()=>{
    clearLocalAuthSession();
    sessionStorage.removeItem(RECOVERY_KEY);
    location.replace('/?freshLogin='+Date.now());
  });
},4500);

window.addEventListener('pageshow',()=>{
  if(!document.querySelector('.loading')) sessionStorage.removeItem(RECOVERY_KEY);
});
