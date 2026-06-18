const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Server configuration error — missing env vars' });

  const { bucket, path, base64, mimeType } = req.body;
  if (!bucket || !path || !base64 || !mimeType) return res.status(400).json({ error: 'Missing required fields' });

  let keyRole = 'unknown';
  try { keyRole = JSON.parse(Buffer.from(serviceRoleKey.split('.')[1], 'base64').toString()).role; } catch(e) {}
  if (keyRole !== 'service_role') {
    return res.status(500).json({ error: `Wrong key in SUPABASE_SERVICE_ROLE_KEY (role="${keyRole}"). Copy the service_role secret from Supabase → Settings → API.` });
  }

  const buffer = Buffer.from(base64, 'base64');

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: mimeType,
    upsert: true,
  });

  if (error) return res.status(500).json({ error: error.message });

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
  return res.status(200).json({ publicUrl });
};
