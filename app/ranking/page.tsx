"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { rangoDesdePuntos } from "@/lib/rangos";

type FilaRanking = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  banos_publicados: number;
  valoraciones_hechas: number;
  puntos: number;
};

const MEDALLAS = ["🥇", "🥈", "🥉"];

export default function RankingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [filas, setFilas] = useState<FilaRanking[]>([]);
  const [miId, setMiId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const { data: userData } = await supabase.auth.getUser();
      setMiId(userData.user?.id ?? null);

      const { data } = await supabase
        .from("ranking_usuarios")
        .select("*")
        .order("puntos", { ascending: false })
        .limit(50);

      if (data) setFilas(data as FilaRanking[]);
      setCargando(false);
    }
    cargar();
  }, [supabase]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ranking 🏆</h1>
        <Button variant="outline" size="sm" onClick={() => router.push("/")}>
          Volver al mapa
        </Button>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        Gana puntos añadiendo baños (10 pts), valorándolos (5 pts) y subiendo
        fotos (+3 pts).
      </p>

      {cargando ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : filas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no hay nadie en el ranking.</p>
      ) : (
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
                        (tú)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rango.emoji} {rango.nombre}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {f.banos_publicados} baños · {f.valoraciones_hechas} valoraciones
                  </p>
                </div>

                <span className="shrink-0 text-lg font-extrabold text-primary">
                  {f.puntos}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}