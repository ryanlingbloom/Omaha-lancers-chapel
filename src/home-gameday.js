const GAME_DATES=new Set(['2026-09-04','2026-09-05','2026-09-06','2026-09-10','2026-09-11','2026-09-19','2026-09-20','2026-09-25','2026-09-26','2026-10-02','2026-10-10','2026-10-16','2026-10-17','2026-10-23','2026-10-24','2026-10-30','2026-10-31']);
const chicagoDay=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function enhance(){
  for(const btn of document.querySelectorAll('.bottom-nav button')){
    const text=(btn.textContent||'').trim();
    if(text.includes('Scripture')){
      for(const n of [...btn.childNodes]) if(n.nodeType===Node.TEXT_NODE&&n.textContent.includes('Scripture')) n.textContent=n.textContent.replace('Scripture','Home');
    }
  }
  const card=document.querySelector('.word-card');
  if(!card)return;
  const gameDay=GAME_DATES.has(chicagoDay());
  const meta=card.querySelector('.word-meta span:first-child');
  if(meta)meta.textContent=gameDay?'GAMEDAY WORD':"TODAY'S WORD";
  const devotion=card.querySelector('.devotion');
  if(gameDay&&devotion&&!devotion.querySelector('.gameday-focus')){
    const focus=document.createElement('div');
    focus.className='gameday-focus';
    focus.innerHTML='<strong>GAME DAY FOCUS</strong><p>Compete free today. Your identity is bigger than the scoreboard. Play hard, stay present, serve the guy next to you, and trust God with the result.</p>';
    devotion.insertBefore(focus,devotion.firstChild);
  }
  if(!gameDay)devotion?.querySelector('.gameday-focus')?.remove();
}
const style=document.createElement('style');style.textContent='.gameday-focus{margin:0 0 16px;padding:13px 14px;border:1px solid rgba(244,122,34,.45);border-radius:12px;background:rgba(244,122,34,.08)}.gameday-focus strong{display:block;color:#f47a22;font-size:11px;letter-spacing:.9px;margin-bottom:6px}.gameday-focus p{margin:0!important;color:#eee!important;line-height:1.5}';document.head.appendChild(style);
new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});enhance();