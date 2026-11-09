/* Light Christmas snowfall on a fixed canvas.
   Not started at all for prefers-reduced-motion. Visitors can switch it off (remembered). */
const KEY = 'kubik_snow';
let canvas, ctx, flakes = [], raf = 0, toggle;

const isOff = () => { try { return localStorage.getItem(KEY) === 'off'; } catch { return false; } };

function makeFlakes() {
  const n = window.innerWidth < 600 ? 35 : 70;
  flakes = Array.from({ length: n }, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    r: 1.5 + Math.random() * 3, v: .4 + Math.random() * .9, drift: Math.random() * Math.PI * 2,
  }));
}
function resize() {
  canvas.width = window.innerWidth; canvas.height = window.innerHeight; makeFlakes();
}
function frame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const f of flakes) {
    f.y += f.v; f.drift += .01; f.x += Math.sin(f.drift) * .4;
    if (f.y > canvas.height + 5) { f.y = -5; f.x = Math.random() * canvas.width; }
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.fill();
    ctx.strokeStyle = 'rgba(107,74,53,.22)'; ctx.lineWidth = 1; ctx.stroke(); // faint edge so flakes show on cream
  }
  raf = requestAnimationFrame(frame);
}
function run() {
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'deco-canvas'; canvas.setAttribute('aria-hidden', 'true');
    ctx = canvas.getContext('2d'); document.body.appendChild(canvas);
    window.addEventListener('resize', resize);
  }
  canvas.hidden = false; resize(); cancelAnimationFrame(raf); frame();
}
function halt() { cancelAnimationFrame(raf); if (canvas) canvas.hidden = true; }

export function start() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  toggle = document.createElement('button');
  toggle.className = 'deco-toggle';
  const sync = (on) => { toggle.textContent = on ? '❄ ✕' : '❄'; toggle.setAttribute('aria-pressed', String(on)); toggle.setAttribute('aria-label', 'Snowfall'); };
  toggle.addEventListener('click', () => {
    const turnOff = !isOff();
    try { localStorage.setItem(KEY, turnOff ? 'off' : 'on'); } catch { /* ignore */ }
    sync(!turnOff); turnOff ? halt() : run();
  });
  document.body.appendChild(toggle);
  sync(!isOff());
  if (!isOff()) run();
  document.addEventListener('visibilitychange', () => { if (document.hidden) halt(); else if (!isOff()) run(); });
}
export function stop() { halt(); toggle?.remove(); }
