"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIdioma } from "@/lib/idiomas";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useIdioma();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  async function registrarse() {
    setCargando(true);
    setMensaje("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) setMensaje("Error: " + error.message);
    else setMensaje(t("revisa_email"));
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
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-teal-400 via-primary to-emerald-500 px-4 py-8">
      {/* Emojis de papel flotando de fondo */}
      <span className="pointer-events-none absolute left-[8%] top-[12%] animate-bounce text-4xl opacity-30" style={{ animationDuration: "3s" }}>🧻</span>
      <span className="pointer-events-none absolute right-[10%] top-[20%] animate-bounce text-3xl opacity-25" style={{ animationDuration: "4s", animationDelay: "0.5s" }}>🚽</span>
      <span className="pointer-events-none absolute bottom-[15%] left-[12%] animate-bounce text-3xl opacity-25" style={{ animationDuration: "3.5s", animationDelay: "1s" }}>🧻</span>
      <span className="pointer-events-none absolute bottom-[22%] right-[14%] animate-bounce text-4xl opacity-30" style={{ animationDuration: "4.5s", animationDelay: "0.3s" }}>💧</span>

      {/* Burbujas de luz */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-[2rem] border-2 border-white/40 bg-white/95 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-6 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="iPoo"
            className="h-32 w-auto drop-shadow-lg"
            style={{ animation: "flotar 3s ease-in-out infinite" }}
          />
          <h1 className="mt-2 bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-4xl font-black tracking-tight text-transparent">
            iPoo
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {t("login_subtitulo")}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-2 py-5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-semibold">{t("password")}</Label>
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
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {verPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <Button
            onClick={iniciarSesion}
            disabled={cargando}
            className="w-full rounded-xl py-6 text-base font-bold shadow-lg shadow-primary/30 transition active:scale-95"
            size="lg"
          >
            {t("entrar")}
          </Button>
          <Button
            onClick={registrarse}
            disabled={cargando}
            variant="outline"
            className="w-full rounded-xl border-2 py-6 font-bold transition active:scale-95"
          >
            {t("crear_cuenta")}
          </Button>

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted-foreground">{t("o_separador")}</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            onClick={entrarConGoogle}
            disabled={cargando}
            variant="outline"
            className="w-full rounded-xl border-2 py-6 font-semibold transition active:scale-95"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.google.com/favicon.ico"
              alt=""
              className="mr-2 h-4 w-4"
            />
            {t("entrar_google")}
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