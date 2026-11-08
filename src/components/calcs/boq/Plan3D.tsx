"use client";

import { useEffect, useRef, useState } from "react";
import type * as T from "three";
import type { SketchRect } from "@/engine";
import { STOREY } from "@/lib/plan3d";
import type { Lang } from "@/lib/site";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const FLOOR = (i: number, lang: Lang) =>
  lang === "hi"
    ? ["ग्राउंड", "पहली", "दूसरी", "तीसरी"][i]
    : ["Ground", "First", "Second", "Third"][i];



/**
 * Rotatable 3D model of the drawn plan (walls with door and window openings, room floors, stair).
 * three.js is loaded only when this view is opened.
 */
export function Plan3D({
  lang,
  sketch,
  names,
  facingLabel,
  still,
  onError,
  plot,
  look = "plan",
}: {
  lang: Lang;
  sketch: { floor: number; L: number; B: number; rects: SketchRect[] }[];
  names: (t: string) => string;
  facingLabel: string;
  /** Fixed camera, no rotation (for making preview images). */
  still?: boolean;
  /** WebGL not available: the parent shows the 2D plan instead. */
  onError?: () => void;
  /** Plot frontage, depth and back setback, feet (for the site around the house). */
  plot?: { w: number; d: number; back: number };
  /**
   * "plan": the technical aerial plan (road, plot dimensions, room names).
   * "model": an architect's-model look: cut-away house on a plinth seen from the front-right, warm light.
   */
  look?: "plan" | "model";
}) {
  const host = useRef<HTMLDivElement>(null);
  const isModel = look === "model";
  const [show, setShow] = useState<number>(0); // ground floor first; -1 = whole house
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [labels, setLabels] = useState(!(isModel && still));
  const labelsRef = useRef(labels);
  labelsRef.current = labels;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const namesRef = useRef(names);
  namesRef.current = names;

  useEffect(() => {
    let stop = false;
    let cleanup = () => {};
    (async () => {
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import(
          "three/examples/jsm/controls/OrbitControls.js"
        );
        const el = host.current;
        if (!el || stop) return;
        const W = Math.max(...sketch.map((s) => s.L));
        const D = Math.max(...sketch.map((s) => s.B));
        const floors = sketch.filter((s) => show < 0 || s.floor === show);
        const top = Math.max(...floors.map((s) => s.floor));

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: isModel, // the model look sits on the page's own soft gradient
          preserveDrawingBuffer: !!still,
        });
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        el.appendChild(renderer.domElement);

        const { buildFloor, buildSite, groundText, makeMaterials, CUT_H } = await import("@/lib/plan3dScene");
        const { formatFtIn } = await import("@/engine");
        const FT = 0.3048;
        const ft = (m: number) => formatFtIn(m).replace(/'-0"$/, "'").replace(/'-(\d+)"$/, "'$1\"");
        const scene = new THREE.Scene();
        if (!isModel) scene.background = new THREE.Color(0xe4e9ef);
        else renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = isModel ? 1.12 : 1.0;

        // the plot around the house (from the plot size, or a modest garden when not known)
        const site = plot
          ? { w: plot.w * FT, d: plot.d * FT, back: plot.back * FT }
          : { w: W + 3, d: D + 4, back: 1 };
        const mats = makeMaterials();
        const { group: siteGroup, extents: E } = buildSite(mats, W, D, site, sketch[0].rects, facingLabel, ft, isModel);
        scene.add(siteGroup);

        // aerial view from the road side, slightly tilted
        const cx = (E.X0 + E.X1) / 2,
          cz = (E.Z0 + E.Z1) / 2 + 1.6;
        // what has to be in frame: the plot with its dimension lines, and a strip of the road
        const needW = E.X1 - E.X0 + 3.5,
          needH = E.Z1 - E.Z0 + 6;
        const span = Math.max(needW, needH);
        const floorY = top * STOREY;
        const camera = new THREE.PerspectiveCamera(30, el.clientWidth / el.clientHeight, 0.1, 500);
        const fitPlan = () => {
          const a = el.clientWidth / el.clientHeight;
          // distance that fits the site in both directions
          const t = Math.tan((15 * Math.PI) / 180);
          const dist = Math.max(needH / 2 / t, needW / 2 / (t * a)) * (still ? 0.92 : 1);
          const tilt = (24 * Math.PI) / 180; // from straight down
          camera.position.set(cx, floorY + dist * Math.cos(tilt), cz + dist * Math.sin(tilt));
        };
        // model look: look at the plinth from the front-right and back off until all of it is in frame
        const rim = 0.45;
        const modelTarget = new THREE.Vector3((E.X0 + E.X1) / 2, floorY + 0.3, (E.Z0 + E.Z1) / 2);
        const modelCorners: T.Vector3[] = [];
        for (const x of [E.X0 - rim, E.X1 + rim])
          for (const z of [E.Z0 - rim, E.Z1 + rim])
            for (const y of [-1.25, floorY + 3.1]) modelCorners.push(new THREE.Vector3(x, y, z));
        const fitModel = () => {
          const az = (36 * Math.PI) / 180,
            el2 = (40 * Math.PI) / 180;
          const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el2), Math.sin(el2), Math.cos(az) * Math.cos(el2));
          const fits = (d: number) => {
            camera.position.copy(modelTarget).addScaledVector(dir, d);
            camera.lookAt(modelTarget);
            camera.updateMatrixWorld();
            return modelCorners.every((c) => {
              const p = c.clone().project(camera);
              return Math.abs(p.x) <= 0.97 && Math.abs(p.y) <= 0.97 && p.z < 1;
            });
          };
          let lo = 3,
            hi = 600;
          for (let i = 0; i < 40; i++) {
            const mid = (lo + hi) / 2;
            if (fits(mid)) hi = mid;
            else lo = mid;
          }
          fits(hi);
        };
        const fit = isModel ? fitModel : fitPlan;
        fit();
        const controls = new OrbitControls(camera, renderer.domElement);
        if (isModel) controls.target.copy(modelTarget);
        else controls.target.set(cx, floorY, cz);
        controls.enableDamping = true;
        controls.maxPolarAngle = Math.PI * 0.45;
        controls.minDistance = 4;
        controls.maxDistance = span * 5;
        controls.autoRotate = false;
        controls.update();

        scene.add(isModel ? new THREE.HemisphereLight(0xfff3e4, 0xc4ccd6, 1.05) : new THREE.HemisphereLight(0xffffff, 0xb8c2cf, 1.9));
        const sun = new THREE.DirectionalLight(0xffeccf, isModel ? 3.3 : 2.6);
        // model look: sun from the front-left, so the near walls and the room floors are lit and shadows fall back-right
        if (isModel) sun.position.set(cx - span * 0.9, floorY + span * 1.2, cz + span * 0.7);
        else sun.position.set(cx - span * 0.7, floorY + span * 1.6, cz - span * 0.9);
        sun.target.position.set(cx, floorY, cz);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.bias = -0.0005;
        sun.shadow.radius = 3;
        const sc = sun.shadow.camera;
        sc.left = sc.bottom = -span * 0.9;
        sc.right = sc.top = span * 0.9;
        sc.far = span * 6;
        scene.add(sun, sun.target);
        if (isModel) {
          // warm lamps in the biggest living rooms, like the lit interiors of a presentation model
          const topFloor = sketch.find((s) => s.floor === top);
          const rooms = (topFloor?.rects ?? [])
            .filter((r) => ["hall", "bedroom", "dining", "kitchen", "study"].includes(r.type) && r.w * r.h > 5)
            .sort((a, b) => b.w * b.h - a.w * a.h)
            .slice(0, 5);
          for (const r of rooms) {
            const lamp = new THREE.PointLight(0xffdcb4, 14, 8, 1.6);
            lamp.position.set(r.x + r.w / 2, floorY + 2.3, r.y + r.h / 2);
            scene.add(lamp);
          }
        }

        const labelGroup = new THREE.Group();
        for (const s of floors) {
          // only the top floor shown is cut open; floors below are full height
          const g = buildFloor(mats, s.L, s.B, s.rects, s.floor, { cut: s.floor === top, model: isModel });
          scene.add(g);
          if (s.floor !== top) continue;
          for (const r of s.rects.filter((x) => x.type !== "column" && x.type !== "stair" && x.type !== "parking" && x.w * x.h > 2.2)) {
            const h = Math.max(0.24, Math.min(0.46, r.w / 7, r.h / 4));
            const lb = groundText(namesRef.current(r.type), h, { sub: `${ft(r.w)} × ${ft(r.h)}`, weight: 700, color: "#15263b" });
            lb.position.set(r.x + r.w / 2, s.floor * STOREY + 0.03, r.y + r.h / 2 + (r.h > 3 ? 0.45 : 0));
            labelGroup.add(lb);
          }
        }
        scene.add(labelGroup);
        const matList = Object.values(mats);
        void CUT_H;

        const resize = () => {
          if (!el.clientWidth) return;
          renderer.setSize(el.clientWidth, el.clientHeight);
          camera.aspect = el.clientWidth / el.clientHeight;
          camera.updateProjectionMatrix();
          fit();
        };
        const ro = new ResizeObserver(resize);
        ro.observe(el);
        let raf = 0;
        let frames = 0;
        const loop = () => {
          labelGroup.visible = labelsRef.current;
          controls.update();
          renderer.render(scene, camera);
          // a still picture needs only a couple of frames
          if (still && ++frames > 2) return;
          raf = requestAnimationFrame(loop);
        };
        loop();
        setState("ready");
        if (still)
          setTimeout(() => {
            (window as unknown as { __plan3dReady?: boolean }).__plan3dReady = true;
          }, 600);
        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          controls.dispose();
          renderer.dispose();
          scene.traverse((o) => {
            const m = o as T.Mesh;
            m.geometry?.dispose?.();
          });
          matList.forEach((m) => m.dispose());
          el.removeChild(renderer.domElement);
        };
      } catch (e) {
        console.error(e);
        if (!stop) {
          setState("error");
          onErrorRef.current?.();
        }
      }
    })();
    return () => {
      stop = true;
      cleanup();
    };
  }, [sketch, show, facingLabel, plot, isModel]);

  const chip = (on: boolean) =>
    `rounded-full px-3.5 py-1.5 text-[13px] font-bold transition ${on ? "bg-ink text-white" : "bg-white text-ink hover:bg-[#eaf3ff]"}`;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={chip(show < 0)} onClick={() => setShow(-1)}>
          {L(lang, "Whole house", "पूरा घर")}
        </button>
        {sketch.map((s) => (
          <button
            key={s.floor}
            type="button"
            className={chip(show === s.floor)}
            onClick={() => setShow(s.floor)}
          >
            {FLOOR(s.floor, lang)} {L(lang, "floor", "मंज़िल")}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-[13px] font-semibold text-body">
          <input
            type="checkbox"
            checked={labels}
            onChange={(e) => setLabels(e.target.checked)}
            className="h-4 w-4 accent-[#1769d2]"
          />
          {L(lang, "Room names", "कमरों के नाम")}
        </label>
      </div>
      <div
        ref={host}
        data-plan3d
        className={`relative h-[420px] w-full touch-none overflow-hidden rounded-[22px] border border-line sm:h-[540px] ${isModel ? "" : "bg-[#f7fafe]"}`}
        style={
          isModel
            ? {
                background: "linear-gradient(180deg,#f8fafc 0%,#e4e9ef 100%)",
                // preview pictures: a fixed 1000 × 640 frame (about the shape of a card), whatever the page width
                ...(still ? { width: 1000, height: 640 } : {}),
              }
            : undefined
        }
      >
        {plot && !isModel && state === "ready" && (
          <div className="pointer-events-none absolute right-3 top-3 rounded-lg border border-line bg-white/95 px-3.5 py-2.5 text-ink shadow-sm">
            <p className="text-[12px] font-bold">{L(lang, "Residential plot", "रिहायशी प्लॉट")}</p>
            <p className="font-display text-[16px] font-extrabold leading-tight">
              {plot.w}&apos; × {plot.d}&apos;
            </p>
            <p className="text-[11px] text-muted">
              ≈ {Math.round(plot.w * plot.d * 0.0929)} m² · {Math.round((plot.w * plot.d) / 9)} {L(lang, "gaj", "गज़")}
            </p>
          </div>
        )}
        {state !== "ready" && (
          <div className="absolute inset-0 flex items-center justify-center text-[14px] font-semibold text-muted">
            {state === "error"
              ? L(lang, "3D view could not start on this device.", "इस डिवाइस पर 3D व्यू नहीं चल सका।")
              : L(lang, "Building the 3D model…", "3D मॉडल बन रहा है…")}
          </div>
        )}
      </div>
      <p className="text-[13px] text-muted">
        {L(
          lang,
          "Drag to turn, pinch or scroll to zoom. Made from the same plan — rooms, walls, doors, windows and furniture to scale; finishes and landscaping are indicative.",
          "घुमाने के लिए खींचें, ज़ूम के लिए पिंच या स्क्रॉल करें। उसी नक्शे से बना — कमरे, दीवारें, दरवाज़े, खिड़कियां और फ़र्नीचर स्केल पर; रंग और बगीचा सिर्फ़ अंदाज़े के लिए।",
        )}
      </p>
    </div>
  );
}
