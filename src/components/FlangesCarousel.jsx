import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const flangesData = [
  {
    id: 1,
    image: "/imagenes/flanges/BridaMark_Flange_virtual.png",
    title: "Flange Virtual 150#",
    description:
      "Diseño avanzado con tecnología de modelado 3D para aplicaciones de alta presión en minería.",
    specs: ["ANSI B16.5", "Acero al Carbono", "150-300 PSI"],
  },
  {
    id: 2,
    image: "/imagenes/flanges/BridaMark_Flange_virtual2.png",
    title: "Flange Virtual 300#",
    description:
      "Solución optimizada para sistemas de piping complejos con máxima resistencia y durabilidad.",
    specs: ["ANSI B16.5", "Acero Inoxidable", "300-600 PSI"],
  },
  {
    id: 3,
    image: "/imagenes/flanges/BridaMark_flange1.png",
    title: "Flange Industrial Estándar",
    description:
      "Fabricación de precisión para aplicaciones industriales con certificaciones internacionales.",
    specs: ["ISO 7005", "Aleación Especial", "Alta Temperatura"],
  },
  {
    id: 4,
    image: "/imagenes/flanges/BridaMark_flange2.png",
    title: "Junta Rotativa Orbital (J.R.O.)",
    description:
      "Diseño especializado para Movimiento de Alta Precisión en entornos de Vacío Extremo y variación térmica en satélites de telecomunicaciones.",
    specs: [
      "Aleación de Titanio Grado 5 (Ti-6Al-4V)",
      "Certificación AS9100",
      "50.000+ Ciclos de Vida Rotacional",
    ],
  },
  {
    id: 5,
    image: "/imagenes/flanges/flange3D.jpg",
    title: "Flange 3D Avanzado",
    description:
      "Tecnología de vanguardia con modelado tridimensional para máxima precisión.",
    specs: ["Diseño Custom", "Multi-Material", "Presión Variable"],
  },
];

export default function FlangesCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef(null);
  const slidesRef = useRef([]);
  const backgroundRef = useRef(null);
  const intervaloRef = useRef(null);

  // Auto-play del carrusel
  useEffect(() => {
    if (isAutoPlaying) {
      intervaloRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % flangesData.length);
      }, 4000);
    }

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };
  }, [isAutoPlaying]);

  // Efectos GSAP para transiciones 3D
  useEffect(() => {
    const slides = slidesRef.current;
    const container = carouselRef.current;
    if (!slides.length || !container) return;

    // Limpiar animaciones previas
    gsap.killTweensOf(slides);
    gsap.killTweensOf(backgroundRef.current);

    slides.forEach((slide, index) => {
      if (!slide) return;

      const isActive = index === currentSlide;
      const isPrev =
        index === (currentSlide - 1 + flangesData.length) % flangesData.length;
      const isNext = index === (currentSlide + 1) % flangesData.length;

      // Configuración inicial
      gsap.set(slide, {
        position: "absolute",
        top: "50%",
        left: "50%",
        transformOrigin: "center center",
      });

      if (isActive) {
        // Slide activo - centro con efecto de profundidad
        gsap.to(slide, {
          duration: 0.8,
          x: "-50%",
          y: "-50%",
          scale: 1,
          rotationY: 0,
          rotationX: 0,
          z: 0,
          opacity: 1,
          filter: "blur(0px) brightness(1.1)",
          ease: "power3.out",
        });
      } else if (isPrev) {
        // Slide anterior - izquierda con perspectiva
        gsap.to(slide, {
          duration: 0.8,
          x: "-150%",
          y: "-50%",
          scale: 0.75,
          rotationY: 45,
          rotationX: -10,
          z: -200,
          opacity: 0.6,
          filter: "blur(2px) brightness(0.7)",
          ease: "power3.out",
        });
      } else if (isNext) {
        // Slide siguiente - derecha con perspectiva
        gsap.to(slide, {
          duration: 0.8,
          x: "50%",
          y: "-50%",
          scale: 0.75,
          rotationY: -45,
          rotationX: -10,
          z: -200,
          opacity: 0.6,
          filter: "blur(2px) brightness(0.7)",
          ease: "power3.out",
        });
      } else {
        // Slides ocultos
        gsap.to(slide, {
          duration: 0.6,
          scale: 0.5,
          opacity: 0,
          z: -400,
          ease: "power2.out",
        });
      }
    });

    // Efecto parallax en el fondo
    if (backgroundRef.current) {
      gsap.to(backgroundRef.current, {
        duration: 1.2,
        backgroundPosition: `${currentSlide * 20}% 50%`,
        ease: "power2.out",
      });
    }
  }, [currentSlide]);

  // Efectos de scroll parallax
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const scrollTrigger = ScrollTrigger.create({
      trigger: container,
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        // Parallax en las slides
        slidesRef.current.forEach((slide, index) => {
          if (slide) {
            gsap.to(slide, {
              duration: 0.3,
              y: `${-50 + progress * 30 * (index % 2 === 0 ? 1 : -1)}%`,
              rotationX: progress * 5 * (index % 2 === 0 ? 1 : -1),
              overwrite: "auto",
            });
          }
        });

        // Efecto en el fondo
        if (backgroundRef.current) {
          gsap.to(backgroundRef.current, {
            duration: 0.3,
            scale: 1 + progress * 0.1,
            opacity: 0.8 - progress * 0.3,
            overwrite: "auto",
          });
        }
      },
    });

    return () => {
      scrollTrigger.kill();
    };
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % flangesData.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + flangesData.length) % flangesData.length
    );
  };

  return (
    <div
      ref={carouselRef}
      className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden rounded-2xl"
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Fondo dinámico con gradientes */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at 30% 40%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 60%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.8) 100%)
          `,
          backgroundSize: "120% 120%",
        }}
      />

      {/* Slides del carrusel */}
      <div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {flangesData.map((flange, index) => (
          <div
            key={flange.id}
            ref={(el) => (slidesRef.current[index] = el)}
            className="carousel-slide flex items-center justify-center"
            style={{
              width: "80%",
              maxWidth: "900px",
              height: "80%",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 h-full">
              {/* Imagen con efectos 3D */}
              <div className="relative flex-1 flex items-center justify-center">
                <div
                  className="relative group cursor-pointer"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <img
                    src={flange.image}
                    alt={flange.title}
                    className="w-full max-w-md h-auto object-contain transition-all duration-700 
                             group-hover:scale-110 group-hover:rotate-2 
                             drop-shadow-2xl filter brightness-110 contrast-110"
                    style={{
                      filter:
                        index === currentSlide
                          ? "drop-shadow(0 25px 50px rgba(6, 182, 212, 0.4)) brightness(1.2)"
                          : "drop-shadow(0 10px 30px rgba(0,0,0,0.5))",
                      transform:
                        index === currentSlide
                          ? "translateZ(50px)"
                          : "translateZ(0px)",
                    }}
                  />

                  {/* Efecto de brillo holográfico */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(45deg, transparent 40%, rgba(6, 182, 212, 0.1) 50%, transparent 60%)",
                      animation:
                        index === currentSlide ? "shimmer 3s infinite" : "none",
                    }}
                  />
                </div>
              </div>

              {/* Contenido textual */}
              <div className="flex-1 text-center lg:text-left space-y-6">
                <div>
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-4 text-glow">
                    {flange.title}
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    {flange.description}
                  </p>
                </div>

                {/* Especificaciones técnicas */}
                <div className="space-y-3">
                  <h4 className="text-cyan-400 font-bold text-sm uppercase tracking-widest">
                    Especificaciones Técnicas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {flange.specs.map((spec, specIndex) => (
                      <span
                        key={specIndex}
                        className="px-3 py-1 bg-gray-800/60 border border-cyan-500/30 
                                 rounded-full text-sm text-cyan-300 backdrop-blur-sm
                                 hover:bg-cyan-500/10 hover:border-cyan-400/50 transition-all"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Botón de acción */}
                <button
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 
                                 text-black font-bold rounded-lg hover:from-cyan-400 hover:to-blue-500 
                                 transition-all duration-300 hover:scale-105 hover:shadow-lg 
                                 hover:shadow-cyan-500/25 transform-gpu"
                >
                  Ver Detalles Técnicos
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controles de navegación */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full 
                   bg-black/40 backdrop-blur-sm border border-white/20 text-white 
                   hover:bg-black/60 hover:border-cyan-400/50 hover:text-cyan-400 
                   transition-all duration-300 hover:scale-110"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full 
                   bg-black/40 backdrop-blur-sm border border-white/20 text-white 
                   hover:bg-black/60 hover:border-cyan-400/50 hover:text-cyan-400 
                   transition-all duration-300 hover:scale-110"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Indicadores de slides */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {flangesData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
              index === currentSlide
                ? "bg-cyan-400 shadow-lg shadow-cyan-400/50"
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Contador de slides */}
      <div
        className="absolute top-6 right-6 px-4 py-2 bg-black/40 backdrop-blur-sm 
                      rounded-full border border-white/20 text-white text-sm z-10"
      >
        <span className="text-cyan-400 font-bold">{currentSlide + 1}</span>
        <span className="text-gray-400 mx-2">/</span>
        <span className="text-gray-400">{flangesData.length}</span>
      </div>
    </div>
  );
}
