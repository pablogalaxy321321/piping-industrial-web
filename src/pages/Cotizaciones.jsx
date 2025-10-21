import { useState } from "react";
import Cotizaciones3D from "./Cotizaciones3D.jsx";

export default function Cotizaciones() {
  const [params, setParams] = useState({
    di: 0.3, // diámetro interior (m)
    de: 0.6, // diámetro exterior (m)
    espesor: 0.06, // espesor (m)
    pernos: 12,
    material: "inox",
    unidades: 10,
  });

  const update = (key, value) => setParams((p) => ({ ...p, [key]: value }));

  return (
    <main className="px-4 md:px-8 pt-24 pb-10 text-gray-200">
      <header className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-5xl font-black text-white text-glow">
          Cotizaciones
        </h1>
        <p className="mt-2 text-gray-400">
          Configura tu flange y solicita una cotización provisoria.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <section className="lg:col-span-8 h-[60vh] md:h-[70vh] lg:h-[78vh] bg-black/40 border border-gray-800 rounded-xl overflow-hidden">
          <Cotizaciones3D params={params} />
        </section>

        <aside className="lg:col-span-4 bg-black/50 border border-gray-800 rounded-xl p-4 md:p-6 flex flex-col">
          <h2 className="text-xl font-bold text-white mb-4">Parámetros</h2>
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-sm text-gray-300">
                Diámetro interior (m)
              </label>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.01"
                value={params.di}
                onChange={(e) => update("di", parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {params.di.toFixed(2)} m
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300">
                Diámetro exterior (m)
              </label>
              <input
                type="range"
                min="0.2"
                max="1.2"
                step="0.01"
                value={params.de}
                onChange={(e) => update("de", parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {params.de.toFixed(2)} m
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300">Espesor (m)</label>
              <input
                type="range"
                min="0.02"
                max="0.2"
                step="0.005"
                value={params.espesor}
                onChange={(e) => update("espesor", parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {params.espesor.toFixed(3)} m
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300">
                Cantidad de pernos
              </label>
              <input
                type="range"
                min="4"
                max="24"
                step="1"
                value={params.pernos}
                onChange={(e) => update("pernos", parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {params.pernos} pernos
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300">Material</label>
              <select
                value={params.material}
                onChange={(e) => update("material", e.target.value)}
                className="mt-2 w-full rounded-md bg-[#0a0a0a] border border-gray-800 px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="inox">Acero Inoxidable</option>
                <option value="acero">Acero al Carbono</option>
                <option value="bronce">Bronce</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300">Unidades</label>
              <input
                type="number"
                min="1"
                value={params.unidades}
                onChange={(e) =>
                  update("unidades", parseInt(e.target.value) || 1)
                }
                className="mt-2 w-full rounded-md bg-[#0a0a0a] border border-gray-800 px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
          <button
            type="button"
            className="mt-6 bg-cyan-500 text-black font-bold py-3 px-6 rounded-md hover:bg-cyan-400 transition-all duration-300 hover:scale-105"
            onClick={() => {
              // Placeholder: Vapi Voice Chat trigger — requiere integrar su SDK/iframe con tu API key (no se comitea)
              alert(
                "Iniciar chat de voz (Vapi) para gestionar cotización provisoria"
              );
            }}
          >
            Hablar con un asesor (Vapi)
          </button>
        </aside>
      </div>
    </main>
  );
}
