"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRadio, setRadio } from "@/lib/preferencias";
import { rangoDesdePuntos, progresoHaciaSiguiente } from "@/lib/rangos";
import { useIdioma, IDIOMAS } from "@/lib/idiomas";

type Valoracion = {
  id: string;
  puntuacion_general: number;
  comentario: string | null;
  created_at: string;
  banos: { nombre: string } | null;
};

export default function AjustesPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t, idioma, setIdioma } = useIdioma();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [radio, setRadioState] = useState(5000);
  const [misValoraciones, setMisValoraciones] = useState<Valoracion[]>([]);
  const [puntos, setPuntos] = useState(0);
  const [banosPublicados, setBanosPublicados] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargar() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }
      setEmail(userData.user.email ?? "");

      // Perfil
      const { data: perfil } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", userData.user.id)
        .single();
      if (perfil) {
        setUsername(perfil.username ?? "");
        setAvatarUrl(perfil.avatar_url);
      }

      // Mis valoraciones (con el nombre del baño)
      const { data: vals } = await supabase
        .from("valoraciones")
        .select("id, puntuacion_general, comentario, created_at, banos(nombre)")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });
      if (vals) setMisValoraciones(vals as unknown as Valoracion[]);

      // Mis puntos del ranking
      const { data: rank } = await supabase
        .from("ranking_usuarios")
        .select("puntos, banos_publicados")
        .eq("id", userData.user.id)
        .single();
      if (rank) {
        setPuntos(rank.puntos);
        setBanosPublicados(rank.banos_publicados);
      }
      setRadioState(getRadio());
    }
    cargar();
  }, [supabase, router]);

  async function guardarPerfil() {
    setGuardando(true);
    setMensaje("");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", userData.user.id);

    setRadio(radio);

    if (error) setMensaje(t("no_guardado") + error.message);
    else setMensaje(t("cambios_guardados"));
    setGuardando(false);
  }

  async function subirAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const nombreArchivo = `${userData.user.id}/${Date.now()}-${archivo.name}`;
    const { error: errSubida } = await supabase.storage
      .from("avatares")
      .upload(nombreArchivo, archivo, { upsert: true });

    if (errSubida) {
      setMensaje("Error: " + errSubida.message);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatares")
      .getPublicUrl(nombreArchivo);

    await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", userData.user.id);

    setAvatarUrl(urlData.publicUrl);
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const rango = rangoDesdePuntos(puntos);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("ajustes_titulo")}</h1>
        <Button variant="outline" size="sm" onClick={() => router.push("/")}>
          {t("volver_mapa")}
        </Button>
      </div>

      {/* Perfil */}
      <section className="mb-8 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">{t("perfil")}</h2>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full bg-muted">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Tu foto"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl">
                🧻
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="avatar" className="cursor-pointer text-sm text-primary underline">
              {t("cambiar_foto")}
            </Label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={subirAvatar}
              className="hidden"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="username">{t("nombre_usuario")}</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mt-4 space-y-2">
          <Label>Email</Label>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </section>

      {/* Mi nivel */}
      <section className="mb-8 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("mi_nivel")}</h2>
          <Button variant="outline" size="sm" onClick={() => router.push("/ranking")}>
            {t("ver_ranking")}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-4xl">{rango.emoji}</span>
          <div className="flex-1">
            <p className="font-bold">{t(rango.clave)}</p>
            <p className="text-sm text-muted-foreground">
              {puntos} {t("puntos")}
            </p>
          </div>
        </div>

        {rango.siguiente !== null && (
          <div className="mt-4">
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progresoHaciaSiguiente(puntos)}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {rango.siguiente - puntos} {t("puntos_siguiente")}
            </p>
          </div>
        )}
      </section>

      {/* Radio de búsqueda */}
      <section className="mb-8 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">{t("radio_busqueda")}</h2>
        <p className="mb-2 text-sm text-muted-foreground">
          {t("buscar_en_radio")} <strong>{(radio / 1000).toFixed(1)} km</strong>.
        </p>
        <input
          type="range"
          min={500}
          max={20000}
          step={500}
          value={radio}
          onChange={(e) => setRadioState(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </section>

      {/* Guardar */}
      <div className="mb-8 flex items-center gap-3">
        <Button onClick={guardarPerfil} disabled={guardando}>
          {t("guardar_cambios")}
        </Button>
        {mensaje && <span className="text-sm text-muted-foreground">{mensaje}</span>}
      </div>

      {/* Mis valoraciones */}
      <section className="mb-8 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          {t("mis_valoraciones")} ({misValoraciones.length})
        </h2>
        {misValoraciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("sin_mis_valoraciones")}
          </p>
        ) : (
          <div className="space-y-3">
            {misValoraciones.map((v) => (
              <div key={v.id} className="rounded-xl border p-3 text-sm">
                <p className="font-medium">{v.banos?.nombre ?? "Baño"}</p>
                <p>{"🧻".repeat(v.puntuacion_general)}</p>
                {v.comentario && (
                  <p className="mt-1 text-muted-foreground">{v.comentario}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Idioma */}
      <section className="mb-8 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">{t("idioma")}</h2>
        <div className="flex flex-wrap gap-2">
          {IDIOMAS.map((i) => (
            <button
              key={i.codigo}
              onClick={() => setIdioma(i.codigo)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                idioma === i.codigo
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-card hover:bg-muted"
              }`}
            >
              <span>{i.bandera}</span>
              {i.nombre}
            </button>
          ))}
        </div>
      </section>

      {/* Información y ayuda */}
      <section className="mb-8 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">{t("info_ayuda")}</h2>
        <div className="flex flex-col gap-2 text-sm">
          <a href="/ayuda" className="text-primary hover:underline">
            {t("centro_ayuda")}
          </a>
          <a href="/legal/privacidad" className="text-primary hover:underline">
            {t("politica_privacidad")}
          </a>
          <a href="/legal/aviso-legal" className="text-primary hover:underline">
            {t("aviso_legal")}
          </a>
          <a href="/legal/cookies" className="text-primary hover:underline">
            {t("politica_cookies")}
          </a>
        </div>
      </section>

      {/* Cerrar sesión */}
      <Button variant="destructive" onClick={cerrarSesion}>
        {t("cerrar_sesion")}
      </Button>
    </main>
  );
}