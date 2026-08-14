import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './styles.css';

const SUPABASE_URL = 'https://jpfnhwolttfisawfthbf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vsHZotBHUEePBvunVgTWWQ_fIImlhYY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'lancers-chapel-session' }
});
const LOGO = '/lancers-logo.png';
const DEFAULT_DEVOTION = {
  reference: 'JOSHUA 1:9',
  verse: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
  title: 'Steady in the moment',
  body: 'Pressure does not mean God has left the room. Courage is trusting His presence in the moment.',
  question: 'Where do you need to compete from trust instead of fear?'
};

const games = [
  ['SEP','4','FRI · 6:00 PM','at Sioux City Musketeers','Sioux City, IA','PRESEASON','2026-09-04T18:00:00-05:00','2026-09-04-sioux-city',false],
  ['SEP','5','SAT · 6:05 PM','vs Sioux City Musketeers','Liberty First Credit Union Arena','PRESEASON','2026-09-05T18:05:00-05:00','2026-09-05-sioux-city',true],
  ['SEP','6','SUN · 5:05 PM','vs Des Moines Buccaneers','Liberty First Credit Union Arena','PRESEASON','2026-09-06T17:05:00-05:00','2026-09-06-des-moines',true],
  ['SEP','10','THU · 6:05 PM','vs Lincoln Stars','Liberty First Credit Union Arena','PRESEASON','2026-09-10T18:05:00-05:00','2026-09-10-lincoln',true],
  ['SEP','11','FRI · 6:05 PM','at Lincoln Stars','Lincoln, NE','PRESEASON','2026-09-11T18:05:00-05:00','2026-09-11-lincoln',false],
  ['SEP','19','SAT · 7:00 PM','at Chicago Steel','USHL Fall Classic · Chicago','','2026-09-19T19:00:00-05:00','2026-09-19-chicago',false],
  ['SEP','20','SUN · 3:30 PM','at Madison Capitols','USHL Fall Classic · Chicago','','2026-09-20T15:30:00-05:00','2026-09-20-madison',false],
  ['SEP','25','FRI · 7:05 PM','vs Des Moines Buccaneers','Liberty First Credit Union Arena','','2026-09-25T19:05:00-05:00','2026-09-25-des-moines',true],
  ['SEP','26','SAT · 6:05 PM','vs Des Moines Buccaneers','Liberty First Credit Union Arena','','2026-09-26T18:05:00-05:00','2026-09-26-des-moines',true],
  ['OCT','2','FRI · 7:05 PM','at Des Moines Buccaneers','Des Moines, IA','','2026-10-02T19:05:00-05:00','2026-10-02-des-moines',false],
  ['OCT','10','SAT · 7:05 PM','at Cedar Rapids RoughRiders','Cedar Rapids, IA','','2026-10-10T19:05:00-05:00','2026-10-10-cedar-rapids',false],
  ['OCT','16','FRI · 7:05 PM','at Tri-City Storm','Kearney, NE','','2026-10-16T19:05:00-05:00','2026-10-16-tri-city',false],
  ['OCT','17','SAT · 6:05 PM','vs Tri-City Storm','Liberty First Credit Union Arena','','2026-10-17T18:05:00-05:00','2026-10-17-tri-city',true],
  ['OCT','23','FRI · 7:05 PM','at Sioux Falls Stampede','Sioux Falls, SD','','2026-10-23T19:05:00-05:00','2026-10-23-sioux-falls',false],
  ['OCT','24','SAT · 6:05 PM','vs Tri-City Storm','Liberty First Credit Union Arena','','2026-10-24T18:05:00-05:00','2026-10-24-tri-city',true],
  ['OCT','30','FRI · 7:05 PM','at Lincoln Stars','Lincoln, NE','','2026-10-30T19:05:00-05:00','2026-10-30-lincoln',false],
  ['OCT','31','SAT · 7:30 PM','vs Lincoln Stars','Liberty First Credit Union Arena','','2026-10-31T19:30:00-05:00','2026-10-31-lincoln',true]
].map(([month,day,time,opponent,location,note,iso,key,home]) => ({month,day,time,opponent,location,note,iso,key,home}));

function chicagoDay(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}
function chicagoClock(date = new Date()) {
  return new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit'}).format(date);
}
function chicagoLong(date = new Date()) {
  return new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',weekday:'long',month:'long',day:'numeric'}).format(date);
}
function eventText(iso) {
  return new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(iso));
}
function base64ToUint8Array(value) {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g,'+').replace(/_/g,'/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}
function initials(name='Player') { return name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase(); }
function formatTime(iso) { return new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit'}).format(new Date(iso)); }
function toLocalInput(iso){if(!iso)return'';const d=new Date(iso);const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d);const map=Object.fromEntries(parts.map(p=>[p.type,p.value]));return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;}
function chicagoInputToIso(value){
  if(!value) return null;
  const [date,time] = value.split('T');
  const [y,m,d] = date.split('-').map(Number); const [hh,mm] = time.split(':').map(Number);
  let guess = Date.UTC(y,m-1,d,hh,mm);
  for(let i=0;i<3;i++){
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(guess));
    const map=Object.fromEntries(parts.map(p=>[p.type,p.value]));
    const seen=Date.UTC(+map.year,+map.month-1,+map.day,+map.hour,+map.minute);
    guess += Date.UTC(y,m-1,d,hh,mm)-seen;
  }
  return new Date(guess).toISOString();
}

function Gate({ onReady }) {
  const [form,setForm] = useState({first:'',last:'',jersey:'',code:''});
  const [busy,setBusy] = useState(false); const [error,setError] = useState('');
  async function submit(e){
    e.preventDefault(); setBusy(true); setError('');
    try {
      const {data,error:fnError} = await supabase.functions.invoke('team-entry',{body:{firstName:form.first.trim(),lastName:form.last.trim(),jerseyNumber:form.last.trim().toLowerCase()==='lingbloom'?'100':form.jersey.trim(),teamCode:form.code.trim()}});
      if(fnError) throw fnError;
      if(!data?.email || !data?.password) throw new Error(data?.error || 'Could not sign in. Check your information.');
      const {error:authError}=await supabase.auth.signInWithPassword({email:data.email,password:data.password});
      if(authError) throw authError;
      onReady();
    } catch(err){ setError(err.message || 'Could not sign in.'); }
    finally { setBusy(false); }
  }
  return <main className="gate">
    <img src={LOGO} alt="Omaha Lancers"/><span>OMAHA LANCERS</span><h1>Chapel</h1>
    <p>Scripture. Team connection. A place to check in and stay connected with Pastor Ryan.</p>
    <form onSubmit={submit}>
      <div className="name-row"><input required placeholder="First name" value={form.first} onChange={e=>setForm({...form,first:e.target.value})}/><input required placeholder="Last name" value={form.last} onChange={e=>setForm({...form,last:e.target.value})}/></div>
      <input required placeholder="Jersey number" inputMode="numeric" value={form.jersey} onChange={e=>setForm({...form,jersey:e.target.value})}/>
      <input required placeholder="Team code" value={form.code} onChange={e=>setForm({...form,code:e.target.value})}/>
      <button disabled={busy}>{busy?'Signing in…':'Enter Lancers Chapel'}</button>
    </form>
    {error && <div className="gate-notice">{error}</div>}
    <small>For Omaha Lancers players and staff.</small>
  </main>
}

function EnableNotifications({userId}) {
  const [status,setStatus]=useState('');
  const [enabled,setEnabled]=useState(false);
  useEffect(()=>{ if(!('Notification' in window)) return; setEnabled(Notification.permission==='granted'); },[]);
  async function enable(){
    setStatus('');
    try {
      if(!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('Push notifications are not supported in this browser.');
      await navigator.serviceWorker.register('/sw.js');
      const ready = await navigator.serviceWorker.ready;
      let permission = Notification.permission;
      if(permission!=='granted') permission = await Notification.requestPermission();
      if(permission!=='granted') throw new Error('Notifications were not allowed. You can enable them later in your phone settings.');
      const {data:settings,error:sErr}=await supabase.from('app_settings').select('vapid_public_key').eq('id',1).single();
      if(sErr) throw sErr;
      let subscription = await ready.pushManager.getSubscription();
      if(!subscription) subscription = await ready.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:base64ToUint8Array(settings.vapid_public_key)});
      const json = subscription.toJSON();
      const {error}=await supabase.from('push_subscriptions').upsert({user_id:userId,endpoint:json.endpoint,p256dh:json.keys?.p256dh,auth:json.keys?.auth,updated_at:new Date().toISOString()},{onConflict:'endpoint'});
      if(error) throw error;
      setEnabled(true); setStatus('Notifications are on.');
    } catch(err){
      const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      setStatus(ios ? `${err.message} On iPhone, add Lancers Chapel to your Home Screen, open it there, then enable notifications.` : err.message);
    }
  }
  return <div className="notify-card"><div><strong>{enabled?'🔔 Notifications on':'🔔 Turn on notifications'}</strong><span>Get private messages from Pastor Ryan, chapel updates, and check-in reminders.</span></div>{!enabled&&<button onClick={enable}>Enable</button>}{status&&<small>{status}</small>}</div>
}

function Home({user,devotion,event,checkins,onRefresh}) {
  const [now,setNow]=useState(new Date()); const [saving,setSaving]=useState(false); const [notice,setNotice]=useState('');
  useEffect(()=>{const i=setInterval(()=>setNow(new Date()),30000); return()=>clearInterval(i)},[]);
  const today=chicagoDay(now);
  const checkedToday=checkins.some(c=>c.checkin_day===today || chicagoDay(new Date(c.created_at))===today);
  const streak=useMemo(()=>{
    const days=[...new Set(checkins.map(c=>c.checkin_day||chicagoDay(new Date(c.created_at))))].sort().reverse();
    let count=0; let cursor=new Date(`${today}T12:00:00`);
    if(!days.includes(today)) cursor.setDate(cursor.getDate()-1);
    for(const day of days){ if(day===chicagoDay(cursor)){count++;cursor.setDate(cursor.getDate()-1);} else if(day<chicagoDay(cursor)) break; }
    return count;
  },[checkins,today]);
  async function checkin(mood){
    if(checkedToday||saving) return; setSaving(true); setNotice('');
    const {error}=await supabase.from('checkins').insert({user_id:user.id,mood});
    if(error && error.code!=='23505') setNotice(error.message); else { setNotice(error?.code==='23505'?'Already checked in today.':'Check-in saved.'); localStorage.setItem('lancers-checkin',today); await onRefresh(); }
    setSaving(false);
  }
  const d=devotion||DEFAULT_DEVOTION;
  return <>
    <section className="welcome"><img src={LOGO} alt="Lancers"/><div className="home-clock"><strong>{chicagoClock(now)}</strong><p>{chicagoLong(now)}</p></div><h1>Ready for today.</h1><span>{user.display_name}</span></section>
    <article className="word-card"><div className="word-meta"><span>TODAY'S WORD</span><span>{d.reference}</span></div><p className="verse">“{d.verse}”</p><p className="reference">{d.reference}</p><div className="devotion"><h2>{d.title}</h2><p>{d.body}</p><strong>Think about it:</strong><p>{d.question}</p></div></article>
    {event && <article className="next-card"><div className="date-block"><strong>{new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',day:'numeric'}).format(new Date(event.starts_at))}</strong><span>CHAPEL</span></div><div><span className="eyebrow">NEXT CHAPEL</span><h3>{event.title}</h3><p>{eventText(event.starts_at)} · {event.location}</p></div></article>}
    <article className="streak-card"><div className="streak-flame">🔥</div><div><span className="eyebrow">CURRENT STREAK</span><h2>{streak} day{streak===1?'':'s'}</h2><p>Your history stays saved. A new daily check-in opens at midnight Central Time.</p></div></article>
    <section className={`checkin ${checkedToday?'done':''}`}><span className="eyebrow">DAILY CHECK-IN</span><h2>{checkedToday?'You’re checked in for today ✓':'How are you doing today?'}</h2><p>{checkedToday?'Come back after midnight Central Time for tomorrow’s check-in.':'Pick the answer that fits best.'}</p>{!checkedToday&&<div className="moods"><button onClick={()=>checkin('Good')} disabled={saving}><span>●</span>Good</button><button onClick={()=>checkin('Okay')} disabled={saving}><span>●</span>Okay</button><button onClick={()=>checkin('Talk')} disabled={saving}><span>●</span>Need to talk</button></div>}{notice&&<p className="saved">{notice}</p>}</section>
    <EnableNotifications userId={user.id}/>
  </>
}

function Chapel({user,event,onRefresh}) {
  const [attending,setAttending]=useState(null); const [busy,setBusy]=useState(false);
  async function loadRsvp(){if(!event)return; const {data}=await supabase.from('rsvps').select('user_id,attending').eq('event_id',event.id); const mine=(data||[]).find(x=>x.user_id===user.id); setAttending(mine?.attending??null);}
  useEffect(()=>{loadRsvp()},[event?.id,user.id]);
  async function rsvp(value){ if(!event)return; setBusy(true); const {error}=await supabase.from('rsvps').upsert({event_id:event.id,user_id:user.id,attending:value},{onConflict:'event_id,user_id'}); if(!error){setAttending(value);await onRefresh();} setBusy(false); }
  return <section className="page-section"><div className="page-heading"><div><span className="eyebrow">TEAM CHAPEL</span><h1>Chapel</h1></div></div>{event?<article className="feature-event"><span>UPCOMING</span><h2>{event.title}</h2><p>{event.description||'A time to connect, open Scripture, and be together.'}</p><div><strong>{eventText(event.starts_at)}</strong><span>{event.location}</span><span>{event.food}</span></div><div className="rsvp-buttons"><button className={attending===true?'attending':''} onClick={()=>rsvp(true)} disabled={busy}>✓ I’m coming</button><button className={attending===false?'declining':''} onClick={()=>rsvp(false)} disabled={busy}>Can’t make it</button></div></article>:<div className="empty-card">No chapel is scheduled yet.</div>}</section>
}

function TeamChat({user,isAdmin}) {
  const [messages,setMessages]=useState([]),[likes,setLikes]=useState([]),[body,setBody]=useState(''),[uploading,setUploading]=useState(false);
  async function load(){
    const [{data:m},{data:l}]=await Promise.all([supabase.from('messages').select('*').order('created_at',{ascending:true}).limit(150),supabase.from('message_likes').select('*')]);
    setMessages(m||[]); setLikes(l||[]); localStorage.setItem('lancers-chat-seen',new Date().toISOString());
  }
  useEffect(()=>{load(); const channel=supabase.channel('team-chat-live').on('postgres_changes',{event:'*',schema:'public',table:'messages'},load).on('postgres_changes',{event:'*',schema:'public',table:'message_likes'},load).subscribe(); return()=>supabase.removeChannel(channel)},[]);
  async function send(image_path=null){ const text=body.trim(); if(!text&&!image_path)return; const {error}=await supabase.from('messages').insert({user_id:user.id,body:text,image_path,sender_name:user.display_name,sender_jersey:user.jersey_number||null}); if(!error){setBody('');await load();} }
  async function upload(file){ if(!file)return; if(file.size>10*1024*1024){alert('Image must be under 10 MB.');return;} setUploading(true); const ext=(file.name.split('.').pop()||'jpg').toLowerCase(); const path=`${user.id}/${Date.now()}.${ext}`; const {error}=await supabase.storage.from('chapel-chat').upload(path,file,{upsert:false}); if(!error)await send(path); else alert(error.message); setUploading(false); }
  async function toggleLike(messageId){ const mine=likes.find(l=>l.message_id===messageId&&l.user_id===user.id); if(mine) await supabase.from('message_likes').delete().eq('message_id',messageId).eq('user_id',user.id); else await supabase.from('message_likes').insert({message_id:messageId,user_id:user.id}); await load(); }
  async function del(m){ if(!isAdmin||!confirm('Delete this message?'))return; if(m.image_path) await supabase.storage.from('chapel-chat').remove([m.image_path]); await supabase.from('messages').delete().eq('id',m.id); await load(); }
  function imageUrl(path){ return supabase.storage.from('chapel-chat').getPublicUrl(path).data.publicUrl; }
  return <div className="chat-panel"><div className="pinned"><strong>TEAM CHAT</strong><span>Team conversation. Likes are limited to one per person.</span></div><div className="message-list">{messages.map(m=>{const mine=m.user_id===user.id;const count=likes.filter(l=>l.message_id===m.id).length;const liked=likes.some(l=>l.message_id===m.id&&l.user_id===user.id);return <div className={`message ${mine?'own':''}`} key={m.id}><div className="message-avatar">{initials(m.sender_name)}</div><div><p><b>{m.sender_name||'Player'}</b>{m.sender_jersey&&` #${m.sender_jersey}`}<time>{formatTime(m.created_at)}</time></p>{m.body&&<span>{m.body}</span>}{m.image_path&&<img className="chat-photo" src={imageUrl(m.image_path)} alt="Chat upload"/>}<div className="message-actions"><button className={`like-button ${liked?'liked':''}`} onClick={()=>toggleLike(m.id)}>♥ <span>{count||''}</span></button>{isAdmin&&<button className="delete-chat" onClick={()=>del(m)}>Delete</button>}</div></div></div>})}</div><div className="composer"><label className="photo-button">＋<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0])}/></label><input placeholder="Message the team…" value={body} onChange={e=>setBody(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send()}}/><button className="send" onClick={()=>send()}>{uploading?'…':'Send'}</button></div></div>
}

function DirectMessages({user,isAdmin,players,onUnread}) {
  const [pastorId,setPastorId]=useState(null),[all,setAll]=useState([]),[selected,setSelected]=useState(null),[body,setBody]=useState('');
  async function load(){ const {data:p}=await supabase.rpc('pastor_admin_id'); setPastorId(p); const {data,error}=await supabase.from('direct_messages').select('*').order('created_at',{ascending:true}).limit(300); if(!error){setAll(data||[]); const unread=(data||[]).filter(m=>m.recipient_id===user.id&&!m.read_at).length; onUnread?.(unread);} }
  useEffect(()=>{load(); const ch=supabase.channel('dm-live').on('postgres_changes',{event:'*',schema:'public',table:'direct_messages'},load).subscribe(); return()=>supabase.removeChannel(ch)},[user.id]);
  useEffect(()=>{if(!isAdmin&&pastorId)setSelected(pastorId)},[isAdmin,pastorId]);
  const partnerId=isAdmin?selected:pastorId;
  const thread=all.filter(m=>partnerId&&((m.sender_id===user.id&&m.recipient_id===partnerId)||(m.sender_id===partnerId&&m.recipient_id===user.id)));
  async function markRead(){ if(!partnerId)return; const ids=thread.filter(m=>m.recipient_id===user.id&&!m.read_at).map(m=>m.id); if(!ids.length)return; await supabase.from('direct_messages').update({read_at:new Date().toISOString()}).in('id',ids); }
  useEffect(()=>{markRead()},[partnerId,thread.length]);
  async function send(){const text=body.trim();if(!text||!partnerId)return; const {error}=await supabase.from('direct_messages').insert({sender_id:user.id,recipient_id:partnerId,body:text}); if(error) alert(error.message); else {setBody('');await load();}}
  const conversations=useMemo(()=>players.map(p=>{const msgs=all.filter(m=>(m.sender_id===user.id&&m.recipient_id===p.id)||(m.sender_id===p.id&&m.recipient_id===user.id));const last=msgs.at(-1);const unread=msgs.filter(m=>m.sender_id===p.id&&m.recipient_id===user.id&&!m.read_at).length;return{...p,last,unread}}).sort((a,b)=>(b.last?.created_at||'').localeCompare(a.last?.created_at||'')),[players,all,user.id]);
  if(isAdmin&&!selected) return <div className="dm-list"><div className="dm-intro"><strong>Private Messages</strong><span>Only Pastor Ryan and each individual player can see these messages.</span></div>{conversations.map(p=><button key={p.id} onClick={()=>setSelected(p.id)}><span className="message-avatar">{p.jersey_number||initials(p.display_name)}</span><div><strong>{p.display_name}</strong><small>{p.last?.body||'Start a private conversation'}</small></div>{p.unread>0&&<i>{p.unread}</i>}</button>)}</div>;
  const partnerName=isAdmin?(players.find(p=>p.id===selected)?.display_name||'Player'):'Pastor Ryan';
  return <div className="dm-thread-full"><header>{isAdmin&&<button onClick={()=>setSelected(null)}>← Players</button>}<div><span className="eyebrow">PRIVATE</span><h2>{partnerName}</h2></div></header><div className="dm-thread-scroll">{thread.length===0&&<p className="empty-rsvp">No private messages yet.</p>}{thread.map(m=><article key={m.id} className={m.sender_id===user.id?'mine':''}><strong>{m.sender_id===user.id?(isAdmin?'Pastor Ryan':'You'):(isAdmin?partnerName:'Pastor Ryan')}</strong><p>{m.body}</p><time>{formatTime(m.created_at)}</time></article>)}</div><div className="dm-compose"><textarea placeholder={isAdmin?`Message ${partnerName}…`:'Message Pastor Ryan…'} value={body} onChange={e=>setBody(e.target.value)}/><button onClick={send}>Send private message</button></div></div>
}

function Chat({user,isAdmin,players,initialMode='team',onUnread}) {
  const [mode,setMode]=useState(initialMode),[dmUnread,setDmUnread]=useState(0);
  useEffect(()=>setMode(initialMode),[initialMode]);
  useEffect(()=>onUnread?.(dmUnread),[dmUnread]);
  return <section className="page-section chat-page"><div className="chat-hero"><img src={LOGO} alt="Lancers"/><div><span className="eyebrow">LANCERS</span><h1>Chat</h1></div></div><div className="chat-tabs"><button className={mode==='team'?'active':''} onClick={()=>setMode('team')}>Team Chat</button><button className={mode==='messages'?'active':''} onClick={()=>setMode('messages')}>Messages {dmUnread>0&&<i>{dmUnread}</i>}</button></div>{mode==='team'?<TeamChat user={user} isAdmin={isAdmin}/>:<DirectMessages user={user} isAdmin={isAdmin} players={players} onUnread={setDmUnread}/>}</section>
}

function Games({user}) {
  const [rows,setRows]=useState([]),[page,setPage]=useState(0); const per=5;
  async function load(){const {data}=await supabase.from('game_prayer_rsvps').select('*');setRows(data||[])}
  useEffect(()=>{load()},[]);
  async function answer(game,status){const current=rows.find(r=>r.game_key===game.key&&r.user_id===user.id); if(current?.status===status) await supabase.from('game_prayer_rsvps').delete().eq('game_key',game.key).eq('user_id',user.id); else await supabase.from('game_prayer_rsvps').upsert({game_key:game.key,user_id:user.id,status,updated_at:new Date().toISOString()},{onConflict:'game_key,user_id'}); await load();}
  const slice=games.slice(page*per,page*per+per);
  return <section className="games-page"><div className="games-hero"><img src={LOGO} alt="Lancers"/><h1>Schedule</h1><p>Pregame prayer RSVP is available for home games.</p></div><div className="games-list">{slice.map(g=>{const mine=rows.find(r=>r.game_key===g.key&&r.user_id===user.id);return <article key={g.key}><div className="game-date"><span>{g.month}</span><strong>{g.day}</strong></div><div className="game-info">{g.note&&<b>{g.note}</b>}<h2>{g.opponent}</h2><p>{g.time} · {g.location}</p>{g.home&&<div className="game-prayer"><strong>🙏 Pregame Prayer</strong><span>Let Pastor Ryan know if you’re coming.</span><div className="prayer-rsvp-buttons"><button className={`accept ${mine?.status==='accept'?'selected':''}`} onClick={()=>answer(g,'accept')}>Accept</button><button className={`decline ${mine?.status==='decline'?'selected':''}`} onClick={()=>answer(g,'decline')}>Decline</button></div></div>}</div><span className={g.home?'home-badge':'away-badge'}>{g.home?'HOME':'AWAY'}</span></article>})}</div><div className="pager"><button disabled={page===0} onClick={()=>setPage(p=>p-1)}>← Previous</button><span>{page+1} / {Math.ceil(games.length/per)}</span><button disabled={(page+1)*per>=games.length} onClick={()=>setPage(p=>p+1)}>Next →</button></div></section>
}

function PastorPage({user}) {
  const [kind,setKind]=useState('Prayer request'),[body,setBody]=useState(''),[anonymous,setAnonymous]=useState(false),[sent,setSent]=useState(false);
  async function submit(){if(!body.trim())return; const {error}=await supabase.from('private_requests').insert({user_id:user.id,sender_name:user.display_name,kind,body:body.trim(),anonymous}); if(error)alert(error.message);else setSent(true)}
  if(sent)return <section className="private-page"><div className="private-hero"><span className="lock">PRIVATE</span><h1>Pastor Ryan</h1></div><div className="success-card"><span>✓</span><h2>Sent privately</h2><p>Pastor Ryan received your note.</p><button onClick={()=>{setSent(false);setBody('')}}>Send another</button></div></section>;
  return <section className="private-page"><div className="private-hero"><span className="lock">PRIVATE TO PASTOR RYAN</span><h1>Talk to Pastor Ryan</h1><p>Prayer request, question, or something you want to talk through. This does not post to team chat.</p></div><div className="request-form"><label>What do you need?</label><div className="choice-row">{['Prayer request','I need to talk','Ask a question'].map(x=><button key={x} className={kind===x?'active':''} onClick={()=>setKind(x)}>{x}</button>)}</div><label>Your message</label><textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Write your message…"/><label className="toggle"><input type="checkbox" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)}/>Send anonymously</label><button className="primary" onClick={submit}>Send to Pastor Ryan</button><p className="privacy-note">For an ongoing private conversation, use Chat → Messages.</p></div></section>
}

function Admin({players,event,devotion,onRefresh}) {
  const [view,setView]=useState('dashboard'); const [chapel,setChapel]=useState({title:event?.title||'',starts_at:event?toLocalInput(event.starts_at):'',location:event?.location||'',description:event?.description||'',food:event?.food||'Food provided'}); const [word,setWord]=useState({...DEFAULT_DEVOTION,...devotion}); const [requests,setRequests]=useState([]); const [today,setToday]=useState([]); const [notice,setNotice]=useState('');
  useEffect(()=>{setChapel({title:event?.title||'',starts_at:event?toLocalInput(event.starts_at):'',location:event?.location||'',description:event?.description||'',food:event?.food||'Food provided'});setWord({...DEFAULT_DEVOTION,...devotion})},[event?.id,devotion?.id]);
  useEffect(()=>{(async()=>{const [{data:r},{data:c}]=await Promise.all([supabase.from('private_requests').select('*').order('created_at',{ascending:false}).limit(100),supabase.from('checkins').select('*').eq('checkin_day',chicagoDay()).order('created_at',{ascending:false})]);setRequests(r||[]);setToday(c||[])})()},[view]);
  async function saveChapel(){setNotice(''); if(!chapel.title||!chapel.starts_at||!chapel.location){setNotice('Add a title, date/time, and location.');return;} const row={title:chapel.title,starts_at:chicagoInputToIso(chapel.starts_at),location:chapel.location,description:chapel.description,food:chapel.food}; const {error}=event?await supabase.from('chapel_events').update(row).eq('id',event.id):await supabase.from('chapel_events').insert(row);if(error)setNotice(error.message);else{setNotice('Chapel saved. Players will be notified.');await onRefresh();}}
  async function saveWord(){const row={devotion_date:chicagoDay(),reference:word.reference,verse:word.verse,title:word.title,body:word.body,question:word.question,published:true}; const {error}=devotion?.id?await supabase.from('devotions').update(row).eq('id',devotion.id):await supabase.from('devotions').insert(row); if(error)setNotice(error.message);else{setNotice('Today’s Word published.');await onRefresh();}}
  async function removePlayer(p){if(!confirm(`Remove ${p.display_name}?`))return; const {error}=await supabase.functions.invoke('admin-remove-player',{body:{userId:p.id}}); if(error)alert(error.message);else await onRefresh();}
  return <section className="admin-live"><div className="admin-top-lite"><span className="eyebrow">PASTOR RYAN · ADMIN</span><h1>Lancers Chapel Admin</h1><p>Private messages are managed in Chat → Messages.</p></div><div className="admin-tabs">{['dashboard','word','chapel','players','requests'].map(x=><button key={x} className={view===x?'active':''} onClick={()=>setView(x)}>{x}</button>)}</div>{notice&&<div className="toast-lite">{notice}</div>}
    {view==='dashboard'&&<div className="admin-content"><div className="stats"><article><span>PLAYERS</span><strong>{players.length}</strong><small>approved</small></article><article><span>CHECKED IN</span><strong>{today.length}</strong><small>today</small></article><article><span>PRIVATE NOTES</span><strong>{requests.filter(r=>!r.followed_up).length}</strong><small>open</small></article></div><div className="editor-card"><h3>Today’s check-ins</h3><div className="checkin-admin">{today.map(c=>{const p=players.find(x=>x.id===c.user_id);return <article key={c.id}><span className={`checkin-dot ${c.mood?.toLowerCase()==='okay'?'okay':c.mood?.toLowerCase()==='talk'?'talk':''}`}></span><div><strong>{p?.display_name||'Player'}</strong><small>{formatTime(c.created_at)}</small></div><b>{c.mood}</b></article>})}{today.length===0&&<p className="empty-rsvp">No player check-ins yet today.</p>}</div></div></div>}
    {view==='word'&&<div className="admin-content editor-wrap"><div className="editor-card"><h3>Today’s Word</h3>{['reference','verse','title','body','question'].map(k=><label key={k}>{k}<textarea className={k==='verse'||k==='body'?'large':''} value={word[k]||''} onChange={e=>setWord({...word,[k]:e.target.value})}/></label>)}<button className="publish" onClick={saveWord}>Publish Today’s Word</button></div></div>}
    {view==='chapel'&&<div className="admin-content editor-wrap"><div className="editor-card chapel-editor"><h3>Schedule Chapel</h3><label>Title<input value={chapel.title} onChange={e=>setChapel({...chapel,title:e.target.value})}/></label><label>Date & time<input type="datetime-local" value={chapel.starts_at} onChange={e=>setChapel({...chapel,starts_at:e.target.value})}/></label><label>Location<input value={chapel.location} onChange={e=>setChapel({...chapel,location:e.target.value})}/></label><label>Description<textarea value={chapel.description} onChange={e=>setChapel({...chapel,description:e.target.value})}/></label><label>Food<input value={chapel.food} onChange={e=>setChapel({...chapel,food:e.target.value})}/></label><button className="publish" onClick={saveChapel}>Save & notify players</button></div></div>}
    {view==='players'&&<div className="admin-content"><div className="player-roster">{players.map(p=><article key={p.id}><div><strong>#{p.jersey_number||'—'} · {p.display_name}</strong><small>{p.first_name} {p.last_name}</small></div><button onClick={()=>removePlayer(p)}>Remove</button></article>)}</div></div>}
    {view==='requests'&&<div className="admin-content"><div className="inbox-list">{requests.map(r=><article key={r.id}><div><header><strong>{r.anonymous?'Anonymous':r.sender_name}</strong><time>{eventText(r.created_at)}</time></header><b>{r.kind}</b><p>{r.body}</p></div></article>)}</div></div>}
  </section>
}

function App(){
  const [session,setSession]=useState(null),[user,setUser]=useState(null),[loading,setLoading]=useState(true),[tab,setTab]=useState('home'),[chatMode,setChatMode]=useState('team'),[devotion,setDevotion]=useState(null),[event,setEvent]=useState(null),[checkins,setCheckins]=useState([]),[players,setPlayers]=useState([]),[unread,setUnread]=useState(0);
  const isAdmin=user?.role==='admin';
  async function loadSession(){ const {data:{session:s}}=await supabase.auth.getSession(); setSession(s); if(!s){setUser(null);setLoading(false);return;} const {data:p,error}=await supabase.from('profiles').select('*').eq('id',s.user.id).single(); if(error||!p?.approved){await supabase.auth.signOut();setSession(null);setUser(null);setLoading(false);return;} setUser(p); await loadData(p); setLoading(false); }
  async function loadData(p=user){ if(!p)return; const day=chicagoDay(); const calls=[supabase.from('devotions').select('*').eq('published',true).lte('devotion_date',day).order('devotion_date',{ascending:false}).limit(1).maybeSingle(),supabase.from('chapel_events').select('*').gte('starts_at',new Date(Date.now()-2*3600000).toISOString()).order('starts_at',{ascending:true}).limit(1).maybeSingle(),supabase.from('checkins').select('*').eq('user_id',p.id).order('created_at',{ascending:false}).limit(120)]; if(p.role==='admin') calls.push(supabase.from('profiles').select('*').eq('role','player').eq('approved',true).order('jersey_number')); else calls.push(Promise.resolve({data:[]})); const [d,e,c,pl]=await Promise.all(calls); setDevotion(d.data||null);setEvent(e.data||null);setCheckins(c.data||[]);setPlayers(pl.data||[]); }
  useEffect(()=>{loadSession(); const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>setTimeout(loadSession,0)); return()=>subscription.unsubscribe()},[]);
  useEffect(()=>{ if(!user)return; const params=new URLSearchParams(location.search); const open=params.get('open'); if(open==='chat'){setTab('chat');setChatMode(params.get('tab')==='messages'?'messages':'team')} else if(open==='chapel')setTab('chapel'); else if(open==='home')setTab('home'); },[user?.id]);
  useEffect(()=>{ if(!user)return; const channel=supabase.channel('app-updates').on('postgres_changes',{event:'*',schema:'public',table:'chapel_events'},()=>loadData()).on('postgres_changes',{event:'*',schema:'public',table:'devotions'},()=>loadData()).subscribe(); return()=>supabase.removeChannel(channel)},[user?.id]);
  useEffect(()=>{let last=chicagoDay();const i=setInterval(()=>{const next=chicagoDay();if(next!==last){last=next;loadData();}},30000);return()=>clearInterval(i)},[user?.id]);
  if(loading)return <div className="loading">Loading Lancers Chapel…</div>;
  if(!session||!user)return <Gate onReady={loadSession}/>;
  async function signout(){await supabase.auth.signOut();setSession(null);setUser(null)}
  const nav=[['home','⌂','Scripture'],['chapel','✚','Chapel'],['chat','●','Chat'],['games','▣','Games'],[isAdmin?'admin':'pastor','◉',isAdmin?'Admin':'Pastor Ryan']];
  return <main className="app-shell"><header className="topbar"><button className="brand" onClick={()=>setTab('home')}><img src={LOGO} alt="Lancers"/><span><strong>LANCERS</strong><small>CHAPEL</small></span></button><div className="header-actions"><button className="avatar" title="Sign out" onClick={signout}>{initials(user.display_name)}<span className="status-dot"></span></button></div></header><div className="content">{tab==='home'&&<Home user={user} devotion={devotion} event={event} checkins={checkins} onRefresh={()=>loadData(user)}/>} {tab==='chapel'&&<Chapel user={user} event={event} onRefresh={()=>loadData(user)}/>} {tab==='chat'&&<Chat user={user} isAdmin={isAdmin} players={players} initialMode={chatMode} onUnread={setUnread}/>} {tab==='games'&&<Games user={user}/>} {tab==='pastor'&&!isAdmin&&<PastorPage user={user}/>} {tab==='admin'&&isAdmin&&<Admin players={players} event={event} devotion={devotion} onRefresh={()=>loadData(user)}/>}</div><nav className="bottom-nav five">{nav.map(([key,icon,label])=><button key={key} className={tab===key?'active':''} onClick={()=>{setTab(key);if(key==='chat')setChatMode('team')}}><span>{icon}</span>{label}{key==='chat'&&unread>0&&<i className="nav-badge">{unread}</i>}</button>)}</nav></main>
}

createRoot(document.getElementById('root')).render(<App/>);
