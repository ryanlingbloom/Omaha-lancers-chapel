function fixDailyCircleLabels(){
  const box=document.getElementById('daily-three');
  if(!box)return;
  for(const wrap of box.querySelectorAll('.daily-ring-wrap')){
    const btn=wrap.querySelector('.daily-ring');
    const label=wrap.querySelector('strong');
    const hint=wrap.querySelector('small');
    if(!btn||!label)return;
    const key=btn.dataset.action;
    if(key==='checkin'){
      label.textContent='Checked In';
      if(hint)hint.textContent='Daily check-in';
    }else if(key==='read_bible'){
      label.textContent='Read Bible/Devotion';
      if(hint)hint.textContent='Today’s devotion';
    }else if(key==='encouraged_teammate'){
      label.textContent='Encouraged a Teammate';
      if(hint)hint.textContent='Today';
    }
  }
}
new MutationObserver(fixDailyCircleLabels).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('load',fixDailyCircleLabels);
setInterval(fixDailyCircleLabels,1000);
