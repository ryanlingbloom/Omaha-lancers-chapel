import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jpfnhwolttfisawfthbf.supabase.co',
  'sb_publishable_vsHZotBHUEePBvunVgTWWQ_fIImlhYY',
  { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'lancers-chapel-session' } }
);

let syncing = false;
let activeComposer = null;

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function ensureStyles() {
  if (document.getElementById('team-chat-reply-styles')) return;
  const style = document.createElement('style');
  style.id = 'team-chat-reply-styles';
  style.textContent = `
    .chat-reply-preview{margin:0 0 8px;padding:8px 10px;border-left:3px solid #f47a22;background:rgba(244,122,34,.08);border-radius:8px;color:#bdbdbd;font-size:12px;line-height:1.35}
    .chat-reply-preview strong{display:block;color:#f3f3f3;font-size:11px;margin-bottom:2px}
    .chat-reply-action{appearance:none;border:0;background:transparent;color:#a9a9a9;font:inherit;font-size:12px;font-weight:800;padding:4px 6px;margin:4px 0 0;cursor:pointer}
    .chat-reply-action:hover,.chat-reply-action:focus{color:#f47a22}
    .chat-reply-composer{margin-top:8px;padding:10px;background:#101010;border:1px solid #323232;border-radius:12px}
    .chat-replying-to{font-size:11px;color:#9b9b9b;margin:0 0 7px}.chat-replying-to strong{color:#fff}
    .chat-reply-composer textarea{box-sizing:border-box;width:100%;min-height:62px;resize:vertical;background:#080808;color:#fff;border:1px solid #3b3b3b;border-radius:10px;padding:10px;font:inherit;font-size:14px;outline:none}
    .chat-reply-composer textarea:focus{border-color:#f47a22}
    .chat-reply-buttons{display:flex;justify-content:flex-end;gap:8px;margin-top:8px}
    .chat-reply-buttons button{border:0;border-radius:9px;padding:8px 11px;font:inherit;font-size:12px;font-weight:900;cursor:pointer}
    .chat-reply-cancel{background:#292929;color:#ddd}.chat-reply-send{background:#f47a22;color:#080808}.chat-reply-send:disabled{opacity:.55}
    .chat-reply-error{color:#ff7b7b;font-size:11px;margin:6px 0 0}
  `;
  document.head.appendChild(style);
}

function closeComposer() {
  if (activeComposer) activeComposer.remove();
  activeComposer = null;
}

async function openComposer(node, row) {
  closeComposer();
  const composer = document.createElement('div');
  composer.className = 'chat-reply-composer';
  composer.innerHTML = `
    <p class="chat-replying-to">Replying to <strong>${escapeHtml(row.sender_name || 'teammate')}</strong></p>
    <textarea maxlength="1200" placeholder="Write a reply…" aria-label="Reply"></textarea>
    <div class="chat-reply-buttons">
      <button type="button" class="chat-reply-cancel">Cancel</button>
      <button type="button" class="chat-reply-send">Send reply</button>
    </div>
    <p class="chat-reply-error" hidden></p>
  `;
  node.appendChild(composer);
  activeComposer = composer;

  const textarea = composer.querySelector('textarea');
  const send = composer.querySelector('.chat-reply-send');
  const errorBox = composer.querySelector('.chat-reply-error');
  composer.querySelector('.chat-reply-cancel').onclick = closeComposer;

  async function submit() {
    const body = textarea.value.trim();
    if (!body) return textarea.focus();
    send.disabled = true;
    errorBox.hidden = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error('Please sign in again to reply.');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('display_name,jersey_number')
        .eq('id', session.user.id)
        .maybeSingle();
      if (profileError) throw profileError;

      const { error } = await supabase.from('messages').insert({
        user_id: session.user.id,
        body,
        sender_name: profile?.display_name || session.user.email?.split('@')[0] || 'Player',
        sender_jersey: profile?.jersey_number || null,
        reply_to: row.id
      });
      if (error) throw error;

      closeComposer();
      setTimeout(syncReplies, 250);
    } catch (error) {
      errorBox.textContent = error?.message || 'Could not send reply.';
      errorBox.hidden = false;
      send.disabled = false;
    }
  }

  send.onclick = submit;
  textarea.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  });
  textarea.focus();
}

async function syncReplies() {
  if (syncing) return;
  const list = document.querySelector('.chat-panel .message-list');
  if (!list) return;
  const nodes = [...list.querySelectorAll(':scope > .message')];
  if (!nodes.length) return;

  syncing = true;
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id,body,sender_name,sender_jersey,reply_to,created_at')
      .order('created_at', { ascending: true })
      .limit(150);
    if (error || !data) return;

    const byId = new Map(data.map(row => [String(row.id), row]));
    nodes.forEach((node, index) => {
      const row = data[index];
      if (!row) return;
      node.dataset.messageId = row.id;

      let preview = node.querySelector(':scope > .chat-reply-preview');
      if (row.reply_to) {
        const parent = byId.get(String(row.reply_to));
        if (parent) {
          if (!preview) {
            preview = document.createElement('div');
            preview.className = 'chat-reply-preview';
            node.prepend(preview);
          }
          const excerpt = parent.body?.length > 120 ? `${parent.body.slice(0, 117)}…` : (parent.body || 'Message');
          preview.innerHTML = `<strong>↩ ${escapeHtml(parent.sender_name || 'teammate')}</strong>${escapeHtml(excerpt)}`;
        }
      } else if (preview) {
        preview.remove();
      }

      let replyButton = node.querySelector(':scope > .chat-reply-action');
      if (!replyButton) {
        replyButton = document.createElement('button');
        replyButton.type = 'button';
        replyButton.className = 'chat-reply-action';
        replyButton.textContent = '↩ Reply';
        node.appendChild(replyButton);
      }
      replyButton.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        openComposer(node, row);
      };
    });
  } finally {
    syncing = false;
  }
}

ensureStyles();
window.addEventListener('load', () => setTimeout(syncReplies, 900));
new MutationObserver(() => setTimeout(syncReplies, 120)).observe(document.documentElement, { childList: true, subtree: true });
setInterval(syncReplies, 2500);
