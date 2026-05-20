/* ============================================================
   Luminous starfield — brighter, lighter, more stars,
   with an extra glow halo around the hero title.
   Add data-glow-y="0.42" on <body> to position the title halo
   (fraction of viewport height). Default 0.40.
   ============================================================ */
(function () {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr, stars = [], glints = [];
  const glowY = parseFloat(document.body.getAttribute('data-glow-y')) || 0.40;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // density scaled to area — plenty of stars
    const count = Math.round((w * h) / 1100);
    stars = [];
    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 2.2) * 1.5 + 0.3;
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r,
        base: rand(0.45, 1.0),
        tw: rand(0.6, 2.4),
        ph: rand(0, Math.PI * 2),
        hue: Math.random() < 0.18 ? 'gold' : (Math.random() < 0.4 ? 'blue' : 'white')
      });
    }
    // brighter sparkle glints (cross flares)
    glints = [];
    const gc = Math.round((w * h) / 90000);
    for (let i = 0; i < gc; i++) {
      glints.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.85,
        r: rand(1.4, 2.6),
        tw: rand(0.4, 1.1),
        ph: rand(0, Math.PI * 2),
        gold: Math.random() < 0.5
      });
    }
  }

  function colorFor(hue, a) {
    if (hue === 'gold') return `rgba(247,222,140,${a})`;
    if (hue === 'blue') return `rgba(170,205,255,${a})`;
    return `rgba(255,255,255,${a})`;
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);

    // ---- base luminous azure gradient (painted by the canvas itself,
    //      so it works no matter what your site's CSS does) ----
    const cx = w / 2, cy = h * glowY;
    const bg = ctx.createRadialGradient(cx, -h * 0.1, 0, cx, -h * 0.1, Math.max(w, h) * 1.25);
    bg.addColorStop(0,    '#4a89d8'); // lighter, brighter top
    bg.addColorStop(0.32, '#2e60ac');
    bg.addColorStop(0.70, '#1b407e');
    bg.addColorStop(1,    '#14346f'); // deep at the edges/bottom
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // luminous halo around the title area
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.55);
    halo.addColorStop(0, 'rgba(150,195,255,0.30)');
    halo.addColorStop(0.28, 'rgba(120,170,245,0.16)');
    halo.addColorStop(0.6, 'rgba(90,140,220,0.05)');
    halo.addColorStop(1, 'rgba(90,140,220,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);

    // warm gold breath right at the title
    const warm = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.30);
    warm.addColorStop(0, 'rgba(247,218,128,0.10)');
    warm.addColorStop(1, 'rgba(247,218,128,0)');
    ctx.fillStyle = warm;
    ctx.fillRect(0, 0, w, h);

    // base stars
    for (const s of stars) {
      const tw = 0.55 + 0.45 * Math.sin(t * 0.001 * s.tw + s.ph);
      const a = Math.min(1, s.base * tw + 0.12);
      ctx.beginPath();
      ctx.fillStyle = colorFor(s.hue, a);
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // bright sparkle glints with cross flare
    for (const g of glints) {
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.001 * g.tw + g.ph));
      const a = tw;
      const col = g.gold ? `rgba(247,222,140,${a})` : `rgba(220,235,255,${a})`;
      // glow
      const grd = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r * 6);
      grd.addColorStop(0, col);
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r * 6, 0, Math.PI * 2); ctx.fill();
      // core + cross
      ctx.strokeStyle = col; ctx.lineWidth = 0.8;
      const L = g.r * 4.5 * tw;
      ctx.beginPath();
      ctx.moveTo(g.x - L, g.y); ctx.lineTo(g.x + L, g.y);
      ctx.moveTo(g.x, g.y - L); ctx.lineTo(g.x, g.y + L);
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  build();
  requestAnimationFrame(draw);
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); });
})();
