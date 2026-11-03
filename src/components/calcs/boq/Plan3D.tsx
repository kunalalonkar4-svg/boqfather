"use client";

import { useEffect, useRef, useState } from "react";
import type * as T from "three";
import type { SketchRect } from "@/engine";
import { PLAN_FILL, planPrimitives } from "@/lib/planDraw";
import { floorBlocks, STOREY, type Block } from "@/lib/plan3d";
import type { Lang } from "@/lib/site";

const L = (lang: Lang, en: string, hi: string) => (lang === "hi" ? hi : en);
const FLOOR = (i: number, lang: Lang) =>
  lang === "hi"
    ? ["ग्राउंड", "पहली", "दूसरी", "तीसरी"][i]
    : ["Ground", "First", "Second", "Third"][i];

const COLOR: Record<Block["kind"], number> = {
  wall: 0xf7f3ec,
  column: 0xcfc6b6,
  lintel: 0xf4f1ea,
  sill: 0xf4f1ea,
  glass: 0x9cc3dd,
  step: 0xcfc6b6,
  slab: 0xa9a294,
};

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
}: {
  lang: Lang;
  sketch: { floor: number; L: number; B: number; rects: SketchRect[] }[];
  names: (t: string) => string;
  facingLabel: string;
  /** Fixed camera, no rotation (for making preview images). */
  still?: boolean;
  /** WebGL not available: the parent shows the 2D plan instead. */
  onError?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState<number>(-1); // -1 = all floors
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [labels, setLabels] = useState(true);
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
          preserveDrawingBuffer: !!still,
        });
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        renderer.setSize(el.clientWidth, el.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xeef0ec);
        const camera = new THREE.PerspectiveCamera(
          38,
          el.clientWidth / el.clientHeight,
          0.1,
          400,
        );
        const span = Math.max(W, D);
        const cy = (top + 0.5) * STOREY;
        const k = still ? 0.82 : 1;
        camera.position.set(
          W / 2 + span * 0.7 * k,
          cy + span * 1.45 * k,
          D / 2 + span * 1.2 * k,
        );
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(W / 2, show < 0 ? cy * 0.6 : top * STOREY, D / 2);
        controls.enableDamping = true;
        controls.maxPolarAngle = Math.PI * 0.49;
        controls.minDistance = 4;
        controls.maxDistance = span * 4;
        controls.autoRotate = !still;
        controls.autoRotateSpeed = 0.8;
        controls.addEventListener("start", () => (controls.autoRotate = false));

        scene.add(new THREE.HemisphereLight(0xffffff, 0xe6dccb, 2.2));
        const sun = new THREE.DirectionalLight(0xffffff, 2.1);
        sun.position.set(-span, span * 2, span * 1.2);
        sun.target.position.set(W / 2, 0, D / 2);
        sun.castShadow = true;
        sun.shadow.mapSize.set(still ? 1536 : 2048, still ? 1536 : 2048);
        const sc = sun.shadow.camera;
        sc.left = sc.bottom = -span;
        sc.right = sc.top = span;
        sc.far = span * 6;
        scene.add(sun, sun.target);

        // ground, plot and road
        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(span * 8, span * 8),
          new THREE.MeshStandardMaterial({ color: 0xd9e2cc }),
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(W / 2, -0.16, D / 2);
        ground.receiveShadow = true;
        scene.add(ground);
        const road = new THREE.Mesh(
          new THREE.PlaneGeometry(span * 8, 6),
          new THREE.MeshStandardMaterial({ color: 0x5b5d61 }),
        );
        road.rotation.x = -Math.PI / 2;
        road.position.set(W / 2, -0.15, D + 4.5);
        road.receiveShadow = true;
        scene.add(road);

        const textSprite = (
          text: string,
          size = 0.42,
          color = "rgba(22,24,26,0.9)",
          onTop = false,
        ) => {
          const c = document.createElement("canvas");
          const ctx = c.getContext("2d")!;
          const font = `700 64px "Noto Sans Devanagari", Inter, Arial, sans-serif`;
          ctx.font = font;
          const w = Math.ceil(ctx.measureText(text).width) + 40;
          c.width = w;
          c.height = 96;
          ctx.font = font;
          ctx.fillStyle = color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, w / 2, 50);
          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;
          const m = new THREE.Mesh(
            new THREE.PlaneGeometry((size * w) / 96, size),
            new THREE.MeshBasicMaterial({
              map: tex,
              transparent: true,
              depthWrite: false,
              depthTest: !onTop,
            }),
          );
          m.rotation.x = -Math.PI / 2;
          if (onTop) m.renderOrder = 10;
          return m;
        };
        const roadLabel = textSprite(facingLabel, 0.8, "#ffffff");
        roadLabel.position.set(W / 2, -0.12, D + 4.5);
        scene.add(roadLabel);

        const mats = new Map<string, T.Material>();
        const mat = (kind: Block["kind"]) => {
          if (!mats.has(kind))
            mats.set(
              kind,
              kind === "glass"
                ? new THREE.MeshStandardMaterial({
                    color: COLOR.glass,
                    transparent: true,
                    opacity: 0.45,
                    roughness: 0.1,
                  })
                : new THREE.MeshStandardMaterial({ color: COLOR[kind], roughness: 0.9 }),
            );
          return mats.get(kind)!;
        };
        const box = new THREE.BoxGeometry(1, 1, 1);
        const furnMat = new THREE.MeshStandardMaterial({ color: 0xe9dcc4, roughness: 0.8 });
        const softMat = new THREE.MeshStandardMaterial({ color: 0xd8cbb2, roughness: 0.9 });
        const carMat = new THREE.MeshStandardMaterial({ color: 0x7f8fa3, roughness: 0.4, metalness: 0.2 });
        const labelGroup = new THREE.Group();
        for (const s of floors) {
          const { blocks, tiles } = floorBlocks(s.L, s.B, s.rects, s.floor);
          for (const b of blocks) {
            const m = new THREE.Mesh(box, mat(b.kind));
            m.scale.set(b.w, b.h, b.d);
            m.position.set(b.x + b.w / 2, b.y + b.h / 2, b.z + b.d / 2);
            m.castShadow = b.kind !== "glass";
            m.receiveShadow = true;
            scene.add(m);
          }
          // furniture: the same pieces the 2D plan draws, raised as low blocks
          const P = planPrimitives(s.L, s.B, s.rects, () => "", {});
          for (const fr of P.rects.filter((x) => x.sw === 0.016)) {
            const area = fr.w * fr.h;
            if (area < 0.04) continue;
            const car = area > 5;
            const h = car ? 1.35 : area < 0.35 ? 0.5 : Math.max(fr.w, fr.h) > 1.7 && Math.min(fr.w, fr.h) < 0.7 ? 0.85 : 0.5;
            const m = new THREE.Mesh(
              box,
              car ? carMat : fr.fill && (fr.fill[0] < 250 || fr.fill[1] < 250) ? softMat : furnMat,
            );
            m.scale.set(fr.w, h, fr.h);
            m.position.set(fr.x + fr.w / 2, s.floor * STOREY + h / 2, fr.y + fr.h / 2);
            m.castShadow = true;
            m.receiveShadow = true;
            scene.add(m);
          }
          for (const t of tiles) {
            const c = PLAN_FILL[t.type] ?? [240, 240, 240];
            const f = new THREE.Mesh(
              new THREE.PlaneGeometry(t.w, t.d),
              new THREE.MeshStandardMaterial({
                // the 2D fills are very pale; a little more colour reads better in 3D
                color: new THREE.Color(`rgb(${c[0]},${c[1]},${c[2]})`).offsetHSL(0, 0.25, -0.1),
                roughness: 0.95,
              }),
            );
            f.rotation.x = -Math.PI / 2;
            f.position.set(t.cx, s.floor * STOREY + 0.005, t.cz);
            f.receiveShadow = true;
            scene.add(f);
            if (t.type !== "stair" && t.w * t.d > 2.5) {
              const lb = textSprite(
                namesRef.current(t.type).toUpperCase(),
                Math.min(0.5, t.w / 5),
                "rgba(22,24,26,0.92)",
                true,
              );
              lb.position.set(t.cx, s.floor * STOREY + (s.floor === top ? 0.02 : 0.02), t.cz);
              if (s.floor === top) labelGroup.add(lb);
            }
          }
        }
        scene.add(labelGroup);

        const resize = () => {
          if (!el.clientWidth) return;
          renderer.setSize(el.clientWidth, el.clientHeight);
          camera.aspect = el.clientWidth / el.clientHeight;
          camera.updateProjectionMatrix();
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
          mats.forEach((m) => m.dispose());
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
  }, [sketch, show, facingLabel]);

  const chip = (on: boolean) =>
    `rounded-full px-3.5 py-1.5 text-[13px] font-bold transition ${on ? "bg-ink text-white" : "bg-white text-ink hover:bg-[#f1eee8]"}`;
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
            className="h-4 w-4 accent-[#16181a]"
          />
          {L(lang, "Room names", "कमरों के नाम")}
        </label>
      </div>
      <div
        ref={host}
        data-plan3d
        className="relative h-[420px] w-full touch-none overflow-hidden rounded-[22px] border border-line bg-[#f5f3ef] sm:h-[540px]"
      >
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
          "Drag to turn, pinch or scroll to zoom. A massing model from the same plan — walls, doors, windows, stair; finishes and elevation are indicative.",
          "घुमाने के लिए खींचें, ज़ूम के लिए पिंच या स्क्रॉल करें। उसी नक्शे से बना ढांचा मॉडल — दीवारें, दरवाज़े, खिड़कियां, सीढ़ी; रंग और एलिवेशन सिर्फ़ अंदाज़े के लिए।",
        )}
      </p>
    </div>
  );
}
