const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;');

module.exports = async function handler(req, res) {
  let html;
  try {
    html = fs.readFileSync(path.join(process.cwd(), 'invitation.html'), 'utf8');
  } catch (e) {
    return res.status(500).send('Page unavailable');
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  try {
    const slug = String(req.query.slug || '').trim();
    if (/^[a-zA-Z0-9_-]{1,80}$/.test(slug) && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const { data } = await supabase
        .from('invitations')
        .select('couple_name, wedding_date, venue, couple_photo_url, status')
        .eq('slug', slug)
        .maybeSingle();

      if (data && data.couple_name && (!data.status || data.status === 'live')) {
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const base = 'https://' + host;
        const title = data.couple_name + ' | Wedding Invitation';
        let dateStr = '';
        if (data.wedding_date) {
          dateStr = new Date(data.wedding_date).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Colombo'
          });
        }
        const desc = ['You are invited to the wedding of ' + data.couple_name, dateStr, data.venue]
          .filter(Boolean).join(' · ');
        let img = data.couple_photo_url || '';
        if (!/^https?:\/\//i.test(img)) img = base + '/logo.png';
        const pageUrl = base + '/invitation.html?slug=' + encodeURIComponent(slug);

        const tags =
          '<title>' + esc(title) + '</title>\n' +
          '<meta property="og:type" content="website">\n' +
          '<meta property="og:site_name" content="InviSend">\n' +
          '<meta property="og:title" content="' + esc(title) + '">\n' +
          '<meta property="og:description" content="' + esc(desc) + '">\n' +
          '<meta property="og:image" content="' + esc(img) + '">\n' +
          '<meta property="og:url" content="' + esc(pageUrl) + '">\n' +
          '<meta name="twitter:card" content="summary_large_image">';

        const anchor = '<title>InviSend — Wedding Invitation</title>';
        if (html.includes(anchor)) html = html.replace(anchor, () => tags);
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      }
    }
  } catch (e) {
    // any problem: serve the normal page unchanged
  }
  return res.status(200).send(html);
};
