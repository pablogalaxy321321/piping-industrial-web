import { useState } from "react";
import Cotizaciones3D from "./Cotizaciones3D.jsx";

// Datos estándar ASME B16.5
const ASME_B16_5_DATA = {
  1: {
    150: { od: 108, bolts: 4, thickness: 11 },
    300: { od: 117, bolts: 4, thickness: 14 },
    600: { od: 124, bolts: 4, thickness: 17 },
    900: { od: 124, bolts: 4, thickness: 17 },
  },
  1.5: {
    150: { od: 127, bolts: 4, thickness: 13 },
    300: { od: 137, bolts: 4, thickness: 16 },
    600: { od: 149, bolts: 4, thickness: 21 },
    900: { od: 149, bolts: 4, thickness: 21 },
  },
  2: {
    150: { od: 152, bolts: 4, thickness: 16 },
    300: { od: 165, bolts: 8, thickness: 19 },
    600: { od: 178, bolts: 8, thickness: 25 },
    900: { od: 190, bolts: 8, thickness: 32 },
  },
  3: {
    150: { od: 190, bolts: 4, thickness: 19 },
    300: { od: 210, bolts: 8, thickness: 22 },
    600: { od: 229, bolts: 8, thickness: 29 },
    900: { od: 254, bolts: 8, thickness: 38 },
  },
  4: {
    150: { od: 229, bolts: 8, thickness: 19 },
    300: { od: 254, bolts: 8, thickness: 24 },
    600: { od: 279, bolts: 8, thickness: 32 },
    900: { od: 318, bolts: 8, thickness: 43 },
  },
  6: {
    150: { od: 279, bolts: 8, thickness: 22 },
    300: { od: 318, bolts: 12, thickness: 29 },
    600: { od: 356, bolts: 12, thickness: 36 },
    900: { od: 394, bolts: 12, thickness: 48 },
  },
  8: {
    150: { od: 343, bolts: 8, thickness: 24 },
    300: { od: 381, bolts: 12, thickness: 32 },
    600: { od: 419, bolts: 12, thickness: 41 },
    900: { od: 457, bolts: 12, thickness: 54 },
  },
  10: {
    150: { od: 406, bolts: 12, thickness: 25 },
    300: { od: 445, bolts: 16, thickness: 35 },
    600: { od: 508, bolts: 16, thickness: 44 },
    900: { od: 559, bolts: 16, thickness: 57 },
  },
  12: {
    150: { od: 483, bolts: 12, thickness: 29 },
    300: { od: 521, bolts: 16, thickness: 38 },
    600: { od: 597, bolts: 20, thickness: 48 },
    900: { od: 648, bolts: 20, thickness: 60 },
  },
};

// Conversión NPS a diámetro interior aproximado (mm)
const NPS_TO_ID = {
  1: 26.6,
  1.5: 40.9,
  2: 52.5,
  3: 77.9,
  4: 102.3,
  6: 154.1,
  8: 202.7,
  10: 254.5,
  12: 303.2,
};

export default function Cotizaciones() {
  const [params, setParams] = useState({
    // Parámetros profesionales ASME B16.5
    material: "SS 304/304L (ASTM A182)",
    flangeType: "WN", // Welding Neck por defecto
    pressureClass: "150",
    faceType: "RF", // Raised Face por defecto
    nominalSize: "4", // NPS 4" por defecto
    di: NPS_TO_ID["4"], // diámetro interior calculado (mm)
    de: ASME_B16_5_DATA["4"]["150"].od, // diámetro exterior estándar (mm)
    espesor: 15, // espesor por defecto (mm)
    pernos: ASME_B16_5_DATA["4"]["150"].bolts, // cantidad de pernos estándar
    customDimensions: false, // Dimensiones a medida
    unidades: 10,
  });

  const update = (key, value) => {
    setParams((prevParams) => {
      const newParams = { ...prevParams, [key]: value };

      // Auto-ajuste basado en estándares ASME B16.5
      if (
        (key === "nominalSize" || key === "pressureClass") &&
        !newParams.customDimensions
      ) {
        const standard =
          ASME_B16_5_DATA[newParams.nominalSize]?.[newParams.pressureClass];
        if (standard) {
          newParams.di = NPS_TO_ID[newParams.nominalSize];
          newParams.de = standard.od;
          newParams.pernos = standard.bolts;
          newParams.espesor = standard.thickness;
        }
      }

      // Si se activa custom dimensions, mantener valores actuales
      if (key === "customDimensions" && value === false) {
        const standard =
          ASME_B16_5_DATA[newParams.nominalSize]?.[newParams.pressureClass];
        if (standard) {
          newParams.di = NPS_TO_ID[newParams.nominalSize];
          newParams.de = standard.od;
          newParams.pernos = standard.bolts;
          newParams.espesor = standard.thickness;
        }
      }

      return newParams;
    });
  };

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
          <h2 className="text-xl font-bold text-white mb-4">
            Parámetros ASME B16.5
          </h2>
          <div className="space-y-4 flex-1">
            {/* Material */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Material
              </label>
              <select
                value={params.material}
                onChange={(e) => update("material", e.target.value)}
                className="w-full rounded-md bg-[#0a0a0a] border border-gray-800 px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <optgroup label="Acero Inoxidable">
                  <option value="SS 304/304L (ASTM A182)">
                    SS 304/304L (ASTM A182)
                  </option>
                  <option value="SS 316/316L (ASTM A182)">
                    SS 316/316L (ASTM A182)
                  </option>
                  <option value="SS Dúplex 2205 (ASTM A182)">
                    SS Dúplex 2205 (ASTM A182)
                  </option>
                </optgroup>
                <optgroup label="Acero al Carbono">
                  <option value="CS A105N (ASTM A105)">
                    CS A105N (ASTM A105)
                  </option>
                  <option value="CS Baja Temp A350 LF2">
                    CS Baja Temp A350 LF2
                  </option>
                </optgroup>
                <optgroup label="Aleaciones">
                  <option value="Bronce (ASTM B61)">Bronce (ASTM B61)</option>
                </optgroup>
              </select>
            </div>

            {/* Tipo de Brida */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Tipo de Brida
              </label>
              <select
                value={params.flangeType}
                onChange={(e) => update("flangeType", e.target.value)}
                className="w-full rounded-md bg-[#0a0a0a] border border-gray-800 px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="BL">Ciega (Blind Flange - BL)</option>
                <option value="WN">
                  Cuello para Soldar (Welding Neck - WN)
                </option>
                <option value="SO">Deslizante (Slip-On - SO)</option>
                <option value="TH">Roscada (Threaded - TH)</option>
              </select>
            </div>

            {/* Clase de Presión */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Clase de Presión (Rating)
              </label>
              <select
                value={params.pressureClass}
                onChange={(e) => update("pressureClass", e.target.value)}
                className="w-full rounded-md bg-[#0a0a0a] border border-gray-800 px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="150">150 Lbs</option>
                <option value="300">300 Lbs</option>
                <option value="600">600 Lbs</option>
                <option value="900">900 Lbs</option>
              </select>
            </div>

            {/* Tipo de Cara */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Tipo de Cara
              </label>
              <select
                value={params.faceType}
                onChange={(e) => update("faceType", e.target.value)}
                className="w-full rounded-md bg-[#0a0a0a] border border-gray-800 px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="RF">Cara Elevada (Raised Face - RF)</option>
                <option value="FF">Cara Plana (Flat Face - FF)</option>
                <option value="RTJ">
                  Junta de Anillo (Ring Type Joint - RTJ)
                </option>
              </select>
            </div>

            {/* Tamaño Nominal */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Tamaño Nominal (NPS/DN)
              </label>
              <select
                value={params.nominalSize}
                onChange={(e) => update("nominalSize", e.target.value)}
                disabled={params.customDimensions}
                className={`w-full rounded-md bg-[#0a0a0a] border border-gray-800 px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  params.customDimensions ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="1">1" - {NPS_TO_ID["1"].toFixed(1)} mm</option>
                <option value="1.5">
                  1.5" - {NPS_TO_ID["1.5"].toFixed(1)} mm
                </option>
                <option value="2">2" - {NPS_TO_ID["2"].toFixed(1)} mm</option>
                <option value="3">3" - {NPS_TO_ID["3"].toFixed(1)} mm</option>
                <option value="4">4" - {NPS_TO_ID["4"].toFixed(1)} mm</option>
                <option value="6">6" - {NPS_TO_ID["6"].toFixed(1)} mm</option>
                <option value="8">8" - {NPS_TO_ID["8"].toFixed(1)} mm</option>
                <option value="10">
                  10" - {NPS_TO_ID["10"].toFixed(1)} mm
                </option>
                <option value="12">
                  12" - {NPS_TO_ID["12"].toFixed(1)} mm
                </option>
              </select>
              <div className="text-xs text-gray-500 mt-1">
                DI: {params.di.toFixed(1)} mm
              </div>
            </div>

            {/* Dimensiones a Medida */}
            <div className="border-t border-gray-700 pt-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={params.customDimensions}
                  onChange={(e) => update("customDimensions", e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-sm text-gray-300">
                  Dimensiones a Medida
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Activar para anular los estándares ASME B16.5
              </p>
            </div>

            {/* Diámetro Exterior */}
            <div>
              <label className="block text-sm text-gray-300">
                Diámetro Exterior (mm)
                {!params.customDimensions && (
                  <span className="text-cyan-400 text-xs ml-1">[Auto]</span>
                )}
              </label>
              <input
                type="range"
                min="200"
                max="1200"
                step="10"
                value={params.de}
                onChange={(e) => update("de", parseFloat(e.target.value))}
                disabled={!params.customDimensions}
                className={`w-full ${
                  !params.customDimensions ? "opacity-50" : ""
                }`}
              />
              <div className="text-xs text-gray-500 mt-1">
                {params.de.toFixed(0)} mm
              </div>
            </div>

            {/* Espesor */}
            <div>
              <label className="block text-sm text-gray-300">
                Espesor (mm)
                {!params.customDimensions && (
                  <span className="text-cyan-400 text-xs ml-1">[Auto]</span>
                )}
              </label>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={params.espesor}
                onChange={(e) => update("espesor", parseFloat(e.target.value))}
                disabled={!params.customDimensions}
                className={`w-full ${
                  !params.customDimensions ? "opacity-50" : ""
                }`}
              />
              <div className="text-xs text-gray-500 mt-1">
                {params.espesor.toFixed(0)} mm
              </div>
            </div>

            {/* Cantidad de Pernos */}
            <div>
              <label className="block text-sm text-gray-300">
                Cantidad de Pernos
                {!params.customDimensions && (
                  <span className="text-cyan-400 text-xs ml-1">[Auto]</span>
                )}
              </label>
              <input
                type="range"
                min="4"
                max="24"
                step="1"
                value={params.pernos}
                onChange={(e) => update("pernos", parseInt(e.target.value))}
                disabled={!params.customDimensions}
                className={`w-full ${
                  !params.customDimensions ? "opacity-50" : ""
                }`}
              />
              <div className="text-xs text-gray-500 mt-1">
                {params.pernos} pernos
              </div>
            </div>

            {/* Unidades */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Unidades
              </label>
              <input
                type="number"
                min="1"
                value={params.unidades}
                onChange={(e) =>
                  update("unidades", parseInt(e.target.value) || 1)
                }
                className="w-full rounded-md bg-[#0a0a0a] border border-gray-800 px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
