"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { rangoDesdePuntos } from "@/lib/rangos";
import { useIdioma } from "@/lib/idiomas";

type FilaRanking = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  ciudad: string | null;
  banos_publicados: number;
  valoraciones_hechas: number;
  puntos: number;
};

const MEDALLAS = ["🥇", "🥈", "🥉"];

function ListaRanking({
  filas,
  miId,
  t,
}: {
  filas: FilaRanking[];
  miId: string | null;
  t: (clave: string) => string;
}) {
  if (filas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("ranking_vacio")}</p>
    );
  }
  return (
    <div className="space-y-2">
      {filas.map((f, i) => {
        const rango = rangoDesdePuntos(f.puntos);
        const soyYo = f.id === miId;
        return (
          <div
            key={f.id}
            className={`flex items-center gap-3 rounded-2xl border p-3 shadow-sm transition ${
              soyYo ? "border-primary bg-primary/5" : "bg-card"
            }`}
          >
            <span className="w-8 shrink-0 text-center text-lg font-bold">
              {MEDALLAS[i] ?? i + 1}
            </span>

            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
              {f.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={f.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  🧻
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {f.username ?? "Anónimo"}
                {soyYo && (
                  <span className="ml-2 text-xs font-normal text-primary">
                    ({t("tu")})
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {rango.emoji} {t(rango.clave)}
              </p>
              <p className="text-xs text-muted-foreground">
                {f.banos_publicados} · {f.valoraciones_hechas}
              </p>
            </div>

            <span className="shrink-0 text-lg font-extrabold text-primary">
              {f.puntos}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function RankingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useIdioma();
  const [global, setGlobal] = useState<FilaRanking[]>([]);
  const [local, setLocal] = useState<FilaRanking[]>([]);
  const [miCiudad, setMiCiudad] = useState<string | null>(null);
  const [miId, setMiId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const { data: userData } = await supabase.auth.getUser();
      setMiId(userData.user?.id ?? null);

      // Mi ciudad (para el ranking local)
      let ciudad: string | null = null;
      if (userData.user) {
        const { data: perfil } = await supabase
          .from("profiles")
          .select("ciudad")
          .eq("id", userData.user.id)
          .single();
        ciudad = perfil?.ciudad ?? null;
        setMiCiudad(ciudad);
      }

      // Ranking global
      const { data: g } = await supabase
        .from("ranking_usuarios")
        .select("*")
        .order("puntos", { ascending: false })
        .limit(50);
      if (g) setGlobal(g as FilaRanking[]);

      // Ranking local (solo si tengo ciudad)
      if (ciudad) {
        const { data: l } = await supabase
          .from("ranking_usuarios")
          .select("*")
          .eq("ciudad", ciudad)
          .order("puntos", { ascending: false })
          .limit(50);
        if (l) setLocal(l as FilaRanking[]);
      }

      setCargando(false);
    }
    cargar();
  }, [supabase]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("ranking_titulo")}</h1>
        <Button variant="outline" size="sm" onClick={() => router.push("/")}>
          {t("volver_mapa")}
        </Button>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        {t("ranking_subtitulo")}
      </p>

      {cargando ? (
        <p className="text-sm text-muted-foreground">{t("cargando")}</p>
      ) : (
        <>
          {/* Ranking local */}
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-semibold">
              {t("ranking_local")}
              {miCiudad && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {miCiudad}
                </span>
              )}
            </h2>
            {miCiudad ? (
              <ListaRanking filas={local} miId={miId} t={t} />
            ) : (
              <p className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
                {t("sin_ciudad")}
              </p>
            )}
          </section>

          {/* Ranking global */}
          <section>
            <h2 className="mb-3 text-lg font-semibold">{t("ranking_global")}</h2>
            <ListaRanking filas={global} miId={miId} t={t} />
          </section>
        </>
      )}
    </main>
  );
}