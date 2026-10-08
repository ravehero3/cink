# Magazín Feature - QA Checklist

Use this before marking the feature as complete/live.

---

## Pre-Deployment (Dev Environment)

### Build & Migrations
- [ ] Schema compiles: `npx prisma generate` (no errors)
- [ ] Migration valid: `npx prisma db push --skip-generate` (no schema conflicts)
- [ ] Build succeeds: `npm run build` (no TS errors)
- [ ] Dev server starts: `npm run dev` (no errors in console)

### API Routes
- [ ] `GET /api/magazine/articles` returns `[]` (empty array)
- [ ] `POST /api/magazine/articles` without auth returns 401
- [ ] `POST /api/magazine/articles` without title returns 400
- [ ] Upload endpoint accepts: JPG, PNG, WebP, GIF, AVIF
- [ ] Upload endpoint rejects: BMP, TIFF, MP4 (wrong types)
- [ ] Upload endpoint rejects: 11MB file (>10MB limit)

### Public Pages
- [ ] `GET /magazin` loads, shows empty state text
- [ ] `GET /magazin/nonexistent` returns 404
- [ ] CSS loads: inspect `.magazin-card` in DevTools (check no conflicts)
- [ ] Footer has "Magazín" link (both desktop/mobile)
- [ ] Footer "Magazín" link goes to `/magazin`

### Admin Pages
- [ ] Admin user can see "Magazín" tab in sidebar
- [ ] Non-admin (customer) cannot access `/admin/magazin` (redirects)
- [ ] `/admin/magazin` shows empty list initially
- [ ] "Nový článek" button navigates to editor

---

## Admin Editor (New Article)

### Basic Fields
- [ ] Title input saves and reflects in list
- [ ] Slug auto-generates from title (e.g., "Test Title" → "test-title")
- [ ] Slug is editable
- [ ] Slug stripping works: "Řežem" → "rezem" (diacritics removed)
- [ ] Slug validation rejects: spaces, uppercase, special chars
- [ ] Author field saves
- [ ] Category field saves
- [ ] Tags field saves (comma-separated)

### Images
- [ ] Hero image upload works (PNG/JPG/WebP)
- [ ] File picker only shows image types
- [ ] File >10MB shows error
- [ ] Uploaded file appears in preview
- [ ] Image URL in blocks matches `/magazine-uploads/xxx`
- [ ] Image persists after page refresh

### Content Blocks
- [ ] Text block 1 accepts multiple paragraphs
- [ ] Text block 1 saves after edit
- [ ] Image block accepts upload (same rules as hero)
- [ ] Image block credit field saves
- [ ] Text block 2 saves
- [ ] Instagram URL field accepts valid URL
- [ ] Instagram URL field validates: rejects `facebook.com` URLs
- [ ] Text block 3 saves

### Publishing
- [ ] Checking "Zveřejněno" checkbox works
- [ ] Unchecking "Zveřejněno" unchecks
- [ ] Save button disabled while saving
- [ ] "Ukládám…" message appears during save
- [ ] "Uloženo ✓" message appears after save
- [ ] "Náhled" button opens public page in new tab

### Error Handling
- [ ] Saving with empty title shows error
- [ ] Duplicate slug shows error: "Slug already exists"
- [ ] Upload failure shows: "Chyba při nahrání obrázku"
- [ ] Save failure shows: "Chyba při ukládání"

---

## Admin List Page

### Display
- [ ] List shows all articles (published + drafts)
- [ ] Title column shows correct titles
- [ ] Status column shows "Zveřejněno" (green) for published
- [ ] Status column shows "Koncept" (yellow) for drafts
- [ ] Updated date column shows correct date
- [ ] "Nový článek" button accessible (top right)

### Actions
- [ ] "Upravit" button navigates to editor with data loaded
- [ ] "Zobrazit" button opens public page in new tab
- [ ] "Smazat" button opens delete confirmation modal
- [ ] Confirm delete removes article from list
- [ ] Cancel delete keeps article in list

---

## Public Magazine Page (/magazin)

### Initial State (No Articles)
- [ ] Page loads
- [ ] Title: "Magazín"
- [ ] Subtitle: "Inspirace a tipy ze světa UFO SPORT"
- [ ] Empty state text visible: "Zatím zde nejsou žádné články."
- [ ] No console errors

### With Published Articles
- [ ] Articles appear in grid (3 columns on desktop)
- [ ] Grid shows newest first (by `publishedAt`)
- [ ] Each card shows: hero image, category, author, title, subtitle
- [ ] Cards are clickable (links to `/magazin/[slug]`)
- [ ] Hover effect: slight opacity change or scale
- [ ] Mobile: 1 column layout
- [ ] Tablet: 2 columns

---

## Public Article Page (/magazin/[slug])

### Content Rendering
- [ ] Breadcrumb/category link shows correct category
- [ ] H1 title matches article title
- [ ] Standfirst (subtitle) displays
- [ ] Byline shows: "Od [Author]" and date
- [ ] Hero image displays
- [ ] Hero credit displays (if set)
- [ ] Text blocks render in order
- [ ] Image block displays with credit
- [ ] Instagram embed loads (if URL provided)
- [ ] Tags display as pill buttons (bottom)

### Navigation
- [ ] Related articles show (3 cards, "Doporučujeme" heading)
- [ ] Related cards show thumbnail + title
- [ ] Related cards are clickable
- [ ] Back to list: Footer → "Magazín" link works
- [ ] Footer doesn't duplicate article content

### Unpublished Article
- [ ] Direct URL to draft article returns 404 page
- [ ] Draft appears only in admin list, not public grid

### SEO / Meta Tags
- [ ] Page title = article title (check browser tab)
- [ ] og:image points to hero image (use Facebook Debugger)
- [ ] og:title = article title
- [ ] og:description = subtitle

---

## Image Upload Persistence

### Docker / Production
- [ ] Upload image in article
- [ ] Note filename: e.g., `abc123def456.jpg`
- [ ] Restart container: `docker compose restart app`
- [ ] Reload article page
- [ ] Image still displays (not 404)
- [ ] File exists in `/public/magazine-uploads/abc123def456.jpg`

### Cleanup
- [ ] Delete article
- [ ] Image file removed from disk (optional, but good practice)
- [ ] If not auto-deleted: manually purge old uploads periodically

---

## Database & Auth

### Permission Model
- [ ] Admin user can create/edit/delete articles
- [ ] Non-admin (customer) cannot POST/PUT/DELETE
- [ ] Non-admin gets 401 Unauthorized
- [ ] Session check works: logout, try to create article → 401

### Data Integrity
- [ ] Slug is unique: create 2 articles with same title
  - [ ] First saves successfully
  - [ ] Second slug changes (e.g., "test-article-1")
  - OR second shows "Slug already exists" error
- [ ] Draft articles don't appear in public grid
- [ ] Published articles appear correctly in list

---

## Performance & Edge Cases

### Load Time
- [ ] `/magazin` loads in <1s (empty or 10 articles)
- [ ] `/magazin/[slug]` loads in <1s
- [ ] Admin list loads in <2s (20+ articles)

### Edge Cases
- [ ] Article with no hero image: card shows placeholder or empty space (not broken)
- [ ] Article with empty blocks: only shows filled blocks
- [ ] Article with missing author: shows "Redakce" or blank (not crash)
- [ ] Article title with quotes `"Hello"`: escapes correctly (not XSS)
- [ ] Article with very long title: truncates in card (line-clamp-2)

### Mobile
- [ ] Touch targets are ≥44px (WCAG AA)
- [ ] Text is readable at small sizes (16px base)
- [ ] Images don't overflow on mobile
- [ ] Footer "Magazín" link accessible on mobile

---

## Cross-Browser / Device Testing

- [ ] Desktop Chrome (latest)
- [ ] Desktop Firefox (latest)
- [ ] Desktop Safari (macOS)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

For each browser:
- [ ] Public page renders correctly
- [ ] Admin page accessible
- [ ] Images load
- [ ] Responsive layout works

---

## Integration with Existing Site

### No Regressions
- [ ] Homepage still works
- [ ] Product pages still work
- [ ] Shopping cart still works
- [ ] Admin other tabs (Produkty, Objednávky, etc.) still work
- [ ] Search still works
- [ ] Navigation still works

### Styling
- [ ] No colors clash with main site (use DevTools inspector)
- [ ] No font conflicts
- [ ] Footer layout didn't break
- [ ] Admin sidebar layout unchanged

---

## Deployment Verification

### After `docker compose up -d --build`:

1. [ ] Container starts without errors: `docker compose logs app | grep ERROR`
2. [ ] Prisma migration runs: `docker compose logs app | grep "db push"`
3. [ ] Migration completes: `docker compose logs app | grep "✔"` or "success"
4. [ ] API responds: `curl https://ufosport.cz/api/magazine/articles`
5. [ ] Public page loads: `curl -L https://ufosport.cz/magazin | grep "Magazín"`
6. [ ] Admin page requires auth: `curl https://ufosport.cz/admin/magazin` (redirects to login)
7. [ ] After login, admin page loads

### Monitoring (First 24h Post-Deploy)
- [ ] No 500 errors in logs related to `/magazine`
- [ ] No database connection issues
- [ ] No image upload path issues
- [ ] Page load times normal (check CloudFlare analytics)

---

## Sign-Off

**Tested by**: _________________  
**Date**: _________________  
**Notes**: _________________  

**Ready for production**: [ ] Yes [ ] No

If "No", describe blockers:
_____________________________________________________
_____________________________________________________

---

## Rollback Plan

If critical issues found:

```bash
# Revert last commit (if just deployed)
git revert HEAD

# Or restore previous image
docker image ls | grep cink
docker compose down
# Edit docker-compose.yml to previous image tag
docker compose up -d

# Or full database rollback (if schema issue)
# Contact DBA / backup team
```

No data loss expected since feature is additive (new table, no schema changes to existing tables).
