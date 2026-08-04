export type Logro = {
  clave: string;
  emoji: string;
  // Devuelve true si el logro está desbloqueado según las estadísticas
  conseguido: (stats: EstadisticasUsuario) => boolean;
};

export type EstadisticasUsuario = {
  banosPublicados: number;
  valoraciones: number;
  valoracionesConFoto: number;
  ciudadesDistintas: number;
};

export const LOGROS: Logro[] = [
  {
    clave: "logro_primer_bano",
    emoji: "🚽",
    conseguido: (s) => s.banosPublicados >= 1,
  },
  {
    clave: "logro_cinco_banos",
    emoji: "🏗️",
    conseguido: (s) => s.banosPublicados >= 5,
  },
  {
    clave: "logro_diez_banos",
    emoji: "🏙️",
    conseguido: (s) => s.banosPublicados >= 10,
  },
  {
    clave: "logro_primera_valoracion",
    emoji: "⭐",
    conseguido: (s) => s.valoraciones >= 1,
  },
  {
    clave: "logro_critico",
    emoji: "✍️",
    conseguido: (s) => s.valoraciones >= 10,
  },
  {
    clave: "logro_fotografo",
    emoji: "📸",
    conseguido: (s) => s.valoracionesConFoto >= 5,
  },
  {
    clave: "logro_explorador",
    emoji: "🗺️",
    conseguido: (s) => s.ciudadesDistintas >= 3,
  },
];

export function contarLogros(stats: EstadisticasUsuario): number {
  return LOGROS.filter((l) => l.conseguido(stats)).length;
}