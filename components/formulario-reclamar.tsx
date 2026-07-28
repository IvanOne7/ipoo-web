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
import { useIdioma } from "@/lib/idiomas";

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
  const { t } = useIdioma();
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
      setAviso(t("debes_iniciar"));
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
        setAviso(t("ya_solicitud"));
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
            {t("reclamar_titulo")}
          </DialogTitle>
        </DialogHeader>

        {enviado ? (
          <div className="space-y-4 py-4 text-center">
            <span className="text-4xl">✅</span>
            <p className="text-sm">{t("reclamar_enviado")}</p>
            <Button onClick={onCerrar} className="w-full">
              {t("entendido")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("reclamar_intro")}</p>

            <div className="space-y-2">
              <Label htmlFor="negocio">{t("nombre_negocio")}</Label>
              <Input
                id="negocio"
                value={nombreNegocio}
                onChange={(e) => setNombreNegocio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email_contacto")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@tunegocio.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="msg">{t("mensaje_opcional")}</Label>
              <Textarea
                id="msg"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder={t("reclamar_msg_placeholder")}
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
                {t("cancelar")}
              </Button>
              <Button
                onClick={enviar}
                disabled={enviando || !nombreNegocio || !email}
                className="flex-1"
              >
                {t("enviar_solicitud")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}