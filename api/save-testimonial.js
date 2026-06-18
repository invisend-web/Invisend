const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Server configuration error' });

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { payload, editingTestId } = req.body;
  if (!payload) return res.status(400).json({ error: 'payload required' });

  let error;
  if (editingTestId) {
    ({ error } = await supabase.from('testimonials').update(payload).eq('id', editingTestId));
  } else {
    ({ error } = await supabase.from('testimonials').insert(payload));
  }

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
};
