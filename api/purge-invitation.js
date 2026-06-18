const { createClient } = require('@supabase/supabase-js');

async function deleteStorageUrls(supabase, urls) {
  for (const url of urls) {
    if (!url) continue;
    const marker = '/storage/v1/object/public/';
    const idx = url.indexOf(marker);
    if (idx === -1) continue;
    const afterMarker = url.substring(idx + marker.length);
    const slashIdx = afterMarker.indexOf('/');
    if (slashIdx === -1) continue;
    const bucket = afterMarker.substring(0, slashIdx);
    const path = afterMarker.substring(slashIdx + 1).split('?')[0];
    try { await supabase.storage.from(bucket).remove([path]); } catch (e) {}
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Server configuration error' });

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { mode, binId } = req.body;

  if (mode === 'single') {
    if (!binId) return res.status(400).json({ error: 'binId required for single mode' });
    const { data: binItem, error } = await supabase.from('bin').select('*').eq('id', binId).single();
    if (error) return res.status(500).json({ error: error.message });
    if (binItem.media_urls && binItem.media_urls.length) {
      await deleteStorageUrls(supabase, binItem.media_urls);
    }
    await supabase.from('bin').delete().eq('id', binId);
    return res.status(200).json({ success: true });
  }

  if (mode === 'all') {
    const { data: allBin, error } = await supabase.from('bin').select('*');
    if (error) return res.status(500).json({ error: error.message });
    const allUrls = [];
    for (const item of allBin || []) {
      if (item.media_urls && item.media_urls.length) allUrls.push(...item.media_urls);
    }
    if (allUrls.length) await deleteStorageUrls(supabase, allUrls);
    if (allBin && allBin.length) {
      await supabase.from('bin').delete().in('id', allBin.map(i => i.id));
    }
    return res.status(200).json({ success: true });
  }

  return res.status(400).json({ error: 'mode must be single or all' });
};
