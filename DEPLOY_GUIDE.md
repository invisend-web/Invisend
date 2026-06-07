# InviSend — GitHub & Vercel Deploy Guide
> Complete step-by-step guide. No experience needed.

---

## PART 1 — GitHub Setup (one time only)

### Step 1: Create a GitHub account
1. Go to **https://github.com** → click **Sign up**
2. Use your email, create a username and password
3. Verify your email

### Step 2: Create a new repository
1. After login, click the **"+"** icon top-right → **"New repository"**
2. Repository name: `invisend`
3. Set to **Public**
4. Do NOT check "Add README" (we have our own)
5. Click **"Create repository"**

### Step 3: Upload your files
1. On the new empty repo page, click **"uploading an existing file"** link
2. Drag and drop ALL these files from the ZIP:
   - `index.html`
   - `invitation.html`
   - `dashboard.html`
   - `rsvp-live.html`
   - `setup.sql`
   - `README.md`
3. Scroll down → in the "Commit changes" box, type: `Initial upload`
4. Click **"Commit changes"**
5. Your files are now on GitHub!

---

## PART 2 — Vercel Setup (one time only)

### Step 1: Create Vercel account
1. Go to **https://vercel.com** → click **"Sign Up"**
2. Choose **"Continue with GitHub"** — this links both accounts automatically

### Step 2: Import your GitHub repo
1. On the Vercel dashboard, click **"Add New Project"**
2. You will see your GitHub repositories listed
3. Find `invisend` and click **"Import"**
4. On the configure screen:
   - Framework Preset: **Other** (leave as default)
   - Root Directory: leave blank
   - Build & Output Settings: leave everything blank
5. Click **"Deploy"**
6. Wait ~30 seconds → Done!

Vercel gives you a URL like: **`invisend.vercel.app`**

---

## PART 3 — Custom Domain (optional)

1. In Vercel, click your project → **"Settings"** → **"Domains"**
2. Type your domain name → click **"Add"**
3. Follow Vercel's instructions to update your domain's DNS settings

---

## PART 4 — How to push code updates (when I say "push to git")

### Method A: GitHub website (easiest)
1. Go to **https://github.com/YOUR-USERNAME/invisend**
2. Click on the file you want to update (e.g. `dashboard.html`)
3. Click the **pencil icon** (Edit) top-right of the file
4. Make changes or paste the new content
5. Scroll down → click **"Commit changes"**
6. Vercel will **automatically redeploy** within 30 seconds — no action needed!

### Method B: GitHub Desktop app (for uploading whole files)
1. Download **GitHub Desktop** from https://desktop.github.com
2. Sign in with your GitHub account
3. Click **"Clone a repository"** → find `invisend` → Clone
4. Replace the files on your computer with the new versions I give you
5. In GitHub Desktop, you will see the changes listed
6. Type a message like "Update dashboard" in the bottom-left box
7. Click **"Commit to main"** → then **"Push origin"**
8. Vercel auto-deploys!

### Method C: Git command line (advanced)
```bash
git clone https://github.com/YOUR-USERNAME/invisend
# Replace files
git add .
git commit -m "Update files"
git push origin main
```

---

## PART 5 — Your live URLs after deploy

| Page | URL |
|------|-----|
| Landing page | `https://invisend.vercel.app` |
| Guest invitation | `https://invisend.vercel.app/invitation.html?slug=SLUG` |
| Admin dashboard | `https://invisend.vercel.app/dashboard.html` |
| Live RSVP view | `https://invisend.vercel.app/rsvp-live.html?slug=SLUG` |

Replace `invisend.vercel.app` with your actual Vercel URL or custom domain.

---

## When I say "push to git" — what happens

When I give you updated files and say "push to git", you:
1. Download the new file from me
2. Go to GitHub → click the file → Edit (pencil)
3. Replace all content with the new version
4. Click "Commit changes"
5. Vercel redeploys automatically within 30 seconds
6. Done — your live site is updated!

