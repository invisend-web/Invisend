const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Server configuration error' });

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { binId } = req.body;
  if (!binId) return res.status(400).json({ error: 'binId required' });

  const { data: binItem, error } = await supabase
    .from('bin')
    .select('*')
    .eq('id', binId)
    .single();
  if (error) return res.status(500).json({ error: error.message });

  if (binItem.item_type === 'invitation') {
    const { invitation, rsvps } = binItem.item_data;
    const invPayload = { ...invitation, status: 'live' };
    delete invPayload.id;
    const { error: restoreErr } = await supabase.from('invitations').upsert(invPayload);
    if (restoreErr) return res.status(500).json({ error: restoreErr.message });
    if (rsvps && rsvps.length) {
      const cleanRsvps = rsvps.map(r => { const c = { ...r }; delete c.id; return c; });
      await supabase.from('rsvp').insert(cleanRsvps);
    }
  }

  await supabase.from('bin').delete().eq('id', binId);
  return res.status(200).json({ success: true });
};
