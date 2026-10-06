# Direct Database Update via Neon Console

If you don't want to use the ts-node script, you can update directly in Neon:

## Steps:
1. Go to your Neon dashboard: https://console.neon.tech/
2. Select your project
3. Go to **SQL Editor**
4. Run these two SQL queries:

```sql
-- Update VOODOO808 category
UPDATE "Category" 
SET "videoUrl" = 'https://videos.ufosport.cz/VOODOO808%204%20UFOSPORT.CZ%202576x584.mov'
WHERE slug = 'voodoo808';

-- Update SPACE LOVE category  
UPDATE "Category"
SET "videoUrl" = 'https://videos.ufosport.cz/SPACE%20LOVE%204%20UFOSPORT.CZ%20257x584.mov'
WHERE slug = 'space-love';
```

## Verify:
```sql
SELECT slug, name, "videoUrl" FROM "Category" WHERE slug IN ('voodoo808', 'space-love');
```

After running these, refresh your website and the videos will appear!
