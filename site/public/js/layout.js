// Injects the shared header + footer (ufosport.cz-style structure) from SITE config.
(function () {
  const S = window.SITE;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const links = (arr) => arr.map((l) => `<a href="${esc(l.h)}">${esc(l.t)}</a>`).join('');

  const header = `
  <header class="hdr">
    <div class="hdr-in">
      <button class="hdr-burger" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>
      <nav class="hdr-nav" aria-label="Main">${links(S.nav)}</nav>
      <a class="hdr-logo" href="/">${esc(S.name)}</a>
      <div class="hdr-right">${links(S.account)}</div>
    </div>
  </header>
  <div class="drawer" hidden>
    <div class="drawer-top"><span class="drawer-title">MENU</span><button class="drawer-close" aria-label="Close">✕</button></div>
    <nav class="drawer-nav">${links(S.nav)}${links(S.account)}</nav>
  </div>`;

  const F = S.footer;
  const col = (c) => `
    <div class="ftr-col">
      <h3>${esc(c.h)}</h3>
      <ul>${(c.links || []).map(([t, h]) => `<li><a href="${esc(h)}">${esc(t)}</a></li>`).join('')}${(c.lines || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </div>`;
  const footer = `
  <footer class="ftr">
    <div class="ftr-news">
      <h2>${esc(F.newsletter.title)}</h2>
      <p>${esc(F.newsletter.text)}</p>
      <form class="news-form" onsubmit="event.preventDefault();this.querySelector('button').textContent='✓'">
        <label>${esc(F.newsletter.label)}<input type="email" required></label>
        <button type="submit">${esc(F.newsletter.button)}</button>
      </form>
      <small>${esc(F.newsletter.note)}</small>
    </div>
    <div class="ftr-cols">${F.cols.map(col).join('')}</div>
    <div class="ftr-bottom">${esc(F.copy)}</div>
  </footer>`;

  const h = document.getElementById('site-header');
  const f = document.getElementById('site-footer');
  if (h) h.innerHTML = header;
  if (f) f.innerHTML = footer;

  const drawer = document.querySelector('.drawer');
  const burger = document.querySelector('.hdr-burger');
  if (drawer && burger) {
    const set = (open) => { drawer.hidden = !open; burger.setAttribute('aria-expanded', open); document.body.classList.toggle('no-scroll', open); };
    burger.addEventListener('click', () => set(drawer.hidden));
    drawer.querySelector('.drawer-close').addEventListener('click', () => set(false));
  }
})();
