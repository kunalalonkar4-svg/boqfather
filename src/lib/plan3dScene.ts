/**
 * "3D floor plan" look: a cut-away floor seen from above at an angle — white walls with dark tops,
 * wooden and tiled floors, and furnished rooms (beds, sofa, dining, kitchen, bathroom fittings, car).
 * The furniture is the same set the 2D plan draws, raised into simple models.
 */
import * as THREE from "three";
import type { Side, SketchRect } from "@/engine";
import { planPrimitives, type Furniture } from "@/lib/planDraw";
import { floorBlocks } from "@/lib/plan3d";

export const CUT_H = 1.15; // walls are cut here, so the rooms can be seen from above
const LEVEL = 3.05;

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, rep: [number, number]) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...rep);
  t.anisotropy = 4;
  return t;
}
const rnd = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

export interface Materials {
  [k: string]: THREE.Material;
}
export function makeMaterials(): Materials {
  const r = rnd(7);
  const wood = canvasTex(
    512,
    512,
    (g) => {
      const pw = 64;
      for (let x = 0; x < 512; x += pw)
        for (let y = -Math.floor(r() * 300); y < 512; ) {
          const len = 180 + r() * 220;
          const v = 150 + r() * 35;
          g.fillStyle = `rgb(${v + 30},${v - 8},${v - 52})`;
          g.fillRect(x, y, pw - 2, len - 2);
          g.strokeStyle = "rgba(90,55,25,0.18)";
          for (let k = 0; k < 6; k++) {
            g.beginPath();
            g.moveTo(x + 6 + k * 9 + r() * 4, y);
            g.lineTo(x + 6 + k * 9 + r() * 4, y + len);
            g.stroke();
          }
          y += len;
        }
    },
    [1, 1],
  );
  const stone = canvasTex(
    512,
    512,
    (g) => {
      g.fillStyle = "#c8b190";
      g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) {
          const v = 226 + Math.floor(r() * 12);
          g.fillStyle = `rgb(${v},${v - 22},${v - 52})`;
          g.fillRect(i * 128 + 2, j * 128 + 2, 124, 124);
        }
    },
    [1, 1],
  );
  const blue = canvasTex(
    256,
    256,
    (g) => {
      g.fillStyle = "#cfe0ea";
      g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++) {
          const v = Math.floor(r() * 18);
          g.fillStyle = `rgb(${46 + v},${118 + v},${170 + v})`;
          g.fillRect(i * 32 + 1, j * 32 + 1, 30, 30);
        }
    },
    [1, 1],
  );
  const pave = canvasTex(
    256,
    256,
    (g) => {
      g.fillStyle = "#9f9b93";
      g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) {
          const v = 178 + Math.floor(r() * 22);
          g.fillStyle = `rgb(${v},${v - 2},${v - 6})`;
          g.fillRect(i * 64 + 2, j * 64 + 2, 60, 60);
        }
    },
    [1, 1],
  );
  const tile = canvasTex(
    256,
    256,
    (g) => {
      g.fillStyle = "#d9d9d6";
      g.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) {
          const v = 228 + Math.floor(r() * 14);
          g.fillStyle = `rgb(${v},${v},${v - 3})`;
          g.fillRect(i * 64 + 1.5, j * 64 + 1.5, 61, 61);
        }
    },
    [1, 1],
  );
  const S = (color: string, rough = 0.8, extra: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra });
  return {
    wall: S("#f4f3f0", 0.9),
    cap: S("#26282b", 0.7),
    column: S("#f4f3f0", 0.9),
    glass: new THREE.MeshStandardMaterial({ color: "#a9c8e3", roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.45 }),
    frame: S("#2b2d31", 0.5),
    step: S("#cfcac2", 0.9),
    slab: S("#bdbbb6", 0.95),
    woodFloor: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.55 }),
    tileFloor: new THREE.MeshStandardMaterial({ map: tile, roughness: 0.35 }),
    stoneFloor: new THREE.MeshStandardMaterial({ map: stone, roughness: 0.45 }),
    blueFloor: new THREE.MeshStandardMaterial({ map: blue, roughness: 0.3 }),
    paveFloor: new THREE.MeshStandardMaterial({ map: pave, roughness: 0.9 }),
    concrete: S("#c9c8c4", 0.95),
    deck: S("#9c7a5a", 0.8),
    stone: S("#d7d3cc", 0.8),
    woodDark: S("#8a5a34", 0.55),
    woodLight: S("#c79a63", 0.55),
    white: S("#fbfbfa", 0.6),
    linen: S("#f2efe9", 0.85),
    blanket: S("#b9ad9b", 0.95),
    blanket2: S("#7d7f99", 0.95),
    fabric: S("#e4e2de", 0.95),
    fabric2: S("#d6d2ca", 0.95),
    cushion: S("#e9e2d6", 0.9),
    black: S("#18191b", 0.4),
    granite: S("#2e3033", 0.3),
    steel: S("#b9bcc0", 0.25, { metalness: 0.8 }),
    ceramic: S("#ffffff", 0.2),
    car: S("#f6f6f4", 0.25, { metalness: 0.3 }),
    tyre: S("#1c1c1e", 0.8),
    carGlass: S("#1e2630", 0.08, { metalness: 0.7 }),
    leaf: S("#3f7a3a", 0.8),
    pot: S("#e6dfd4", 0.8),
    rug: S("#cdbfa8", 0.95),
    pooja: S("#d8a03a", 0.5),
  };
}

const FLOOR_OF: Record<string, string> = {
  hall: "stoneFloor",
  bedroom: "stoneFloor",
  dining: "stoneFloor",
  study: "woodFloor",
  dress: "stoneFloor",
  passage: "stoneFloor",
  corridor: "stoneFloor",
  lobby: "stoneFloor",
  pooja: "stoneFloor",
  kitchen: "stoneFloor",
  toilet: "blueFloor",
  utility: "tileFloor",
  store: "tileFloor",
  shop: "stoneFloor",
  parking: "paveFloor",
  porch: "paveFloor",
  stair: "stone",
  balcony: "deck",
  open: "deck",
};

/** Builds one floor (cut-away, furnished) into a group; plan x → x, plan y → z, metres. */
export function buildFloor(
  m: Materials,
  W: number,
  D: number,
  rects: SketchRect[],
  level: number,
  opts: { cut?: boolean; cutH?: number } = {},
) {
  const group = new THREE.Group();
  const cut = opts.cut !== false;
  const base = level * LEVEL;
  const unit = new THREE.BoxGeometry(1, 1, 1);
  const add = (mat: THREE.Material, x: number, y: number, z: number, w: number, h: number, d: number, shadow = true) => {
    const o = new THREE.Mesh(unit, mat);
    o.scale.set(w, h, d);
    o.position.set(x + w / 2, y + h / 2, z + d / 2);
    o.castShadow = shadow;
    o.receiveShadow = true;
    group.add(o);
    return o;
  };
  const cyl = (mat: THREE.Material, x: number, y: number, z: number, r: number, h: number, seg = 20) => {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
    o.position.set(x, y + h / 2, z);
    o.castShadow = true;
    o.receiveShadow = true;
    group.add(o);
    return o;
  };

  // walls, glass, stair
  const { blocks, tiles } = floorBlocks(W, D, rects, level, cut ? { wallH: opts.cutH ?? CUT_H, doorLintel: false } : {});
  for (const b of blocks) {
    if (b.kind === "slab") {
      add(m.slab, b.x, b.y, b.z, b.w, b.h, b.d);
      continue;
    }
    const mat = b.kind === "glass" ? m.glass : b.kind === "step" ? m.step : b.kind === "column" ? m.column : m.wall;
    add(mat, b.x, b.y, b.z, b.w, b.h, b.d, b.kind !== "glass");
    // dark cut line on top of every wall (the floor-plan look)
    if (cut && (b.kind === "wall" || b.kind === "column" || b.kind === "lintel"))
      add(m.cap, b.x - 0.004, b.y + b.h, b.z - 0.004, b.w + 0.008, 0.025, b.d + 0.008, false);
    if (b.kind === "glass") {
      // thin frame along the sill and the top
      const flat = b.w > b.d;
      add(m.frame, b.x, b.y - 0.01, b.z, b.w, 0.04, b.d);
      add(m.frame, b.x, b.y + b.h - 0.03, b.z, b.w, 0.04, b.d);
      void flat;
    }
  }
  // floors
  for (const t of tiles) {
    const key = FLOOR_OF[t.type] ?? "woodFloor";
    let mat = m[key];
    if ((mat as THREE.MeshStandardMaterial).map) {
      const mm = (mat as THREE.MeshStandardMaterial).clone();
      const tex = (mm.map as THREE.Texture).clone();
      // metres per texture repeat: 600 mm tiles, 150 mm bath tiles, 400 mm pavers
      const sc = ({ woodFloor: 2.4, stoneFloor: 2.4, blueFloor: 1.2, paveFloor: 1.6, tileFloor: 1.2 } as Record<string, number>)[key] ?? 1.2;
      tex.repeat.set(t.w / sc, t.d / sc);
      tex.needsUpdate = true;
      mm.map = tex;
      mat = mm;
    }
    const f = new THREE.Mesh(new THREE.PlaneGeometry(t.w, t.d), mat);
    f.rotation.x = -Math.PI / 2;
    f.position.set(t.cx, base + 0.006, t.cz);
    f.receiveShadow = true;
    group.add(f);
  }

  // furniture, from the same placement the 2D plan uses
  const P = planPrimitives(W, D, rects, () => "", {});
  const r = rnd(Math.round(W * 100 + D * 10 + level));
  const sofaMat = r() > 0.5 ? m.fabric : m.fabric2;
  // u = along the wall it stands on, v = away from it
  const frame = (f: Furniture) => {
    const sd: Side = f.sd ?? "top";
    const horiz = sd === "top" || sd === "bottom";
    return { sd, horiz, L: horiz ? f.w : f.h, Dp: horiz ? f.h : f.w };
  };
  // a box placed in the piece's own frame (u along wall, v into the room, from the wall)
  const local = (f: Furniture, mat: THREE.Material, u: number, v: number, lu: number, lv: number, y: number, h: number, shadow = true) => {
    const { sd } = frame(f);
    let x: number, z: number, w: number, d: number;
    if (sd === "top") [x, z, w, d] = [f.x + u, f.y + v, lu, lv];
    else if (sd === "bottom") [x, z, w, d] = [f.x + u, f.y + f.h - v - lv, lu, lv];
    else if (sd === "left") [x, z, w, d] = [f.x + v, f.y + u, lv, lu];
    else [x, z, w, d] = [f.x + f.w - v - lv, f.y + u, lv, lu];
    return add(mat, x, base + y, z, w, h, d, shadow);
  };
  for (const f of P.furniture) {
    const { L, Dp } = frame(f);
    switch (f.t) {
      case "bed": {
        {
          const rug = new THREE.Mesh(new THREE.PlaneGeometry(f.w + 0.9, f.h + 0.5), m.rug);
          rug.rotation.x = -Math.PI / 2;
          rug.position.set(f.x + f.w / 2, base + 0.012, f.y + f.h / 2 + 0.1);
          rug.receiveShadow = true;
          group.add(rug);
        }
        local(f, m.woodDark, 0, 0, L, 0.08, 0, 0.95); // headboard
        local(f, m.woodDark, 0, 0.08, L, Dp - 0.08, 0, 0.3);
        local(f, m.linen, 0.04, 0.1, L - 0.08, Dp - 0.14, 0.3, 0.2);
        const pw = (L - 0.3) / 2;
        local(f, m.white, 0.1, 0.16, pw, 0.4, 0.5, 0.12);
        local(f, m.white, 0.2 + pw, 0.16, pw, 0.4, 0.5, 0.12);
        local(f, r() > 0.5 ? m.blanket : m.blanket2, 0.02, Dp * 0.48, L - 0.04, Dp * 0.5, 0.5, 0.06);
        break;
      }
      case "sidetable":
        local(f, m.woodLight, 0, 0, L, Dp, 0, 0.5);
        cyl(m.cushion, f.x + f.w / 2, base + 0.5, f.y + f.h / 2, 0.09, 0.28, 12);
        break;
      case "wardrobe":
        local(f, m.woodLight, 0, 0, L, Dp, 0, 1.05);
        for (let k = 0.6; k < L - 0.1; k += 0.6) local(f, m.woodDark, k - 0.01, Dp - 0.01, 0.02, 0.02, 0.05, 0.95, false);
        break;
      case "sofa":
        local(f, sofaMat, 0, 0.0, L, 0.22, 0, 0.82); // back
        local(f, sofaMat, 0, 0.22, 0.2, Dp - 0.22, 0, 0.6); // arms
        local(f, sofaMat, L - 0.2, 0.22, 0.2, Dp - 0.22, 0, 0.6);
        local(f, sofaMat, 0.2, 0.22, L - 0.4, Dp - 0.22, 0, 0.4);
        for (let k = 0; k < 3; k++)
          local(f, m.cushion, 0.24 + (k * (L - 0.48)) / 3, 0.24, (L - 0.48) / 3 - 0.04, Dp - 0.3, 0.4, 0.08);
        break;
      case "ctable": {
        // rug under the table
        const rug = new THREE.Mesh(new THREE.PlaneGeometry(f.w + 1.0, f.h + 0.9), m.rug);
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(f.x + f.w / 2, base + 0.012, f.y + f.h / 2);
        rug.receiveShadow = true;
        group.add(rug);
        add(m.woodDark, f.x, base + 0.34, f.y, f.w, 0.06, f.h);
        add(m.woodDark, f.x + 0.05, base, f.y + 0.05, f.w - 0.1, 0.34, f.h - 0.1);
        break;
      }
      case "tv":
        local(f, m.woodDark, 0, 0, L, Dp, 0, 0.45);
        local(f, m.black, L * 0.2, 0.05, L * 0.6, 0.05, 0.45, 0.62);
        break;
      case "dtable":
        add(m.woodLight, f.x, base + 0.72, f.y, f.w, 0.05, f.h);
        for (const [dx, dz] of [
          [0.05, 0.05],
          [f.w - 0.1, 0.05],
          [0.05, f.h - 0.1],
          [f.w - 0.1, f.h - 0.1],
        ])
          add(m.woodDark, f.x + dx, base, f.y + dz, 0.05, 0.72, 0.05);
        break;
      case "chair": {
        // back faces away from the table: chairs carry the side of the table they sit on
        add(m.white, f.x + 0.03, base + 0.42, f.y + 0.03, f.w - 0.06, 0.06, f.h - 0.06);
        add(m.woodDark, f.x + 0.08, base, f.y + 0.08, f.w - 0.16, 0.42, f.h - 0.16);
        const sd = f.sd ?? "top";
        const bw = 0.05;
        if (sd === "top") add(m.white, f.x + 0.03, base + 0.48, f.y + 0.03, f.w - 0.06, 0.42, bw);
        if (sd === "bottom") add(m.white, f.x + 0.03, base + 0.48, f.y + f.h - 0.03 - bw, f.w - 0.06, 0.42, bw);
        if (sd === "left") add(m.white, f.x + 0.03, base + 0.48, f.y + 0.03, bw, 0.42, f.h - 0.06);
        if (sd === "right") add(m.white, f.x + f.w - 0.03 - bw, base + 0.48, f.y + 0.03, bw, 0.42, f.h - 0.06);
        break;
      }
      case "counter":
        local(f, m.white, 0, 0, L, Dp, 0, 0.84);
        local(f, m.granite, -0.01, -0.01, L + 0.02, Dp + 0.03, 0.84, 0.04);

        break;
      case "sink":
        local(f, m.steel, 0, 0, L, Dp, 0.85, 0.035);
        break;
      case "hob":
        local(f, m.black, 0, 0, L, Dp, 0.88, 0.02);
        break;
      case "wc": {
        local(f, m.ceramic, 0.02, 0, L - 0.04, 0.18, 0, 0.75);
        const c = frame(f);
        const cx = f.x + f.w / 2,
          cz = f.y + f.h / 2;
        const off = 0.12;
        const [ox, oz] = c.sd === "top" ? [0, off] : c.sd === "bottom" ? [0, -off] : c.sd === "left" ? [off, 0] : [-off, 0];
        cyl(m.ceramic, cx + ox, base, cz + oz, 0.19, 0.42);
        break;
      }
      case "basin":
        local(f, m.ceramic, 0, 0, L, Dp, 0.72, 0.12);
        local(f, m.white, 0.15, 0, L - 0.3, 0.08, 0, 0.72);
        break;
      case "car": {
        const along = f.h > f.w;
        const cw = (along ? f.w : f.h) - 0.05,
          cl = (along ? f.h : f.w) - 0.1;
        const g = new THREE.Group();
        // z runs along the car, front (bonnet) at -z
        const part = (mat: THREE.Material, z0: number, len: number, y0: number, h: number, wid: number) => {
          const o = new THREE.Mesh(unit, mat);
          o.scale.set(wid, h, len);
          o.position.set(0, y0 + h / 2, z0 + len / 2 - cl / 2);
          o.castShadow = true;
          g.add(o);
          return o;
        };
        part(m.car, 0.05, cl - 0.1, 0.22, 0.42, cw); // body
        part(m.car, 0, cl, 0.3, 0.26, cw - 0.06); // bumpers
        part(m.carGlass, 1.05, 2.15, 0.64, 0.44, cw - 0.14); // glass house
        part(m.car, 1.2, 1.85, 1.06, 0.06, cw - 0.22); // roof
        part(m.black, 0.02, 0.06, 0.32, 0.12, cw - 0.4); // grille
        for (const [sx, sz] of [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ]) {
          const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.2, 20), m.tyre);
          wh.rotation.z = Math.PI / 2;
          wh.position.set(sx * (cw / 2 - 0.05), 0.31, sz * (cl / 2 - 0.78));
          wh.castShadow = true;
          g.add(wh);
        }
        g.position.set(f.x + f.w / 2, base, f.y + f.h / 2);
        // the plan's car faces the road (+z); turn the model round so its bonnet does too
        g.rotation.y = along ? Math.PI : -Math.PI / 2;
        group.add(g);
        break;
      }
      case "pooja":
        local(f, m.pooja, 0, 0, L, Dp, 0, 0.9);
        break;
      case "shopcounter":
        local(f, m.woodDark, 0, 0, L, Dp, 0, 0.95);
        local(f, m.granite, 0, 0, L, Dp, 0.95, 0.04);
        break;
    }
  }
  // a plant in the free corners of the hall and on balconies
  for (const t of tiles.filter((x) => ["hall", "balcony", "open"].includes(x.type) && x.w * x.d > 3)) {
    const px = t.x + 0.35,
      pz = t.z + 0.35;
    const busy = P.furniture.some((f) => px > f.x - 0.3 && px < f.x + f.w + 0.3 && pz > f.y - 0.3 && pz < f.y + f.h + 0.3);
    if (busy) continue;
    cyl(m.pot, px, base, pz, 0.16, 0.35, 14);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 12), m.leaf);
    leaf.position.set(px, base + 0.7, pz);
    leaf.castShadow = true;
    group.add(leaf);
  }
  return group;
}

/* ------------------------------------------------------------------ site: the "aerial plan" look */

export interface SitePlot {
  /** plot frontage and depth, metres */
  w: number;
  d: number;
  /** back setback, metres (front setback = whatever is left in front of the house) */
  back: number;
}

/** Flat text lying on the ground (labels, dimensions). */
export function groundText(
  text: string,
  height: number,
  opts: { color?: string; weight?: number; shadow?: boolean; sub?: string } = {},
) {
  const c = document.createElement("canvas");
  const g = c.getContext("2d")!;
  const px = 96;
  const font = `${opts.weight ?? 700} ${px}px Inter, "Noto Sans Devanagari", Arial, sans-serif`;
  const sub = `${600} ${Math.round(px * 0.72)}px Inter, Arial, sans-serif`;
  g.font = font;
  let w = g.measureText(text).width;
  if (opts.sub) {
    g.font = sub;
    w = Math.max(w, g.measureText(opts.sub).width);
  }
  c.width = Math.ceil(w) + 48;
  c.height = opts.sub ? Math.round(px * 2.1) : Math.round(px * 1.3);
  g.textAlign = "center";
  g.textBaseline = "middle";
  if (opts.shadow) {
    g.shadowColor = "rgba(0,0,0,0.55)";
    g.shadowBlur = 10;
  }
  g.fillStyle = opts.color ?? "#1b1c1e";
  g.font = font;
  g.fillText(text, c.width / 2, opts.sub ? px * 0.62 : c.height / 2);
  if (opts.sub) {
    g.font = sub;
    g.fillText(opts.sub, c.width / 2, px * 1.5);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const hh = opts.sub ? height * 2.1 : height * 1.3;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry((hh * c.width) / c.height, hh),
    // drawn over everything, like the labels on a presentation plan
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false }),
  );
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 10;
  return m;
}

/**
 * Road, lawn, boundary wall, landscaping and plot dimensions around the house.
 * The house sits at x 0..W, z 0..D (front / road side at +z); the plot is centred on it across the width.
 */
export function buildSite(
  m: Materials,
  W: number,
  D: number,
  plot: SitePlot,
  rects: SketchRect[],
  roadLabel: string,
  ft: (metres: number) => string,
) {
  const g = new THREE.Group();
  const r = rnd(Math.round(W * 31 + D * 7));
  const S = (color: string, rough = 0.9) => new THREE.MeshStandardMaterial({ color, roughness: rough });
  const grass = S("#5f9a3e"),
    grass2 = S("#6fae47"),
    soil = S("#6b4b33"),
    asphalt = S("#3a3d42", 0.95),
    kerb = S("#c9b98f"),
    wallM = S("#ede6da", 0.85),
    capM = S("#b9ad98", 0.8),
    paver = S("#c4c0b8", 0.85),
    paverJoint = S("#a9a59d", 0.9),
    white = new THREE.MeshBasicMaterial({ color: "#ffffff" }),
    leafA = S("#3e7b2f"),
    leafB = S("#4f9136"),
    trunk = S("#6e4b2e");
  const flowers = ["#e8365d", "#f06292", "#ffb300", "#ff7043", "#ffffff", "#c2185b"].map((c) => S(c, 0.7));
  const box = (mat: THREE.Material, x: number, y: number, z: number, w: number, h: number, d: number, sh = true) => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    o.position.set(x + w / 2, y + h / 2, z + d / 2);
    o.castShadow = sh;
    o.receiveShadow = true;
    g.add(o);
    return o;
  };
  const plane = (mat: THREE.Material, x: number, z: number, w: number, d: number, y = 0) => {
    const o = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    o.rotation.x = -Math.PI / 2;
    o.position.set(x + w / 2, y, z + d / 2);
    o.receiveShadow = true;
    g.add(o);
    return o;
  };
  const sphere = (mat: THREE.Material, x: number, y: number, z: number, rad: number) => {
    const o = new THREE.Mesh(new THREE.SphereGeometry(rad, 12, 10), mat);
    o.position.set(x, y, z);
    o.castShadow = true;
    g.add(o);
    return o;
  };

  // plot extents
  const sx = Math.max(0, (plot.w - W) / 2);
  const X0 = -sx,
    X1 = W + sx,
    Z0 = -plot.back,
    Z1 = Math.max(D + 0.6, Z0 + plot.d);
  const span = Math.max(X1 - X0, Z1 - Z0);

  // land around, the road in front with a footpath
  plane(grass, X0 - span * 3, Z0 - span * 3, span * 7, span * 7, -0.16);
  plane(kerb, X0 - span * 3, Z1 + 0.25, span * 7, 1.4, -0.14);
  plane(asphalt, X0 - span * 3, Z1 + 1.65, span * 7, 7, -0.13);
  for (let x = X0 - span * 3; x < X1 + span * 3; x += 3) plane(white, x, Z1 + 5.1, 1.5, 0.14, -0.12);
  const road = groundText(roadLabel, 1.0, { color: "#f4f4f4", shadow: true });
  road.position.set((X0 + X1) / 2, -0.11, Z1 + 3.3);
  g.add(road);

  // inside the plot: lawn, then the house on top
  plane(grass2, X0, Z0, X1 - X0, Z1 - Z0, -0.02);

  // boundary wall with a gate in front of the parking (or the main door)
  const bt = 0.15,
    bh = 0.9;
  const park = rects.find((x) => x.type === "parking" || x.type === "porch");
  const mainDoor = rects
    .flatMap((x) => (x.doors ?? []).filter((d) => d.main || d.shutter).map((d) => ({ x, d })))
    .find(Boolean);
  const gateC = park ? park.x + park.w / 2 : mainDoor ? mainDoor.x.x + mainDoor.d.at + mainDoor.d.width / 2 : W / 2;
  const gateW = park ? Math.min(3.2, park.w - 0.2) : 1.4;
  const g0 = gateC - gateW / 2,
    g1 = gateC + gateW / 2;
  const wall = (x: number, z: number, w: number, d: number) => {
    box(wallM, x, -0.02, z, w, bh, d);
    box(capM, x - 0.02, bh - 0.02, z - 0.02, w + 0.04, 0.05, d + 0.04, false);
  };
  wall(X0 - bt, Z0 - bt, X1 - X0 + 2 * bt, bt);
  wall(X0 - bt, Z0, bt, Z1 - Z0);
  wall(X1, Z0, bt, Z1 - Z0);
  if (g0 > X0) wall(X0 - bt, Z1, g0 - X0 + bt, bt);
  if (g1 < X1) wall(g1, Z1, X1 - g1 + bt, bt);
  // gate leaves
  box(S("#2f3134", 0.5), g0, -0.02, Z1 + 0.02, g1 - g0, 0.05, 0.05, false);

  // paved drive from the gate, a stepping-stone path to the main door
  const frontGap = Z1 - D;
  if (frontGap > 0.3) {
    plane(paver, g0, D, g1 - g0, frontGap, -0.005);
    for (let z = D + 0.5; z < Z1; z += 0.6) plane(paverJoint, g0, z, g1 - g0, 0.03, -0.004);
  }
  if (mainDoor && frontGap > 1.2 && !park) {
    const dx = mainDoor.x.x + mainDoor.d.at + mainDoor.d.width / 2;
    for (let z = D + 0.3; z < Z1 - 0.3; z += 0.7) plane(paver, dx - 0.35, z, 0.7, 0.45, 0.01);
  }

  // flower beds along the boundary where there is room, shrubs and a palm at the corners
  const bed = (x: number, z: number, w: number, d: number) => {
    if (w < 0.35 || d < 0.35) return;
    plane(soil, x, z, w, d, 0.005);
    const n = Math.floor((w * d) / 0.12);
    for (let i = 0; i < Math.min(n, 140); i++)
      sphere(flowers[Math.floor(r() * flowers.length)], x + 0.1 + r() * (w - 0.2), 0.1, z + 0.1 + r() * (d - 0.2), 0.05 + r() * 0.04);
    const k = Math.max(1, Math.floor(Math.max(w, d) / 1.6));
    for (let i = 0; i < k; i++) {
      const t = (i + 0.5) / k;
      sphere(r() > 0.5 ? leafA : leafB, w > d ? x + t * w : x + w / 2, 0.26, w > d ? z + d / 2 : z + t * d, 0.24);
    }
  };
  const side = sx - 0.05;
  if (side > 0.4) {
    bed(X0 + 0.05, Z0 + 0.05, Math.min(0.7, side), Z1 - Z0 - 0.1);
    bed(X1 - Math.min(0.7, side) - 0.05, Z0 + 0.05, Math.min(0.7, side), Z1 - Z0 - 0.1);
  }
  if (plot.back > 0.5) bed(X0 + 0.1, Z0 + 0.05, X1 - X0 - 0.2, Math.min(0.7, plot.back - 0.1));
  if (frontGap > 1.0) {
    // lawn strip beside the drive with a flower bed along the front wall
    if (g0 - X0 > 0.8) bed(X0 + 0.1, Z1 - 0.65, g0 - X0 - 0.2, 0.55);
    if (X1 - g1 > 0.8) bed(g1 + 0.1, Z1 - 0.65, X1 - g1 - 0.2, 0.55);
    const palmX = X1 - g1 > 1.4 ? X1 - 0.9 : X0 + 0.9;
    if (Math.abs(palmX - gateC) > gateW / 2 + 0.8) {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.6, 8), trunk);
      t.position.set(palmX, 1.3, Z1 - 1.0);
      t.castShadow = true;
      g.add(t);
      for (let i = 0; i < 7; i++) {
        const fr = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.5, 4), leafB);
        const a = (i / 7) * Math.PI * 2;
        fr.position.set(palmX + Math.cos(a) * 0.55, 2.55, Z1 - 1.0 + Math.sin(a) * 0.55);
        fr.rotation.set(Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2);
        fr.castShadow = true;
        g.add(fr);
      }
    }
  }

  // trees on the neighbouring land
  const tree = (x: number, z: number, s: number) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.16 * s, 1.6 * s, 8), trunk);
    t.position.set(x, 0.8 * s, z);
    g.add(t);
    for (let i = 0; i < 4; i++)
      sphere(i % 2 ? leafA : leafB, x + (r() - 0.5) * 1.2 * s, (1.9 + r() * 0.8) * s, z + (r() - 0.5) * 1.2 * s, (0.8 + r() * 0.4) * s);
  };
  for (let z = Z0 - 1; z < Z1; z += 3.2 + r() * 1.5) {
    tree(X0 - 2.4 - r() * 2, z, 1 + r() * 0.3);
    tree(X1 + 2.4 + r() * 2, z + 1.2, 1 + r() * 0.3);
  }
  for (let x = X0; x < X1; x += 3.5 + r() * 1.5) tree(x, Z0 - 2.6 - r() * 1.5, 1 + r() * 0.3);

  // plot dimensions in white, with arrows, outside the boundary
  const arrow = (x0: number, z0: number, x1: number, z1: number) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const ang = Math.atan2(z1 - z0, x1 - x0);
    const shaft = new THREE.Mesh(new THREE.PlaneGeometry(len - 0.5, 0.06), white);
    shaft.rotation.set(-Math.PI / 2, 0, -ang);
    shaft.position.set((x0 + x1) / 2, 0.02, (z0 + z1) / 2);
    g.add(shaft);
    for (const [px, pz, dir] of [
      [x0, z0, ang + Math.PI],
      [x1, z1, ang],
    ] as const) {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(-0.38, 0.17);
      shape.lineTo(-0.38, -0.17);
      const head = new THREE.Mesh(new THREE.ShapeGeometry(shape), white);
      head.rotation.set(-Math.PI / 2, 0, -dir);
      head.position.set(px, 0.025, pz);
      g.add(head);
    }
  };
  const dimW = groundText(`${ft(X1 - X0)}  (${(X1 - X0).toFixed(2)} m)`, 0.62, { color: "#ffffff", shadow: true });
  const zTop = Z0 - 1.25;
  arrow(X0, zTop, X1, zTop);
  dimW.position.set((X0 + X1) / 2, 0.06, zTop);
  // keep the label off the arrow: put it on a dark band
  g.add(dimW);
  const dimD = groundText(`${ft(Z1 - Z0)}  (${(Z1 - Z0).toFixed(2)} m)`, 0.62, { color: "#ffffff", shadow: true });
  const xR = X1 + 1.1;
  arrow(xR, Z0, xR, Z1);
  dimD.rotation.z = Math.PI / 2;
  dimD.position.set(xR, 0.06, (Z0 + Z1) / 2);
  g.add(dimD);

  return { group: g, extents: { X0, X1, Z0, Z1 } };
}
