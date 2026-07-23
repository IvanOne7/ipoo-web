"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const TIPOS = [
  { valor: "publico_calle", etiqueta: "Público de calle" },
  { valor: "centro_comercial", etiqueta: "Centro comercial" },
  { valor: "hosteleria", etiqueta: "Hostelería" },
  { valor: "otro", etiqueta: "Otro" },
];

export default function FormularioBano({
  punto,
  onCerrar,
  onGuardado,
}: {
  punto: { lat: number; lng: number };
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const supabase = createClient();
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("publico_calle");
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setGuardando(true);
    setMensaje("");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setMensaje("Debes iniciar sesión para añadir un baño.");
      setGuardando(false);
      return;
    }

    const { error } = await supabase.from("banos").insert({
      nombre,
      tipo,
      descripcion: descripcion || null,
      created_by: userData.user.id,
      ubicacion: `POINT(${punto.lng} ${punto.lat})`,
    });

    if (error) {
      setMensaje("Error: " + error.message);
      setGuardando(false);
    } else {
      onGuardado();
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir un baño 🧻</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del sitio</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. El Corte Inglés - Planta 3"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de establecimiento</Label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {TIPOS.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.etiqueta}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          {mensaje && <p className="text-sm text-red-500">{mensaje}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCerrar}>
              Cancelar
            </Button>
            <Button onClick={guardar} disabled={guardando || !nombre}>
              Guardar baño
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}