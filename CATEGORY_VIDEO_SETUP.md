# Category Video Update Instructions

Both videos have been successfully uploaded to your Oracle VPS at `/home/ubuntu/ufosport-videos/`:

✅ `VOODOO808 4 UFOSPORT.CZ 2576x584.mov` (18MB)
✅ `SPACE LOVE 4 UFOSPORT.CZ 257x584.mov` (42MB)

## To complete the setup:

Run this command in your project root to update the database:

```bash
npx ts-node scripts/update-category-videos.ts
```

This will:
1. Find the voodoo808 category and set videoUrl to: `https://videos.ufosport.cz/VOODOO808%204%20UFOSPORT.CZ%202576x584.mov`
2. Find the space-love category and set videoUrl to: `https://videos.ufosport.cz/SPACE%20LOVE%204%20UFOSPORT.CZ%20257x584.mov`

After running, the videos will be live on:
- https://www.ufosport.cz/voodoo808
- https://www.ufosport.cz/space-love

## Troubleshooting

If the script fails, verify:
1. DATABASE_URL is set in your .env file
2. The categories exist with slugs: `voodoo808` and `space-love`
3. Nginx on the VPS is serving /home/ubuntu/ufosport-videos/

Check VPS files:
```bash
ssh -i /Users/voodoo808/Downloads/oracle-keys/ssh-key-2026-06-16.key ubuntu@130.61.26.156 "ls -lah /home/ubuntu/ufosport-videos/"
```
