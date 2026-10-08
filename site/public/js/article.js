// Renders an article from TEMPLATE. The reader page and the admin editor use THIS SAME renderer,
// so layout is guaranteed identical; edit mode just makes the fields editable.
(function () {
  const TPL = window.TEMPLATE;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'} ago`;
  function relTime(iso) {
    if (!iso) return '';
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 3600) return plural(Math.max(1, Math.round(s / 60)), 'minute');
    if (s < 86400) return plural(Math.round(s / 3600), 'hour');
    if (s < 2592000) return plural(Math.round(s / 86400), 'day');
    if (s < 31536000) return plural(Math.round(s / 2592000), 'month');
    return plural(Math.round(s / 31536000), 'year');
  }

  // ---- text sanitiser: keeps <p>, <br>, <strong>, <em>, <a href> only ----
  const BLOCK = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'UL', 'OL', 'BLOCKQUOTE']);
  function clean(html) {
    const doc = new DOMParser().parseFromString('<body>' + (html || '') + '</body>', 'text/html');
    const out = document.createElement('div');
    let cur = null;
    const para = () => (cur || (cur = out.appendChild(document.createElement('p'))));
    function inline(node, target) {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 3) { target.appendChild(document.createTextNode(n.nodeValue)); return; }
        if (n.nodeType !== 1) return;
        const t = n.tagName;
        if (t === 'BR') target.appendChild(document.createElement('br'));
        else if (t === 'STRONG' || t === 'B') { const e = document.createElement('strong'); inline(n, e); target.appendChild(e); }
        else if (t === 'EM' || t === 'I') { const e = document.createElement('em'); inline(n, e); target.appendChild(e); }
        else if (t === 'A' && /^(https?:|mailto:)/i.test(n.getAttribute('href') || '')) {
          const e = document.createElement('a'); e.href = n.getAttribute('href'); e.target = '_blank'; e.rel = 'noopener'; inline(n, e); target.appendChild(e);
        } else inline(n, target);
      });
    }
    function flat(node) {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 1 && BLOCK.has(n.tagName)) { cur = null; flat(n); cur = null; }
        else if (n.nodeType === 1 && n.tagName !== 'BR' && n.querySelector && n.querySelector([...BLOCK].join(',').toLowerCase())) flat(n);
        else if (n.nodeType === 3 || n.nodeType === 1) {
          if (n.nodeType === 3 && !n.nodeValue.trim() && !cur) return;
          const wrap = document.createElement('div'); wrap.appendChild(n.cloneNode(true)); inline(wrap, para());
        }
      });
    }
    flat(doc.body);
    [...out.children].forEach((p) => { if (!p.textContent.trim()) p.remove(); });
    return out.textContent.trim() ? out.innerHTML : '';
  }

  // ---- instagram ----
  const IG_RE = /^https?:\/\/(?:www\.)?instagram\.com\/(?:[\w.]+\/)?(p|reel|reels|tv)\/([\w-]+)/i;
  function normIG(u) {
    const m = IG_RE.exec((u || '').trim());
    return m ? `https://www.instagram.com/${m[1].toLowerCase() === 'reels' ? 'reel' : m[1].toLowerCase()}/${m[2]}/` : null;
  }
  let igLoading = false;
  function processIG() {
    if (!document.querySelector('.instagram-media')) return;
    if (window.instgrm && window.instgrm.Embeds) { window.instgrm.Embeds.process(); return; }
    if (igLoading) return;
    igLoading = true;
    const s = document.createElement('script');
    s.async = true; s.src = 'https://www.instagram.com/embed.js';
    s.onload = () => window.instgrm && window.instgrm.Embeds.process();
    document.body.appendChild(s);
  }

  // ---- building blocks (return HTML strings) ----
  function fld({ tag = 'div', cls = '', f, k, ph = '', val = '', edit, single = true }) {
    if (!edit && !String(val).trim()) return '';
    const attrs = edit
      ? ` contenteditable="true" spellcheck="true" data-${f ? 'f' : 'k'}="${esc(f || k)}" data-single="${single ? 1 : 0}" data-ph="${esc(ph)}"`
      : '';
    const empty = edit && !String(val).trim() ? ' is-empty' : '';
    const inner = single ? esc(val) : (edit ? val : clean(val));
    return `<${tag} class="${cls}${edit ? ' fld' : ''}${empty}"${attrs}>${inner}</${tag}>`;
  }

  const defById = (id) => (id === 'hero' ? TPL.hero : id === 'avatar' ? TPL.avatar : TPL.body.find((b) => b.id === id));

  function imageSlot(def, a, edit) {
    const v = a.blocks[def.id] || '';
    if (!v && !edit) return '';
    const round = def.id === 'avatar';
    const cls = def.id === 'hero' ? 'slot art-hero' : round ? 'slot' : 'slot blk imgb';
    const box = edit
      ? `<div class="fig-box slot-box is-img${round ? ' round' : ''} ${v ? 'filled' : 'is-empty-slot'}" style="--ratio:${def.ratio}">
           ${v ? `<img src="${esc(v)}" alt=""><div class="slot-ctrls"><button type="button" data-act="replace">Replace</button><button type="button" data-act="remove">Remove</button></div>`
               : `<span class="slot-plus">+</span><span class="slot-size">${esc(def.size)} · ${esc(def.ratioLabel)}</span>`}
         </div>`
      : `<div class="fig-box" style="--ratio:${def.ratio}"><img src="${esc(v)}" alt="" loading="lazy"></div>`;
    const credit = def.credit ? fld({ cls: 'credit', k: def.id + ':credit', ph: 'Credit / caption', val: a.blocks[def.id + ':credit'] || '', edit }) : '';
    return `<figure class="${cls}" style="margin-left:auto;margin-right:auto${def.id === 'hero' || round ? '' : ''}" data-slot="${def.id}" data-type="image">${box}${credit}</figure>`;
  }

  function igSlot(def, a, edit, form) {
    const url = a.blocks[def.id] || '';
    if (!url && !edit) return '';
    let inner;
    if (form) {
      inner = `<div class="slot-box is-ig"><form class="ig-form" data-act="ig-form">
        <label>Paste the Instagram post URL (post, reel or tv)</label>
        <input type="url" placeholder="https://www.instagram.com/p/…" value="${esc(form.prefill || '')}" required>
        <div class="ig-err"></div>
        <div class="row"><button type="submit">Load post</button><button type="button" class="ghost" data-act="ig-cancel">Cancel</button></div></form></div>`;
    } else if (url) {
      inner = `<div class="ig-wrap">
        ${edit ? '<div class="slot-ctrls"><button type="button" data-act="ig-change">Change URL</button><button type="button" data-act="ig-remove">Remove</button></div>' : ''}
        <div class="ig-embed"><blockquote class="instagram-media" data-instgrm-permalink="${esc(url)}" data-instgrm-version="14" style="background:#fff;border:0;margin:0 auto;max-width:540px;width:100%;padding:0;">
          <a href="${esc(url)}" target="_blank" rel="noopener">View this post on Instagram</a></blockquote></div>
        <a class="ig-link" href="${esc(url)}" target="_blank" rel="noopener">View on Instagram ↗</a></div>`;
    } else {
      inner = `<div class="slot-box is-ig is-empty-slot"><span class="slot-plus">+</span><span class="slot-size">Instagram post · max 540 px wide · click to add URL</span></div>`;
    }
    return `<div class="slot blk igs" data-slot="${def.id}" data-type="instagram">${inner}</div>`;
  }

  const blockHTML = (def, a, edit) =>
    def.type === 'text'
      ? fld({ cls: 'tb blk', k: def.id, ph: 'Write your paragraph here…', val: a.blocks[def.id] || '', edit, single: false })
      : def.type === 'image' ? imageSlot(def, a, edit) : igSlot(def, a, edit);

  function build(a, edit, related) {
    const when = edit ? '<span class="dim tmp">date set on publish</span>' : `<span class="dim">${esc(relTime(a.publishedAt))}</span>`;
    const tags = edit
      ? fld({ cls: 'tagfld', f: 'tags', ph: 'Tags, comma separated', val: a.tags || '', edit })
      : (a.tags || '').split(',').map((t) => t.trim()).filter(Boolean).map((t) => `<a class="tag" href="#">${esc(t)}</a>`).join('');
    const hasAuthorBox = edit || a.author || a.blocks.bio || a.blocks.avatar;
    const relHTML = edit
      ? `<section class="rel"><h2>We Recommend</h2><div class="rel-grid">${Array(5).fill('<div class="card ph"><div class="fig-box" style="--ratio:3/2"></div><div class="card-meta">.</div><div class="card-title">.</div></div>').join('')}</div><p class="edit-note">Filled automatically with your other published articles.</p></section>`
      : related && related.length
        ? `<section class="rel"><h2>We Recommend</h2><div class="rel-grid">${related.map((r) => `<a class="card" href="/p/${esc(r.slug)}/"><div class="fig-box" style="--ratio:3/2">${r.hero ? `<img src="${esc(r.hero)}" alt="" loading="lazy">` : ''}</div><div class="card-meta">${esc(r.category)}${r.category && r.author ? ' / ' : ''}${esc(r.author)}</div><div class="card-title">${esc(r.title)}</div></a>`).join('')}</div></section>`
        : '';

    return `
      <div class="art-head">
        ${fld({ tag: 'a', cls: 'crumb', f: 'category', ph: 'Category', val: a.category, edit })}
        ${fld({ tag: 'h1', f: 'title', ph: 'Headline', val: a.title, edit })}
        ${fld({ tag: 'h2', cls: 'standfirst', f: 'subtitle', ph: 'Standfirst / subheadline', val: a.subtitle, edit })}
        <p class="byline">
          <span>Written by</span>
          ${fld({ tag: 'span', cls: 'au', f: 'author', ph: 'Author name', val: a.author, edit })}
          ${when}
          ${a.category || edit ? `<span>in</span><span data-mirror="category">${esc(a.category)}</span>` : ''}
        </p>
      </div>
      ${imageSlot(TPL.hero, a, edit)}
      <div class="art-body">${TPL.body.map((d) => blockHTML(d, a, edit)).join('')}</div>
      <div class="art-after">
        <div class="tags">${tags}</div>
        ${hasAuthorBox ? `<aside class="author">
          <div class="author-av">${imageSlot(TPL.avatar, a, edit)}</div>
          <div><div class="author-name" data-mirror="author">${esc(a.author)}</div>
          ${fld({ cls: 'author-bio', k: 'bio', ph: 'Short author bio', val: a.blocks.bio || '', edit })}</div></aside>` : ''}
      </div>
      ${relHTML}`;
  }

  // ---- public API ----
  function mount(root, a, opts = {}) {
    const edit = !!opts.edit;
    a.blocks = a.blocks || {};
    root.className = 'art' + (edit ? ' edit' : '');
    root.innerHTML = build(a, edit, opts.related);
    processIG();
    if (!edit) return;

    const change = () => opts.onChange && opts.onChange();
    const rerender = (slot, html) => { slot.outerHTML = html; processIG(); };
    const redo = (id, form) => {
      const el = root.querySelector(`[data-slot="${id}"]`); const d = defById(id);
      rerender(el, d.type === 'instagram' ? igSlot(d, a, true, form) : imageSlot(d, a, true));
    };

    // typing
    root.addEventListener('focusin', (e) => {
      const el = e.target;
      if (el.matches && el.matches('.tb[contenteditable]')) {
        document.execCommand('defaultParagraphSeparator', false, 'p');
        if (!el.querySelector('p')) {
          el.innerHTML = '<p><br></p>';
          const r = document.createRange(); r.setStart(el.firstChild, 0); r.collapse(true);
          const s = getSelection(); s.removeAllRanges(); s.addRange(r);
        }
      }
    });
    root.addEventListener('focusout', (e) => {
      const el = e.target;
      if (el.matches && el.matches('[contenteditable]') && !el.textContent.trim()) { el.innerHTML = ''; el.classList.add('is-empty'); }
    });
    root.addEventListener('input', (e) => {
      const el = e.target.closest && e.target.closest('[contenteditable]');
      if (!el) return;
      el.classList.toggle('is-empty', !el.textContent.trim());
      const single = el.dataset.single === '1';
      const val = single ? el.textContent.replace(/\s*\n\s*/g, ' ') : clean(el.innerHTML);
      if (el.dataset.f) {
        a[el.dataset.f] = val;
        root.querySelectorAll(`[data-mirror="${el.dataset.f}"]`).forEach((m) => (m.textContent = val));
      } else if (el.dataset.k) a.blocks[el.dataset.k] = val;
      change();
    });
    root.addEventListener('keydown', (e) => {
      const el = e.target;
      if (!el.matches || !el.matches('[contenteditable]')) return;
      if (e.key === 'Enter' && el.dataset.single === '1') e.preventDefault();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && el.matches('.tb')) {
        e.preventDefault();
        const u = prompt('Link URL (https://…)');
        if (u) document.execCommand('createLink', false, u);
      }
    });
    root.addEventListener('paste', (e) => {
      const el = e.target;
      if (!el.matches || !el.matches('[contenteditable]')) return;
      e.preventDefault();
      const txt = (e.clipboardData || window.clipboardData).getData('text/plain').replace(/\r/g, '');
      if (el.dataset.single === '1') { document.execCommand('insertText', false, txt.replace(/\s*\n+\s*/g, ' ')); return; }
      txt.split(/\n+/).forEach((line, i) => { if (i) document.execCommand('insertParagraph'); document.execCommand('insertText', false, line); });
    });

    // images + instagram
    function pickImage(id, slot) {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/png,image/jpeg,image/webp,image/gif,image/avif';
      inp.onchange = async () => {
        const file = inp.files[0]; if (!file) return;
        slot.classList.add('busy');
        try { a.blocks[id] = await opts.upload(file); change(); redo(id); }
        catch (err) { slot.classList.remove('busy'); alert('Upload failed: ' + (err.message || err)); }
      };
      inp.click();
    }
    root.addEventListener('click', (e) => {
      const slot = e.target.closest('[data-slot]');
      if (!slot) return;
      const id = slot.dataset.slot, type = slot.dataset.type;
      const act = e.target.closest('[data-act]') && e.target.closest('[data-act]').dataset.act;
      if (type === 'image') {
        if (act === 'remove') { delete a.blocks[id]; change(); redo(id); }
        else if (act === 'replace' || (!act && !a.blocks[id] && e.target.closest('.slot-box'))) pickImage(id, slot);
      } else {
        if (act === 'ig-remove') { delete a.blocks[id]; change(); redo(id); }
        else if (act === 'ig-change') redo(id, { prefill: a.blocks[id] });
        else if (act === 'ig-cancel') redo(id);
        else if (!act && !a.blocks[id] && e.target.closest('.slot-box.is-empty-slot')) {
          redo(id, { prefill: '' });
          const inp = root.querySelector(`[data-slot="${id}"] .ig-form input`); if (inp) inp.focus();
        }
      }
    });
    root.addEventListener('submit', (e) => {
      const form = e.target.closest('.ig-form'); if (!form) return;
      e.preventDefault();
      const id = form.closest('[data-slot]').dataset.slot;
      const url = normIG(form.querySelector('input').value);
      if (!url) { form.querySelector('.ig-err').textContent = 'That doesn’t look like an Instagram post URL.'; return; }
      a.blocks[id] = url; change(); redo(id);
    });
  }

  window.Article = { mount, clean, relTime, normIG };
})();
