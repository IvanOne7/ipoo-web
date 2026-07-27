"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { createClient } from "@/lib/supabase/client";
import { estadoDesdeRating } from "@/lib/estado";
import { getRadio } from "@/lib/preferencias";
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
  miPos,
}: {
  recargar: number;
  onSeleccionBano: (b: Bano) => void;
  onBanosCargados: (banos: Bano[]) => void;
  miPos: { lat: number; lng: number } | null;
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
          radio_metros: getRadio(),
        })
        .then(({ data }) => {
          if (data) {
            setBanos(data as Bano[]);
            onBanosCargados(data as Bano[]);
          }
        });
    }

    cargarBanos();
    const listener = map.addListener("idle", cargarBanos);
    return () => google.maps.event.removeListener(listener);
  }, [map, recargar, supabase, onBanosCargados]);

  return (
    <>
      {/* Punto azul de mi ubicación */}
      {miPos && (
        <AdvancedMarker position={miPos} title="Estás aquí">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-6 w-6 animate-ping rounded-full bg-blue-500/40" />
            <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-md" />
          </div>
        </AdvancedMarker>
      )}

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
            verificado={!!b.verificado_dueno}
          />
        </AdvancedMarker>
      ))}
    </>
  );
}

export default function Mapa() {
  const [centro, setCentro] = useState({ lat: 38.0951, lng: -3.6366 });
  const [miPos, setMiPos] = useState<{ lat: number; lng: number } | null>(null);
  const [cargado, setCargado] = useState(false);
  const [recargar, setRecargar] = useState(0);
  const [nuevoPunto, setNuevoPunto] = useState<{ lat: number; lng: number } | null>(null);
  const [banoSeleccionado, setBanoSeleccionado] = useState<Bano | null>(null);
  const [listaBanos, setListaBanos] = useState<Bano[]>([]);
  const [mapaRef, setMapaRef] = useState<google.maps.Map | null>(null);
  const [modoAnadir, setModoAnadir] = useState(false);
  const [banoEditar, setBanoEditar] = useState<Bano | null>(null);
  const [haySesion, setHaySesion] = useState<boolean | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCentro(p);
          setMiPos(p);
          setCargado(true);
        },
        () => setCargado(true)
      );
    } else {
      setCargado(true);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setHaySesion(!!data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setHaySesion(!!session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSeleccionBano = useCallback((b: Bano) => {
    setBanoSeleccionado(b);
  }, []);

  const handleBanosCargados = useCallback((banos: Bano[]) => {
    setListaBanos(banos);
  }, []);

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

  function confirmarUbicacion() {
    if (!mapaRef) return;
    const c = mapaRef.getCenter();
    if (!c) return;
    setNuevoPunto({ lat: c.lat(), lng: c.lng() });
    setModoAnadir(false);
  }

  // Centrar el mapa en mi ubicación
  function centrarEnMi() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setMiPos(p);
      if (mapaRef) {
        mapaRef.panTo(p);
        mapaRef.setZoom(16);
      }
    });
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

            {/* Botón centrarme */}
            <button
              onClick={centrarEnMi}
              title="Centrarme en mi ubicación"
              className="absolute bottom-28 right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-card text-xl shadow-lg ring-1 ring-black/5 transition hover:shadow-xl"
            >
              🎯
            </button>

            <Button
              onClick={() => {
                if (haySesion) {
                  setModoAnadir(true);
                } else {
                  window.location.href = "/login";
                }
              }}
              className="absolute bottom-6 left-6 z-10 rounded-full shadow-lg"
              size="lg"
            >
              ➕ Añadir baño
            </Button>
          </>
        )}

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
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID!}
          onIdle={(e) => setMapaRef(e.map)}
          disableDefaultUI={true}
          zoomControl={true}
          clickableIcons={false}
        >
          <CapaBanos
            recargar={recargar}
            onSeleccionBano={handleSeleccionBano}
            onBanosCargados={handleBanosCargados}
            miPos={miPos}
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

      {banoEditar && (
        <FormularioBano
          banoExistente={banoEditar}
          onCerrar={() => setBanoEditar(null)}
          onGuardado={() => {
            setBanoEditar(null);
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
          onEditar={() => {
            setBanoEditar(banoSeleccionado);
            setBanoSeleccionado(null);
          }}
        />
      )}
    </APIProvider>
  );
}