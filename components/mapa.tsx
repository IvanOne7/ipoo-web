"use client";

import { useCallback, useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import { createClient } from "@/lib/supabase/client";
import { estadoDesdeRating } from "@/lib/estado";
import FormularioBano from "@/components/formulario-bano";
import FichaBano from "@/components/ficha-bano";
import PanelBuscador, { type Bano } from "@/components/panel-buscador";
import BotonEmergencia from "@/components/boton-emergencia";
import BarraNavegacion from "@/components/barra-navegacion";
import MarcadorBano from "@/components/marcador-bano";
import { Button } from "@/components/ui/button";

function CapaBanos({
  recargar,
  onSeleccionBano,
  onBanosCargados,
}: {
  recargar: number;
  onSeleccionBano: (b: Bano) => void;
  onBanosCargados: (banos: Bano[]) => void;
}) {
  const map = useMap();
  const supabase = createClient();
  const [banos, setBanos] = useState<Bano[]>([]);

  useEffect(() => {
    if (!map) return;

    function cargarBanos() {
      const centro = map!.getCenter();
      if (!centro) return;

      supabase
        .rpc("banos_cercanos", {
          lat: centro.lat(),
          lng: centro.lng(),
          radio_metros: 5000,
        })
        .then(({ data }) => {
          if (data) {
            setBanos(data as Bano[]);
            onBanosCargados(data as Bano[]);
          }
        });
    }

    // Carga inicial
    cargarBanos();

    // Recargar cada vez que el mapa deja de moverse
    const listener = map.addListener("idle", cargarBanos);
    return () => google.maps.event.removeListener(listener);
  }, [map, recargar, supabase, onBanosCargados]);

  return (
    <>
      {banos.map((b) => (
        <AdvancedMarker
          key={b.id}
          position={{ lat: b.lat_bano, lng: b.lng_bano }}
          title={b.nombre}
          onClick={() => onSeleccionBano(b)}
        >
          <MarcadorBano
            estado={estadoDesdeRating(b.rating_medio, b.total_valoraciones)}
            size={40}
          />
        </AdvancedMarker>
      ))}
    </>
  );
}

export default function Mapa() {
  const [centro, setCentro] = useState({ lat: 38.0951, lng: -3.6366 });
  const [cargado, setCargado] = useState(false);
  const [recargar, setRecargar] = useState(0);
  const [nuevoPunto, setNuevoPunto] = useState<{ lat: number; lng: number } | null>(null);
  const [banoSeleccionado, setBanoSeleccionado] = useState<Bano | null>(null);
  const [listaBanos, setListaBanos] = useState<Bano[]>([]);
  const [mapaRef, setMapaRef] = useState<google.maps.Map | null>(null);
  const [modoAnadir, setModoAnadir] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCentro({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setCargado(true);
        },
        () => setCargado(true)
      );
    } else {
      setCargado(true);
    }
  }, []);

  const handleSeleccionBano = useCallback((b: Bano) => {
    setBanoSeleccionado(b);
  }, []);

  const handleBanosCargados = useCallback((banos: Bano[]) => {
    setListaBanos(banos);
  }, []);

  // Al elegir un baño en el buscador o en emergencia: centrar el mapa y abrir su ficha
  const handleSeleccionDesdeBuscador = useCallback(
    (b: Bano) => {
      if (mapaRef) {
        mapaRef.panTo({ lat: b.lat_bano, lng: b.lng_bano });
        mapaRef.setZoom(17);
      }
      setBanoSeleccionado(b);
    },
    [mapaRef]
  );

  // Confirmar la posición del pin central
  function confirmarUbicacion() {
    if (!mapaRef) return;
    const c = mapaRef.getCenter();
    if (!c) return;
    setNuevoPunto({ lat: c.lat(), lng: c.lng() });
    setModoAnadir(false);
  }

  if (!cargado) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Cargando mapa…</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <div className="relative h-screen w-full">
        <BarraNavegacion />

        {!modoAnadir && (
          <>
            <PanelBuscador
              banos={listaBanos}
              onSeleccion={handleSeleccionDesdeBuscador}
            />

            <BotonEmergencia
              banos={listaBanos}
              onEmergencia={handleSeleccionDesdeBuscador}
            />

            <Button
              onClick={() => setModoAnadir(true)}
              className="absolute bottom-6 left-6 z-10 rounded-full shadow-lg"
              size="lg"
            >
              ➕ Añadir baño
            </Button>
          </>
        )}

        {/* Modo añadir: pin central fijo + confirmar */}
        {modoAnadir && (
          <>
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <div className="flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="" className="h-12 w-12 drop-shadow-lg" />
                <div className="h-4 w-1 bg-black/40" />
                <div className="h-2 w-2 rounded-full bg-black/40" />
              </div>
            </div>

            <div className="absolute inset-x-0 top-20 z-30 flex justify-center px-4">
              <p className="rounded-full bg-card px-4 py-2 text-sm font-semibold shadow-lg">
                Mueve el mapa para colocar el baño
              </p>
            </div>

            <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center gap-3 px-4">
              <Button
                variant="outline"
                onClick={() => setModoAnadir(false)}
                className="rounded-full shadow-lg"
                size="lg"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarUbicacion}
                className="rounded-full shadow-lg"
                size="lg"
              >
                Confirmar aquí
              </Button>
            </div>
          </>
        )}

        <Map
          defaultCenter={centro}
          defaultZoom={15}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID!}
          onIdle={(e) => setMapaRef(e.map)}
        >
          <CapaBanos
            recargar={recargar}
            onSeleccionBano={handleSeleccionBano}
            onBanosCargados={handleBanosCargados}
          />
        </Map>
      </div>

      {nuevoPunto && (
        <FormularioBano
          punto={nuevoPunto}
          onCerrar={() => setNuevoPunto(null)}
          onGuardado={() => {
            setNuevoPunto(null);
            setRecargar((r) => r + 1);
          }}
        />
      )}

      {banoSeleccionado && (
        <FichaBano
          bano={banoSeleccionado}
          onCerrar={() => setBanoSeleccionado(null)}
          onValorado={() => {
            setBanoSeleccionado(null);
            setRecargar((r) => r + 1);
          }}
        />
      )}
    </APIProvider>
  );
}