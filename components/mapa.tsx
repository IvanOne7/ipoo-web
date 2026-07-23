"use client";

import { useCallback, useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import { createClient } from "@/lib/supabase/client";
import Rollo from "@/components/rollo";
import MarcadorBano from "@/components/marcador-bano";
import { estadoDesdeRating } from "@/lib/estado";
import FormularioBano from "@/components/formulario-bano";
import FichaBano from "@/components/ficha-bano";
import PanelBuscador, { type Bano } from "@/components/panel-buscador";
import BotonEmergencia from "@/components/boton-emergencia";
import BarraNavegacion from "@/components/barra-navegacion";

function CapaBanos({
  recargar,
  onNuevoPunto,
  onSeleccionBano,
  onBanosCargados,
}: {
  recargar: number;
  onNuevoPunto: (p: { lat: number; lng: number }) => void;
  onSeleccionBano: (b: Bano) => void;
  onBanosCargados: (banos: Bano[]) => void;
}) {
  const map = useMap();
  const supabase = createClient();
  const [banos, setBanos] = useState<Bano[]>([]);

  useEffect(() => {
    if (!map) return;
    const centro = map.getCenter();
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
  }, [map, recargar, supabase, onBanosCargados]);

  useEffect(() => {
    if (!map) return;
    const listener = map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onNuevoPunto({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      }
    });
    return () => google.maps.event.removeListener(listener);
  }, [map, onNuevoPunto]);

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

  const handleNuevoPunto = useCallback((p: { lat: number; lng: number }) => {
    setNuevoPunto(p);
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

        <PanelBuscador
          banos={listaBanos}
          onSeleccion={handleSeleccionDesdeBuscador}
        />

        <BotonEmergencia
          banos={listaBanos}
          onEmergencia={handleSeleccionDesdeBuscador}
        />

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
            onNuevoPunto={handleNuevoPunto}
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
          banoId={banoSeleccionado.id}
          nombre={banoSeleccionado.nombre}
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