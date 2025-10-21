import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Cotizaciones3D({ params }) {
  const mountRef = useRef(null);
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const flangeGroupRef = useRef(new THREE.Group());
  const controlsState = useRef({
    rotating: false,
    lastX: 0,
    lastY: 0,
    az: 0.8,
    el: 0.4,
    dist: 2.8,
  });

  // Crear/Recrear geometría del flange
  const buildFlange = () => {
    const group = flangeGroupRef.current;
    group.clear();
    const { di, de, espesor, pernos, material } = params;
    const outerR = de / 2;
    const innerR = di / 2;
    const thickness = espesor;

    const color =
      material === "inox"
        ? 0xcfd8dc
        : material === "acero"
        ? 0xb0bec5
        : 0xd7ccc8;
    const metalness = material === "inox" ? 0.9 : 0.7;
    const roughness = material === "inox" ? 0.25 : 0.38;
    const mat = new THREE.MeshStandardMaterial({ color, metalness, roughness });

    // Cuerpo: cilindro exterior
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(outerR, outerR, thickness, 128),
      mat
    );
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    // Simular agujero interior con material negro (placeholder). Para premium, usar CSG y restar un cilindro.
    const hole = new THREE.Mesh(
      new THREE.CylinderGeometry(
        innerR * 0.98,
        innerR * 0.98,
        thickness * 1.05,
        64
      ),
      new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.6,
        roughness: 0.4,
      })
    );
    hole.castShadow = hole.receiveShadow = true;
    group.add(hole);

    // Pernos
    const boltR = outerR * 0.02;
    const boltGeom = new THREE.CylinderGeometry(
      boltR,
      boltR,
      thickness * 1.2,
      32
    );
    const boltMat = new THREE.MeshStandardMaterial({
      color: 0x9e9e9e,
      metalness: 0.85,
      roughness: 0.3,
    });
    const radiusBolt = (innerR + outerR) / 1.8;
    for (let i = 0; i < pernos; i++) {
      const angle = (i / pernos) * Math.PI * 2;
      const x = Math.cos(angle) * radiusBolt;
      const z = Math.sin(angle) * radiusBolt;
      const bolt = new THREE.Mesh(boltGeom, boltMat);
      bolt.position.set(x, 0, z);
      bolt.castShadow = bolt.receiveShadow = true;
      group.add(bolt);
    }
  };

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0b0b);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      35,
      mount.clientWidth / mount.clientHeight,
      0.01,
      100
    );
    camera.position.set(2.5, 1.6, 2.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Luces de estudio
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.5);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(5, 6, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(-4, 3, -5);
    scene.add(rim);

    // Suelo y sombras de contacto aproximadas
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.ShadowMaterial({ opacity: 0.25 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.6;
    plane.receiveShadow = true;
    scene.add(plane);

    const flangeGroup = flangeGroupRef.current;
    scene.add(flangeGroup);
    buildFlange();

    // Control orbital simple (mouse)
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    const updateCamera = () => {
      const s = controlsState.current;
      const r = Math.max(1.2, Math.min(6, s.dist));
      const x = r * Math.cos(s.el) * Math.sin(s.az);
      const y = r * Math.sin(s.el);
      const z = r * Math.cos(s.el) * Math.cos(s.az);
      camera.position.set(x, y, z);
      camera.lookAt(0, 0, 0);
    };
    updateCamera();

    const onDown = (e) => {
      controlsState.current.rotating = true;
      controlsState.current.lastX = e.clientX;
      controlsState.current.lastY = e.clientY;
    };
    const onMove = (e) => {
      const s = controlsState.current;
      if (!s.rotating) return;
      const dx = (e.clientX - s.lastX) / 200;
      const dy = (e.clientY - s.lastY) / 200;
      s.az -= dx;
      s.el = Math.max(-1.2, Math.min(1.2, s.el - dy));
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      updateCamera();
    };
    const onUp = () => (controlsState.current.rotating = false);
    const onWheel = (e) => {
      controlsState.current.dist = Math.max(
        1,
        Math.min(8, controlsState.current.dist + e.deltaY * 0.002)
      );
      updateCamera();
    };
    renderer.domElement.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    renderer.domElement.addEventListener("wheel", onWheel);

    let raf;
    const tick = () => {
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      renderer.domElement.removeEventListener("mousedown", onDown);
      renderer.domElement.removeEventListener("wheel", onWheel);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild flange when params change
  useEffect(() => {
    buildFlange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.di, params.de, params.espesor, params.pernos, params.material]);

  return <div ref={mountRef} className="w-full h-full" />;
}
