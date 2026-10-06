'use strict';
// Public content is readable by visitors. Only allowlisted Auth users can write.
window.VCBackend = (() => {
  let instance;
  const revisions = {};
  function configured() {
    const c = window.VC_CONFIG || {};
    try {
      if (c.anonKey && c.anonKey.split('.').length === 3 && JSON.parse(atob(c.anonKey.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role === 'service_role') return false;
    } catch (_) { /* A publishable key is not a JWT. */ }
    return /^https:\/\/[^/]+\.supabase\.co\/?$/.test(c.url || '') &&
      !!c.anonKey && !c.anonKey.includes('PASTE_') && !c.anonKey.startsWith('sb_secret_');
  }
  function client() {
    if (!configured()) throw new Error('Setup needed: edit supabase-config.js with the project URL and public key.');
    if (!window.supabase) throw new Error('Supabase library did not load. Refresh the page.');
    return instance || (instance = supabase.createClient(VC_CONFIG.url, VC_CONFIG.anonKey));
  }
  function check(error) { if (error) throw new Error(error.message || 'Supabase request failed.'); }
  async function load() {
    const { data, error } = await client().from('site_content').select('section,content,updated_at');
    check(error);
    const result = {};
    for (const row of data || []) { result[row.section] = row.content; revisions[row.section] = row.updated_at; }
    if (!Array.isArray(result.projects) || !Array.isArray(result.services) || !result.contact) {
      throw new Error('Content is missing. Run supabase-schema.sql in Supabase SQL Editor.');
    }
    for (const item of [...result.projects, ...result.services]) {
      if (!item || !/^[a-zA-Z0-9_-]+$/.test(item.id)) throw new Error('An item has an invalid ID. Check site_content in Supabase.');
    }
    return result;
  }
  async function requireAdmin() {
    const { data: userData, error: userError } = await client().auth.getUser();
    check(userError);
    if (!userData.user) throw new Error('Please sign in again.');
    const { data, error } = await client().from('site_admins').select('user_id').eq('user_id', userData.user.id);
    check(error);
    if (!data || data.length !== 1) throw new Error('This account is not a site admin. Check the admin email in the SQL setup.');
  }
  async function saveSection(section, content) {
    await requireAdmin();
    if (!revisions[section]) throw new Error('Refresh the dashboard before saving.');
    const { data, error } = await client().from('site_content').update({ content })
      .eq('section', section).eq('updated_at', revisions[section]).select('updated_at');
    check(error);
    if (!data || data.length !== 1) throw new Error('Content changed in another session, or permission was denied. Refresh this dashboard before trying again.');
    revisions[section] = data[0].updated_at;
  }
  async function reset() {
    await requireAdmin();
    const { error } = await client().rpc('reset_site_content'); check(error);
  }
  async function uploadImage(dataUrl) {
    await requireAdmin();
    const blob = await (await fetch(dataUrl)).blob();
    if (blob.size > 5 * 1024 * 1024) throw new Error('Optimized image is too large. Choose a smaller photo.');
    const path = crypto.randomUUID() + '.jpg';
    const { error } = await client().storage.from('project-images').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    check(error);
    return client().storage.from('project-images').getPublicUrl(path).data.publicUrl;
  }
  function safeImage(value) {
    const s = String(value || 'image/ezgif-frame-050.jpg');
    if (/^https:\/\//i.test(s) || /^data:image\/(jpeg|png|webp);base64,/i.test(s) || /^(\.\.\/)?image\/[a-zA-Z0-9_.-]+$/.test(s)) return s;
    return 'image/ezgif-frame-050.jpg';
  }
  return { configured, client, load, requireAdmin, saveSection, reset, uploadImage, safeImage,
    async session() { const { data, error } = await client().auth.getSession(); check(error); return data.session; },
    async signIn(email, password) { const { error } = await client().auth.signInWithPassword({ email, password }); check(error); },
    async signOut() { const { error } = await client().auth.signOut(); check(error); }
  };
})();
