import React from 'react';
import './NightScene.css';

/* ─────────────────────────────────────────────────────────────
   NightScene — the existing painting plus living environment
   layers. Each layer is its own component, so it's easy to tune.
   Positions are % of the painted scene (see NightScene.css).
   ───────────────────────────────────────────────────────────── */

// Deterministic pseudo-random → stable layout across renders
const rnd = (i, s) => {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/* ── 1. Clouds ─────────────────────────────────────────────── */
const WISPS = [
  // zone, top%, height%, duration(s), delay(s), opacity
  ['mid', 13, 9, 40, -6, 0.32],   // back layer — slowest
  ['mid', 23, 8, 40, -26, 0.28],
  ['mid', 35, 10, 26, -8, 0.4],   // middle layer
  ['mid', 45, 9, 26, -20, 0.34],
  ['low', 62, 9, 18, -3, 0.42],   // front layer — fastest
  ['low', 70, 8, 18, -12, 0.36],
];

function Clouds() {
  const track = (w, i) => (
    <div key={i} className="fx-track"
      style={{ top: `${w[1]}%`, height: `${w[2]}%`, animationDuration: `${w[3]}s`, animationDelay: `${w[4]}s`, opacity: w[5] }}>
      <div className="fx-wisp" style={{ animationDelay: `${-i * 2.3}s` }} />
    </div>
  );
  return (
    <>
      {/* the painted clouds themselves, in three depth layers */}
      <div className="fx-img fx-clouds-back" />
      <div className="fx-img fx-clouds-mid" />
      <div className="fx-img fx-clouds-front" />
      {/* soft mist carried continuously by the wind */}
      <div className="fx-zone fx-zone-mid">{WISPS.map((w, i) => w[0] === 'mid' && track(w, i))}</div>
      <div className="fx-zone fx-zone-low">{WISPS.map((w, i) => w[0] === 'low' && track(w, i))}</div>
    </>
  );
}

/* ── 2. Stars ──────────────────────────────────────────────── */
// Only place stars in open, dark sky (not on clouds or the moon)
const inOpenSky = (x, y) => {
  if (x < 10 || x > 97) return false;
  if (y > 44) return false;
  if (x > 18 && x < 46 && y < 12) return false;          // top clouds
  if (x > 56 && x < 80 && y < 34) return false;          // moon
  if (x > 62 && y > 18) return false;                     // right cloud mass
  if (x > 46 && x < 66 && y > 28) return false;          // mid cloud
  return true;
};

const STARS = [];
for (let i = 0; STARS.length < 55 && i < 600; i++) {
  const x = rnd(i, 1) * 100;
  const y = rnd(i, 2) * 46;
  if (!inOpenSky(x, y)) continue;
  const diag = rnd(i, 8) > 0.6;
  STARS.push({
    x, y,
    size: 1 + rnd(i, 3) * 1.8,
    o: 0.5 + rnd(i, 4) * 0.45,
    tw: 6 + rnd(i, 5) * 10,       // twinkle cycle 6–16s
    twd: -rnd(i, 6) * 16,
    dr: 14 + rnd(i, 7) * 18,      // drift cycle 14–32s
    drd: -rnd(i, 9) * 30,
    dx: -(2 + rnd(i, 10) * 4),    // drift left 2–6px
    dy: diag ? (rnd(i, 11) - 0.5) * 6 : 0,
  });
}

const SHOOTING = [
  { x: 56, y: 7, d: 19, delay: 3 },
  { x: 92, y: 3, d: 27, delay: 13 },
  { x: 46, y: 20, d: 33, delay: 24 },
];

function Stars() {
  return (
    <>
      {STARS.map((s, i) => (
        <span key={i} className="fx-star" style={{
          left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size,
          '--o': s.o, '--tw': `${s.tw}s`, '--twd': `${s.twd}s`,
          '--dr': `${s.dr}s`, '--drd': `${s.drd}s`, '--dx': `${s.dx}px`, '--dy': `${s.dy}px`,
        }} />
      ))}
      {SHOOTING.map((s, i) => (
        <span key={i} className="fx-shoot"
          style={{ left: `${s.x}%`, top: `${s.y}%`, '--d': `${s.d}s`, '--delay': `${s.delay}s` }} />
      ))}
    </>
  );
}

/* ── 3. Moon ───────────────────────────────────────────────── */
function Moon() {
  return (
    <>
      <div className="fx-moon-glow" />
      <div className="fx-moon-halo" />
      <div className="fx-moon-bright" />
    </>
  );
}

/* ── 4 & 5. Wind on hair, leaves, plants ───────────────────── */
function Wind() {
  return (
    <>
      <div className="fx-img fx-leaf-l" />
      <div className="fx-img fx-leaf-r" />
      <div className="fx-img fx-plant-a" />
      <div className="fx-img fx-plant-b" />
      <div className="fx-img fx-hair-a" />
      <div className="fx-img fx-hair-b" />
    </>
  );
}

const FIREFLIES = Array.from({ length: 9 }, (_, i) => {
  const right = i >= 6;
  return {
    x: right ? 84 + rnd(i, 21) * 12 : 4 + rnd(i, 21) * 40,
    y: 80 + rnd(i, 22) * 16,
    d: 9 + rnd(i, 23) * 8,
    delay: -rnd(i, 24) * 17,
  };
});

function Fireflies() {
  return FIREFLIES.map((f, i) => (
    <span key={i} className="fx-firefly"
      style={{ left: `${f.x}%`, top: `${f.y}%`, '--d': `${f.d}s`, '--delay': `${f.delay}s` }} />
  ));
}

/* ── 6. Lanterns ───────────────────────────────────────────── */
const LANTERNS = [
  // x%, y%, glow size%, flame size%, duration, delay
  [6.5, 84, 11, 3, 2.9, 0],
  [94.8, 91, 11, 3, 3.4, -1.2],
  [1.2, 63, 6, 1.8, 2.6, -0.7],
  [96.8, 64.8, 6, 1.8, 3.1, -1.9],
  [52.5, 70, 5, 1.6, 3.7, -2.4],
  [16.5, 92.5, 3.5, 1.1, 2.4, -0.4],
];

function Lanterns() {
  return LANTERNS.map(([x, y, g, f, d, delay], i) => (
    <React.Fragment key={i}>
      <div className="fx-lantern" style={{ left: `${x}%`, top: `${y}%`, width: `${g}%`, '--d': `${d}s`, '--delay': `${delay}s` }} />
      <div className="fx-flame" style={{ left: `${x}%`, top: `${y}%`, width: `${f}%`, '--d': `${d * 0.47}s`, '--delay': `${delay * 0.6}s` }} />
    </React.Fragment>
  ));
}

/* ── 7. City lights ────────────────────────────────────────── */
const CITY = Array.from({ length: 18 }, (_, i) => ({
  x: 37 + rnd(i, 31) * 38,
  y: 64 + rnd(i, 32) * 13,
  s: 2 + rnd(i, 33) * 1.4,
  d: 3 + rnd(i, 34) * 5,
  delay: -rnd(i, 35) * 8,
}));

function CityLights() {
  return CITY.map((c, i) => (
    <span key={i} className="fx-city"
      style={{ left: `${c.x}%`, top: `${c.y}%`, width: c.s, height: c.s, '--d': `${c.d}s`, '--delay': `${c.delay}s` }} />
  ));
}

/* ── Scene ─────────────────────────────────────────────────── */
export default function NightScene() {
  return (
    <div className="nz-scene" aria-hidden="true">
      <div className="nz-bg" />
      <Stars />
      <Moon />
      <Clouds />
      <CityLights />
      <Wind />
      <Lanterns />
      <Fireflies />
    </div>
  );
}
