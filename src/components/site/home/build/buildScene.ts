/**
 * A modern Indian G+1 house on a 30 × 40 ft plot that builds itself stage by stage:
 * 0 empty plot · 1 excavation · 2 foundation · 3 RCC frame · 4 brickwork · 5 plaster & flooring
 * · 6 doors, windows & paint · 7 finished house at blue hour.
 * Everything is procedural (no downloaded models). `setStage(s)` takes a float 0..7.
 */
import * as THREE from "three";

export interface BuildScene {
  setStage: (s: number) => void;
  /** Slow camera drift (hero / idle). */
  setDrift: (on: boolean) => void;
  resize: () => void;
  render: (t: number) => void;
  dispose: () => void;
}

type Anim =
  | { o: THREE.Object3D; a: number; b: number; m: "grow" | "pop" | "rise" | "show" | "hide" }
  | { o: THREE.Object3D; a: number; b: number; m: "fade"; mat: THREE.Material & { opacity: number } };

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// house: x -4..4, z -5..4 (front = +z), plot x -4.6..4.6, z -5.6..6.6
const HX0 = -4,
  HX1 = 4,
  HZ0 = -5,
  HZ1 = 4;
const PLINTH = 0.45;
const SLAB1 = 3.3; // underside of first slab
const FL1 = 3.45; // first floor level
const SLAB2 = 6.3; // underside of roof slab
const WT = 0.23; // wall thickness
const COLS_X = [-4, 0, 4];
const COLS_Z = [-5, -1, 4];

function brickTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#cfc6b8";
  g.fillRect(0, 0, 256, 128);
  const rows = 8,
    bh = 128 / rows;
  for (let r = 0; r < rows; r++) {
    const off = r % 2 ? 16 : 0;
    for (let x = -32 + off; x < 256; x += 32) {
      const v = 150 + Math.floor(Math.random() * 40);
      g.fillStyle = `rgb(${v},${70 + Math.floor(Math.random() * 20)},${50 + Math.floor(Math.random() * 15)})`;
      g.fillRect(x + 1.5, r * bh + 1.5, 29, bh - 3);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function createBuildScene(
  canvas: HTMLCanvasElement,
  opts: { quality: "high" | "low"; still?: boolean; frame?: "hero" | "build" },
): BuildScene {
  const hq = opts.quality === "high";
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: hq,
    alpha: false,
    preserveDrawingBuffer: !!opts.still,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(hq ? Math.min(2, window.devicePixelRatio) : 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = hq;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const skyDay = new THREE.Color("#2a3a52");
  const skyNight = new THREE.Color("#060a14");
  scene.background = skyDay.clone();
  scene.fog = new THREE.Fog(skyDay.clone(), 40, 95);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 300);

  // ---------- light
  const hemi = new THREE.HemisphereLight("#9db8ff", "#2b2117", 1.15);
  scene.add(hemi);
  const key = new THREE.DirectionalLight("#ffd9a8", 2.6);
  key.position.set(-14, 18, 12);
  key.castShadow = hq;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  Object.assign(key.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70 });
  scene.add(key);
  const rim = new THREE.DirectionalLight("#4d8dff", 1.6);
  rim.position.set(14, 8, -16);
  scene.add(rim);

  // ---------- materials
  const M = (color: string, rough = 0.9, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
  const mats = {
    ground: M("#1b2219", 1),
    lawn: M("#2f4a26", 1),
    soil: M("#4b3a2a", 1, { side: THREE.DoubleSide }),
    soilDark: M("#2c2118", 1),
    pit: new THREE.MeshStandardMaterial({
      color: "#7a5a3e",
      roughness: 1,
      side: THREE.BackSide,
      emissive: new THREE.Color("#2a1a0e"),
    }),
    pcc: M("#8f8b84", 0.95),
    concrete: M("#b3afa7", 0.85),
    rebar: M("#7a3e1d", 0.6, { metalness: 0.4 }),
    brick: M("#b25d42", 0.95),
    plaster: M("#e7e2d8", 0.92, { transparent: true, opacity: 0 }),
    paintWhite: M("#f1eee7", 0.8),
    charcoal: M("#25282d", 0.6),
    wood: M("#9a5f34", 0.6),
    tile: M("#d9d2c4", 0.35, { transparent: true, opacity: 0 }),
    frame: M("#1d2024", 0.4, { metalness: 0.5 }),
    glass: new THREE.MeshStandardMaterial({
      color: "#8fb3d9",
      roughness: 0.08,
      metalness: 0.2,
      transparent: true,
      opacity: 0.55,
      emissive: new THREE.Color("#ffb066"),
      emissiveIntensity: 0,
    }),
    rail: new THREE.MeshStandardMaterial({ color: "#a9c6e4", roughness: 0.05, transparent: true, opacity: 0.3 }),
    stone: M("#6f6a62", 0.9),
    leaf: M("#2e5a2c", 0.9),
    leaf2: M("#3d6b33", 0.9),
    trunk: M("#4a3424", 1),
    peg: M("#d9a21b", 0.6),
    lamp: new THREE.MeshStandardMaterial({ color: "#ffd8a0", emissive: new THREE.Color("#ffb45c"), emissiveIntensity: 0 }),
    car: M("#2f3640", 0.35, { metalness: 0.6 }),
    road: M("#15181c", 0.95),
  };
  const brickTex = brickTexture();

  const anims: Anim[] = [];
  const box = (
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    pivot: "bottom" | "top" | "center" = "bottom",
  ) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (pivot === "bottom") g.translate(0, h / 2, 0);
    if (pivot === "top") g.translate(0, -h / 2, 0);
    const m = new THREE.Mesh(g, mat);
    m.position.set(x, y, z);
    m.castShadow = hq && mat !== mats.glass && mat !== mats.rail;
    m.receiveShadow = hq;
    scene.add(m);
    return m;
  };
  const anim = (o: THREE.Object3D, a: number, b: number, m: "grow" | "pop" | "rise" | "show" | "hide") =>
    anims.push({ o, a, b, m });

  // ---------- site
  // surrounding ground, with the plot left open (so the pits can be seen into)
  box(160, 0.1, 74.4, mats.ground, 0, -0.1, -43.2);
  box(160, 0.1, 73.4, mats.ground, 0, -0.1, 43.3);
  box(75.4, 0.1, 12.2, mats.ground, -42.3, -0.1, 0.5);
  box(75.4, 0.1, 12.2, mats.ground, 42.3, -0.1, 0.5);
  box(160, 0.02, 8, mats.road, 0, -0.06, 10.6); // road in front
  const plotIntact = box(9.2, 0.05, 12.2, mats.lawn, 0, -0.05, 0.5);
  anim(plotIntact, 0.95, 1.0, "hide");

  // ground with holes for the column pits (seen during excavation / foundation)
  const plotShape = new THREE.Shape();
  plotShape.moveTo(-4.6, -5.6);
  plotShape.lineTo(4.6, -5.6);
  plotShape.lineTo(4.6, 6.6);
  plotShape.lineTo(-4.6, 6.6);
  const PIT = 1.9;
  for (const x of COLS_X)
    for (const z of COLS_Z) {
      const h = new THREE.Path();
      h.moveTo(x - PIT / 2, z - PIT / 2);
      h.lineTo(x - PIT / 2, z + PIT / 2);
      h.lineTo(x + PIT / 2, z + PIT / 2);
      h.lineTo(x + PIT / 2, z - PIT / 2);
      plotShape.holes.push(h);
    }
  const holed = new THREE.Mesh(new THREE.ShapeGeometry(plotShape), mats.soil);
  holed.rotation.x = Math.PI / 2;
  holed.position.y = -0.02;
  holed.receiveShadow = hq;
  scene.add(holed);
  anim(holed, 0.95, 1.0, "show");
  anim(holed, 2.95, 3.0, "hide");
  // levelled site after backfill
  const site = box(9.2, 0.05, 12.2, mats.soil, 0, -0.05, 0.5);
  anim(site, 2.95, 3.0, "show");

  // survey pegs and strings (empty plot)
  const pegs = new THREE.Group();
  for (const [x, z] of [
    [-4, -5],
    [4, -5],
    [4, 4],
    [-4, 4],
  ]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7), mats.peg);
    p.position.set(x, 0.35, z);
    pegs.add(p);
  }
  const strMat = new THREE.LineBasicMaterial({ color: "#f5d36b" });
  pegs.add(
    new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(
        [
          [-4, -5],
          [4, -5],
          [4, 4],
          [-4, 4],
          [-4, -5],
        ].map(([x, z]) => new THREE.Vector3(x, 0.6, z)),
      ),
      strMat,
    ),
  );
  scene.add(pegs);
  anim(pegs, 1.6, 1.8, "hide");

  // ---------- 1 excavation: pits + spoil heaps
  COLS_X.forEach((x, i) =>
    COLS_Z.forEach((z, j) => {
      const pit = box(PIT, 1.5, PIT, mats.pit, x, 0, z, "top");
      const k = (i + j) * 0.05;
      anim(pit, 1.0 + k, 1.45 + k, "grow");
      anim(pit, 2.95, 3.0, "hide");
      const heap = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.7, 7), mats.soilDark);
      heap.position.set(x + (x > 0 ? 1.4 : -1.4) * (i === 1 ? 0 : 1), 0.35, z + (i === 1 ? 1.5 : 0.6));
      heap.castShadow = hq;
      scene.add(heap);
      anim(heap, 1.2 + k, 1.6 + k, "pop");
      anim(heap, 2.75, 2.95, "hide");
    }),
  );

  // ---------- 2 foundation: PCC, footing, column starters, backfill, plinth
  COLS_X.forEach((x, i) =>
    COLS_Z.forEach((z, j) => {
      const k = (i + j) * 0.03;
      anim(box(1.7, 0.1, 1.7, mats.pcc, x, -1.5, z), 2.0 + k, 2.15 + k, "rise");
      anim(box(1.3, 0.45, 1.3, mats.concrete, x, -1.4, z), 2.1 + k, 2.35 + k, "grow");
      anim(box(0.3, 1.45 + PLINTH, 0.3, mats.concrete, x, -0.95, z), 2.3 + k, 2.55 + k, "grow");
    }),
  );
  const fill = box(HX1 - HX0, PLINTH, HZ1 - HZ0, mats.soil, 0, 0, (HZ0 + HZ1) / 2);
  anim(fill, 2.65, 2.85, "grow");
  // plinth beams + plinth slab
  for (const z of COLS_Z) anim(box(8.3, 0.3, 0.23, mats.concrete, 0, 0.15, z), 2.75, 2.9, "grow");
  for (const x of COLS_X) anim(box(0.23, 0.3, 9.3, mats.concrete, x, 0.15, -0.5), 2.75, 2.9, "grow");
  anim(box(8.2, 0.1, 9.2, mats.concrete, 0, PLINTH - 0.1, -0.5), 2.85, 3.0, "grow");

  // ---------- 3 RCC frame
  const columns = (y0: number, y1: number, a: number) =>
    COLS_X.forEach((x, i) =>
      COLS_Z.forEach((z, j) => {
        const c = box(0.3, y1 - y0, 0.3, mats.concrete, x, y0, z);
        anim(c, a + (i + j) * 0.03, a + 0.25 + (i + j) * 0.03, "grow");
        // starter bars showing above the column until the slab is cast
        const bars = new THREE.Group();
        for (const [dx, dz] of [
          [-0.09, -0.09],
          [0.09, -0.09],
          [0.09, 0.09],
          [-0.09, 0.09],
        ]) {
          const b = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.8), mats.rebar);
          b.position.set(x + dx, y1 + 0.4, z + dz);
          bars.add(b);
        }
        scene.add(bars);
        anim(bars, a + 0.15, a + 0.25, "show");
        anim(bars, a + 0.5, a + 0.55, "hide");
      }),
    );
  const beams = (yTop: number, a: number) => {
    for (const z of COLS_Z) anim(box(8.3, 0.45, 0.23, mats.concrete, 0, yTop - 0.45, z), a, a + 0.12, "grow");
    for (const x of COLS_X) anim(box(0.23, 0.45, 9.3, mats.concrete, x, yTop - 0.45, -0.5), a, a + 0.12, "grow");
  };
  columns(PLINTH, SLAB1, 3.0);
  beams(SLAB1, 3.28);
  const slab1 = box(8.3, 0.15, 9.3, mats.concrete, 0, SLAB1, -0.5);
  anim(slab1, 3.38, 3.5, "pop");
  const balcony = box(5.2, 0.15, 1.5, mats.concrete, -1.5, SLAB1, 4.75);
  anim(balcony, 3.42, 3.55, "pop");
  columns(FL1, SLAB2, 3.55);
  beams(SLAB2, 3.8);
  const roof = box(9.2, 0.22, 10.9, mats.concrete, 0, SLAB2, 0.2);
  anim(roof, 3.88, 4.0, "pop");

  // ---------- 4 brickwork (with real openings), 5 plaster shells
  type Op = { a: number; b: number; y0: number; y1: number };
  const plasterShells: THREE.Mesh[] = [];
  const wall = (
    axis: "x" | "z",
    fixed: number,
    from: number,
    to: number,
    y0: number,
    y1: number,
    ops: Op[],
    a: number,
    exterior = true,
  ) => {
    // split the wall into pieces around the openings
    const pieces: { a: number; b: number; y0: number; y1: number }[] = [];
    const sorted = [...ops].sort((p, q) => p.a - q.a);
    let cur = from;
    for (const o of sorted) {
      if (o.a > cur) pieces.push({ a: cur, b: o.a, y0, y1 });
      if (o.y0 > y0) pieces.push({ a: o.a, b: o.b, y0, y1: o.y0 });
      if (o.y1 < y1) pieces.push({ a: o.a, b: o.b, y0: o.y1, y1 });
      cur = o.b;
    }
    if (cur < to) pieces.push({ a: cur, b: to, y0, y1 });
    for (const p of pieces) {
      const len = p.b - p.a,
        h = p.y1 - p.y0,
        mid = (p.a + p.b) / 2;
      const tex = brickTex.clone();
      tex.repeat.set(len / 1.0, h / 0.5);
      tex.needsUpdate = true;
      const bm = mats.brick.clone();
      bm.map = tex;
      const [w, d, x, z] = axis === "x" ? [len, WT, mid, fixed] : [WT, len, fixed, mid];
      const m = box(w, h, d, bm, x, p.y0, z);
      const k = (p.y0 - y0) / (y1 - y0 + 0.01);
      anim(m, a + k * 0.25, a + 0.3 + k * 0.25, "grow");
      if (exterior || true) {
        const sh = box(w + 0.03, h, d + 0.03, mats.plaster, x, p.y0, z);
        plasterShells.push(sh);
      }
    }
  };
  // ground floor
  const GF = [PLINTH, SLAB1 - 0.45] as const;
  const FF = [FL1, SLAB2 - 0.45] as const;
  const win = (a: number, b: number, y: number, h = 1.2): Op => ({ a, b, y0: y, y1: y + h });
  wall("x", HZ1, HX0, HX1, ...GF, [
    { a: -3.5, b: -0.7, y0: PLINTH, y1: 2.55 },
    { a: 0.4, b: 1.5, y0: PLINTH, y1: 2.55 },
    win(2.2, 3.6, 1.35),
  ], 4.0);
  wall("x", HZ0, HX0, HX1, ...GF, [win(-3, -1.6, 1.35), win(1, 2.4, 1.35), win(3, 3.6, 2.0, 0.55)], 4.05);
  wall("z", HX0, HZ0, HZ1, ...GF, [win(-1, 1, 1.35)], 4.1);
  wall("z", HX1, HZ0, HZ1, ...GF, [win(-3.5, -2.3, 1.35), win(1.5, 3, 1.35)], 4.1);
  wall("x", -1, HX0, HX1, ...GF, [
    { a: -1, b: -0.1, y0: PLINTH, y1: 2.55 },
    { a: 1, b: 1.9, y0: PLINTH, y1: 2.55 },
  ], 4.15, false);
  wall("z", 0, HZ0, -1, ...GF, [{ a: -2, b: -1.1, y0: PLINTH, y1: 2.55 }], 4.15, false);
  // first floor
  wall("x", HZ1, HX0, HX1, ...FF, [
    { a: -3.6, b: 0.8, y0: FL1, y1: 5.55 },
    win(1.6, 3.4, 4.35),
  ], 4.45);
  wall("x", HZ0, HX0, HX1, ...FF, [win(-3, -1.6, 4.35), win(1, 2.4, 4.35)], 4.5);
  wall("z", HX0, HZ0, HZ1, ...FF, [win(-1, 1, 4.35)], 4.55);
  wall("z", HX1, HZ0, HZ1, ...FF, [win(-3.5, -2.3, 4.35), win(1.5, 3, 4.35)], 4.55);
  wall("x", -1, HX0, HX1, ...FF, [
    { a: -1, b: -0.1, y0: FL1, y1: 5.55 },
    { a: 1, b: 1.9, y0: FL1, y1: 5.55 },
  ], 4.6, false);
  for (const sh of plasterShells) anims.push({ o: sh, a: 5.0, b: 5.45, m: "fade", mat: mats.plaster });
  // flooring
  const tile1 = box(7.8, 0.02, 8.8, mats.tile, 0, PLINTH + 0.001, -0.5);
  const tile2 = box(7.8, 0.02, 8.8, mats.tile, 0, FL1 + 0.001, -0.5);
  for (const t of [tile1, tile2]) anims.push({ o: t, a: 5.35, b: 5.7, m: "fade", mat: mats.tile });

  // ---------- 6 finishing: glass, frames, doors, paint accents, slats, railing
  const glazing = (x0: number, x1: number, y0: number, y1: number, z: number, a: number) => {
    const g = new THREE.Group();
    const gl = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, 0.04), mats.glass);
    gl.position.set((x0 + x1) / 2, (y0 + y1) / 2, z);
    g.add(gl);
    const f = 0.06;
    for (const [w, h, x, y] of [
      [x1 - x0, f, (x0 + x1) / 2, y0],
      [x1 - x0, f, (x0 + x1) / 2, y1],
      [f, y1 - y0, x0, (y0 + y1) / 2],
      [f, y1 - y0, x1, (y0 + y1) / 2],
      [f, y1 - y0, (x0 + x1) / 2, (y0 + y1) / 2],
    ] as const) {
      const fm = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), mats.frame);
      fm.position.set(x, y, z);
      g.add(fm);
    }
    scene.add(g);
    anim(g, a, a + 0.25, "pop");
  };
  const glazingZ = (z0: number, z1: number, y0: number, y1: number, x: number, a: number) => {
    const g = new THREE.Mesh(new THREE.BoxGeometry(0.04, y1 - y0, z1 - z0), mats.glass);
    g.position.set(x, (y0 + y1) / 2, (z0 + z1) / 2);
    scene.add(g);
    anim(g, a, a + 0.25, "pop");
  };
  // front glazing
  glazing(-3.5, -0.7, PLINTH, 2.55, HZ1 + 0.02, 6.0);
  glazing(2.2, 3.6, 1.35, 2.55, HZ1 + 0.02, 6.05);
  glazing(-3.6, 0.8, FL1, 5.55, HZ1 + 0.02, 6.1);
  glazing(1.6, 3.4, 4.35, 5.55, HZ1 + 0.02, 6.1);
  // back / sides
  for (const [x0, x1] of [
    [-3, -1.6],
    [1, 2.4],
  ]) {
    glazing(x0, x1, 1.35, 2.55, HZ0 - 0.02, 6.1);
    glazing(x0, x1, 4.35, 5.55, HZ0 - 0.02, 6.15);
  }
  for (const y of [1.35, 4.35]) {
    glazingZ(-1, 1, y, y + 1.2, HX0 - 0.02, 6.15);
    glazingZ(-3.5, -2.3, y, y + 1.2, HX1 + 0.02, 6.15);
    glazingZ(1.5, 3, y, y + 1.2, HX1 + 0.02, 6.15);
  }
  // main door (wood)
  anim(box(1.1, 2.1, 0.06, mats.wood, 0.95, PLINTH, HZ1 + 0.03), 6.05, 6.3, "pop");
  // dark frame band around the first floor + roof fascia
  const fascia = box(9.24, 0.24, 10.94, mats.charcoal, 0, SLAB2 - 0.01, 0.2);
  anim(fascia, 6.1, 6.4, "pop");
  const band = box(5.24, 0.17, 1.54, mats.charcoal, -1.5, SLAB1 - 0.01, 4.75);
  anim(band, 6.1, 6.4, "pop");
  // timber slats on the first-floor front (right part)
  const slats = new THREE.Group();
  for (let x = 1.25; x <= 3.85; x += 0.14) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.06, SLAB2 - FL1, 0.1), mats.wood);
    s.position.set(x, (FL1 + SLAB2) / 2, HZ1 + 0.2);
    s.castShadow = hq;
    slats.add(s);
  }
  scene.add(slats);
  anim(slats, 6.2, 6.5, "grow");
  // stone cladding on the ground-floor right side
  anim(box(2.6, SLAB1 - PLINTH, 0.06, mats.stone, 2.7, PLINTH, HZ1 + 0.05), 6.15, 6.45, "grow");
  // glass railing on the balcony
  const rail = new THREE.Group();
  for (const [w, d, x, z] of [
    [5.2, 0.03, -1.5, 5.48],
    [0.03, 1.5, -4.08, 4.75],
    [0.03, 1.5, 1.08, 4.75],
  ] as const) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(w, 1.0, d), mats.rail);
    r.position.set(x, FL1 + 0.5, z);
    rail.add(r);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.04, d + 0.04), mats.frame);
    cap.position.set(x, FL1 + 1.0, z);
    rail.add(cap);
  }
  scene.add(rail);
  anim(rail, 6.3, 6.55, "pop");
  // paint: white over plaster
  const paint = mats.plaster;

  // ---------- 7 site works + landscaping
  const boundary = new THREE.Group();
  const bw = (w: number, d: number, x: number, z: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.1, d), mats.charcoal);
    m.position.set(x, 0.55, z);
    m.castShadow = hq;
    boundary.add(m);
  };
  bw(0.2, 12.2, -4.6, 0.5);
  bw(0.2, 12.2, 4.6, 0.5);
  boundary.children.slice(0, 2).forEach((m) => {
    m.scale.y = 0.7;
    m.position.y = 0.385;
  });
  bw(9.4, 0.2, 0, -5.6);
  // low front wall so the house stays in view
  const fw = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.55, 0.2), mats.charcoal);
  fw.position.set(-2.5, 0.27, 6.6);
  boundary.add(fw);
  scene.add(boundary);
  anim(boundary, 6.4, 6.75, "grow");
  // lawn back in the front setback, paving to the door, car in the porch
  const lawn = box(3.6, 0.04, 2.3, mats.lawn, -2.6, 0, 5.4);
  anim(lawn, 6.6, 6.85, "pop");
  const paving = box(4.2, 0.05, 2.5, mats.stone, 2.3, 0, 5.3);
  anim(paving, 6.55, 6.8, "pop");
  const car = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.6, 3.9), mats.car);
  body.position.y = 0.5;
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 2.0), mats.car);
  top.position.set(0, 1.05, -0.2);
  car.add(body, top);
  void car;
  // shrubs and trees
  const greens = new THREE.Group();
  const shrub = (x: number, z: number, r: number) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), Math.random() > 0.5 ? mats.leaf : mats.leaf2);
    s.position.set(x, r * 0.8, z);
    s.castShadow = hq;
    greens.add(s);
  };
  for (const [x, z, r] of [
    [-4.1, 5.9, 0.45],
    [-3.2, 6.1, 0.35],
    [-0.9, 6.1, 0.4],
    [-4.2, 3.0, 0.4],
    [-4.2, -3.5, 0.45],
    [4.2, -4.8, 0.4],
  ])
    shrub(x, z, r);
  const tree = (x: number, z: number, s: number) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.18 * s, 3 * s), mats.trunk);
    t.position.set(x, 1.5 * s, z);
    greens.add(t);
    for (const [dx, dy, dz, r] of [
      [0, 3.4, 0, 1.4],
      [0.8, 2.9, 0.3, 1.0],
      [-0.7, 3.0, -0.3, 1.1],
    ]) {
      const l = new THREE.Mesh(new THREE.SphereGeometry(r * s, 14, 12), mats.leaf);
      l.position.set(x + dx * s, dy * s, z + dz * s);
      l.castShadow = hq;
      greens.add(l);
    }
  };
  tree(-8.8, -1.5, 1.25);
  tree(7.8, -3, 1.4);
  tree(-8.5, -6, 1.1);
  scene.add(greens);
  anim(greens, 6.7, 7.0, "pop");
  // garden lamps + warm interior light
  const lamps = new THREE.Group();
  for (const [x, z] of [
    [-1.2, 6.3],
    [0.9, 4.6],
    [-4.3, 4.5],
    [4.3, 4.5],
  ]) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), mats.lamp);
    l.position.set(x, 0.25, z);
    lamps.add(l);
  }
  scene.add(lamps);
  anim(lamps, 6.8, 6.9, "show");
  const warm: THREE.PointLight[] = [];
  for (const [x, y, z] of [
    [-2, 1.8, 2.5],
    [2.5, 1.8, 2.5],
    [-1.4, 4.8, 2.5],
    [2.4, 4.8, 2.5],
  ]) {
    const p = new THREE.PointLight("#ffb46b", 0, 9, 1.6);
    p.position.set(x, y, z);
    scene.add(p);
    warm.push(p);
  }
  const porch = new THREE.SpotLight("#ffc98a", 0, 12, 0.7, 0.6, 1.2);
  porch.position.set(1, 3.2, 5);
  porch.target.position.set(1, 0, 5.5);
  scene.add(porch, porch.target);

  // stars at night
  const starGeo = new THREE.BufferGeometry();
  const pts: number[] = [];
  for (let i = 0; i < 900; i++) {
    const th = Math.random() * Math.PI * 2,
      ph = Math.random() * 0.45 * Math.PI;
    pts.push(120 * Math.cos(th) * Math.cos(ph), 8 + 120 * Math.sin(ph), 120 * Math.sin(th) * Math.cos(ph));
  }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  const starMat = new THREE.PointsMaterial({ color: "#cfe0ff", size: 0.35, transparent: true, opacity: 0, fog: false });
  scene.add(new THREE.Points(starGeo, starMat));

  // ---------- camera path (one key per stage)
  const KEYS: [THREE.Vector3, THREE.Vector3][] = [
    [new THREE.Vector3(16, 13, 20), new THREE.Vector3(0, 0, 0.5)],
    [new THREE.Vector3(11, 10, 14), new THREE.Vector3(0, -0.6, 0)],
    [new THREE.Vector3(10, 7.5, 12.5), new THREE.Vector3(0, -0.3, 0)],
    [new THREE.Vector3(15, 10, 15), new THREE.Vector3(0, 2.6, 0)],
    [new THREE.Vector3(16, 8.5, 19), new THREE.Vector3(0, 2.8, 0.5)],
    [new THREE.Vector3(12, 6.5, 19), new THREE.Vector3(0, 3, 1)],
    [new THREE.Vector3(-10, 5, 15), new THREE.Vector3(0, 3.1, 1)],
    [new THREE.Vector3(-8.5, 2.3, 17.5), new THREE.Vector3(-0.2, 3.3, 1.2)],
  ];
  let stage = 0;
  let drift = false;
  const camPos = new THREE.Vector3();
  const camTgt = new THREE.Vector3();

  const animated = [...new Set(anims.map((x) => x.o))];
  const apply = (s: number) => {
    // every rule can only switch an object off, so scrubbing back and forth always gives the same picture
    for (const o of animated) o.visible = true;
    for (const an of anims) {
      const k = an.b > an.a ? ease(clamp((s - an.a) / (an.b - an.a))) : s >= an.a ? 1 : 0;
      const o = an.o;
      switch (an.m) {
        case "grow":
          o.visible &&= k > 0.001;
          o.scale.y = Math.max(0.001, k);
          break;
        case "pop":
          o.visible &&= k > 0.02;
          o.scale.setScalar(Math.max(0.001, 0.6 + 0.4 * k));
          break;
        case "rise":
          o.visible &&= k > 0.001;
          o.position.y = (o.userData.y0 ??= o.position.y) + (1 - k) * 1.5;
          break;
        case "show":
          o.visible &&= s >= an.a;
          break;
        case "hide":
          o.visible &&= s < an.b;
          break;
        case "fade":
          o.visible &&= s > an.a;
          break;
      }
    }
    // shared fades (one material each)
    mats.plaster.opacity = ease(clamp((s - 5.0) / 0.45));
    mats.plaster.transparent = mats.plaster.opacity < 0.99;
    mats.plaster.color.set(s > 6.0 ? "#f1eee7" : "#ddd7cb").lerp(new THREE.Color("#f1eee7"), clamp((s - 6) / 0.4));
    mats.tile.opacity = ease(clamp((s - 5.35) / 0.35));
    void paint;
    // night falls and the lights come on
    const night = ease(clamp((s - 6.6) / 0.4));
    (scene.background as THREE.Color).copy(skyDay).lerp(skyNight, night);
    (scene.fog as THREE.Fog).color.copy(scene.background as THREE.Color);
    hemi.intensity = lerp(1.15, 0.45, night);
    key.intensity = lerp(2.6, 0.9, night);
    key.color.set("#ffd9a8").lerp(new THREE.Color("#8fb2ff"), night);
    rim.intensity = lerp(1.6, 2.4, night);
    mats.glass.emissiveIntensity = lerp(0, 1.25, night);
    mats.glass.opacity = lerp(0.55, 0.85, night);
    mats.lamp.emissiveIntensity = lerp(0, 3, night);
    starMat.opacity = night * 0.9;
    for (const p of warm) p.intensity = lerp(0, 9, night);
    porch.intensity = lerp(0, 25, night);
  };

  const placeCamera = (t: number) => {
    const s = Math.min(6.999, Math.max(0, stage));
    const i = Math.floor(s);
    const k = ease(s - i);
    camPos.copy(KEYS[i][0]).lerp(KEYS[i + 1][0], k);
    camTgt.copy(KEYS[i][1]).lerp(KEYS[i + 1][1], k);
    if (stage >= 7) {
      camPos.copy(KEYS[7][0]);
      camTgt.copy(KEYS[7][1]);
    }
    if (drift) {
      const a = t * 0.00006;
      const r = Math.hypot(camPos.x, camPos.z);
      const ang = Math.atan2(camPos.z, camPos.x) + Math.sin(a) * 0.35;
      camPos.x = Math.cos(ang) * r;
      camPos.z = Math.sin(ang) * r;
      camPos.y += Math.sin(a * 1.7) * 0.4;
    }
    // narrow (portrait) screens: step back so the whole house stays in frame
    if (camera.aspect < 1.25) {
      const k = Math.min(2.1, Math.pow(1.25 / camera.aspect, 0.95));
      camPos.sub(camTgt).multiplyScalar(k).add(camTgt);
    }
    camera.position.copy(camPos);
    camera.lookAt(camTgt);
  };

  const resize = () => {
    const w = canvas.clientWidth || 1,
      h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the house in frame on tall (phone) screens
    camera.fov = 32;
    // hero: the house sits right of centre, leaving room for the headline on wide screens
    if (opts.frame === "hero" && w / h > 1.2) camera.setViewOffset(w, h, -w * 0.2, -h * 0.04, w, h);
    // portrait: hero house high (copy sits below it); build stages low (stage text sits above)
    else if (w / h < 0.9) camera.setViewOffset(w, h, 0, (opts.frame === "hero" ? 0.17 : -0.12) * h, w, h);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  resize();
  apply(0);

  return {
    setStage: (s) => {
      stage = s;
      apply(s);
    },
    setDrift: (on) => {
      drift = on;
    },
    resize,
    render: (t) => {
      placeCamera(t);
      renderer.render(scene, camera);
    },
    dispose: () => {
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mm = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mm)) mm.forEach((x) => x.dispose());
        else mm?.dispose?.();
      });
      brickTex.dispose();
      renderer.dispose();
    },
  };
}
