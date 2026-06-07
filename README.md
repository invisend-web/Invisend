# InviSend — Complete Setup Guide
> A cinematic digital wedding invitation platform with preshoot galleries, RSVP, and testimonials.

---

## Files in this package

| File | Purpose |
|------|---------|
| `index.html` | Public landing page (your website homepage) |
| `invitation.html` | Guest-facing wedding invitation page |
| `dashboard.html` | Admin dashboard (password protected) |
| `rsvp-live.html` | Real-time RSVP results view |
| `setup.sql` | All the Supabase database & storage setup (run this first!) |

---

## STEP 1 — Set up Supabase (Do this before anything else)

### 1.1 — Create your Supabase account
1. Go to **https://supabase.com** and sign up with Google or email
2. Click **"New Project"**
3. Choose a name (e.g. `invisend`), set a strong database password, pick a region close to Sri Lanka (Singapore is closest)
4. Wait ~2 minutes for the project to be created

### 1.2 — Run the SQL to create tables
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"** (the `+` button)
3. Open the file `setup.sql` from this package and **copy all of its contents**
4. Paste it into the SQL editor
5. Click the green **"Run"** button
6. You should see `Success. No rows returned` — that means it worked!

### 1.3 — Create Storage Buckets (for images, music, videos)
1. In the left sidebar, click **"Storage"**
2. Click **"New Bucket"** and create these TWO buckets:

   **Bucket 1:**
   - Name: `images`
   - Toggle **"Public bucket"** to ON
   - Click Save

   **Bucket 2:**
   - Name: `music`
   - Toggle **"Public bucket"** to ON
   - Click Save

3. For EACH bucket, set the upload policy:
   - Click on the bucket name
   - Click **"Policies"** tab
   - Click **"New Policy"** → **"For full customization"**
   - Policy name: `Allow all uploads`
   - Allowed operations: check ALL (SELECT, INSERT, UPDATE, DELETE)
   - Target roles: leave blank (means everyone)
   - Click **"Review"** then **"Save policy"**

> **Why?** Without this, the dashboard cannot upload photos/music.

---

## STEP 2 — Deploy to Vercel

### 2.1 — Create a GitHub repository
1. Go to **https://github.com** and sign in
2. Click the **"+"** icon → **"New repository"**
3. Name it `invisend` (or anything you like)
4. Keep it **Public** (free hosting on Vercel)
5. Click **"Create repository"**

### 2.2 — Upload your files to GitHub
1. On the repository page, click **"uploading an existing file"**
2. Drag ALL 5 HTML files (`index.html`, `invitation.html`, `dashboard.html`, `rsvp-live.html`) into the upload area
3. Scroll down, click **"Commit changes"**

### 2.3 — Deploy on Vercel
1. Go to **https://vercel.com** and sign in with your GitHub account
2. Click **"Add New Project"**
3. Find your `invisend` repository and click **"Import"**
4. Leave all settings as default (Framework: Other)
5. Click **"Deploy"**
6. Wait ~30 seconds → Your site is live!

Vercel will give you a URL like `invisend.vercel.app`. You can set a custom domain in Vercel settings.

---

## STEP 3 — Test your setup locally first

Open the files in your browser directly before deploying:
- Open `dashboard.html` — log in with password `I@mfc!sm@S`
- Create a test invitation
- Open `invitation.html?slug=your-test-slug`
- Check swipe works, RSVP submits

---

## How to use the Dashboard

### Admin Login
- URL: `yoursite.com/dashboard.html`
- Password: `I@mfc!sm@S`

### Creating an Invitation
1. Click **"New Invitation"**
2. Choose a theme (Western Luxury / Udarata Sinhala / Kalyanam / InviSend Ivory)
3. Fill in couple name and slug (e.g. `ayasha-rohan` — this becomes the URL)
4. Add family names, venue, date, message
5. Upload Swipe Image A (bride), Swipe Image B (groom), Couple Photo
6. Optionally upload background music (MP3)
7. Optionally tick **"Enable pre-shoot section"** and upload up to 10 photos + a video link
8. Click **"Save Invitation"**

### Sharing the invitation
- Click the copy icon next to any invitation
- Share the link: `yoursite.com/invitation.html?slug=ayasha-rohan`

### Viewing RSVPs
- Click the people icon → or go to **RSVP Results** tab
- Select the invitation to see who is attending
- Click **"Open Live View"** for real-time updates (share this with the couple!)

### Adding Testimonials (for landing page)
1. Go to **Testimonials** tab
2. Click **"Add Testimonial"**
3. Upload a screenshot or wedding photo
4. Add couple name, optional caption, theme used
5. Set sort order (1 = shows first)
6. Keep **Visible** to show it on the landing page
7. Save — it appears on `index.html` instantly!

---

## Pre-Shoot Feature (Optional)

When creating or editing an invitation:
1. Check **"Enable pre-shoot section"**
2. Set a section title (default: "Our Pre-Shoot")
3. Upload up to **10 photos** by clicking the numbered slots
4. Paste a **video link** (YouTube, Vimeo, or direct MP4 URL)

The pre-shoot section only appears on the invitation if it has content. If a couple doesn't have a pre-shoot, simply leave it disabled.

---

## Database Tables Reference

| Table | Purpose |
|-------|---------|
| `invitations` | All wedding invitations with their settings |
| `rsvp` | Guest RSVP responses |
| `testimonials` | Testimonial photos shown on landing page |

---

## Your Supabase Credentials (Already saved in all files)
- **Project URL:** `https://uodiuclpqnhwsiclrbsq.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (saved in code)

> **Important:** Never share your Supabase **service role** key publicly. The anon key used here is safe for frontend use.

---

## Troubleshooting

**"Invitation Not Found" error**
→ Check the slug in the URL matches exactly what you entered in the dashboard
→ Make sure the invitation status is set to "Live"

**Photos not uploading**
→ Make sure you created the `images` bucket in Supabase Storage with Public access
→ Make sure you added the policy to allow all uploads

**Music not playing**
→ Create the `music` bucket in Supabase Storage (same steps as images bucket)
→ Some browsers block autoplay — guests can click the music button

**RSVP not saving**
→ Check that the `rsvp` table was created (run `setup.sql` again if needed)
→ Check browser console for error messages

**Testimonials not showing on landing page**
→ Make sure `is_visible` is set to true in the dashboard
→ Make sure the `testimonials` table exists (run `setup.sql`)

---

## Theme Reference

| ID | Name | Colors | Best for |
|----|------|--------|---------|
| 1 | Western Luxury | Black & Gold | Modern, elegant couples |
| 2 | Udarata Sinhala | Deep Red & Yellow | Sri Lankan traditional weddings |
| 3 | Kalyanam | Forest Green & Gold | Tamil cultural weddings |
| 4 | InviSend Ivory | Warm Cream & Gold | Light, romantic luxury weddings |

