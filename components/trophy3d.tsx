"use client";
import { useEffect, useRef } from "react";

/** A spinning gold trophy (lathe cup + handles + base). Tint changes per milestone via `hue`. */
export default function Trophy3D({ hue = 0 }: { hue?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const hueRef = useRef(hue);
  hueRef.current = hue;

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let stop = false, cleanup = () => {};
    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (stop) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" }); } catch { return; }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      host.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      camera.position.set(0, 1.3, 8.5);
      camera.lookAt(0, 1.05, 0);

      const gold = new THREE.MeshStandardMaterial({ color: 0xe9b949, metalness: 1, roughness: 0.18 });
      const dark = new THREE.MeshStandardMaterial({ color: 0x1b1030, metalness: 0.6, roughness: 0.35 });
      const cupPts = [[0, 0.62], [0.16, 0.62], [0.11, 0.9], [0.14, 1.02], [0.55, 1.18], [0.86, 1.6], [0.98, 2.22], [0.93, 2.24], [0.8, 1.66], [0.5, 1.28], [0, 1.2]].map(([r, y]) => new THREE.Vector2(r, y));
      const trophy = new THREE.Group();
      trophy.add(new THREE.Mesh(new THREE.LatheGeometry(cupPts, 64), gold));
      const handle = new THREE.TorusGeometry(0.34, 0.06, 16, 48, Math.PI * 1.1);
      const hl = new THREE.Mesh(handle, gold); hl.position.set(-0.98, 1.78, 0); hl.rotation.z = Math.PI * 0.45;
      const hr = new THREE.Mesh(handle, gold); hr.position.set(0.98, 1.78, 0); hr.rotation.z = -Math.PI * 0.45 + Math.PI; hr.rotation.y = Math.PI;
      trophy.add(hl, hr);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.18, 48), gold); stem.position.y = 0.56;
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.48, 1.0), dark); base.position.y = 0.24;
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.2, 0.02), gold); plate.position.set(0, 0.25, 0.51);
      trophy.add(stem, base, plate);
      scene.add(trophy);
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 5, 6); scene.add(key);
      const rim = new THREE.DirectionalLight(0xa855f7, 4); rim.position.set(-5, 2, -2); scene.add(rim);

      const size = () => { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
      size();
      const ro = new ResizeObserver(size); ro.observe(host);
      const tint = new THREE.Color();
      let visible = true, raf = 0;
      const clock = new THREE.Clock();
      const frame = () => {
        const tt = clock.getElapsedTime();
        trophy.rotation.y = reduce ? 0.5 : tt * 0.7;
        trophy.position.y = reduce ? 0 : Math.sin(tt * 1.3) * 0.06;
        tint.setHSL((0.12 + hueRef.current) % 1, 0.75, 0.6);
        gold.color.lerp(tint, 0.06);
        renderer.render(scene, camera);
      };
      const loop = () => { if (stop || !visible) { raf = 0; return; } frame(); raf = requestAnimationFrame(loop); };
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); });
      io.observe(host);
      raf = requestAnimationFrame(loop);
      cleanup = () => {
        cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
        scene.traverse((o) => { const m = o as { geometry?: { dispose(): void }; material?: { dispose(): void } }; m.geometry?.dispose(); m.material?.dispose(); });
        env.dispose(); pmrem.dispose(); renderer.dispose(); renderer.domElement.remove();
      };
      if (stop) cleanup();
    })().catch(() => {});
    return () => { stop = true; cleanup(); };
  }, []);

  return <div ref={ref} className="trophy3d" aria-hidden />;
}
