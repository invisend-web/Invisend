const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Server configuration error' });

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { payload, editingId } = req.body;
  if (!payload) return res.status(400).json({ error: 'payload required' });

  let error, data;
  if (editingId) {
    ({ error } = await supabase.from('invitations').update(payload).eq('id', editingId));
  } else {
    ({ error, data } = await supabase.from('invitations').insert(payload).select('id').single());
  }

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true, id: data?.id || null });
};
