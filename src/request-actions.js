import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jpfnhwolttfisawfthbf.supabase.co',
  'sb_publishable_vsHZotBHUEePBvunVgTWWQ_fIImlhYY',
  { auth: { persistSession: true, storageKey: 'lancers-chapel-session' } }
);

let syncing = false;

async function getAdminSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
  if (profile?.role !== 'admin') return null;
  return session;
}

function addStyles() {
  if (document.getElementById('request-action-styles')) return;
  const style = document.createElement('style');
  style.id = 'request-action-styles';
  style.textContent = `
    .request-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center}
    .request-actions button{border:0;border-radius:9px;padding:9px 13px;font-weight:800;cursor:pointer}
    .request-reply{background:#f47a22;color:#080808}
    .request-delete{background:#8d2525;color:#fff}
    .request-self-note{font-size:12px;color:#aaa;padding:8px 0}
    .request-reply-box{margin-top:10px;display:grid;gap:8px}
    .request-reply-box textarea{width:100%;min-height:82px;resize:vertical;background:#101010;color:#fff;border:1px solid #444;border-radius:10px;padding:10px;font:inherit;box-sizing:border-box}
    .request-reply-box .reply-controls{display:flex;gap:8px}
    .request-reply-box .send-request-reply{background:#f47a22;color:#080808}
    .request-reply-box .cancel-request-reply{background:#333;color:#fff}
    .request-action-status{font-size:12px;color:#aaa;margin-top:6px}
  `;
  document.head.appendChild(style);
}

async function sendReply(session, request, article) {
  let box = article.querySelector('.request-reply-box');
  if (box) { box.remove(); return; }
  box = document.createElement('div');
  box.className = 'request-reply-box';
  box.innerHTML = `<textarea placeholder="Reply privately…"></textarea><div class="reply-controls"><button class="send-request-reply">Send Reply</button><button class="cancel-request-reply">Cancel</button></div><div class="request-action-status"></div>`;
  article.appendChild(box);
  const textarea = box.querySelector('textarea');
  textarea.focus();
  box.querySelector('.cancel-request-reply').onclick = () => box.remove();
  box.querySelector('.send-request-reply').onclick = async () => {
    const text = textarea.value.trim();
    if (!text) return;
    const send = box.querySelector('.send-request-reply');
    const status = box.querySelector('.request-action-status');
    send.disabled = true;
    send.textContent = 'Sending…';
    const { error } = await supabase.from('direct_messages').insert({
      sender_id: session.user.id,
      recipient_id: request.user_id,
      body: text
    });
    if (error) {
      status.textContent = error.message;
      send.disabled = false;
      send.textContent = 'Send Reply';
      return;
    }
    status.textContent = 'Reply sent privately in Chat → Messages.';
    textarea.value = '';
    setTimeout(() => box.remove(), 900);
  };
}

async function deleteRequest(request, article) {
  if (!confirm('Delete this request? This cannot be undone.')) return;
  const { error } = await supabase.from('private_requests').delete().eq('id', request.id);
  if (error) { alert(error.message); return; }
  article.remove();
}

async function syncRequestActions() {
  if (syncing) return;
  const list = document.querySelector('.admin-live .inbox-list');
  if (!list) return;
  syncing = true;
  try {
    const session = await getAdminSession();
    if (!session) return;
    addStyles();
    const { data: requests, error } = await supabase.from('private_requests').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) return;
    const articles = [...list.querySelectorAll(':scope > article')];
    articles.forEach((article, index) => {
      const request = (requests || [])[index];
      if (!request || article.querySelector('.request-actions')) return;
      const actions = document.createElement('div');
      actions.className = 'request-actions';
      const isSelfTest = request.user_id === session.user.id;
      actions.innerHTML = isSelfTest
        ? `<span class="request-self-note">Test request — you can’t reply to yourself.</span><button class="request-delete">Delete</button>`
        : `<button class="request-reply">Reply</button><button class="request-delete">Delete</button>`;
      article.appendChild(actions);
      if (!isSelfTest) actions.querySelector('.request-reply').onclick = () => sendReply(session, request, article);
      actions.querySelector('.request-delete').onclick = () => deleteRequest(request, article);
    });
  } finally {
    syncing = false;
  }
}

const observer = new MutationObserver(() => setTimeout(syncRequestActions, 50));
observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('load', syncRequestActions);
setInterval(syncRequestActions, 1000);
