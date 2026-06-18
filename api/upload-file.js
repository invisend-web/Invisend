module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Server configuration error' });

  const { bucket, path, base64, mimeType } = req.body;
  if (!bucket || !path || !base64 || !mimeType) return res.status(400).json({ error: 'Missing required fields' });

  let keyRole = 'unknown';
  try { keyRole = JSON.parse(Buffer.from(serviceRoleKey.split('.')[1], 'base64').toString()).role; } catch(e) {}
  if (keyRole !== 'service_role') {
    return res.status(500).json({ error: `Wrong key in SUPABASE_SERVICE_ROLE_KEY (role="${keyRole}"). Go to Supabase → Settings → API and copy the service_role secret.` });
  }

  const buffer = Buffer.from(base64, 'base64');

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
