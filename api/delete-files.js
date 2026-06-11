const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Get URLs to delete from request body
  const { urls } = req.body;

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'No URLs provided' });
  }

  const results = [];
  const errors = [];

  for (const url of urls) {
    if (!url) continue;
    try {
      // Extract bucket and path from Supabase storage URL
      // URL format: https://xxx.supabase.co/storage/v1/object/public/BUCKET/PATH
      const marker = '/storage/v1/object/public/';
      const idx = url.indexOf(marker);
      if (idx === -1) {
        errors.push({ url, error: 'Invalid URL format' });
        continue;
      }

      const afterMarker = url.substring(idx + marker.length);
      const slashIdx = afterMarker.indexOf('/');
      if (slashIdx === -1) {
        errors.push({ url, error: 'Cannot extract path' });
        continue;
      }

      const bucket = afterMarker.substring(0, slashIdx);
      const path = afterMarker.substring(slashIdx + 1);

      // Delete from storage using service role key
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        errors.push({ url, error: error.message });
      } else {
        results.push({ url, deleted: true });
      }

    } catch (e) {
      errors.push({ url, error: e.message });
    }
  }

  return res.status(200).json({
    success: true,
    deleted: results.length,
    failed: errors.length,
    results,
    errors
  });
};
