import { createClient } from '@supabase/supabase-js';
const supabase=createClient('https://jpfnhwolttfisawfthbf.supabase.co','sb_publishable_vsHZotBHUEePBvunVgTWWQ_fIImlhYY',{auth:{persistSession:true,autoRefreshToken:true,storageKey:'lancers-chapel-session'}});
function cleanup(){document.querySelectorAll('.checkin-achievements,.home-milestones').forEach(el=>el.remove())}
cleanup();window.addEventListener('load',cleanup);setTimeout(cleanup,600);setTimeout(cleanup,1600);supabase.auth.onAuthStateChange(()=>setTimeout(cleanup,300));
