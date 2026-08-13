"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIdioma } from "@/lib/idiomas";

export default function CompletarPerfilPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useIdioma();

  const [username, setUsername] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargar() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }
      setUserId(userData.user.id);

      // Si ya tiene el perfil completo, no debería estar aquí
      const { data: perfil } = await supabase
        .from("profiles")
        .select("username, avatar_url, ciudad, perfil_completo")
        .eq("id", userData.user.id)
        .single();
      if (perfil?.perfil_completo) {
        router.push("/");
        return;
      }
      if (perfil) {
        setUsername(perfil.username ?? "");
        setCiudad(perfil.ciudad ?? "");
        setAvatarUrl(perfil.avatar_url);
      }

      // Detectar ciudad por GPS si no tiene
      if (perfil && !perfil.ciudad) {
        detectarCiudad();
      }
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function detectarCiudad() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const resp = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.coords.latitude},${pos.coords.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=es`
        );
        const data = await resp.json();
        const comp = data.results?.[0]?.address_components?.find(
          (c: { types: string[]; long_name: string }) =>
            c.types.includes("locality")
        );
        if (comp) setCiudad(comp.long_name);
      } catch {
        // Si falla, la escribe a mano
      }
    });
  }

  async function subirAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo || !userId) return;
    setMensaje("Subiendo foto…");

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
        reader.readAsDataURL(archivo);
      });

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error("Formato no soportado"));
        i.src = dataUrl;
      });

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
      if (!ctx) throw new Error("No se pudo procesar");
      ctx.drawImage(img, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
      );
      if (!blob) throw new Error("No se pudo convertir");

      const nombreArchivo = `${userId}/${Date.now()}.jpg`;
      const { error: errSubida } = await supabase.storage
        .from("avatares")
        .upload(nombreArchivo, blob, {
          upsert: true,
          contentType: "image/jpeg",
        });
      if (errSubida) {
        setMensaje("Error: " + errSubida.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatares")
        .getPublicUrl(nombreArchivo);
      setAvatarUrl(urlData.publicUrl);
      setMensaje("");
    } catch {
      setMensaje("No se pudo subir la foto.");
    }
  }

  async function guardar() {
    if (!userId) return;
    if (!username.trim()) {
      setMensaje("Ponte un nombre de usuario.");
      return;
    }
    setGuardando(true);
    setMensaje("");

    const { error } = await supabase
      .from("profiles")
      .update({
        username: username.trim(),
        ciudad: ciudad.trim() || null,
        avatar_url: avatarUrl,
        perfil_completo: true,
      })
      .eq("id", userId);

    if (error) {
      setMensaje("Error: " + error.message);
      setGuardando(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-teal-400 via-primary to-emerald-500 px-4 py-8">
      <span className="pointer-events-none absolute left-[8%] top-[12%] animate-bounce text-4xl opacity-30" style={{ animationDuration: "3s" }}>🧻</span>
      <span className="pointer-events-none absolute right-[10%] top-[18%] animate-bounce text-3xl opacity-25" style={{ animationDuration: "4s", animationDelay: "0.5s" }}>🎉</span>
      <span className="pointer-events-none absolute bottom-[15%] right-[12%] animate-bounce text-4xl opacity-30" style={{ animationDuration: "4.5s", animationDelay: "0.3s" }}>🚽</span>

      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />

      <div className="relative w-full max-w-sm rounded-[2rem] border-2 border-white/40 bg-white/95 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-6 text-center">
          <h1 className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-3xl font-black text-transparent">
            ¡Ya casi está! 🎉
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Completa tu perfil para empezar
          </p>
        </div>

        {/* Foto */}
        <div className="mb-5 flex flex-col items-center gap-3">
          <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-primary/20 bg-muted shadow-lg">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl">
                🧻
              </div>
            )}
          </div>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={subirAvatar}
            style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
          />
          <label
            htmlFor="avatar"
            className="cursor-pointer rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary transition active:scale-95"
          >
            📸 Elegir foto
          </label>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="font-semibold">
              {t("nombre_usuario")}
            </Label>
            <Input
              id="username"
              placeholder="Tu nombre en iPoo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl border-2 py-5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ciudad" className="font-semibold">
              {t("tu_ciudad")}
            </Label>
            <div className="flex gap-2">
              <Input
                id="ciudad"
                placeholder={t("ciudad_placeholder")}
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="rounded-xl border-2 py-5"
              />
              <Button
                type="button"
                variant="outline"
                onClick={detectarCiudad}
                className="rounded-xl border-2"
              >
                📍
              </Button>
            </div>
          </div>

          <Button
            onClick={guardar}
            disabled={guardando}
            className="w-full rounded-xl py-6 text-base font-bold shadow-lg shadow-primary/30 transition active:scale-95"
            size="lg"
          >
            {guardando ? "Guardando…" : "¡Empezar! 🚀"}
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