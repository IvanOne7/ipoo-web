"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function registrarse() {
    setCargando(true);
    setMensaje("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMensaje("Error: " + error.message);
    else setMensaje("¡Revisa tu email para confirmar la cuenta!");
    setCargando(false);
  }

  async function iniciarSesion() {
    setCargando(true);
    setMensaje("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMensaje("Error: " + error.message);
      setCargando(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function entrarConGoogle() {
    setCargando(true);
    setMensaje("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setMensaje("Error: " + error.message);
      setCargando(false);
    }
    // Si va bien, el navegador redirige solo a Google
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background px-4">
      {/* Burbujas decorativas de fondo */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-3xl border bg-card/80 p-8 shadow-xl backdrop-blur">
        <div className="mb-6 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="iPoo" className="h-20 w-auto" />
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">iPoo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Encuentra tu baño, estés donde estés.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            onClick={iniciarSesion}
            disabled={cargando}
            className="w-full"
            size="lg"
          >
            Entrar
          </Button>
          <Button
            onClick={registrarse}
            disabled={cargando}
            variant="outline"
            className="w-full"
          >
            Crear cuenta
          </Button>

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">o</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            onClick={entrarConGoogle}
            disabled={cargando}
            variant="outline"
            className="w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.google.com/favicon.ico"
              alt=""
              className="mr-2 h-4 w-4"
            />
            Entrar con Google
          </Button>

          {mensaje && (
            <p className="rounded-lg bg-muted p-2 text-center text-sm">
              {mensaje}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}