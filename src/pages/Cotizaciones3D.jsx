import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";

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
    dist: 1.5, // Distancia inicial más cercana
  });

  // Crear/Recrear geometría del flange
  const buildFlange = () => {
    const group = flangeGroupRef.current;
    group.clear();
    const { di, de, espesor, material, flangeType } = params;
    // pernos se usa en las funciones de creación individuales

    // Convertir de milímetros a metros para la visualización 3D, con escalado mejorado
    const scale = 0.005; // Factor de escala para mejor visualización
    const outerR = (de * scale) / 2;
    const innerR = (di * scale) / 2;
    const thickness = espesor * scale;

    // Determinar propiedades del material basado en ASTM - REALISTA
    let color, metalness, roughness, envMapIntensity, clearcoat;
    if (
      material.includes("SS 304") ||
      material.includes("SS 316") ||
      material.includes("SS Dúplex")
    ) {
      // Acero Inoxidable - Colores realistas
      color = 0xc0c5d0; // Gris acero más neutro
      metalness = 0.9;
      roughness = 0.2;
      envMapIntensity = 0.6; // Reducido para menos reflecciones
      clearcoat = 0.05;
    } else if (
      material.includes("CS A105") ||
      material.includes("CS Baja Temp")
    ) {
      // Acero al Carbono - Tono más realista
      color = 0xa8b0b8; // Gris más oscuro y neutro
      metalness = 0.8;
      roughness = 0.3;
      envMapIntensity = 0.5; // Reducido
      clearcoat = 0.03;
    } else if (material.includes("Bronce")) {
      // Bronce - Color más auténtico
      color = 0xd4b896; // Bronce más realista
      metalness = 0.7;
      roughness = 0.25;
      envMapIntensity = 0.4; // Reducido
      clearcoat = 0.05;
    } else {
      // Material por defecto
      color = 0xc0c5d0;
      metalness = 0.85;
      roughness = 0.25;
      envMapIntensity = 0.5; // Reducido
      clearcoat = 0.05;
    }

    // Material PBR físico premium
    const mat = new THREE.MeshPhysicalMaterial({
      color,
      metalness,
      roughness,
      envMapIntensity,
      clearcoat,
      clearcoatRoughness: 0.2,
      reflectivity: 0.9,
      ior: 1.5,
      transparent: false,
      opacity: 1.0,
      side: THREE.FrontSide,
      flatShading: false,
    });

    // Añadir textura de rugosidad procedural para mayor realismo
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Crear patrón de rugosidad metálica
    const imageData = ctx.createImageData(512, 512);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.random() * 0.3 + 0.7; // Ruido sutil
      const value = Math.floor(noise * 255);
      imageData.data[i] = value; // R
      imageData.data[i + 1] = value; // G
      imageData.data[i + 2] = value; // B
      imageData.data[i + 3] = 255; // A
    }
    ctx.putImageData(imageData, 0, 0);

    const roughnessTexture = new THREE.CanvasTexture(canvas);
    roughnessTexture.wrapS = roughnessTexture.wrapT = THREE.RepeatWrapping;
    roughnessTexture.repeat.set(4, 4);
    mat.roughnessMap = roughnessTexture;

    // Crear geometría según el tipo de brida
    switch (flangeType) {
      case "BL": // Blind Flange (Ciega)
        createBlindFlange(group, outerR, innerR, thickness, mat);
        break;
      case "WN": // Welding Neck (Cuello para Soldar)
        createWeldingNeckFlange(group, outerR, innerR, thickness, mat);
        break;
      case "SO": // Slip-On (Deslizante)
        createSlipOnFlange(group, outerR, innerR, thickness, mat);
        break;
      case "TH": // Threaded (Roscada)
        createThreadedFlange(group, outerR, innerR, thickness, mat);
        break;
      default:
        createWeldingNeckFlange(group, outerR, innerR, thickness, mat);
    }

    // NO AGREGAR PERNOS - Los flanges se muestran sin pernos como solicitado
  };

  // Función para crear brida ciega (Blind Flange)
  const createBlindFlange = (group, outerR, innerR, thickness, mat) => {
    // Crear shape con perforaciones para pernos pero sin agujero central
    const flangeShape = new THREE.Shape();
    flangeShape.absarc(0, 0, outerR, 0, Math.PI * 2, false);

    // Agregar perforaciones para pernos
    const { pernos } = params;
    if (pernos > 0) {
      const boltHoleRadius = Math.max(outerR * 0.025, 0.006);
      const boltCircleRadius = outerR * 0.7; // Para brida ciega, usar radio basado en exterior

      for (let i = 0; i < pernos; i++) {
        const angle = (i / pernos) * Math.PI * 2;
        const x = Math.cos(angle) * boltCircleRadius;
        const z = Math.sin(angle) * boltCircleRadius;

        const boltHole = new THREE.Path();
        boltHole.absarc(x, z, boltHoleRadius, 0, Math.PI * 2, true);
        flangeShape.holes.push(boltHole);
      }
    }

    const extrudeSettings = {
      depth: thickness,
      bevelEnabled: false,
    };

    const flangeGeom = new THREE.ExtrudeGeometry(flangeShape, extrudeSettings);
    const body = new THREE.Mesh(flangeGeom, mat);
    body.rotation.x = -Math.PI / 2;
    // Alinear base del cuerpo en y=0 para que el hub se acople sin gap
    body.position.y = 0;
    body.castShadow = body.receiveShadow = true;
    group.add(body);
  };

  // Función para crear brida con cuello para soldar (Welding Neck)
  const createWeldingNeckFlange = (group, outerR, innerR, thickness, mat) => {
    // Cuerpo principal de la brida con agujero interior y perforaciones para pernos
    const flangeShape = new THREE.Shape();
    flangeShape.absarc(0, 0, outerR, 0, Math.PI * 2, false);

    // Crear agujero interior si es significativo
    if (innerR > 0.01) {
      const holeShape = new THREE.Path();
      holeShape.absarc(0, 0, innerR, 0, Math.PI * 2, true);
      flangeShape.holes.push(holeShape);
    }

    // Agregar perforaciones para pernos
    const { pernos } = params;
    if (pernos > 0) {
      const boltHoleRadius = Math.max(outerR * 0.025, 0.006);
      const boltCircleRadius = innerR + (outerR - innerR) * 0.7;

      for (let i = 0; i < pernos; i++) {
        const angle = (i / pernos) * Math.PI * 2;
        const x = Math.cos(angle) * boltCircleRadius;
        const z = Math.sin(angle) * boltCircleRadius;

        const boltHole = new THREE.Path();
        boltHole.absarc(x, z, boltHoleRadius, 0, Math.PI * 2, true);
        flangeShape.holes.push(boltHole);
      }
    }

    const extrudeSettings = {
      depth: thickness,
      bevelEnabled: false,
    };

    const flangeGeom = new THREE.ExtrudeGeometry(flangeShape, extrudeSettings);
    const body = new THREE.Mesh(flangeGeom, mat);
    body.rotation.x = -Math.PI / 2;
    body.position.y = thickness / 2;
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    // Cuello cónico para soldadura - CORREGIDO
    if (innerR > 0.01) {
      const neckHeight = thickness * 1.5; // Altura reducida
      const neckGeom = new THREE.ConeGeometry(
        innerR * 1.02, // Radio superior más ajustado
        innerR * 1.2, // Radio inferior reducido
        neckHeight,
        32
      );
      const neck = new THREE.Mesh(neckGeom, mat);
      neck.position.y = -neckHeight / 2; // Posición corregida
      neck.castShadow = neck.receiveShadow = true;
      group.add(neck);
    }
  };

  // Función para crear brida deslizante (Slip-On)
  const createSlipOnFlange = (group, outerR, innerR, thickness, mat) => {
    // Cuerpo principal: anillo con agujeros reales (Extrude + holes)
    const flangeShape = new THREE.Shape();
    flangeShape.absarc(0, 0, outerR, 0, Math.PI * 2, false);

    if (innerR > 0.01) {
      const bore = new THREE.Path();
      bore.absarc(0, 0, innerR, 0, Math.PI * 2, true);
      flangeShape.holes.push(bore);
    }

    // Agujeros de pernos (circulares reales)
    const { pernos } = params;
    if (pernos > 0) {
      const boltHoleRadius = Math.max(outerR * 0.025, 0.006);
      const boltCircleRadius = innerR + (outerR - innerR) * 0.65; // un poco más hacia adentro
      for (let i = 0; i < pernos; i++) {
        const angle = (i / pernos) * Math.PI * 2;
        const x = Math.cos(angle) * boltCircleRadius;
        const z = Math.sin(angle) * boltCircleRadius;
        const hole = new THREE.Path();
        hole.absarc(x, z, boltHoleRadius, 0, Math.PI * 2, true);
        flangeShape.holes.push(hole);
      }
    }

    const flangeGeom = new THREE.ExtrudeGeometry(flangeShape, {
      depth: thickness,
      bevelEnabled: false,
      steps: 1,
      curveSegments: 64,
    });
    const body = new THREE.Mesh(flangeGeom, mat);
    body.rotation.x = -Math.PI / 2;
    body.position.y = thickness / 2;
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    // Raised Face (RF) opcional
    const faceType = (params.faceType || "").toLowerCase();
    const wantsRF = faceType.includes("rf") || faceType.includes("raised");
    if (wantsRF && innerR > 0.01) {
      const rfWidth = Math.min((outerR - innerR) * 0.18, outerR * 0.1);
      const rfOuterR = innerR + rfWidth;
      const rfHeight = Math.max(thickness * 0.07, outerR * 0.008);

      const rfShape = new THREE.Shape();
      rfShape.absarc(0, 0, rfOuterR, 0, Math.PI * 2, false);
      const rfHole = new THREE.Path();
      rfHole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
      rfShape.holes.push(rfHole);

      const rfGeom = new THREE.ExtrudeGeometry(rfShape, {
        depth: rfHeight,
        bevelEnabled: false,
        steps: 1,
        curveSegments: 64,
      });
      const rfMesh = new THREE.Mesh(rfGeom, mat);
      rfMesh.rotation.x = -Math.PI / 2;
      // El cuerpo ahora apoya en y=0, su cara superior queda en y=thickness
      rfMesh.position.y = thickness + rfHeight / 2 + 1e-5; // evitar z-fighting
      rfMesh.castShadow = rfMesh.receiveShadow = true;
      group.add(rfMesh);
    }

    // Cuello Slip-On (corto y proporcionado)
    if (innerR > 0.01) {
      const hubHeight = Math.max(thickness * 0.25, outerR * 0.03); // más corto
      const hubRadius = innerR + 1e-4; // al ras con el bore para evitar gap visual
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(hubRadius, hubRadius, hubHeight, 48),
        mat
      );
      // Debe partir desde la cara inferior (y=0) hacia abajo (sin holgura)
      hub.position.y = -hubHeight / 2;
      hub.castShadow = hub.receiveShadow = true;
      group.add(hub);
    }
  };

  // Función para crear brida roscada (Threaded) - SIMPLIFICADA
  const createThreadedFlange = (group, outerR, innerR, thickness, mat) => {
    // Cuerpo principal de la brida con agujero interior y perforaciones para pernos
    const flangeShape = new THREE.Shape();
    flangeShape.absarc(0, 0, outerR, 0, Math.PI * 2, false);

    // Crear agujero interior si es significativo
    if (innerR > 0.01) {
      const holeShape = new THREE.Path();
      holeShape.absarc(0, 0, innerR, 0, Math.PI * 2, true);
      flangeShape.holes.push(holeShape);
    }

    // Agregar perforaciones para pernos
    const { pernos } = params;
    if (pernos > 0) {
      const boltHoleRadius = Math.max(outerR * 0.025, 0.006);
      const boltCircleRadius = innerR + (outerR - innerR) * 0.7;

      for (let i = 0; i < pernos; i++) {
        const angle = (i / pernos) * Math.PI * 2;
        const x = Math.cos(angle) * boltCircleRadius;
        const z = Math.sin(angle) * boltCircleRadius;

        const boltHole = new THREE.Path();
        boltHole.absarc(x, z, boltHoleRadius, 0, Math.PI * 2, true);
        flangeShape.holes.push(boltHole);
      }
    }

    const extrudeSettings = {
      depth: thickness,
      bevelEnabled: false,
    };

    const flangeGeom = new THREE.ExtrudeGeometry(flangeShape, extrudeSettings);
    const body = new THREE.Mesh(flangeGeom, mat);
    body.rotation.x = -Math.PI / 2;
    body.position.y = thickness / 2;
    body.castShadow = body.receiveShadow = true;
    group.add(body);

    // Crear roscas simples y limpias en el agujero interior
    if (innerR > 0.01) {
      const threadDepth = innerR * 0.03; // Profundidad reducida para evitar problemas
      const numThreads = 6; // Número fijo para consistencia

      for (let i = 0; i < numThreads; i++) {
        // Crear anillos simples para representar roscas
        const threadGeometry = new THREE.TorusGeometry(
          innerR + threadDepth, // Radio mayor
          threadDepth * 0.5, // Radio menor del anillo
          8, // Segmentos radiales
          16 // Segmentos tubulares
        );

        const thread = new THREE.Mesh(threadGeometry, mat);
        thread.position.y =
          -thickness / 2 + (i + 0.5) * (thickness / numThreads);
        thread.rotation.x = Math.PI / 2;

        thread.castShadow = thread.receiveShadow = true;
        group.add(thread);
      }
    }
  };
  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();

    // FONDO NEUTRO - Profesional
    scene.background = new THREE.Color(0x1a1a1a); // Gris oscuro neutro

    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      35,
      mount.clientWidth / mount.clientHeight,
      0.01,
      100
    );
    camera.position.set(1.5, 1.0, 1.5);
    cameraRef.current = camera;

    // RENDERER PREMIUM - Configuración de alta calidad
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
    });

    // Configuraciones de renderizado premium
    renderer.setPixelRatio(Math.min(2.5, window.devicePixelRatio || 1));
    renderer.setSize(mount.clientWidth, mount.clientHeight);

    // Tone mapping para colores naturales
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0; // Reducido para menos saturación

    // Output encoding para colores precisos
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Sombras premium
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;

    // Configuraciones adicionales de calidad
    renderer.physicallyCorrectLights = true;
    renderer.localClippingEnabled = false;

    mount.appendChild(renderer.domElement);

    // Environment realista tipo estudio
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();
    rendererRef.current = renderer;

    // Post-proceso premium
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(mount.clientWidth, mount.clientHeight),
      0.08,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);
    const smaaPass = new SMAAPass(
      mount.clientWidth * renderer.getPixelRatio(),
      mount.clientHeight * renderer.getPixelRatio()
    );
    composer.addPass(smaaPass);

    // SISTEMA DE ILUMINACIÓN REALISTA

    // 1. Luz ambiente neutra
    const ambientLight = new THREE.AmbientLight(0x8a8a8a, 0.25); // Gris neutro
    scene.add(ambientLight);

    // 2. Luz hemisférica suave
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    // 3. Luz principal direccional - Luz blanca cálida
    const keyLight = new THREE.DirectionalLight(0xfff8e1, 1.4); // Blanco cálido
    keyLight.position.set(8, 12, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.setScalar(4096);
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.normalBias = 0.005;
    scene.add(keyLight);

    // 4. Luz de relleno neutra
    const fillLight = new THREE.DirectionalLight(0xf5f5f5, 0.6); // Blanco neutro
    fillLight.position.set(-6, 8, -4);
    fillLight.castShadow = true;
    fillLight.shadow.mapSize.setScalar(2048);
    fillLight.shadow.bias = -0.0003;
    scene.add(fillLight);

    // 5. Luz de contorno suave
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8); // Blanco puro
    rimLight.position.set(-8, 4, -10);
    scene.add(rimLight);

    // 6. Luces puntuales sutiles
    const detailLight1 = new THREE.PointLight(0xffffff, 0.4, 15); // Reducida
    detailLight1.position.set(3, 2, 3);
    scene.add(detailLight1);

    const detailLight2 = new THREE.PointLight(0xf8f8f8, 0.3, 12); // Reducida
    detailLight2.position.set(-3, 3, -2);
    scene.add(detailLight2);
    // Suelo con sombra de contacto
    const groundPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.ShadowMaterial({ opacity: 0.35 })
    );
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -0.15;
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);

    const flangeGroup = flangeGroupRef.current;
    scene.add(flangeGroup);
    buildFlange();

    // Control orbital mejorado (mouse)
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      composer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const updateCamera = () => {
      const s = controlsState.current;
      const r = Math.max(0.5, Math.min(3, s.dist)); // Límites ajustados para mejor visualización
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
        0.3,
        Math.min(4, controlsState.current.dist + e.deltaY * 0.001)
      );
      updateCamera();
    };
    renderer.domElement.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    renderer.domElement.addEventListener("wheel", onWheel);

    let raf;
    const clock = new THREE.Clock();

    const tick = () => {
      const deltaTime = clock.getDelta();

      // Efectos de animación premium sutiles
      if (flangeGroup.children.length > 0) {
        // Rotación muy suave para mostrar reflecciones dinámicas
        flangeGroup.rotation.y += deltaTime * 0.02;
      }

      // Render con postproceso
      composer.render();
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
      composer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild flange when params change
  useEffect(() => {
    buildFlange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.di,
    params.de,
    params.espesor,
    params.pernos,
    params.material,
    params.nominalSize,
    params.pressureClass,
    params.flangeType,
    params.faceType,
    params.customDimensions,
    params.unidades,
  ]);

  return <div ref={mountRef} className="w-full h-full" />;
}
