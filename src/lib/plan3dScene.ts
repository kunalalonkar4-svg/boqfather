/**
 * "3D floor plan" look: a cut-away floor seen from above at an angle — white walls with dark tops,
 * wooden and tiled floors, and furnished rooms (beds, sofa, dining, kitchen, bathroom fittings, car).
 * The furniture is the same set the 2D plan draws, raised into simple models.
 */
import * as THREE from "three";
import type { Side, SketchRect } from "@/engine";
import { planPrimitives, type Furniture } from "@/lib/planDraw";
import { floorBlocks } from "@/lib/plan3d";

export const CUT_H = 2.2; // walls are cut here, so the rooms can be seen from above
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
    concrete: S("#c9c8c4", 0.95),
    deck: S("#9c7a5a", 0.8),
    stone: S("#d7d3cc", 0.8),
    woodDark: S("#8a5a34", 0.55),
    woodLight: S("#c79a63", 0.55),
    white: S("#fbfbfa", 0.6),
    linen: S("#f2efe9", 0.85),
    blanket: S("#c86b4a", 0.9),
    blanket2: S("#5c7aa6", 0.9),
    fabric: S("#2f5fae", 0.9),
    fabric2: S("#d9a441", 0.9),
    cushion: S("#e9e2d6", 0.9),
    black: S("#18191b", 0.4),
    granite: S("#2e3033", 0.3),
    steel: S("#b9bcc0", 0.25, { metalness: 0.8 }),
    ceramic: S("#ffffff", 0.2),
    car: S("#b3262b", 0.3, { metalness: 0.35 }),
    tyre: S("#1c1c1e", 0.8),
    carGlass: S("#1e2630", 0.08, { metalness: 0.7 }),
    leaf: S("#3f7a3a", 0.8),
    pot: S("#e6dfd4", 0.8),
    rug: S("#cdbfa8", 0.95),
    pooja: S("#d8a03a", 0.5),
  };
}

const FLOOR_OF: Record<string, string> = {
  hall: "woodFloor",
  bedroom: "woodFloor",
  dining: "woodFloor",
  study: "woodFloor",
  dress: "woodFloor",
  passage: "woodFloor",
  corridor: "woodFloor",
  lobby: "woodFloor",
  pooja: "woodFloor",
  kitchen: "tileFloor",
  toilet: "tileFloor",
  utility: "tileFloor",
  store: "tileFloor",
  shop: "tileFloor",
  parking: "concrete",
  porch: "concrete",
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
  opts: { cut?: boolean } = {},
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
  const { blocks, tiles } = floorBlocks(W, D, rects, level, cut ? { wallH: CUT_H, doorLintel: false } : {});
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
    if (key === "woodFloor" || key === "tileFloor") {
      const mm = (mat as THREE.MeshStandardMaterial).clone();
      const tex = (mm.map as THREE.Texture).clone();
      const sc = key === "woodFloor" ? 2.4 : 1.2; // metres per texture tile
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
        local(f, m.woodLight, 0, 0, L, Dp, 0, 1.9);
        for (let k = 0.6; k < L - 0.1; k += 0.6) local(f, m.woodDark, k - 0.01, Dp - 0.01, 0.02, 0.02, 0.05, 1.8, false);
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
        // wall units above
        local(f, m.woodLight, 0, 0, L, 0.35, 1.45, 0.65);
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
