export type Rango = {
  clave: string;
  emoji: string;
  minimo: number;
  siguiente: number | null;
};

const RANGOS: Rango[] = [
  { clave: "rango_1", emoji: "🧻", minimo: 0, siguiente: 20 },
  { clave: "rango_2", emoji: "🚽", minimo: 20, siguiente: 50 },
  { clave: "rango_3", emoji: "🗺️", minimo: 50, siguiente: 100 },
  { clave: "rango_4", emoji: "⭐", minimo: 100, siguiente: 200 },
  { clave: "rango_5", emoji: "👑", minimo: 200, siguiente: 500 },
  { clave: "rango_6", emoji: "💩", minimo: 500, siguiente: null },
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