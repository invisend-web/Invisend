const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return res.status(500).json({ error: 'Server configuration error' });

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  if (req.query.countOnly === 'true') {
    const { count, error } = await supabase
      .from('bin')
      .select('id', { count: 'exact', head: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ count });
  }

  const { data, error } = await supabase
    .from('bin')
    .select('*')
    .order('deleted_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ data });
};
