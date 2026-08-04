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
    const { error } = await supabase.auth.signUp({ email, password });
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background px-4">
      {/* Burbujas decorativas de fondo */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-3xl border bg-card/80 p-8 shadow-xl backdrop-blur">
        <div className="mb-6 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="iPoo" className="h-32 w-auto" />
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">iPoo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("login_subtitulo")}
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
            <Label htmlFor="password">{t("password")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={verPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setVerPassword(!verPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {verPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <Button
            onClick={iniciarSesion}
            disabled={cargando}
            className="w-full"
            size="lg"
          >
            {t("entrar")}
          </Button>
          <Button
            onClick={registrarse}
            disabled={cargando}
            variant="outline"
            className="w-full"
          >
            {t("crear_cuenta")}
          </Button>

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">{t("o_separador")}</span>
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
            {t("entrar_google")}
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