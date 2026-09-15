function syncStreakCounters(){
  const box=document.getElementById('daily-three');
  if(!box)return;
  const rings=[...box.querySelectorAll('.ring-streak')];
  if(rings.length<3)return;
  const match=(rings[0].textContent||'').match(/\d+/);
  if(!match)return;
  const days=Number(match[0]);
  const label=`🔥 ${days} day${days===1?'':'s'}`;
  rings.forEach(r=>{if(r.textContent!==label)r.textContent=label});
}
window.addEventListener('load',syncStreakCounters);
document.addEventListener('click',()=>setTimeout(syncStreakCounters,120),true);
new MutationObserver(syncStreakCounters).observe(document.documentElement,{childList:true,subtree:true});
setInterval(syncStreakCounters,1000);
