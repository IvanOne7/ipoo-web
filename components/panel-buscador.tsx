"use client";

import { useState } from "react";

export type Bano = {
  id: string;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  direccion: string | null;
  lat_bano: number;
  lng_bano: number;
  rating_medio: number;
  total_valoraciones: number;
  distancia_metros: number;
  media_limpieza: number | null;
  media_olor: number | null;
  media_equipamiento: number | null;
  media_accesibilidad: number | null;
  es_gratis: boolean | null;
  requiere_consumir: boolean | null;
  tiene_papel: boolean | null;
  tiene_jabon: boolean | null;
  tiene_secador: boolean | null;
  es_accesible: boolean | null;
  tiene_cambiador: boolean | null;
  horario: string | null;
 verificado: boolean | null;
  created_by: string | null;
  verificado_dueno: boolean | null;
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

type Filtro = "gratis" | "papel" | "accesible" | "cambiador" | "sin_consumir";

const FILTROS: { valor: Filtro; etiqueta: string }[] = [
  { valor: "gratis", etiqueta: "Gratis" },
  { valor: "papel", etiqueta: "Con papel" },
  { valor: "accesible", etiqueta: "Accesible ♿" },
  { valor: "cambiador", etiqueta: "Cambiador 🍼" },
  { valor: "sin_consumir", etiqueta: "Sin consumir" },
];

const ETIQUETAS_TIPO: Record<string, string> = {
  publico_calle: "Público",
  centro_comercial: "C. Comercial",
  hosteleria: "Hostelería",
  otro: "Otro",
};

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function cumpleFiltro(b: Bano, f: Filtro): boolean {
  switch (f) {
    case "gratis":
      return b.es_gratis === true;
    case "papel":
      return b.tiene_papel === true;
    case "accesible":
      return b.es_accesible === true;
    case "cambiador":
      return b.tiene_cambiador === true;
    case "sin_consumir":
      return b.requiere_consumir !== true;
  }
}

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
  const [busqueda, setBusqueda] = useState("");
  const [filtrosActivos, setFiltrosActivos] = useState<Filtro[]>([]);

  function alternarFiltro(f: Filtro) {
    setFiltrosActivos((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  // Filtrar por texto y por características, luego ordenar
  const filtrados = banos.filter((b) => {
    if (busqueda.trim()) {
      const texto = normalizar(
        `${b.nombre} ${b.direccion ?? ""} ${ETIQUETAS_TIPO[b.tipo] ?? b.tipo}`
      );
      if (!texto.includes(normalizar(busqueda))) return false;
    }
    return filtrosActivos.every((f) => cumpleFiltro(b, f));
  });

  const ordenados = ordenar(filtrados, criterio);

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

          {/* Caja de búsqueda */}
          <div className="border-b px-4 py-3">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o zona…"
              className="w-full rounded-full border border-input bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Filtros rápidos */}
          <div className="border-b px-4 py-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              Filtros rápidos
            </p>
            <div className="flex flex-wrap gap-2">
              {FILTROS.map((f) => (
                <button
                  key={f.valor}
                  onClick={() => alternarFiltro(f.valor)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    filtrosActivos.includes(f.valor)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {f.etiqueta}
                </button>
              ))}
              {filtrosActivos.length > 0 && (
                <button
                  onClick={() => setFiltrosActivos([])}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-primary underline"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Chips de orden */}
          <div className="border-b px-4 py-3">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">
              Ordenar por
            </p>
            <div className="flex flex-wrap gap-2">
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
          </div>

          {/* Lista */}
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {ordenados.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <span className="text-3xl">🧻</span>
                <p className="text-sm text-muted-foreground">
                  {banos.length === 0
                    ? "No hay baños cerca todavía."
                    : "Ningún baño coincide con la búsqueda."}
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

                    {/* Insignias rápidas */}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {b.es_gratis && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          Gratis
                        </span>
                      )}
                      {b.tiene_papel && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          Papel
                        </span>
                      )}
                      {b.es_accesible && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          ♿
                        </span>
                      )}
                      {b.tiene_cambiador && (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          🍼
                        </span>
                      )}
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