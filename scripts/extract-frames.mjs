import { spawn } from "node:child_process";
import { mkdirSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import ffmpegPath from "ffmpeg-static";

// Params (can be overridden with env vars)
const INPUT =
  process.env.INPUT ||
  resolve("public/videos/maqueta_virtual_piping_cabecera.mp4");
const FPS = Number(process.env.FPS || 24);
const WIDTH = Number(process.env.WIDTH || 1440);
const OUT_DIR = process.env.OUT_DIR || resolve(`public/frames/${WIDTH}`);
const QUALITY = Number(process.env.QUALITY || 80); // WebP 0-100

if (!existsSync(INPUT)) {
  console.error("No se encontró el archivo de entrada:", INPUT);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const args = [
  "-y",
  "-fflags",
  "+genpts",
  "-i",
  INPUT,
  "-vf",
  `fps=${FPS},scale=${WIDTH}:-1:flags=lanczos`,
  "-fps_mode",
  "vfr",
  "-c:v",
  "libwebp",
  "-q:v",
  String(QUALITY),
  "-update",
  "0",
  join(OUT_DIR, "frame_%04d.webp"),
];

console.log("Ejecutando ffmpeg con:", ffmpegPath);
console.log("Args:", args.join(" "));

const child = spawn(ffmpegPath, args, { stdio: "inherit" });
child.on("exit", (code) => {
  if (code !== 0) {
    console.error("ffmpeg terminó con código", code);
    process.exit(code || 1);
  }
  const files = readdirSync(OUT_DIR)
    .filter((f) => /frame_\d{4}\.webp$/i.test(f))
    .sort();
  const manifest = {
    pattern: "frame_%04d.webp",
    count: files.length,
    fps: FPS,
    width: WIDTH,
    quality: QUALITY,
  };
  writeFileSync(
    join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
  console.log("Frames generados:", files.length);
  console.log("Manifest:", join(OUT_DIR, "manifest.json"));
});
