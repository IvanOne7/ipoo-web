export type Rango = {
  nombre: string;
  emoji: string;
  minimo: number;
  siguiente: number | null;
};

const RANGOS: Rango[] = [
  { nombre: "Papel de una capa", emoji: "🧻", minimo: 0, siguiente: 20 },
  { nombre: "Trasero con rollo", emoji: "🚽", minimo: 20, siguiente: 50 },
  { nombre: "Culo explorador", emoji: "🗺️", minimo: 50, siguiente: 100 },
  { nombre: "Culo inquieto", emoji: "⭐", minimo: 100, siguiente: 200 },
  { nombre: "Señor del trono", emoji: "👑", minimo: 200, siguiente: 500 },
  { nombre: "Leyenda de iPoo", emoji: "💩", minimo: 500, siguiente: null },
];

export function rangoDesdePuntos(puntos: number): Rango {
  return [...RANGOS].reverse().find((r) => puntos >= r.minimo) ?? RANGOS[0];
}

export function progresoHaciaSiguiente(puntos: number): number {
  const rango = rangoDesdePuntos(puntos);
  if (rango.siguiente === null) return 100;
  const recorrido = puntos - rango.minimo;
  const total = rango.siguiente - rango.minimo;
  return Math.min(100, Math.round((recorrido / total) * 100));
}