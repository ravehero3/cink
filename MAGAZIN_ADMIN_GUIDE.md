# Magazín - Quick Admin Guide

## Access
- Admin panel: https://ufosport.cz/admin
- Magazín tab: Left sidebar → "Magazín" (under "Obsah & Systém")
- Required: ADMIN role

## Create Your First Article

### Step 1: Start New Article
1. Click "Magazín" in admin sidebar
2. Click blue "Nový článek" button (top-right)

### Step 2: Fill Basic Info
- **Titul** (required): "Jak začít s UV ochranou" (example)
- **Slug** (auto-fills): Will show `jak-zacit-s-uv-ochranou` automatically
  - Editable if needed; must be unique
- **Podtitul** (optional): "Krátký úvod co se dozvíte v článku"
- **Autor**: "Jan Novák"
- **Kategorie**: "Tipy & triky" or "Produkty" or custom
- **Tagy**: "UV, sluneční brýle, bezpečnost" (comma-separated)
- **Zveřejněno**: Check this to publish immediately, or leave unchecked to save as draft

### Step 3: Add Content

#### Hero Image (Required for card display)
1. Scroll to "Hlavní obrázek (hero)"
2. Click file input or drag image
3. Recommended: 1200×800px, JPG/PNG/WebP, max 10MB
4. Wait for "Uloženo ✓"

#### Text Blocks
1. Scroll to first "Text blok"
2. Write article intro (2-3 paragraphs)
3. Keep text readable: short paragraphs, ~18px font size

#### Add Images in Article
1. Scroll to "Obrázek v textu" section
2. Upload image (same specs as hero)
3. Add credit/photographer name in "Kredit / autora obrázku" field
4. Continue with more text blocks

#### Add Instagram Embed (Optional)
1. Find Instagram post URL (click "Copy link" on Instagram)
2. Example: `https://www.instagram.com/p/C1a2b3c4d5e/`
3. Paste into "Instagram URL" field
4. Article will embed the post automatically

### Step 4: Save & Preview
1. Click "Uložit" (blue button)
2. Wait for "Uloženo ✓" message
3. Click "Náhled" to open public page in new tab
4. If unpublished: Shows normally in editor but returns 404 on public site

### Step 5: Publish
1. Check "Zveřejněno" checkbox
2. Click "Uložit"
3. Article now appears on https://ufosport.cz/magazin grid
4. Link appears in footer "Magazín" section

---

## Edit Existing Article

1. Go to Magazín list
2. Click "Upravit" on any article
3. Make changes
4. Click "Uložit"

**Don't see changes on public page?**
- If unpublished: Won't show at all (404)
- If published: Wait 30 seconds, refresh browser, clear cache

---

## Delete Article

1. Go to Magazín list
2. Click "Smazat" (red, far right)
3. Confirm in popup: "Smazat"
4. Article + all images removed permanently

---

## Tips & Tricks

### Slug Editing
- Auto-generated but you can change it
- Use lowercase, dashes, alphanumeric only
- No spaces, no special characters
- Example: `10-tipu-na-letni-kamp` ✅  
- Example: `10 Tips on Summer Camp` ❌ (spaces + caps)

### Image Credits
- Format: "© Fotografo Jméno" or "© Název agentury"
- Appears in small grey text under images
- Optional but recommended

### Instagram URLs
- Copy directly from Instagram: "Copy link to post"
- Formats supported:
  - Regular post: `instagram.com/p/ABC123/`
  - Reel: `instagram.com/reel/ABC123/`
  - TV: `instagram.com/tv/ABC123/`
  - Story: Not supported (too temporary)

### Draft Articles
- Leave "Zveřejněno" unchecked
- Visible in admin list as "Koncept" (yellow badge)
- Not accessible to public (404 if direct link)
- Useful for work-in-progress

### Related Articles
- Automatic: Shows 3 other newest published articles
- Can't customize list — always newest first
- Good for discoverability

---

## Troubleshooting

### "Chyba: Slug already exists"
- Change the slug to something unique
- Click "Uložit" again

### "Chyba při nahrání obrázku"
- Image is too large (>10MB)
- Resize in image editor, then try again
- Supported formats: JPG, PNG, WebP, GIF, AVIF

### "Náhled" button doesn't work
- Article must be saved first
- If slug is empty, article hasn't saved yet

### Article not showing on /magazin
- Check "Zveřejněno" is checked ✓
- Check publication date isn't in the future
- Wait 30 seconds, refresh, clear cache

### Footer "Magazín" link 404s
- Check at least 1 article is published
- If no articles, footer link is normal but /magazin shows empty state

---

## Content Guidelines

### Title
- 40-60 characters (looks good in card grid)
- Capitalize first letter: "Jak se chránit..." ✅ not "jak se chránit..."
- Include keyword for SEO: "10 tipů" better than "Užitečné informace"

### Subtitle (Standfirst)
- 1-2 sentences
- Teaser of what reader will learn
- Example: "Zberte si základní informace o UV ochraně a vyberte správné brýle."

### Category
- Keep consistent across articles: "Tipy", "Recenze", "Dělníci", "Produkčně"
- Used for filtering/organization
- Example: "Produkty", "Blog", "Návody"

### Tags
- 3-5 tags per article
- All lowercase
- Comma-separated: "UV, sluneční brýle, letní"

### Hero Image
- Portrait: Bad (gets cropped)
- Landscape 3:2 ratio: Good (1200×800, 1800×1200, etc.)
- Clear subject, good lighting
- Avoid text overlay (hard to read at small size)

### Article Text
- Paragraphs: 2-4 sentences max
- Subheadings: Optional (but helps readability)
- Links: Can't add manually (future feature)
- Line length: ~70-80 characters (auto-wrapping at mobile)

---

## Permissions

- **View/Create/Edit/Delete**: ADMIN role only
- **Public Read**: Anyone (published articles only)
- **Image Upload**: ADMIN role only
- **No role-based visibility**: All admins can see all articles (including drafts)

---

## Support

**Questions?**  
Contact: [Your Slack / Email]

**Report bugs:**  
GitHub Issues: [Link]

**Request features:**  
- Pagination (100+ articles)
- Rich text editor (bold, italic, links)
- Article scheduling (publish on specific date)
- Comments/reactions
- Author bios/photo
