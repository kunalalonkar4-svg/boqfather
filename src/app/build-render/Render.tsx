"use client";

import { useEffect, useRef } from "react";

/** Renders one frame of the construction scene (used to make the hero and fallback images). */
export function BuildRender() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let dispose = () => {};
    (async () => {
      const { createBuildScene } = await import("@/components/site/home/build/buildScene");
      const c = ref.current!;
      const q = new URLSearchParams(window.location.search);
      const sc = createBuildScene(c, {
        quality: "high",
        still: true,
        frame: q.get("frame") === "hero" ? "hero" : "build",
      });
      sc.setStage(Number(q.get("s") ?? 7));
      sc.resize();
      sc.render(0);
      sc.render(0);
      (window as unknown as { __buildReady?: boolean }).__buildReady = true;
      dispose = sc.dispose;
    })();
    return () => dispose();
  }, []);
  return <canvas ref={ref} data-build-render style={{ width: "100vw", height: "100vh", display: "block" }} />;
}
