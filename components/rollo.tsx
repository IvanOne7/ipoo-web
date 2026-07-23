export type EstadoBano = "perfecto" | "regular" | "sucio" | "sin_valorar";

const COLORES: Record<EstadoBano, { cuerpo: string; base: string; hueco: string; centro: string }> = {
  perfecto:    { cuerpo: "#16a34a", base: "#15803d", hueco: "#dcfce7", centro: "#86efac" },
  regular:     { cuerpo: "#ea9a1e", base: "#c47d12", hueco: "#fef3c7", centro: "#fcd34d" },
  sucio:       { cuerpo: "#8a5a2b", base: "#6b4420", hueco: "#e7d3c0", centro: "#c9a583" },
  sin_valorar: { cuerpo: "#94a3b8", base: "#64748b", hueco: "#f1f5f9", centro: "#cbd5e1" },
};

export default function Rollo({
  estado = "sin_valorar",
  size = 40,
}: {
  estado?: EstadoBano;
  size?: number;
}) {
  const c = COLORES[estado];
  return (
    <svg width={size} height={size} viewBox="0 0 100 126" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="30" rx="50" ry="26" fill={c.cuerpo} />
      <rect x="0" y="30" width="100" height="70" fill={c.cuerpo} />
      <ellipse cx="50" cy="100" rx="50" ry="26" fill={c.base} />
      <ellipse cx="50" cy="30" rx="24" ry="12" fill={c.hueco} />
      <ellipse cx="50" cy="30" rx="9" ry="4.5" fill={c.centro} />
    </svg>
  );
}