"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type Reclamacion = {
  id: string;
  bano_id: string;
  user_id: string;
  nombre_negocio: string;
  email_contacto: string;
  mensaje: string | null;
  estado: string;
  banos: { nombre: string } | null;
};

type BanoAdmin = {
  id: string;
  nombre: string;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [esAdmin, setEsAdmin] = useState<boolean | null>(null);
  const [reclamaciones, setReclamaciones] = useState<Reclamacion[]>([]);
  const [banos, setBanos] = useState<BanoAdmin[]>([]);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    async function cargar() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      // ¿Es admin?
      const { data: admin } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", userData.user.id)
        .single();

      if (!admin) {
        setEsAdmin(false);
        return;
      }
      setEsAdmin(true);

      cargarDatos();
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargarDatos() {
    const { data: recs } = await supabase
      .from("reclamaciones")
      .select("*, banos(nombre)")
      .eq("estado", "pendiente")
      .order("created_at", { ascending: false });
    if (recs) setReclamaciones(recs as unknown as Reclamacion[]);

    const { data: bs } = await supabase
      .from("banos")
      .select("id, nombre, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (bs) setBanos(bs as BanoAdmin[]);
  }

  async function aprobar(r: Reclamacion) {
    await supabase
      .from("banos")
      .update({ verificado_dueno: true, dueno_id: r.user_id })
      .eq("id", r.bano_id);
    await supabase
      .from("reclamaciones")
      .update({ estado: "aprobada" })
      .eq("id", r.id);
    setAviso(`"${r.nombre_negocio}" verificado.`);
    cargarDatos();
  }

  async function rechazar(r: Reclamacion) {
    await supabase
      .from("reclamaciones")
      .update({ estado: "rechazada" })
      .eq("id", r.id);
    setAviso("Solicitud rechazada.");
    cargarDatos();
  }

  async function borrarBano(id: string, nombre: string) {
    if (!confirm(`¿Borrar el baño "${nombre}"? Esto no se puede deshacer.`)) return;
    await supabase.from("banos").delete().eq("id", id);
    setAviso(`Baño "${nombre}" borrado.`);
    cargarDatos();
  }

  if (esAdmin === null) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Comprobando permisos…</p>
      </main>
    );
  }

  if (esAdmin === false) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold">No tienes acceso a esta página.</p>
        <Button onClick={() => router.push("/")}>Volver al mapa</Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Panel de admin 🛠️</h1>
        <Button variant="outline" size="sm" onClick={() => router.push("/")}>
          Volver al mapa
        </Button>
      </div>

      {aviso && (
        <p className="mb-4 rounded-xl bg-primary/10 p-2 text-sm text-primary">
          {aviso}
        </p>
      )}

      {/* Reclamaciones pendientes */}
      <section className="mb-8 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          Reclamaciones pendientes ({reclamaciones.length})
        </h2>
        {reclamaciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay solicitudes pendientes.</p>
        ) : (
          <div className="space-y-3">
            {reclamaciones.map((r) => (
              <div key={r.id} className="rounded-xl border p-3 text-sm">
                <p className="font-semibold">{r.nombre_negocio}</p>
                <p className="text-muted-foreground">
                  Baño: {r.banos?.nombre ?? r.bano_id}
                </p>
                <p className="text-muted-foreground">📧 {r.email_contacto}</p>
                {r.mensaje && <p className="mt-1">{r.mensaje}</p>}
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => aprobar(r)}>
                    ✓ Aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rechazar(r)}
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Baños (para borrar abusivos) */}
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Baños recientes</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Borra aquí los baños falsos o abusivos.
        </p>
        <div className="space-y-2">
          {banos.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-xl border p-2 text-sm"
            >
              <span className="truncate">{b.nombre}</span>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => borrarBano(b.id, b.nombre)}
              >
                Borrar
              </Button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}