import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useImageSequence,
  loadManifest,
  pickBestSet,
} from "../lib/useImageSequence";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const canvasRef = useRef(null);
  const [setWidth, setSetWidth] = useState(() =>
    pickBestSet(window.innerWidth, window.devicePixelRatio || 1)
  );
  const [framesCount, setFramesCount] = useState(0);
  const [basePath, setBasePath] = useState(() => `/frames/${setWidth}`);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const { images } = useImageSequence({
    basePath,
    count: framesCount || 1,
    preload: 60,
  });

  // Cargar manifest del set actual
  useEffect(() => {
    let active = true;
    loadManifest(basePath)
      .then((m) => {
        if (active) setFramesCount(m.count || 0);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [basePath]);

  // Elegir mejor set en resize
  useEffect(() => {
    const onResize = () => {
      const best = pickBestSet(window.innerWidth, window.devicePixelRatio || 1);
      setSetWidth((prev) => (prev !== best ? best : prev));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Actualizar basePath al cambiar setWidth
  useEffect(() => {
    setBasePath(`/frames/${setWidth}`);
  }, [setWidth]);

  // Resize canvas to viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);
    return () => window.removeEventListener("resize", setCanvasSize);
  }, []);

  // GSAP scroll-driven image sequence and text intro
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    let rafId = 0;
    let currentIndex = 0;

    const draw = () => {
      const list = images.current;
      const img = list[currentIndex];
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
      }
      if (img && w > 0 && h > 0) {
        ctx.clearRect(0, 0, w, h);
        const iw = img.naturalWidth,
          ih = img.naturalHeight;
        const cr = w / h;
        const ir = iw / ih;
        let dw,
          dh,
          dx = 0,
          dy = 0;
        if (ir > cr) {
          dh = h;
          const scale = h / ih;
          dw = iw * scale;
          dx = (w - dw) / 2;
        } else {
          dw = w;
          const scale = w / iw;
          dh = ih * scale;
          dy = (h - dh) / 2;
        }
        ctx.drawImage(img, dx, dy, dw, dh);
      }
      rafId = requestAnimationFrame(draw);
    };

    const st = ScrollTrigger.create({
      trigger: "#hero-video-section",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      pin: true,
      onUpdate: (self) => {
        const total = Math.max(1, framesCount);
        const target = Math.min(
          total - 1,
          Math.max(0, Math.round(self.progress * (total - 1)))
        );
        currentIndex = target;
        const glow = Math.min(1, Math.max(0, self.progress * 1.1));
        gsap.to("#hero-glow", {
          opacity: glow * 0.4,
          overwrite: true,
          duration: 0.1,
          ease: "none",
        });
      },
    });

    gsap.to(".hero-text-container h1, .hero-text-container p", {
      opacity: 1,
      y: 0,
      stagger: 0.2,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: "#hero-video-section", start: "top center" },
    });

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      st && st.kill();
    };
  }, [images, dpr, framesCount]);

  // Preload explícito de los primeros frames del set seleccionado
  useEffect(() => {
    if (!framesCount) return;
    const head = document.head;
    const links = [];
    const max = Math.min(40, framesCount);
    for (let i = 0; i < max; i++) {
      const href = `${basePath}/frame_${String(i + 1).padStart(4, "0")}.webp`;
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      link.crossOrigin = "anonymous";
      head.appendChild(link);
      links.push(link);
    }
    return () => {
      links.forEach((l) => head.removeChild(l));
    };
  }, [basePath, framesCount]);

  return (
    <main>
      {/* Hero Section with Scroll-driven Image Sequence */}
  <section id="hero-video-section" className="relative h-[300vh] -mt-20">
  <div className="sticky top-20 h-screen w-full flex items-center justify-center overflow-hidden">
          <canvas
            id="hero-canvas"
            ref={canvasRef}
            className="absolute top-0 left-0 h-full w-full"
          ></canvas>
          <div
            id="hero-glow"
            className="pointer-events-none absolute inset-0 z-10 opacity-0"
            style={{
              background:
                "radial-gradient(60% 40% at 50% 50%, rgba(6, 182, 212, 0.25) 0%, rgba(0,0,0,0) 60%)",
              mixBlendMode: "screen",
            }}
          />
          <div
            className="hero-text-container absolute z-20 text-center text-white p-4"
            style={{ willChange: "opacity, transform" }}
          >
            <h1 className="text-4xl md:text-7xl font-black text-glow">
              INGENIERÍA DE PRECISIÓN
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-300">
              Soluciones de piping industrial para los desafíos más complejos de
              la minería en Chile.
            </p>
          </div>
        </div>
      </section>

      <div
        id="main-content"
        className="container mx-auto px-4 md:px-8 relative z-20"
      >
        <section id="servicios" className="py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase text-cyan-400 tracking-widest">
              Nuestra Expertise
            </h2>
            <p className="text-4xl md:text-5xl font-black mt-2 text-white">
              Servicios Integrales de Piping
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="service-card p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-white mb-2">
                Diseño y Modelado 3D
              </h3>
              <p className="text-gray-400">
                Utilizamos software CAD de última generación para crear modelos
                3D precisos que optimizan el rendimiento y evitan
                interferencias.
              </p>
            </div>
            <div className="service-card p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-white mb-2">
                Fabricación y Montaje
              </h3>
              <p className="text-gray-400">
                Contamos con talleres equipados para la fabricación de spools y
                flanges, asegurando un montaje preciso y eficiente en faena.
              </p>
            </div>
            <div className="service-card p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-white mb-2">
                Control de Calidad
              </h3>
              <p className="text-gray-400">
                Implementamos rigurosos protocolos de control de calidad para
                garantizar la seguridad y durabilidad de cada instalación.
              </p>
            </div>
          </div>
        </section>

        <section id="proyectos" className="py-20 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-sm font-bold uppercase text-cyan-400 tracking-widest">
                Proyectos Destacados
              </h2>
              <p className="text-4xl md:text-5xl font-black mt-2 text-white">
                Innovación Aplicada en Terreno
              </p>
              <p className="mt-6 text-gray-400 text-lg">
                Nuestra experiencia se traduce en proyectos exitosos para las
                principales compañías mineras del país. Enfrentamos desafíos
                complejos, entregando siempre resultados que superan las
                expectativas.
              </p>
              <a
                href="#contacto"
                className="mt-8 inline-block bg-cyan-500 text-black font-bold py-3 px-6 rounded-md hover:bg-cyan-400 transition-all"
              >
                Ver más proyectos
              </a>
            </div>
            <div>
              <img
                src="https://placehold.co/600x400/000000/1F2937?text=Proyecto+Minero+1"
                alt="Imagen de un proyecto de piping en una faena minera"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
