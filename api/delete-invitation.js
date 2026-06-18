const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Server configuration error' });

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });

  const { data: inv, error: fetchErr } = await supabase
    .from('invitations')
    .select('*')
    .eq('id', id)
    .single();
  if (fetchErr) return res.status(500).json({ error: fetchErr.message });

  const coupleName = inv.couple_name || inv.slug;
  const mediaUrls = [
    inv.swipe_image_a_url, inv.swipe_image_b_url, inv.couple_photo_url,
    inv.music_url, inv.background_image_url, inv.preshoot_video_url,
    inv.preshoot_photo_1, inv.preshoot_photo_2, inv.preshoot_photo_3,
    inv.preshoot_photo_4, inv.preshoot_photo_5, inv.preshoot_photo_6,
    inv.preshoot_photo_7, inv.preshoot_photo_8, inv.preshoot_photo_9,
    inv.preshoot_photo_10,
  ].filter(Boolean);

  const { data: rsvps } = await supabase
    .from('rsvp')
    .select('*')
    .eq('invitation_slug', inv.slug);

  const { error: binError } = await supabase.from('bin').insert({
    item_type: 'invitation',
    item_id: inv.id,
    item_label: coupleName,
    item_data: { invitation: inv, rsvps: rsvps || [] },
    media_urls: mediaUrls,
    purge_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
  if (binError) return res.status(500).json({ error: binError.message });

  await supabase.from('rsvp').delete().eq('invitation_slug', inv.slug);

  const { error: delError } = await supabase.from('invitations').delete().eq('id', id);
  if (delError) return res.status(500).json({ error: delError.message });

  return res.status(200).json({ success: true, label: coupleName });
};
