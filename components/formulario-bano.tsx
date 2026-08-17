"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sonidoPop } from "@/lib/sonidos";
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
import type { Bano } from "@/components/panel-buscador";

function Casilla({
  etiqueta,
  valor,
  onChange,
}: {
  etiqueta: string;
  valor: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!valor)}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        valor
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-card text-muted-foreground hover:bg-muted"
      }`}
    >
      {valor ? "✓ " : ""}
      {etiqueta}
    </button>
  );
}

export default function FormularioBano({
  punto,
  banoExistente,
  onCerrar,
  onGuardado,
}: {
  punto?: { lat: number; lng: number };
  banoExistente?: Bano;
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const { t } = useIdioma();
  const supabase = createClient();
  const editando = !!banoExistente;

  const TIPOS = [
    { valor: "publico_calle", etiqueta: t("tipo_publico") },
    { valor: "centro_comercial", etiqueta: t("tipo_centro") },
    { valor: "hosteleria", etiqueta: t("tipo_hosteleria") },
    { valor: "otro", etiqueta: t("tipo_otro") },
  ];

  const [nombre, setNombre] = useState(banoExistente?.nombre ?? "");
  const [tipo, setTipo] = useState(banoExistente?.tipo ?? "publico_calle");
  const [direccion, setDireccion] = useState(banoExistente?.direccion ?? "");
  const [horario, setHorario] = useState(banoExistente?.horario ?? "");
  const [descripcion, setDescripcion] = useState(banoExistente?.descripcion ?? "");
  const [esGratis, setEsGratis] = useState(banoExistente?.es_gratis ?? true);
  const [requiereConsumir, setRequiereConsumir] = useState(
    banoExistente?.requiere_consumir ?? false
  );
  const [tienePapel, setTienePapel] = useState(banoExistente?.tiene_papel ?? false);
  const [tieneJabon, setTieneJabon] = useState(banoExistente?.tiene_jabon ?? false);
  const [tieneSecador, setTieneSecador] = useState(banoExistente?.tiene_secador ?? false);
  const [esAccesible, setEsAccesible] = useState(banoExistente?.es_accesible ?? false);
  const [tieneCambiador, setTieneCambiador] = useState(
    banoExistente?.tiene_cambiador ?? false
  );
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setGuardando(true);
    setMensaje("");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setMensaje(t("debes_iniciar"));
      setGuardando(false);
      return;
    }

    const datos = {
      nombre,
      tipo,
      descripcion: descripcion || null,
      direccion: direccion || null,
      horario: horario || null,
      es_gratis: esGratis,
      requiere_consumir: requiereConsumir,
      tiene_papel: tienePapel,
      tiene_jabon: tieneJabon,
      tiene_secador: tieneSecador,
      es_accesible: esAccesible,
      tiene_cambiador: tieneCambiador,
    };

    let error;
    if (editando) {
      const res = await supabase
        .from("banos")
        .update(datos)
        .eq("id", banoExistente!.id);
      error = res.error;
    } else {
      const res = await supabase.from("banos").insert({
        ...datos,
        created_by: userData.user.id,
        ubicacion: `POINT(${punto!.lng} ${punto!.lat})`,
      });
      error = res.error;
    }

    if (error) {
      setMensaje("Error: " + error.message);
      setGuardando(false);
    } else {
      sonidoPop();
      onGuardado();
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent className="z-[9999] max-h-[85vh] overflow-y-auto overscroll-contain rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editando ? t("titulo_editar") : t("titulo_anadir")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">{t("nombre_sitio")}</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. El Corte Inglés - Planta 3"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">{t("tipo_establecimiento")}</Label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm"
            >
              {TIPOS.map((tp) => (
                <option key={tp.valor} value={tp.valor}>
                  {tp.etiqueta}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="direccion">{t("direccion_opcional")}</Label>
            <Input
              id="direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="C/ Mayor 12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="horario">{t("horario_opcional")}</Label>
            <Input
              id="horario"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              placeholder="09:00 - 22:00"
            />
          </div>

          {/* Características */}
          <div className="space-y-2">
            <Label>{t("que_tiene")}</Label>
            <div className="flex flex-wrap gap-2">
              <Casilla etiqueta={t("filtro_gratis")} valor={esGratis} onChange={setEsGratis} />
              <Casilla
                etiqueta={t("hay_que_consumir")}
                valor={requiereConsumir}
                onChange={setRequiereConsumir}
              />
              <Casilla etiqueta={t("ins_papel")} valor={tienePapel} onChange={setTienePapel} />
              <Casilla etiqueta={t("ins_jabon")} valor={tieneJabon} onChange={setTieneJabon} />
              <Casilla etiqueta={t("ins_secador")} valor={tieneSecador} onChange={setTieneSecador} />
              <Casilla etiqueta={t("ins_accesible")} valor={esAccesible} onChange={setEsAccesible} />
              <Casilla
                etiqueta={t("ins_cambiador")}
                valor={tieneCambiador}
                onChange={setTieneCambiador}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">{t("notas_opcional")}</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder={t("notas_placeholder")}
              className="rounded-2xl"
            />
          </div>
          {mensaje && (
            <p className="rounded-xl bg-destructive/10 p-2 text-sm text-destructive">
              {mensaje}
            </p>
          )}
          <div className="flex gap-2 border-t pt-4">
            <Button variant="outline" onClick={onCerrar} className="flex-1">
              {t("cancelar")}
            </Button>
            <Button
              onClick={guardar}
              disabled={guardando || !nombre}
              className="flex-1"
            >
              {editando ? t("guardar_cambios") : t("guardar_bano")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}