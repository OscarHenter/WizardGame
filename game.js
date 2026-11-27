const hero = document.getElementById("hero");
const dragon = document.getElementById("dragon");
const dragonHpBar = document.getElementById("dragon-hp");
const arena = document.querySelector(".arena");

let combo = 0;
let hp = 3;
let maxHp = 3;
let isDefeated = false;
let particles = [];
let projectiles = [];
let lastTime = performance.now();

function createParticle(x, y, vx, vy, color, size = 8, life = 0.6) {
  const el = document.createElement("div");
  el.style.position = "fixed";
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = "50%";
  el.style.background = color;
  el.style.boxShadow = `0 0 10px ${color}`;
  el.style.pointerEvents = "none";
  el.style.zIndex = "60";
  document.body.appendChild(el);

  particles.push({ el, x, y, vx, vy, age: 0, life });
}

function spawnBurst(target, colors, count = 18) {
  if (!target) return;
  const r = target.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 90 + Math.random() * 220;
    const color = colors[i % colors.length];
    createParticle(
      cx,
      cy,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed - 60,
      color,
      6 + Math.random() * 7,
      0.45 + Math.random() * 0.35
    );
  }
}

function launchProjectile(fromEl, toEl, emoji, onImpact) {
  if (!fromEl || !toEl) return;
  const start = fromEl.getBoundingClientRect();
  const end = toEl.getBoundingClientRect();

  const el = document.createElement("div");
  el.textContent = emoji;
  el.style.position = "fixed";
  el.style.fontSize = "2.2rem";
  el.style.pointerEvents = "none";
  el.style.zIndex = "55";
  document.body.appendChild(el);

  const x0 = start.left + start.width * 0.7;
  const y0 = start.top + start.height * 0.45;
  const x1 = end.left + end.width * 0.3;
  const y1 = end.top + end.height * 0.45;

  projectiles.push({
    el,
    x0,
    y0,
    x1,
    y1,
    t: 0,
    duration: 0.32,
    onImpact
  });
}

function showFloatingLabel(target, text, color, scale = 1) {
  if (!target) return;
  const r = target.getBoundingClientRect();
  const el = document.createElement("div");
  el.textContent = text;
  el.style.position = "fixed";
  el.style.left = `${r.left + r.width / 2}px`;
  el.style.top = `${r.top - 10}px`;
  el.style.transform = `translate(-50%, 0) scale(${scale})`;
  el.style.color = color;
  el.style.fontWeight = "800";
  el.style.fontSize = "1.35rem";
  el.style.textShadow = "0 2px 8px rgba(0,0,0,0.8)";
  el.style.pointerEvents = "none";
  el.style.zIndex = "70";
  document.body.appendChild(el);

  let age = 0;
  const maxAge = 0.75;
  function stepText(now, prev) {
    const dt = (now - prev) / 1000;
    age += dt;
    const p = Math.min(1, age / maxAge);
    el.style.transform = `translate(-50%, ${-45 * p}px) scale(${scale})`;
    el.style.opacity = String(1 - p);
    if (p < 1) {
      requestAnimationFrame((t) => stepText(t, now));
    } else {
      el.remove();
    }
  }
  requestAnimationFrame((t) => stepText(t, performance.now()));
}

function updateHpBar() {
  if (!dragonHpBar) return;
  const pct = Math.max(0, (hp / maxHp) * 100);
  dragonHpBar.style.width = `${pct}%`;
}

function gameLoop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  const t = now / 1000;
  if (hero) {
    const heroBob = Math.sin(t * 4) * 5;
    hero.style.transform = `translateY(${heroBob}px)`;
  }
  if (dragon && !isDefeated) {
    const dragonBob = Math.cos(t * 3.2) * 7;
    const rageScale = 1 + Math.sin(t * 6) * 0.02;
    dragon.style.transform = `translateY(${dragonBob}px) scale(${rageScale})`;
  }

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.t += dt / p.duration;
    const progress = Math.min(1, p.t);
    const arc = Math.sin(progress * Math.PI) * -35;
    const curX = p.x0 + (p.x1 - p.x0) * progress;
    const curY = p.y0 + (p.y1 - p.y0) * progress + arc;

    p.el.style.left = `${curX}px`;
    p.el.style.top = `${curY}px`;
    p.el.style.transform = `translate(-50%, -50%) rotate(${progress * 360}deg)`;

    if (progress >= 1) {
      p.el.remove();
      projectiles.splice(i, 1);
      if (p.onImpact) p.onImpact();
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const pt = particles[i];
    pt.age += dt;
    if (pt.age >= pt.life) {
      pt.el.remove();
      particles.splice(i, 1);
      continue;
    }
    pt.vy += 420 * dt;
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    const alpha = 1 - pt.age / pt.life;
    pt.el.style.left = `${pt.x}px`;
    pt.el.style.top = `${pt.y}px`;
    pt.el.style.opacity = String(alpha);
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

export function onCorrectAnswer() {
  combo++;
  hp = Math.max(0, hp - 1);

  launchProjectile(hero, dragon, combo >= 3 ? "🔥" : "⚡", () => {
    updateHpBar();

    if (dragon) {
      dragon.style.filter = "brightness(2.5) saturate(2)";
      setTimeout(() => {
        dragon.style.filter = "";
      }, 180);
    }

    if (arena) {
      arena.style.transform = "translateX(8px)";
      setTimeout(() => (arena.style.transform = "translateX(-8px)"), 60);
      setTimeout(() => (arena.style.transform = "translateX(0)"), 120);
    }

    spawnBurst(dragon, ["#4ade80", "#facc15", "#38bdf8"], 20);
    const label = combo > 1 ? `-1 HP (${combo}x STREAK!)` : "-1 HP";
    showFloatingLabel(dragon, label, "#4ade80", combo > 1 ? 1.15 : 1);

    if (hp <= 0 && dragon && !isDefeated) {
      isDefeated = true;
      dragon.textContent = "💥";
      spawnBurst(dragon, ["#facc15", "#f97316", "#ef4444", "#4ade80"], 45);
      showFloatingLabel(dragon, "VICTORY!", "#facc15", 1.35);
    }
  });
}

export function onWrongAnswer() {
  combo = 0;

  launchProjectile(dragon, hero, "🔥", () => {
    if (hero) {
      hero.style.filter = "brightness(0.6) sepia(1) hue-rotate(-50deg)";
      setTimeout(() => {
        hero.style.filter = "";
      }, 250);
    }
    if (arena) {
      arena.style.transform = "translateX(-10px)";
      setTimeout(() => (arena.style.transform = "translateX(10px)"), 60);
      setTimeout(() => (arena.style.transform = "translateX(0)"), 120);
    }
    spawnBurst(hero, ["#ef4444", "#fb923c"], 14);
    showFloatingLabel(hero, "DRAGON HIT!", "#f87171", 1.05);
  });
}