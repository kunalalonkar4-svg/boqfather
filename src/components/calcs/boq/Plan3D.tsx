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
  const [show, setShow] = useState<number>(0); // ground floor first; -1 = whole house
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [labels, setLabels] = useState(false);
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

        const { buildFloor, makeMaterials, CUT_H } = await import("@/lib/plan3dScene");
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x8c8d90);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        const camera = new THREE.PerspectiveCamera(30, el.clientWidth / el.clientHeight, 0.1, 400);
        const span = Math.max(W, D);
        const floorY = top * STOREY;
        const k = still ? 0.86 : 1.0;
        // high, from the front-left corner: the "3D floor plan" view
        camera.position.set(W / 2 - span * 0.62 * k, floorY + span * 1.55 * k, D / 2 + span * 1.05 * k);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(W / 2, floorY + 0.4, D / 2);
        controls.enableDamping = true;
        controls.maxPolarAngle = Math.PI * 0.46;
        controls.minDistance = 4;
        controls.maxDistance = span * 4;
        controls.autoRotate = !still;
        controls.autoRotateSpeed = 0.6;
        controls.addEventListener("start", () => (controls.autoRotate = false));

        scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8a8a, 1.9));
        const sun = new THREE.DirectionalLight(0xfff4e6, 2.4);
        sun.position.set(W / 2 - span * 0.6, floorY + span * 2.2, D / 2 - span * 0.5);
        sun.target.position.set(W / 2, floorY, D / 2);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.bias = -0.0005;
        sun.shadow.radius = 4;
        const sc = sun.shadow.camera;
        sc.left = sc.bottom = -span;
        sc.right = sc.top = span;
        sc.far = span * 8;
        scene.add(sun, sun.target);
        const fill = new THREE.DirectionalLight(0xdfe8ff, 0.6);
        fill.position.set(W + span, floorY + span, D + span);
        scene.add(fill);

        // neutral studio floor under the model
        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(span * 10, span * 10),
          new THREE.MeshStandardMaterial({ color: 0x96979a, roughness: 1 }),
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(W / 2, -0.15, D / 2);
        ground.receiveShadow = true;
        scene.add(ground);

        const textSprite = (text: string, size = 0.42) => {
          const c = document.createElement("canvas");
          const ctx = c.getContext("2d")!;
          const font = `700 64px "Noto Sans Devanagari", Inter, Arial, sans-serif`;
          ctx.font = font;
          const w = Math.ceil(ctx.measureText(text).width) + 40;
          c.width = w;
          c.height = 96;
          ctx.font = font;
          ctx.fillStyle = "rgba(22,24,26,0.92)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, w / 2, 50);
          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;
          const m = new THREE.Mesh(
            new THREE.PlaneGeometry((size * w) / 96, size),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false }),
          );
          m.rotation.x = -Math.PI / 2;
          m.renderOrder = 10;
          return m;
        };
        void facingLabel;

        const mats = makeMaterials();
        const labelGroup = new THREE.Group();
        for (const s of floors) {
          // only the top floor shown is cut open; floors below are full height
          const g = buildFloor(mats, s.L, s.B, s.rects, s.floor, { cut: s.floor === top });
          scene.add(g);
          if (s.floor !== top) continue;
          for (const r of s.rects.filter((x) => x.type !== "column" && x.type !== "stair" && x.w * x.h > 2.5)) {
            const lb = textSprite(namesRef.current(r.type).toUpperCase(), Math.min(0.42, r.w / 6));
            lb.position.set(r.x + r.w / 2, s.floor * STOREY + CUT_H + 0.05, r.y + r.h / 2);
            labelGroup.add(lb);
          }
        }
        scene.add(labelGroup);
        const matList = Object.values(mats);

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
