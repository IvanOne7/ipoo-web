"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRadio, setRadio } from "@/lib/preferencias";
import { rangoDesdePuntos, progresoHaciaSiguiente } from "@/lib/rangos";

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
{/* Mi nivel */}
      <section className="mb-8 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mi nivel</h2>
          <Button variant="outline" size="sm" onClick={() => router.push("/ranking")}>
            Ver ranking 🏆
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-4xl">{rangoDesdePuntos(puntos).emoji}</span>
          <div className="flex-1">
            <p className="font-bold">{rangoDesdePuntos(puntos).nombre}</p>
            <p className="text-sm text-muted-foreground">
              {puntos} puntos · {banosPublicados} baños · {misValoraciones.length} valoraciones
            </p>
          </div>
        </div>

        {rangoDesdePuntos(puntos).siguiente !== null && (
          <div className="mt-4">
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progresoHaciaSiguiente(puntos)}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {rangoDesdePuntos(puntos).siguiente! - puntos} puntos para el
              siguiente rango
            </p>
          </div>
        )}
      </section>
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

    if (error) setMensaje("No se pudo guardar: " + error.message);
    else setMensaje("Cambios guardados.");
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
      setMensaje("Error al subir la foto: " + errSubida.message);
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

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <Button variant="outline" size="sm" onClick={() => router.push("/")}>
          Volver al mapa
        </Button>
      </div>

      {/* Perfil */}
      <section className="mb-8 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Perfil</h2>
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
              Cambiar foto
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
          <Label htmlFor="username">Nombre de usuario</Label>
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

      {/* Radio de búsqueda */}
      <section className="mb-8 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Radio de búsqueda</h2>
        <p className="mb-2 text-sm text-muted-foreground">
          Buscar baños en un radio de <strong>{(radio / 1000).toFixed(1)} km</strong>.
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
          Guardar cambios
        </Button>
        {mensaje && <span className="text-sm text-muted-foreground">{mensaje}</span>}
      </div>

      {/* Mis valoraciones */}
      <section className="mb-8 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          Mis valoraciones ({misValoraciones.length})
        </h2>
        {misValoraciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no has valorado ningún baño.
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
<section className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Información y ayuda</h2>
          <div className="flex flex-col gap-2 text-sm">
            <a href="/ayuda" className="text-primary hover:underline">
              Centro de ayuda
            </a>
            <a href="/legal/privacidad" className="text-primary hover:underline">
              Política de privacidad
            </a>
            <a href="/legal/aviso-legal" className="text-primary hover:underline">
              Aviso legal
            </a>
            <a href="/legal/cookies" className="text-primary hover:underline">
              Política de cookies
            </a>
          </div>
        </section>

      {/* Cerrar sesión */}
      <Button variant="destructive" onClick={cerrarSesion}>
        Cerrar sesión
      </Button>
    </main>
  );
}