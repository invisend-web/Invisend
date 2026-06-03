// ============================================================
// InviSend — Supabase Client
// All API calls go through here. Keys come from config.js
// ============================================================

// Resolved at runtime from config.js
const SUPABASE_URL    = window.INVISEND_CONFIG.supabaseUrl;
const SUPABASE_ANON_KEY = window.INVISEND_CONFIG.supabaseKey;
const STORAGE_BUCKET  = window.INVISEND_CONFIG.storageBucket;

// ── Core fetch helper ────────────────────────────────────────
async function sbFetch(path, options = {}) {
  const url  = `${SUPABASE_URL}/rest/v1/${path}`;
  const headers = {
    'apikey':        SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type':  'application/json',
    'Prefer':        options.prefer || 'return=representation',
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error [${res.status}]: ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── Invitations ──────────────────────────────────────────────
async function getAllInvitations() {
  return sbFetch('invitations?order=created_at.desc&select=*');
}
async function getInvitationBySlug(slug) {
  const data = await sbFetch(`invitations?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`);
  return data?.[0] || null;
}
async function createInvitation(payload) {
  return sbFetch('invitations', { method: 'POST', body: JSON.stringify(payload) });
}
async function updateInvitation(id, payload) {
  return sbFetch(`invitations?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
}
async function deleteInvitation(id) {
  return sbFetch(`invitations?id=eq.${id}`, { method: 'DELETE', prefer: 'return=minimal' });
}

// ── View counter ─────────────────────────────────────────────
async function incrementViewCount(slug) {
  try {
    await sbFetch(`invitations?slug=eq.${encodeURIComponent(slug)}`, {
      method: 'POST',
      headers: { 'Prefer': 'return=minimal' },
      body: JSON.stringify({}),
    });
    // Use RPC for atomic increment
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_views`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inv_slug: slug }),
    });
  } catch(e) { /* silent — never break invitation page */ }
}

// ── RSVP ────────────────────────────────────────────────────
async function submitRSVP(payload) {
  return sbFetch('rsvp', { method: 'POST', body: JSON.stringify(payload) });
}
async function getRSVPsBySlug(slug) {
  return sbFetch(`rsvp?invitation_slug=eq.${encodeURIComponent(slug)}&order=created_at.desc&select=*`);
}
async function checkDuplicateRSVP(slug, phone) {
  const data = await sbFetch(`rsvp?invitation_slug=eq.${encodeURIComponent(slug)}&phone=eq.${encodeURIComponent(phone)}&select=id&limit=1`);
  return data && data.length > 0;
}

// ── Storage upload ───────────────────────────────────────────
async function uploadFile(file, folder = 'general') {
  const ext      = file.name.split('.').pop();
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const url      = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filename}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey':        SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type':  file.type,
      'x-upsert':      'true',
    },
    body: file,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Storage upload failed: ${err}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filename}`;
}

// ── Helpers ──────────────────────────────────────────────────
function generateSlug(coupleName) {
  return coupleName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '').trim()
    .replace(/\s+/g, '-') + '-' + Math.random().toString(36).slice(2, 6);
}
function expiryFromWedding(weddingDate) {
  const d = new Date(weddingDate);
  d.setDate(d.getDate() + 1);
  return d.toISOString();
}
function isExpired(expiryDate) {
  return new Date() > new Date(expiryDate);
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  });
}
function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    weekday:'long', year:'numeric', month:'long',
    day:'numeric', hour:'2-digit', minute:'2-digit'
  });
}
