import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Cotizaciones from "./pages/Cotizaciones.jsx";
import "./index.css";

export default function App() {
  const headerRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const mobileNavClasses = useMemo(
    () =>
      `mobile-nav fixed top-0 right-0 h-full w-full max-w-xs bg-black/90 backdrop-blur-lg z-40 flex flex-col items-center justify-center ${
        mobileOpen ? "open" : ""
      }`,
    [mobileOpen]
  );

  return (
    <div className="bg-black text-gray-200 min-h-screen flex flex-col">
      <header
        id="main-header"
        ref={headerRef}
        className={`fixed top-0 left-0 w-full z-50 p-4 md:px-8 transition-all duration-300 ${
          scrolled ? "scrolled" : ""
        }`}
      >
        <nav className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img
              src="/imagenes/BridaMark_Logo.png"
              alt="BridaMark Logo"
              className="h-7 md:h-8 w-auto"
            />
          </Link>
          <div className="hidden md:flex space-x-8 items-center">
            <a
              href="/#flanges-carousel"
              className="text-gray-300 hover:text-cyan-400 transition-colors"
            >
              Productos
            </a>
            <a
              href="/#servicios"
              className="text-gray-300 hover:text-cyan-400 transition-colors"
            >
              Servicios
            </a>
            <a
              href="/#proyectos"
              className="text-gray-300 hover:text-cyan-400 transition-colors"
            >
              Proyectos
            </a>
            <Link
              to="/cotizaciones"
              className="text-gray-300 hover:text-cyan-400 transition-colors"
            >
              Cotizaciones
            </Link>
            <a
              href="/#contacto"
              className="bg-cyan-500 text-black font-bold py-2 px-5 rounded-md hover:bg-cyan-400 transition-all duration-300 hover:scale-105"
            >
              Contacto
            </a>
          </div>
          <button
            id="mobile-menu-button"
            className="md:hidden text-white z-50"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </nav>
      </header>

      <div id="mobile-nav" className={mobileNavClasses}>
        <a
          href="/#flanges-carousel"
          className="text-gray-300 text-2xl py-4 hover:text-cyan-400 transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          Productos
        </a>
        <a
          href="/#servicios"
          className="text-gray-300 text-2xl py-4 hover:text-cyan-400 transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          Servicios
        </a>
        <a
          href="/#proyectos"
          className="text-gray-300 text-2xl py-4 hover:text-cyan-400 transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          Proyectos
        </a>
        <Link
          to="/cotizaciones"
          className="text-gray-300 text-2xl py-4 hover:text-cyan-400 transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          Cotizaciones
        </Link>
        <a
          href="/#contacto"
          className="mt-8 bg-cyan-500 text-black font-bold py-3 px-8 rounded-md text-xl hover:bg-cyan-400 transition-all"
          onClick={() => setMobileOpen(false)}
        >
          Contacto
        </a>
      </div>

      <div className="pt-20 flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cotizaciones" element={<Cotizaciones />} />
        </Routes>
      </div>

      <footer id="contacto" className="bg-[#0a0a0a] border-t border-gray-900">
        <div className="container mx-auto px-8 py-12 text-center text-gray-500">
          <p>
            &copy; 2025 [Nombre de tu Empresa]. Todos los derechos reservados.
          </p>
          <p className="mt-2 text-sm">
            Diseño de vanguardia para la minería del futuro.
          </p>
        </div>
      </footer>
    </div>
  );
}
