(() => {
  'use strict';
  const canvas = document.getElementById('tetromino-canvas');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const shapes = [ [[0,0],[1,0],[2,0],[3,0]], [[0,0],[1,0],[0,1],[1,1]], [[1,0],[0,1],[1,1],[2,1]], [[1,0],[2,0],[0,1],[1,1]], [[0,0],[1,0],[1,1],[2,1]], [[0,0],[0,1],[1,1],[2,1]], [[2,0],[0,1],[1,1],[2,1]] ];
  const colors = ['#00f0f0','#f0f000','#a000f0','#00f000','#f00000','#0000f0','#f0a000'];
  let width = 0, height = 0, frame = 0, last = 0, inView = true;
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('motion-paused');
  let pieces = [];
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    pieces = Array.from({ length: width < 768 ? 5 : 9 }, (_, i) => ({
      x: (i % 2 ? .83 + Math.random() * .11 : .03 + Math.random() * .12) * width,
      y: Math.random() * height, size: 12 + Math.random() * 8, type: i % 7,
      speed: 7 + Math.random() * 9, angle: (Math.random() - .5) * .6
    }));
    draw(0);
  }
  function draw(delta) {
    ctx.clearRect(0, 0, width, height);
    pieces.forEach(piece => {
      piece.y += piece.speed * delta;
      if (piece.y > height + 70) piece.y = -80;
      ctx.save(); ctx.translate(piece.x, piece.y); ctx.rotate(piece.angle);
      ctx.fillStyle = colors[piece.type];
      shapes[piece.type].forEach(([x,y]) => ctx.fillRect(x * piece.size, y * piece.size, piece.size - 1.5, piece.size - 1.5));
      ctx.restore();
    });
  }
  function tick(now) {
    draw(last ? Math.min((now - last) / 1000, .05) : 0);
    last = now; frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    if (!paused && inView && !document.hidden) frame = requestAnimationFrame(tick);
  }
  addEventListener('tetris-motion', event => { paused = event.detail.paused; sync(); });
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); }).observe(canvas);
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else addEventListener('resize', resize);
  resize(); sync();
})();
