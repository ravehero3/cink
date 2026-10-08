# Magazine site + admin editor

No dependencies – only Node 18+.

    ADMIN_PASSWORD=choose-a-password node server.js
    # site:  http://localhost:3000
    # admin: http://localhost:3000/admin

Admin: log in -> type a URL slug -> "New article". The editor IS the article page:
grey blocks fill as you type, hover an image block for "+" and upload, click an
Instagram block to paste a post URL. Autosaves; Publish makes it live at /p/<slug>/.

## Where to change things
- public/css/site.css   – ":root" tokens at the top = every font size, width, spacing, grey
- public/js/template.js – the ONE article layout (order of text / image / Instagram blocks)
- public/js/config.js   – header + footer text and links
- data/                 – articles (JSON) and uploaded images. Back this folder up.
