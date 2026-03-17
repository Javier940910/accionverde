/* ═══════════════════════════════════════════
   VERDES POR ACCIÓN — pages-bg.js
   Shared animated background for all pages
   ═══════════════════════════════════════════ */

// ── CANVAS PARTICLES ─────────────────────
(function(){
  const cvs = document.getElementById('bg-canvas');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  let W, H, pts = [];
  function resize(){ W = cvs.width = window.innerWidth; H = cvs.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  function rand(a,b){ return a + Math.random()*(b-a); }
  for(let i=0;i<75;i++){
    pts.push({ x:rand(0,1), y:rand(0,1), vx:rand(-.00018,.00018), vy:rand(-.0001,.0001),
      r:rand(.5,2), a:rand(.05,.2), pulse:rand(0,Math.PI*2), pulseSpeed:rand(.005,.016) });
  }
  let mx=.5, my=.5;
  window.addEventListener('mousemove', e=>{ mx=e.clientX/W; my=e.clientY/H; });
  function draw(){
    ctx.clearRect(0,0,W,H);
    for(let i=0;i<pts.length;i++){
      for(let j=i+1;j<pts.length;j++){
        const dx=(pts[i].x-pts[j].x)*W, dy=(pts[i].y-pts[j].y)*H;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<110){ const a=(1-d/110)*.055; ctx.beginPath(); ctx.moveTo(pts[i].x*W,pts[i].y*H); ctx.lineTo(pts[j].x*W,pts[j].y*H); ctx.strokeStyle=`rgba(109,191,138,${a})`; ctx.lineWidth=.5; ctx.stroke(); }
      }
    }
    pts.forEach(p=>{
      p.pulse+=p.pulseSpeed;
      const pa=p.a*(0.7+0.3*Math.sin(p.pulse));
      ctx.beginPath(); ctx.arc(p.x*W,p.y*H,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(109,191,138,${pa})`; ctx.fill();
      const dxm=(p.x-mx)*W, dym=(p.y-my)*H, dm=Math.sqrt(dxm*dxm+dym*dym);
      if(dm<140){ p.vx+=(dxm/dm)*.00007; p.vy+=(dym/dm)*.00007; }
      p.x+=p.vx; p.y+=p.vy; p.vx*=.999; p.vy*=.999;
      if(p.x<0)p.x=1; if(p.x>1)p.x=0; if(p.y<0)p.y=1; if(p.y>1)p.y=0;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── LEAF PARTICLES ───────────────────────
(function(){
  const layer = document.getElementById('leaf-layer');
  if (!layer) return;
  const emojis = ['🍃','🌿','🍀','🌱','🌾','🍂'];
  for(let i=0;i<16;i++){
    const el = document.createElement('span');
    el.className = 'lf';
    el.textContent = emojis[i % emojis.length];
    el.style.cssText = `left:${Math.random()*100}%;font-size:${11+Math.random()*20}px;animation-duration:${13+Math.random()*20}s;animation-delay:-${Math.random()*28}s;`;
    layer.appendChild(el);
  }
})();

// ── NAVBAR SCROLL ─────────────────────────
window.addEventListener('scroll', ()=>{
  const nb = document.getElementById('navbar');
  if (nb) nb.classList.toggle('scrolled', window.scrollY > 40);
});

// ── MOBILE NAV ───────────────────────────
function toggleNav(){
  const nl = document.getElementById('nav-links');
  if (nl) nl.classList.toggle('open');
}

// ── SCROLL REVEAL ─────────────────────────
document.addEventListener('DOMContentLoaded', ()=>{
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
});

// ── TOAST ────────────────────────────────
function toast(msg, type){
  const icons={ok:'✅',err:'❌',warn:'⚠️',info:'ℹ️'};
  const c = document.getElementById('toasts');
  if(!c) return;
  const el = document.createElement('div');
  el.className = 'toast-n toast-'+(type||'ok');
  el.innerHTML = '<span>'+(icons[type]||'💬')+'</span><span>'+msg+'</span>';
  c.appendChild(el);
  setTimeout(()=>{ el.style.cssText='opacity:0;transition:opacity .35s'; setTimeout(()=>el.remove(),380); }, 3400);
}
