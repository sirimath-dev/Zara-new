/* ǫᴜᴇᴇɴ ʜɪʀᴜ </> - shared effects: red mouse trail + ambient music player */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= RED MOUSE TRAIL ================= */
  if (!reduce) {
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9998';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2);
    const resize = () => { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); addEventListener('resize', resize);

    const LIFE = 650;           // ms a trail point stays visible
    let pts = [], sparks = [];
    const add = (x, y) => {
      const t = performance.now();
      pts.push({ x, y, t });
      if (Math.random() < 0.5) sparks.push({ x, y, vx: (Math.random() - .5) * 1.2, vy: (Math.random() - .5) * 1.2, t, s: 1 + Math.random() * 2 });
    };
    addEventListener('mousemove', (e) => add(e.clientX, e.clientY), { passive: true });
    addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) add(t.clientX, t.clientY); }, { passive: true });

    const frame = () => {
      const now = performance.now();
      pts = pts.filter(p => now - p.t < LIFE);
      sparks = sparks.filter(s => now - s.t < LIFE);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const age = (now - b.t) / LIFE;          // 0 new -> 1 old
        const k = 1 - age;
        // skip big jumps (mouse left the window and came back)
        if (Math.hypot(b.x - a.x, b.y - a.y) > 160) continue;
        ctx.strokeStyle = `rgba(255,45,95,${0.85 * k})`;
        ctx.shadowColor = 'rgba(255,45,95,.9)';
        ctx.shadowBlur = 14 * k;
        ctx.lineWidth = 1 + 5 * k;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      ctx.shadowBlur = 0;
      for (const s of sparks) {
        const k = 1 - (now - s.t) / LIFE;
        s.x += s.vx; s.y += s.vy;
        ctx.fillStyle = `rgba(255,120,150,${0.8 * k})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.s * k, 0, 6.283); ctx.fill();
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* ================= MUSIC PLAYER ================= */
  // Put your own track at /music.mp3 (same folder as this page) and it is used automatically.
  // If there is no file, a soft generated ambient loop plays instead.
  const KEY = 'nomo_music';
  const saved = (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
  const state = { on: saved.on !== false, vol: typeof saved.vol === 'number' ? saved.vol : 0.35 };
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

  const box = document.createElement('div');
  box.className = 'mp';
  box.innerHTML =
    '<button class="mp-btn" aria-label="Toggle music"><span class="mp-bars"><i></i><i></i><i></i><i></i></span></button>' +
    '<div class="mp-pop"><span class="mp-t">Ambient</span><input class="mp-vol" type="range" min="0" max="1" step="0.01" aria-label="Volume"></div>';
  document.body.appendChild(box);
  const btn = box.querySelector('.mp-btn'), vol = box.querySelector('.mp-vol'), title = box.querySelector('.mp-t');
  vol.value = state.vol;

  let engine = null, started = false;

  /* --- generated ambient engine (Web Audio) --- */
  function synth() {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ac = new AC();
    const master = ac.createGain(); master.gain.value = 0;
    master.connect(ac.destination);

    // cheap reverb from decaying noise
    const len = ac.sampleRate * 3.2, ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const verb = ac.createConvolver(); verb.buffer = ir;
    const wet = ac.createGain(); wet.gain.value = 0.55;
    const dry = ac.createGain(); dry.gain.value = 0.7;
    verb.connect(wet); wet.connect(master); dry.connect(master);
    const bus = ac.createGain(); bus.connect(dry); bus.connect(verb);

    const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const chords = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 55, 60, 64], [55, 59, 62, 66]]; // Am9 Fmaj7 C G/B feel
    const scale = [69, 72, 74, 76, 79, 81, 84];
    let step = 0, timers = [];

    const pad = (notes, t, dur) => notes.forEach((m, i) => {
      const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
      o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = hz(m); o.detune.value = (Math.random() - .5) * 10;
      f.type = 'lowpass'; f.frequency.value = 900;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.07, t + dur * 0.4);
      g.gain.linearRampToValueAtTime(0, t + dur);
      o.connect(f); f.connect(g); g.connect(bus);
      o.start(t); o.stop(t + dur + 0.1);
    });
    const pluck = (m, t) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = hz(m);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.09, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + 1.7);
    };

    const BAR = 6; // seconds per chord
    const bar = () => {
      const t = ac.currentTime + 0.05;
      pad(chords[step % chords.length], t, BAR + 1.5);
      const bass = ac.createOscillator(), bg = ac.createGain();
      bass.type = 'sine'; bass.frequency.value = hz(chords[step % chords.length][0] - 12);
      bg.gain.setValueAtTime(0, t); bg.gain.linearRampToValueAtTime(0.12, t + 1); bg.gain.linearRampToValueAtTime(0, t + BAR + 0.5);
      bass.connect(bg); bg.connect(bus); bass.start(t); bass.stop(t + BAR + 1);
      for (let i = 0; i < 8; i++) if (Math.random() < 0.65) pluck(scale[Math.floor(Math.random() * scale.length)], t + i * (BAR / 8));
      step++;
    };
    bar();
    timers.push(setInterval(bar, BAR * 1000));

    return {
      setVol: (v) => master.gain.setTargetAtTime(v * 0.9, ac.currentTime, 0.15),
      play: () => { ac.resume(); },
      pause: () => { ac.suspend(); }
    };
  }

  /* --- file engine (if /music.mp3 exists) --- */
  function fileEngine(url) {
    const a = new Audio(url); a.loop = true; a.preload = 'auto';
    return { setVol: (v) => { a.volume = v; }, play: () => a.play().catch(() => {}), pause: () => a.pause() };
  }

  async function boot() {
    if (engine) return;
    try {
      const r = await fetch('music.mp3', { method: 'HEAD' });
      const ok = r.ok && /audio|octet/i.test(r.headers.get('content-type') || '');
      if (ok) { engine = fileEngine('music.mp3'); title.textContent = 'Now playing'; }
    } catch (e) {}
    if (!engine) engine = synth();
    engine.setVol(state.vol);
  }

  const paint = () => { box.classList.toggle('on', state.on && started); btn.setAttribute('aria-pressed', String(state.on)); };

  async function play() { await boot(); engine.setVol(state.vol); engine.play(); started = true; paint(); }
  function pause() { if (engine) engine.pause(); paint(); }

  btn.addEventListener('click', async () => {
    state.on = !state.on; persist();
    if (state.on) await play(); else { pause(); started = false; paint(); }
  });
  vol.addEventListener('input', () => { state.vol = +vol.value; persist(); if (engine) engine.setVol(state.vol); });

  // Browsers block autoplay, so start on the first real interaction (if the user left music on)
  const kick = async (e) => {
    if (e && e.target && e.target.closest && e.target.closest('.mp')) return;
    removeEventListener('pointerdown', kick); removeEventListener('keydown', kick);
    if (state.on && !started) await play();
  };
  addEventListener('pointerdown', kick); addEventListener('keydown', kick);
  paint();
})();