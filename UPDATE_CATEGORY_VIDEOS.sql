-- Update VOODOO808 category with video from public folder
UPDATE "Category" 
SET "videoUrl" = '/voodoo808-banner.mov'
WHERE slug = 'voodoo808';

-- Update SPACE LOVE category with video from public folder
UPDATE "Category"
SET "videoUrl" = '/space-love-banner.mov'
WHERE slug = 'space-love';

-- Verify updates
SELECT slug, name, "videoUrl" FROM "Category" WHERE slug IN ('voodoo808', 'space-love');
