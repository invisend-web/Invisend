const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Server configuration error' });

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ── Per-invitation media pool ──────────────────────────────────────────────
  const { invitationId } = req.query;
  if (invitationId) {
    const { data: files, error: filesErr } = await supabase
      .from('storage_files')
      .select('id, public_url, file_path, file_type, uploaded_at')
      .eq('reference_id', invitationId)
      .order('uploaded_at', { ascending: false });

    if (filesErr) return res.status(500).json({ error: filesErr.message });

    const result = (files || []).map(f => ({
      id: f.id,
      public_url: f.public_url,
      file_path: f.file_path,
      file_type: f.file_type,
      uploaded_at: f.uploaded_at,
    }));

    return res.status(200).json({ files: result });
  }

  // ── Global library (existing behaviour — unchanged) ────────────────────────
  const type = req.query.type;
  if (!['music', 'background'].includes(type)) return res.status(400).json({ error: 'type must be music or background' });

  const { data: files, error: filesErr } = await supabase
    .from('storage_files')
    .select('id, public_url, file_path, uploaded_at')
    .eq('file_type', type)
    .order('uploaded_at', { ascending: false });

  if (filesErr) return res.status(500).json({ error: filesErr.message });

  const urlCol = type === 'music' ? 'music_url' : 'background_image_url';
  const { data: invs, error: invsErr } = await supabase
    .from('invitations')
    .select(urlCol)
    .not(urlCol, 'is', null);

  if (invsErr) return res.status(500).json({ error: invsErr.message });

  const activeUrls = new Set((invs || []).map(i => i[urlCol]).filter(Boolean));

  const result = (files || []).map(f => ({
    id: f.id,
    url: f.public_url,
    label: f.file_path ? f.file_path.split('/').pop() : 'File',
    uploaded_at: f.uploaded_at,
    in_use: activeUrls.has(f.public_url),
  }));

  return res.status(200).json({ files: result });
};
