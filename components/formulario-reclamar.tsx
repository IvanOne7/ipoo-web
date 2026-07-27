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

export default function FormularioReclamar({
  banoId,
  nombreBano,
  onCerrar,
}: {
  banoId: string;
  nombreBano: string;
  onCerrar: () => void;
}) {
  const supabase = createClient();
  const [nombreNegocio, setNombreNegocio] = useState(nombreBano);
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar() {
    setEnviando(true);
    setAviso("");

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setAviso("Debes iniciar sesión.");
      setEnviando(false);
      return;
    }

    const { error } = await supabase.from("reclamaciones").insert({
      bano_id: banoId,
      user_id: userData.user.id,
      nombre_negocio: nombreNegocio,
      email_contacto: email,
      mensaje: mensaje || null,
    });

    if (error) {
      if (error.code === "23505") {
        setAviso("Ya has enviado una solicitud para este baño.");
      } else {
        setAviso("Error: " + error.message);
      }
      setEnviando(false);
    } else {
      setEnviado(true);
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent className="z-[9999] max-h-[85vh] overflow-y-auto overscroll-contain rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Reclamar este baño 🏪
          </DialogTitle>
        </DialogHeader>

        {enviado ? (
          <div className="space-y-4 py-4 text-center">
            <span className="text-4xl">✅</span>
            <p className="text-sm">
              Solicitud enviada. Revisaremos que eres el propietario y verás el
              sello de verificado en cuanto lo aprobemos.
            </p>
            <Button onClick={onCerrar} className="w-full">
              Entendido
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Si eres el dueño de este local, verifícalo para que aparezca con el
              sello oficial.
            </p>

            <div className="space-y-2">
              <Label htmlFor="negocio">Nombre del negocio *</Label>
              <Input
                id="negocio"
                value={nombreNegocio}
                onChange={(e) => setNombreNegocio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email de contacto *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@tunegocio.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="msg">Mensaje (opcional)</Label>
              <Textarea
                id="msg"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Cuéntanos cómo verificar que eres el propietario…"
                className="rounded-2xl"
              />
            </div>

            {aviso && (
              <p className="rounded-xl bg-destructive/10 p-2 text-sm text-destructive">
                {aviso}
              </p>
            )}

            <div className="flex gap-2 border-t pt-4">
              <Button variant="outline" onClick={onCerrar} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={enviar}
                disabled={enviando || !nombreNegocio || !email}
                className="flex-1"
              >
                Enviar solicitud
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}