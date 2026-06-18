const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Server configuration error' });

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { bucket, path, base64, mimeType } = req.body;
  if (!bucket || !path || !base64 || !mimeType) return res.status(400).json({ error: 'Missing required fields' });

  const buffer = Buffer.from(base64, 'base64');
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType: mimeType, upsert: true });

  if (error) return res.status(500).json({ error: error.message });

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return res.status(200).json({ publicUrl: data.publicUrl });
};

module.exports.config = {
  api: { bodyParser: { sizeLimit: '20mb' } },
};
