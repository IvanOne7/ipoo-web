import type { EstadoBano } from "@/components/rollo";

const COLORES_BORDE: Record<EstadoBano, string> = {
  perfecto: "#16a34a",
  regular: "#ea9a1e",
  sucio: "#8a5a2b",
  sin_valorar: "#94a3b8",
};

export default function MarcadorBano({
  estado = "sin_valorar",
  size = 40,
  verificado = false,
}: {
  estado?: EstadoBano;
  size?: number;
  verificado?: boolean;
}) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        style={{
          width: size,
          height: size,
          borderColor: COLORES_BORDE[estado],
        }}
        className="pointer-events-none flex items-center justify-center rounded-full border-4 bg-white shadow-md"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Baño"
          style={{ width: size * 0.62, height: size * 0.62 }}
          className="object-contain"
        />
      </div>

      {verificado && (
        <div
          className="pointer-events-none absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-primary text-white shadow"
          style={{ width: size * 0.42, height: size * 0.42, fontSize: size * 0.26 }}
        >
          ✓
        </div>
      )}
    </div>
  );
}