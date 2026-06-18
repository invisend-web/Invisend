module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Server configuration error' });

  const { bucket, path, base64, mimeType } = req.body;
  if (!bucket || !path || !base64 || !mimeType) return res.status(400).json({ error: 'Missing required fields' });

  const buffer = Buffer.from(base64, 'base64');

  // Direct REST API call — no JS client layer, service role key goes straight
  // into the Authorization header, bypassing storage.objects RLS entirely
  const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': mimeType,
      'x-upsert': 'true',
    },
    body: buffer,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    return res.status(500).json({ error: errText });
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
  return res.status(200).json({ publicUrl });
};
