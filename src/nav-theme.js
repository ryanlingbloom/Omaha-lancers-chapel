function addStyles(){if(document.getElementById('lancers-nav-theme-css'))return;const s=document.createElement('style');s.id='lancers-nav-theme-css';s.textContent=`
.app-shell{padding-bottom:118px!important}
.bottom-nav.five{min-height:98px!important;padding:10px 6px calc(10px + env(safe-area-inset-bottom))!important;grid-template-columns:repeat(5,1fr)!important;background:#080808!important;border-top:1px solid #343434!important}
.bottom-nav.five button{min-height:70px!important;padding:8px 2px!important;font-size:11px!important;font-weight:900!important;gap:5px!important;line-height:1.05!important;border-radius:12px!important;touch-action:manipulation!important}
.bottom-nav.five button>span:first-child{font-size:27px!important;line-height:1!important;min-height:30px!important;display:grid!important;place-items:center!important}
.bottom-nav.five button.active{color:#f47a22!important;background:#20140c!important}
.bottom-nav.five button.active>span:first-child{transform:scale(1.08)}
.composer{bottom:calc(98px + env(safe-area-inset-bottom))!important}
`;document.head.appendChild(s)}
function retheme(){addStyles();const nav=document.querySelector('.bottom-nav.five');if(!nav)return;for(const b of nav.querySelectorAll('button')){const text=(b.textContent||'').trim().toLowerCase();const icon=b.querySelector(':scope > span:first-child');if(!icon)continue;if(text.includes('scripture')||text.includes('home')){icon.textContent='🏠';for(const n of [...b.childNodes])if(n.nodeType===3&&/scripture|home/i.test(n.textContent||''))n.textContent='Home'}else if(text.includes('chapel')){icon.textContent='✝️'}else if(text.includes('chat')){icon.textContent='💬'}else if(text.includes('games')){icon.textContent='🏒'}else if(text.includes('admin')){icon.textContent='⚙️'}else if(text.includes('pastor ryan')){icon.textContent='🙏'}}}
window.addEventListener('load',()=>{retheme();setTimeout(retheme,300)});setInterval(retheme,2500);