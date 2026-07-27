"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function BarraNavegacion() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Estado inicial de sesión
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setCargando(false);
    });

    // Escuchar cambios de sesión (login/logout en vivo)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-white/90 px-4 py-2 shadow-sm backdrop-blur">
      <div className="flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-completo.png" alt="iPoo" className="h-12 w-auto" />
      </div>

      <div className="flex items-center gap-2">
        {cargando ? null : email ? (
          <>
            <span className="hidden text-sm text-gray-600 sm:inline">
              {email}
            </span>
            <Button variant="ghost" size="sm" onClick={() => router.push("/ranking")}>
              🏆 Ranking
            </Button>
<Button variant="ghost" size="sm" onClick={() => router.push("/mi-negocio")}>
              🏪 Mi baño (Sólo negocios)
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/ajustes")}>
              ⚙️ Ajustes
            </Button>
            <Button variant="outline" size="sm" onClick={cerrarSesion}>
              Salir
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={() => router.push("/login")}>
            Entrar
          </Button>
        )}
      </div>
    </header>
  );
}