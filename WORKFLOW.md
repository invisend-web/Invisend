# InviSend Git Workflow

## Branch Structure

main        → Live production (invisend.vercel.app)
develop     → Staging preview (auto preview URL on Vercel)
features/*  → Individual feature work
hotfix/*    → Emergency fixes direct to main

## Daily Workflow

### Starting a new feature
git checkout develop
git pull origin develop
git checkout -b features/feature-name

### Committing changes
git add .
git commit -m "feat: describe the change"
git push origin features/feature-name

### Merging to develop for testing
git checkout develop
git merge features/feature-name
git push origin develop

### When tested and approved — go live
git checkout main
git merge develop
git push origin main

## Emergency hotfix on live site
git checkout main
git checkout -b hotfix/bug-description
# fix the bug
git add .
git commit -m "hotfix: what was fixed"
git push origin hotfix/bug-description
git checkout main
git merge hotfix/bug-description
git push origin main
git checkout develop
git merge hotfix/bug-description
git push origin develop

## Commit Message Rules
feat:     new feature
fix:      bug fix
ui:       design or layout change
hotfix:   emergency production fix
docs:     documentation only
refactor: code cleanup no behaviour change

## Branch Naming Rules
features/add-ivory-theme
features/fix-rsvp-popup
features/improve-mobile-ui
hotfix/fix-login-broken
hotfix/fix-image-upload
