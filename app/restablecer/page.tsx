"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RestablecerPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function cambiar() {
    if (password.length < 6) {
      setMensaje("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setGuardando(true);
    setMensaje("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMensaje("Error: " + error.message);
      setGuardando(false);
    } else {
      setMensaje("¡Contraseña cambiada! Entrando…");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-teal-400 via-primary to-emerald-500 px-4 py-8">
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-[2rem] border-2 border-white/40 bg-white/95 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-6 text-center">
          <h1 className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-3xl font-black text-transparent">
            Nueva contraseña 🔒
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Escribe tu nueva contraseña
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="font-semibold">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={verPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border-2 py-5 pr-10"
              />
              <button
                type="button"
                onClick={() => setVerPassword(!verPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xl"
              >
                {verPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <Button
            onClick={cambiar}
            disabled={guardando}
            className="w-full rounded-xl py-6 text-base font-bold shadow-lg shadow-primary/30 transition active:scale-95"
            size="lg"
          >
            Cambiar contraseña
          </Button>

          {mensaje && (
            <p className="rounded-xl bg-muted p-3 text-center text-sm font-medium">
              {mensaje}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}