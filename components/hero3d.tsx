"use client";
import { useEffect, useRef } from "react";

/**
 * 3D layer behind TU1B's photo: an extruded metallic "TU1B", two orbiting neon rings and a star field.
 * Pauses off-screen, renders one still frame for reduced motion, and quietly does nothing without WebGL.
 */
export default function Hero3D({ text = "TU1B" }: { text?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let stop = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const [{ FontLoader }, { TextGeometry }, { RoomEnvironment }, font] = await Promise.all([
        import("three/examples/jsm/loaders/FontLoader.js"),
        import("three/examples/jsm/geometries/TextGeometry.js"),
        import("three/examples/jsm/environments/RoomEnvironment.js"),
        import("three/examples/fonts/helvetiker_bold.typeface.json"),
      ]);
      if (stop) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      } catch {
        return; // no WebGL: keep the CSS version
      }
      const small = window.matchMedia("(max-width: 768px)").matches;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;

      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0, 12);

      const css = getComputedStyle(document.documentElement);
      const primary = new THREE.Color(css.getPropertyValue("--primary").trim() || "#a855f7");
      const neon = new THREE.Color(css.getPropertyValue("--neon").trim() || "#d8b4fe");

      const world = new THREE.Group();
      scene.add(world);

      // extruded logo
      const loader = new FontLoader();
      const f = loader.parse(((font as { default?: unknown }).default ?? font) as never);
      const tg = new TextGeometry(text, { font: f, size: 1.55, depth: 0.55, curveSegments: 6, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.04, bevelSegments: 3 });
      tg.center();
      const textMat = new THREE.MeshStandardMaterial({ color: 0x24123f, metalness: 1, roughness: 0.22, emissive: primary.clone().multiplyScalar(0.35) });
      const logo = new THREE.Mesh(tg, textMat);
      logo.position.set(0, 1.55, -2.2);
      world.add(logo);

      // orbit rings
      const ringMat = new THREE.MeshBasicMaterial({ color: neon, transparent: true, opacity: 0.85 });
      const ringA = new THREE.Mesh(new THREE.TorusGeometry(3.25, 0.022, 12, 160), ringMat);
      const ringB = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.012, 8, 160), new THREE.MeshBasicMaterial({ color: primary, transparent: true, opacity: 0.6 }));
      ringA.rotation.set(1.25, 0.25, 0);
      ringB.rotation.set(1.05, -0.45, 0.3);
      world.add(ringA, ringB);

      // orbiting glow beads on ring A
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      ringA.add(bead);

      // star field
      const count = small ? 220 : 520;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = 4 + Math.random() * 6, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = r * Math.cos(ph) * 0.8;
        pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th) - 3;
      }
      const pg = new THREE.BufferGeometry();
      pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const stars = new THREE.Points(pg, new THREE.PointsMaterial({ color: neon, size: small ? 0.05 : 0.04, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
      scene.add(stars);

      scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 4, 6); scene.add(key);
      const rim = new THREE.DirectionalLight(primary, 3); rim.position.set(-4, 1, 2); scene.add(rim);

      function size() {
        const w = host!.clientWidth, h = host!.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      size();
      const ro = new ResizeObserver(size);
      ro.observe(host);

      // pointer parallax
      const target = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => {
        target.y = (e.clientX / window.innerWidth - 0.5) * 0.5;
        target.x = (e.clientY / window.innerHeight - 0.5) * 0.3;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      let visible = true, raf = 0;
      const clock = new THREE.Clock();
      function frame() {
        const t = clock.getElapsedTime();
        world.rotation.y += (target.y - world.rotation.y) * 0.05;
        world.rotation.x += (target.x - world.rotation.x) * 0.05;
        logo.rotation.y = Math.sin(t * 0.6) * 0.35;
        logo.position.y = 1.55 + Math.sin(t * 1.1) * 0.08;
        ringA.rotation.z = t * 0.35;
        ringB.rotation.z = -t * 0.18;
        bead.position.set(Math.cos(t * 1.4) * 3.25, Math.sin(t * 1.4) * 3.25, 0);
        stars.rotation.y = t * 0.02;
        renderer.render(scene, camera);
      }
      function loop() {
        if (stop || !visible) { raf = 0; return; }
        frame();
        raf = requestAnimationFrame(loop);
      }
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf && !reduce) raf = requestAnimationFrame(loop);
      });
      io.observe(host);
      if (reduce) frame(); else raf = requestAnimationFrame(loop);

      host.parentElement?.classList.add("has-3d");

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        host.parentElement?.classList.remove("has-3d");
        scene.traverse((o) => {
          const m = o as { geometry?: { dispose(): void }; material?: { dispose(): void } };
          m.geometry?.dispose();
          m.material?.dispose();
        });
        envTex.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
      if (stop) cleanup();
    })().catch(() => {});

    return () => { stop = true; cleanup(); };
  }, [text]);

  return <div ref={ref} className="hero3d" aria-hidden />;
}
