"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useIdioma } from "@/lib/idiomas";

export default function BarraNavegacion() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { t } = useIdioma();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setCargando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function cerrarSesion() {
    setMenuAbierto(false);
    await supabase.auth.signOut();
    router.refresh();
  }

  function ir(ruta: string) {
    setMenuAbierto(false);
    router.push(ruta);
  }

  return (
    <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-white/90 px-4 py-2 shadow-sm backdrop-blur">
      <div className="flex shrink-0 items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-completo.png"
          alt="iPoo"
          className="h-10 w-auto shrink-0 object-contain"
        />
      </div>

      {cargando ? null : email ? (
        <div className="relative">
          {/* Botón hamburguesa */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label="Menú"
            className="flex h-10 w-10 items-center justify-center rounded-full text-2xl transition active:scale-90 hover:bg-muted"
          >
            {menuAbierto ? "✕" : "☰"}
          </button>

          {/* Menú desplegable */}
          {menuAbierto && (
            <>
              {/* Capa para cerrar tocando fuera */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuAbierto(false)}
              />
              <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border bg-card shadow-2xl">
                <div className="border-b px-4 py-3">
                  <p className="truncate text-xs text-muted-foreground">{email}</p>
                </div>
                <nav className="flex flex-col p-2">
                  <button
                    onClick={() => ir("/ranking")}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-muted"
                  >
                    {t("ranking")}
                  </button>
                  <button
                    onClick={() => ir("/mi-negocio")}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-muted"
                  >
                    {t("mi_negocio")}
                  </button>
                  <button
                    onClick={() => ir("/ajustes")}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-muted"
                  >
                    {t("ajustes")}
                  </button>
                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={cerrarSesion}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    {t("salir")}
                  </button>
                </nav>
              </div>
            </>
          )}
        </div>
      ) : (
        <Button size="sm" onClick={() => router.push("/login")}>
          {t("entrar")}
        </Button>
      )}
    </header>
  );
}