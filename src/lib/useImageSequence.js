// Hook para cargar secuencias de imágenes progresivamente con precarga inicial
import { useEffect, useMemo, useRef, useState } from "react";

// requestIdleCallback polyfill simple
const ric = (cb) => {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return window.requestIdleCallback(cb);
  }
  return setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 0);
};

export function useImageSequence({
  basePath,
  pattern = "frame_%04d.webp",
  count,
  preload = 60,
}) {
  const [loadedCount, setLoadedCount] = useState(0);
  const imagesRef = useRef([]);
  const queueRef = useRef([]);
  const canceledRef = useRef(false);

  const srcForIndex = useMemo(() => {
    return (i) =>
      `${basePath}/${pattern.replace("%04d", String(i + 1).padStart(4, "0"))}`;
  }, [basePath, pattern]);

  useEffect(() => {
    canceledRef.current = false;
    imagesRef.current = new Array(count);
    queueRef.current = [];

    const loadImg = (i) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = "sync";
        img.src = srcForIndex(i);
        img.onload = () => {
          imagesRef.current[i] = img;
          resolve(img);
        };
        img.onerror = reject;
      });

    // Precarga inicial en serie para garantizar respuesta inmediata
    const loadInitial = async () => {
      const initial = Math.min(preload, count);
      for (let i = 0; i < initial && !canceledRef.current; i++) {
        try {
          await loadImg(i);
        } catch {
          /* noop */
        }
        setLoadedCount((c) => c + 1);
      }
      // Programar resto en idle
      for (let i = initial; i < count; i++) queueRef.current.push(i);
      const pump = () => {
        if (canceledRef.current) return;
        const i = queueRef.current.shift();
        if (typeof i === "number") {
          loadImg(i).finally(() => {
            setLoadedCount((c) => c + 1);
            ric(pump);
          });
        }
      };
      ric(pump);
    };

    loadInitial();

    return () => {
      canceledRef.current = true;
      queueRef.current = [];
    };
  }, [basePath, count, preload, srcForIndex]);

  return { images: imagesRef, loadedCount };
}

// Cargar manifest.json del set seleccionado
export async function loadManifest(basePath) {
  const res = await fetch(`${basePath}/manifest.json`, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar el manifest");
  return res.json();
}

// Elegir el mejor set considerando viewport y DPR
export function pickBestSet(viewportWidth, dpr) {
  const widths = [640, 1280, 1440, 1920];
  const target = viewportWidth * Math.min(2, dpr || 1);
  for (const w of widths) {
    if (w >= target) return w;
  }
  return widths[widths.length - 1];
}
