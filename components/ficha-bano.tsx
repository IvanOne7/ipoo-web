"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import SelectorPuntuacion from "@/components/selector-puntuacion";
import FormularioReclamar from "@/components/formulario-reclamar";
import type { Bano } from "@/components/panel-buscador";

type Valoracion = {
  id: string;
  puntuacion_general: number;
  limpieza: number | null;
  olor: number | null;
  equipamiento: number | null;
  accesibilidad: number | null;
  comentario: string | null;
  fotos: string[];
  created_at: string;
};

function media(vals: Valoracion[], campo: keyof Valoracion): number | null {
  const nums = vals
    .map((v) => v[campo])
    .filter((n): n is number => typeof n === "number");
  if (nums.length === 0) return null;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function BarraCriterio({ etiqueta, valor }: { etiqueta: string; valor: number | null }) {
  if (valor === null) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-xs text-muted-foreground">{etiqueta}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${(valor / 5) * 100}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-xs font-semibold">
        {valor.toFixed(1)}
      </span>
    </div>
  );
}

function Insignia({ activa, texto }: { activa: boolean | null; texto: string }) {
  if (activa === null) return null;
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        activa
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground line-through"
      }`}
    >
      {texto}
    </span>
  );
}

function urlComoLlegar(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export default function FichaBano({
  bano,
  onCerrar,
  onValorado,
  onEditar,
}: {
  bano: Bano;
  onCerrar: () => void;
  onValorado: () => void;
  onEditar: () => void;
}) {
  const banoId = bano.id;
  const nombre = bano.nombre;
  const distancia = bano.distancia_metros;

  const supabase = createClient();

  const [modo, setModo] = useState<"ver" | "valorar">("ver");
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);
  const [miId, setMiId] = useState<string | null>(null);
  const [reclamando, setReclamando] = useState(false);

  const [general, setGeneral] = useState(0);
  const [limpieza, setLimpieza] = useState(0);
  const [olor, setOlor] = useState(0);
  const [equipamiento, setEquipamiento] = useState(0);
  const [accesibilidad, setAccesibilidad] = useState(0);
  const [comentario, setComentario] = useState("");
  const [archivos, setArchivos] = useState<FileList | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setMiId(data.user?.id ?? null);
    });

    supabase
      .from("valoraciones")
      .select("*")
      .eq("bano_id", banoId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setValoraciones(data as Valoracion[]);
        setCargando(false);
      });
  }, [banoId, supabase]);

  const mediaGeneral =
    valoraciones.length > 0
      ? valoraciones.reduce((s, v) => s + v.puntuacion_general, 0) /
        valoraciones.length
      : 0;

  async function guardar() {
    setGuardando(true);
    setMensaje("");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setMensaje("Debes iniciar sesión para valorar.");
      setGuardando(false);
      return;
    }

    if (general === 0) {
      setMensaje("Pon al menos la puntuación general.");
      setGuardando(false);
      return;
    }

    const urlsFotos: string[] = [];
    if (archivos) {
      for (const archivo of Array.from(archivos)) {
        const nombreArchivo = `${banoId}/${Date.now()}-${archivo.name}`;
        const { error: errSubida } = await supabase.storage
          .from("fotos-banos")
          .upload(nombreArchivo, archivo);
        if (errSubida) {
          setMensaje("No se pudo subir la foto: " + errSubida.message);
          setGuardando(false);
          return;
        }
        const { data: urlData } = supabase.storage
          .from("fotos-banos")
          .getPublicUrl(nombreArchivo);
        urlsFotos.push(urlData.publicUrl);
      }
    }

    const { error } = await supabase.from("valoraciones").insert({
      bano_id: banoId,
      user_id: userData.user.id,
      puntuacion_general: general,
      limpieza: limpieza || null,
      olor: olor || null,
      equipamiento: equipamiento || null,
      accesibilidad: accesibilidad || null,
      comentario: comentario || null,
      fotos: urlsFotos,
    });

    if (error) {
      if (error.code === "23505") {
        setMensaje("Ya has valorado este baño.");
      } else {
        setMensaje("Error: " + error.message);
      }
      setGuardando(false);
    } else {
      onValorado();
    }
  }

  return (
    <>
      <Dialog open onOpenChange={(v) => !v && onCerrar()}>
        <DialogContent className="z-[9999] max-h-[85vh] overflow-y-auto overscroll-contain rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              {nombre}
              {bano.verificado_dueno && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  ✓ Verificado por el local
                </span>
              )}
            </DialogTitle>
            {distancia !== undefined && (
              <p className="text-sm font-semibold text-primary">
                📍 A {formatearDistancia(distancia)} de ti
              </p>
            )}
          </DialogHeader>

          {/* ---------- VISTA VER ---------- */}
          {modo === "ver" && (
            <div className="space-y-5">
              {/* Información práctica */}
              <div className="space-y-3">
                {bano.direccion && (
                  <p className="text-sm text-muted-foreground">📍 {bano.direccion}</p>
                )}
                {bano.horario && (
                  <p className="text-sm text-muted-foreground">🕒 {bano.horario}</p>
                )}

                <div className="flex flex-wrap gap-1.5">
                  <Insignia activa={bano.es_gratis} texto="Gratis" />
                  {bano.requiere_consumir && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      Hay que consumir
                    </span>
                  )}
                  <Insignia activa={bano.tiene_papel} texto="Papel" />
                  <Insignia activa={bano.tiene_jabon} texto="Jabón" />
                  <Insignia activa={bano.tiene_secador} texto="Secador" />
                  <Insignia activa={bano.es_accesible} texto="Accesible ♿" />
                  <Insignia activa={bano.tiene_cambiador} texto="Cambiador 🍼" />
                </div>

                {bano.descripcion && (
                  <p className="rounded-2xl bg-muted/50 p-3 text-sm">{bano.descripcion}</p>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    window.open(
                      urlComoLlegar(bano.lat_bano, bano.lng_bano),
                      "_blank"
                    )
                  }
                >
                  🧭 Cómo llegar
                </Button>

                {miId && bano.created_by === miId && (
                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={onEditar}
                  >
                    ✏️ Editar este baño
                  </Button>
                )}

                {!bano.verificado_dueno && (
                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => setReclamando(true)}
                  >
                    🏪 Soy el propietario
                  </Button>
                )}
              </div>

              {cargando ? (
                <p className="text-sm text-muted-foreground">Cargando…</p>
              ) : valoraciones.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted/50 py-8 text-center">
                  <span className="text-3xl">🧻</span>
                  <p className="text-sm text-muted-foreground">
                    Aún no hay valoraciones.
                    <br />
                    ¡Sé el primero en opinar!
                  </p>
                </div>
              ) : (
                <>
                  {/* Cabecera con la nota */}
                  <div className="flex items-center gap-4 rounded-2xl bg-primary/5 p-4">
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <span className="text-2xl font-extrabold leading-none">
                        {mediaGeneral.toFixed(1)}
                      </span>
                      <span className="text-[10px] opacity-80">de 5</span>
                    </div>
                    <div>
                      <p className="text-lg">{"🧻".repeat(Math.round(mediaGeneral))}</p>
                      <p className="text-xs text-muted-foreground">
                        {valoraciones.length}{" "}
                        {valoraciones.length === 1 ? "opinión" : "opiniones"}
                      </p>
                    </div>
                  </div>

                  {/* Barras por criterio */}
                  <div className="space-y-2">
                    <BarraCriterio etiqueta="Limpieza" valor={media(valoraciones, "limpieza")} />
                    <BarraCriterio etiqueta="Olor" valor={media(valoraciones, "olor")} />
                    <BarraCriterio etiqueta="Equipamiento" valor={media(valoraciones, "equipamiento")} />
                    <BarraCriterio etiqueta="Accesibilidad" valor={media(valoraciones, "accesibilidad")} />
                  </div>

                  {/* Opiniones */}
                  <div className="space-y-3 border-t pt-4">
                    <p className="text-sm font-semibold">Opiniones</p>
                    {valoraciones.map((v) => (
                      <div key={v.id} className="rounded-2xl border bg-card p-3 text-sm shadow-sm">
                        <p>{"🧻".repeat(v.puntuacion_general)}</p>
                        {v.comentario && <p className="mt-1">{v.comentario}</p>}
                        {v.fotos.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {v.fotos.map((url) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={url}
                                src={url}
                                alt="Foto del baño"
                                onClick={() => setFotoAmpliada(url)}
                                className="h-20 w-20 cursor-pointer rounded-xl object-cover transition hover:opacity-80"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex gap-2 border-t pt-4">
                <Button variant="outline" onClick={onCerrar} className="flex-1">
                  Cerrar
                </Button>
                <Button onClick={() => setModo("valorar")} className="flex-1">
                  Valorar 🧻
                </Button>
              </div>
            </div>
          )}

          {/* ---------- VISTA VALORAR ---------- */}
          {modo === "valorar" && (
            <div className="space-y-4">
              <div className="space-y-3 rounded-2xl bg-muted/40 p-4">
                <SelectorPuntuacion etiqueta="General" valor={general} onChange={setGeneral} />
                <SelectorPuntuacion etiqueta="Limpieza" valor={limpieza} onChange={setLimpieza} />
                <SelectorPuntuacion etiqueta="Olor" valor={olor} onChange={setOlor} />
                <SelectorPuntuacion etiqueta="Equipamiento" valor={equipamiento} onChange={setEquipamiento} />
                <SelectorPuntuacion etiqueta="Accesibilidad" valor={accesibilidad} onChange={setAccesibilidad} />
              </div>

              <Textarea
                placeholder="¿Cómo estaba? Cuéntanos…"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="rounded-2xl"
              />

              <div className="space-y-1">
                <label className="text-sm font-medium">Fotos (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setArchivos(e.target.files)}
                  className="block w-full rounded-xl border bg-card p-2 text-sm"
                />
              </div>

              {mensaje && (
                <p className="rounded-xl bg-destructive/10 p-2 text-sm text-destructive">
                  {mensaje}
                </p>
              )}

              <div className="flex gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => setModo("ver")} className="flex-1">
                  Volver
                </Button>
                <Button onClick={guardar} disabled={guardando} className="flex-1">
                  Enviar valoración
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {reclamando && (
        <FormularioReclamar
          banoId={banoId}
          nombreBano={nombre}
          onCerrar={() => setReclamando(false)}
        />
      )}

      {/* Visor de foto a pantalla completa */}
      {fotoAmpliada && (
        <div
          onClick={() => setFotoAmpliada(null)}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoAmpliada}
            alt="Foto ampliada"
            className="max-h-full max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </>
  );
}

function formatearDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros)} m`;
  return `${(metros / 1000).toFixed(1)} km`;
}