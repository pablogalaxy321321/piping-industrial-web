import FlangesCarousel from "../components/FlangesCarousel";

export default function Home() {
  return (
    <main className="bg-black">
      {/* Hero Section with Video */}
      <section
        id="hero-video-section"
        className="relative h-screen -mt-16 md:-mt-20"
      >
        <div className="relative h-screen w-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
            style={{ zIndex: 1 }}
          >
            <source src="/videos/revelacion_isotipo.webm" type="video/webm" />
            Su navegador no soporta el elemento de video.
          </video>
          <div className="absolute inset-0 bg-black/20" style={{ zIndex: 2 }} />
          <div
            className="hero-text-container absolute z-20 text-center text-white p-4 inset-0 flex items-center justify-center"
            style={{ zIndex: 3 }}
          >
            {/* Aquí puedes agregar texto superpuesto si lo necesitas */}
          </div>
        </div>
      </section>{" "}
      {/* Carrusel Avanzado de Flanges - Full Width */}
      <section
        id="flanges-carousel"
        className="py-20 md:py-32 overflow-hidden bg-black relative z-30"
      >
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold uppercase text-cyan-400 tracking-widest">
            Nuestros Productos
          </h2>
          <p className="text-4xl md:text-5xl font-black mt-2 text-white">
            Flanges de Precisión 3D
          </p>
          <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto">
            Tecnología de vanguardia aplicada a la fabricación de flanges
            industriales con estándares internacionales de calidad.
          </p>
        </div>

        <FlangesCarousel />
      </section>
      {/* Servicios - Full Width */}
      <section id="servicios" className="py-20 md:py-32 bg-black">
        <div className="container mx-auto px-4 md:px-8">
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
        </div>
      </section>
      {/* Proyectos - Full Width */}
      <section id="proyectos" className="py-20 md:py-32 bg-black">
        <div className="container mx-auto px-4 md:px-8">
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
              {/* Imagen temporal removida - placeholder */}
              <div className="rounded-xl shadow-2xl bg-gray-800 h-64 flex items-center justify-center">
                <p className="text-gray-400 text-center">
                  Imagen del proyecto
                  <br />
                  <span className="text-sm">Próximamente</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
