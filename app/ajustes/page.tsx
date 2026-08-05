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
import { LOGROS, contarLogros, type EstadisticasUsuario } from "@/lib/logros";

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
  const [ciudad, setCiudad] = useState("");
  const [radio, setRadioState] = useState(5000);
  const [misValoraciones, setMisValoraciones] = useState<Valoracion[]>([]);
  const [puntos, setPuntos] = useState(0);
  const [banosPublicados, setBanosPublicados] = useState(0);
  const [stats, setStats] = useState<EstadisticasUsuario>({
    banosPublicados: 0,
    valoraciones: 0,
    valoracionesConFoto: 0,
    ciudadesDistintas: 0,
  });
  const [racha, setRacha] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  async function detectarCiudad() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const latitude = pos.coords.latitude;
      const lng = pos.coords.longitude;
      try {
        const resp = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=es`
        );
        const data = await resp.json();
        const comp = data.results?.[0]?.address_components?.find(
          (c: { types: string[]; long_name: string }) =>
            c.types.includes("locality")
        );
        if (comp) setCiudad(comp.long_name);
      } catch {
        // Si falla, el usuario la escribe a mano
      }
    });
  }

  useEffect(() => {
    async function cargar() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }
      setEmail(userData.user.email ?? "");

      // Actualizar y obtener la racha diaria
      const { data: rachaData } = await supabase.rpc("actualizar_racha");
      if (typeof rachaData === "number") setRacha(rachaData);

      // Perfil
      const { data: perfil } = await supabase
        .from("profiles")
        .select("username, avatar_url, ciudad")
        .eq("id", userData.user.id)
        .single();
      if (perfil) {
        setUsername(perfil.username ?? "");
        setAvatarUrl(perfil.avatar_url);
        setCiudad(perfil.ciudad ?? "");
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

      // Estadísticas para los logros
      const { data: filaStats } = await supabase
        .from("ranking_usuarios")
        .select("banos_publicados, valoraciones_hechas, valoraciones_con_foto")
        .eq("id", userData.user.id)
        .single();

      // Ciudades distintas donde ha añadido baños
      const { data: misBanos } = await supabase
        .from("banos")
        .select("direccion")
        .eq("created_by", userData.user.id);
      const ciudadesUnicas = new Set(
        (misBanos ?? [])
          .map((b) => (b.direccion ?? "").trim())
          .filter((d) => d.length > 0)
      );

      if (filaStats) {
        setStats({
          banosPublicados: filaStats.banos_publicados,
          valoraciones: filaStats.valoraciones_hechas,
          valoracionesConFoto: filaStats.valoraciones_con_foto,
          ciudadesDistintas: ciudadesUnicas.size,
        });
      }

      setRadioState(getRadio());

      // Si no tiene ciudad guardada, detectarla sola por GPS
      if (perfil && !perfil.ciudad) {
        detectarCiudad();
      }
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, router]);

  async function guardarPerfil() {
    setGuardando(true);
    setMensaje("");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ username, ciudad })
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
    if (!userData.user) {
      setMensaje("No hay sesión iniciada. Vuelve a iniciar sesión.");
      return;
    }

    setMensaje("Subiendo foto…");

    try {
      // Leer la imagen y redimensionarla con un canvas (compatible con Safari iOS
      // y convierte HEIC/pesadas a JPG ligero)
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
        reader.readAsDataURL(archivo);
      });

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error("No se pudo cargar la imagen (formato no soportado)"));
        i.src = dataUrl;
      });

      // Redimensionar a máx 500px de lado
      const max = 500;
      let { width, height } = img;
      if (width > height && width > max) {
        height = (height * max) / width;
        width = max;
      } else if (height > max) {
        width = (width * max) / height;
        height = max;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo procesar la imagen (canvas)");
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a JPG (blob) al 85% de calidad
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
      );
      if (!blob) throw new Error("No se pudo convertir la imagen (blob nulo)");

      const nombreArchivo = `${userData.user.id}/${Date.now()}.jpg`;
      const { error: errSubida } = await supabase.storage
        .from("avatares")
        .upload(nombreArchivo, blob, {
          upsert: true,
          contentType: "image/jpeg",
        });

      if (errSubida) {
        setMensaje("Error subida: " + errSubida.message);
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
      setMensaje("Foto actualizada.");
    } catch (err) {
      setMensaje("Fallo: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function compartirRango() {
    const texto = t("compartir_texto")
      .replace("{rango}", t(rango.clave))
      .replace("{puntos}", String(puntos));
    const url = "https://ipoo.es";
    const mensajeCompleto = `${texto} ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "iPoo", text: texto, url });
      } catch {
        // El usuario canceló
      }
    } else {
      await navigator.clipboard.writeText(mensajeCompleto);
      setMensaje(t("copiado"));
    }
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
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={subirAvatar}
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                opacity: 0,
                overflow: "hidden",
              }}
            />
            <label
              htmlFor="avatar"
              className="cursor-pointer text-sm text-primary underline"
            >
              {t("cambiar_foto")}
            </label>
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
          <Label htmlFor="ciudad">{t("tu_ciudad")}</Label>
          <div className="flex gap-2">
            <Input
              id="ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder={t("ciudad_placeholder")}
            />
            <Button variant="outline" size="sm" onClick={detectarCiudad}>
              {t("detectar_ciudad")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{t("ciudad_ayuda")}</p>
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

        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={compartirRango}
        >
          {t("compartir_rango")}
        </Button>
      </section>

      {/* Racha diaria */}
      {racha > 0 && (
        <section className="mb-8 rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">{t("racha_titulo")}</h2>
          <div className="flex items-center gap-3">
            <span className="text-4xl">🔥</span>
            <div>
              <p className="text-2xl font-extrabold text-primary">
                {racha}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  {t("racha_dias")}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">{t("racha_animo")}</p>
            </div>
          </div>
        </section>
      )}

      {/* Logros */}
      <section className="mb-8 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("logros_titulo")}</h2>
          <span className="text-sm text-muted-foreground">
            {contarLogros(stats)}/{LOGROS.length} {t("logros_progreso")}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {LOGROS.map((logro) => {
            const conseguido = logro.conseguido(stats);
            return (
              <div
                key={logro.clave}
                className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-center transition ${
                  conseguido
                    ? "border-primary/30 bg-primary/5"
                    : "border-dashed opacity-50 grayscale"
                }`}
              >
                <span className="text-2xl">{conseguido ? logro.emoji : "🔒"}</span>
                <span className="text-[10px] font-medium leading-tight">
                  {t(logro.clave)}
                </span>
              </div>
            );
          })}
        </div>
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