"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIdioma } from "@/lib/idiomas";

type MiBano = {
  id: string;
  nombre: string;
  direccion: string | null;
  horario: string | null;
  cerrado_temporal: boolean;
};

type Valoracion = {
  id: string;
  puntuacion_general: number;
  comentario: string | null;
  respuesta_dueno: string | null;
  created_at: string;
};

export default function MiNegocioPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useIdioma();

  const [cargando, setCargando] = useState(true);
  const [banos, setBanos] = useState<MiBano[]>([]);
  const [banoActivo, setBanoActivo] = useState<MiBano | null>(null);
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [visitas, setVisitas] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    async function cargar() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      // Baños de los que soy dueño verificado
      const { data: misBanos } = await supabase
        .from("banos")
        .select("id, nombre, direccion, horario, cerrado_temporal")
        .eq("dueno_id", userData.user.id);

      if (misBanos && misBanos.length > 0) {
        setBanos(misBanos as MiBano[]);
        setBanoActivo(misBanos[0] as MiBano);
      }
      setCargando(false);
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Al cambiar de baño activo, cargar sus valoraciones y visitas
  useEffect(() => {
    if (!banoActivo) return;

    supabase
      .from("valoraciones")
      .select("id, puntuacion_general, comentario, respuesta_dueno, created_at")
      .eq("bano_id", banoActivo.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setValoraciones(data as Valoracion[]);
      });

    supabase
      .from("visitas_bano")
      .select("id", { count: "exact", head: true })
      .eq("bano_id", banoActivo.id)
      .then(({ count }) => setVisitas(count ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banoActivo]);

  async function guardarInfo() {
    if (!banoActivo) return;
    setAviso("");
    const { error } = await supabase
      .from("banos")
      .update({
        direccion: banoActivo.direccion || null,
        horario: banoActivo.horario || null,
      })
      .eq("id", banoActivo.id);
    setAviso(error ? t("mn_error_guardar") : t("mn_info_guardada"));
  }

  async function alternarCerrado() {
    if (!banoActivo) return;
    const nuevo = !banoActivo.cerrado_temporal;
    const { error } = await supabase
      .from("banos")
      .update({ cerrado_temporal: nuevo })
      .eq("id", banoActivo.id);
    if (!error) {
      setBanoActivo({ ...banoActivo, cerrado_temporal: nuevo });
    }
  }

  async function responder(valoracionId: string) {
    const texto = respuestas[valoracionId];
    if (!texto?.trim()) return;
    const { error } = await supabase
      .from("valoraciones")
      .update({
        respuesta_dueno: texto,
        respuesta_fecha: new Date().toISOString(),
      })
      .eq("id", valoracionId);
    if (!error) {
      setValoraciones((prev) =>
        prev.map((v) =>
          v.id === valoracionId ? { ...v, respuesta_dueno: texto } : v
        )
      );
      setRespuestas((prev) => ({ ...prev, [valoracionId]: "" }));
    }
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">{t("cargando")}</p>
      </main>
    );
  }

  if (banos.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-4xl">🏪</span>
        <p className="text-lg font-semibold">{t("mn_sin_banos_titulo")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("mn_sin_banos_texto")}
        </p>
        <Button onClick={() => router.push("/")}>{t("volver_mapa")}</Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("mn_titulo")}</h1>
        <Button variant="outline" size="sm" onClick={() => router.push("/")}>
          {t("volver_mapa")}
        </Button>
      </div>

      {/* Selector de baño si hay varios */}
      {banos.length > 1 && (
        <select
          value={banoActivo?.id}
          onChange={(e) =>
            setBanoActivo(banos.find((b) => b.id === e.target.value) ?? null)
          }
          className="mb-6 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm"
        >
          {banos.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nombre}
            </option>
          ))}
        </select>
      )}

      {banoActivo && (
        <>
          {/* Estadísticas */}
          <section className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border bg-card p-4 text-center shadow-sm">
              <p className="text-3xl font-extrabold text-primary">{visitas}</p>
              <p className="text-xs text-muted-foreground">{t("mn_visitas")}</p>
            </div>
            <div className="rounded-2xl border bg-card p-4 text-center shadow-sm">
              <p className="text-3xl font-extrabold text-primary">
                {valoraciones.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("mn_valoraciones")}
              </p>
            </div>
          </section>

          {/* Cerrado temporal */}
          <section className="mb-6 flex items-center justify-between rounded-2xl border bg-card p-4 shadow-sm">
            <div>
              <p className="font-semibold">{t("mn_cerrado")}</p>
              <p className="text-xs text-muted-foreground">
                {t("mn_cerrado_ayuda")}
              </p>
            </div>
            <button
              onClick={alternarCerrado}
              className={`relative h-7 w-12 rounded-full transition ${
                banoActivo.cerrado_temporal ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                  banoActivo.cerrado_temporal ? "left-6" : "left-1"
                }`}
              />
            </button>
          </section>

          {/* Editar info */}
          <section className="mb-6 space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{t("mn_info_local")}</h2>
            <div className="space-y-2">
              <Label>{t("mn_direccion")}</Label>
              <Input
                value={banoActivo.direccion ?? ""}
                onChange={(e) =>
                  setBanoActivo({ ...banoActivo, direccion: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("mn_horario")}</Label>
              <Input
                value={banoActivo.horario ?? ""}
                onChange={(e) =>
                  setBanoActivo({ ...banoActivo, horario: e.target.value })
                }
                placeholder="09:00 - 22:00"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={guardarInfo}>{t("mn_guardar")}</Button>
              {aviso && (
                <span className="text-sm text-muted-foreground">{aviso}</span>
              )}
            </div>
          </section>

          {/* Responder reseñas */}
          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{t("mn_resenas")}</h2>
            {valoraciones.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("mn_sin_resenas")}
              </p>
            ) : (
              <div className="space-y-4">
                {valoraciones.map((v) => (
                  <div key={v.id} className="rounded-xl border p-3 text-sm">
                    <p>{"🧻".repeat(v.puntuacion_general)}</p>
                    {v.comentario && <p className="mt-1">{v.comentario}</p>}

                    {v.respuesta_dueno ? (
                      <div className="mt-2 rounded-lg bg-primary/5 p-2">
                        <p className="text-xs font-semibold text-primary">
                          {t("mn_tu_respuesta")}
                        </p>
                        <p className="text-sm">{v.respuesta_dueno}</p>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          placeholder={t("mn_responder_placeholder")}
                          value={respuestas[v.id] ?? ""}
                          onChange={(e) =>
                            setRespuestas((prev) => ({
                              ...prev,
                              [v.id]: e.target.value,
                            }))
                          }
                          className="rounded-xl text-sm"
                        />
                        <Button size="sm" onClick={() => responder(v.id)}>
                          {t("mn_responder")}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}