import type { EstadoBano } from "@/components/rollo";

const COLORES: Record<EstadoBano, string> = {
  perfecto: "#16a34a",    // verde
  regular: "#ea9a1e",     // naranja
  sucio: "#8a5a2b",       // marrón
  sin_valorar: "#94a3b8", // gris
};

export default function MarcadorBano({
  estado = "sin_valorar",
  size = 55,
  verificado = false,
}: {
  estado?: EstadoBano;
  size?: number;
  verificado?: boolean;
}) {
  const color = COLORES[estado];

  // Silueta de color: varias sombras del mismo color en todas direcciones
  // crean un contorno que sigue la forma del rollo.
  const grosor = Math.max(2, size * 0.05);
  const contorno = [
    `${grosor}px 0`,
    `-${grosor}px 0`,
    `0 ${grosor}px`,
    `0 -${grosor}px`,
    `${grosor}px ${grosor}px`,
    `-${grosor}px -${grosor}px`,
    `${grosor}px -${grosor}px`,
    `-${grosor}px ${grosor}px`,
  ]
    .map((offset) => `drop-shadow(${offset} 0 ${color})`)
    .join(" ");

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Baño"
        style={{
          width: size,
          height: size,
          filter: `${contorno} drop-shadow(0 2px 3px rgba(0,0,0,0.3))`,
        }}
        className="pointer-events-none"
      />

      {/* Tick azul si está verificado */}
      {verificado && (
        <div
          className="pointer-events-none absolute flex items-center justify-center rounded-full bg-blue-600 text-white shadow"
          style={{
            width: size * 0.32,
            height: size * 0.32,
            right: 0,
            top: 0,
            fontSize: size * 0.19,
          }}
        >
          ✓
        </div>
      )}
    </div>
  );
}