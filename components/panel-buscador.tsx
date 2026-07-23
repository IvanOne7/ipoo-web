"use client";

import { useState } from "react";

export type Bano = {
  id: string;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  lat_bano: number;
  lng_bano: number;
  rating_medio: number;
  total_valoraciones: number;
  distancia_metros: number;
  media_limpieza: number | null;
  media_olor: number | null;
  media_equipamiento: number | null;
  media_accesibilidad: number | null;
};

type Criterio =
  | "cercania"
  | "rating_medio"
  | "media_limpieza"
  | "media_olor"
  | "media_equipamiento"
  | "media_accesibilidad";

const CRITERIOS: { valor: Criterio; etiqueta: string }[] = [
  { valor: "cercania", etiqueta: "Más cercanos" },
  { valor: "rating_medio", etiqueta: "Mejor valorados" },
  { valor: "media_limpieza", etiqueta: "Más limpios" },
  { valor: "media_olor", etiqueta: "Mejor olor" },
  { valor: "media_equipamiento", etiqueta: "Mejor equipados" },
  { valor: "media_accesibilidad", etiqueta: "Más accesibles" },
];

const ETIQUETAS_TIPO: Record<string, string> = {
  publico_calle: "Público",
  centro_comercial: "C. Comercial",
  hosteleria: "Hostelería",
  otro: "Otro",
};

function ordenar(banos: Bano[], criterio: Criterio): Bano[] {
  const copia = [...banos];
  if (criterio === "cercania") {
    return copia.sort((a, b) => a.distancia_metros - b.distancia_metros);
  }
  return copia.sort((a, b) => (Number(b[criterio]) || -1) - (Number(a[criterio]) || -1));
}

function colorEstado(rating: number, total: number): string {
  if (total === 0) return "bg-slate-400";
  if (rating >= 4) return "bg-green-600";
  if (rating >= 2.5) return "bg-amber-500";
  return "bg-amber-900";
}

export default function PanelBuscador({
  banos,
  onSeleccion,
}: {
  banos: Bano[];
  onSeleccion: (b: Bano) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [criterio, setCriterio] = useState<Criterio>("cercania");

  const ordenados = ordenar(banos, criterio);

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setAbierto(true)}
        className="absolute left-4 top-20 z-10 flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-semibold shadow-lg ring-1 ring-black/5 transition hover:shadow-xl"
      >
        <span className="text-base">🔍</span>
        Buscar baños
      </button>

      {/* Fondo oscurecido */}
      {abierto && (
        <div
          onClick={() => setAbierto(false)}
          className="absolute inset-0 z-20 bg-black/20 backdrop-blur-[2px]"
        />
      )}

      {/* Panel lateral */}
      {abierto && (
        <div className="absolute inset-y-0 left-0 z-30 flex w-80 max-w-[85vw] flex-col bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-lg font-bold">Buscar baños</h2>
            <button
              onClick={() => setAbierto(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted"
            >
              ✕
            </button>
          </div>

          {/* Chips de criterio */}
          <div className="flex flex-wrap gap-2 border-b px-4 py-3">
            {CRITERIOS.map((c) => (
              <button
                key={c.valor}
                onClick={() => setCriterio(c.valor)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  criterio === c.valor
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {c.etiqueta}
              </button>
            ))}
          </div>

          {/* Lista */}
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {ordenados.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <span className="text-3xl">🧻</span>
                <p className="text-sm text-muted-foreground">
                  No hay baños cerca todavía.
                  <br />
                  ¡Toca el mapa para añadir uno!
                </p>
              </div>
            )}

            {ordenados.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  onSeleccion(b);
                  setAbierto(false);
                }}
                className="w-full rounded-2xl border bg-card p-3 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${colorEstado(
                      b.rating_medio,
                      b.total_valoraciones
                    )}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{b.nombre}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
                        {ETIQUETAS_TIPO[b.tipo] ?? b.tipo}
                      </span>
                      <span className="font-semibold text-primary">
                        {formatearDistancia(b.distancia_metros)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs">
                      {b.total_valoraciones > 0 ? (
                        <>
                          {"🧻".repeat(Math.round(b.rating_medio))}{" "}
                          <span className="text-muted-foreground">
                            {b.rating_medio}/5 · {b.total_valoraciones}{" "}
                            {b.total_valoraciones === 1 ? "opinión" : "opiniones"}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Sin valorar</span>
                      )}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function formatearDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros)} m`;
  return `${(metros / 1000).toFixed(1)} km`;
}