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
import { getRadio } from "@/lib/preferencias";
import FormularioBano from "@/components/formulario-bano";
import FichaBano from "@/components/ficha-bano";
import PanelBuscador, { type Bano } from "@/components/panel-buscador";
import BotonEmergencia from "@/components/boton-emergencia";
import BarraNavegacion from "@/components/barra-navegacion";
import MarcadorBano from "@/components/marcador-bano";
import { Button } from "@/components/ui/button";
import { useIdioma } from "@/lib/idiomas";

type Grupo = {
  lat: number;
  lng: number;
  banos: Bano[];
};

function agruparBanos(banos: Bano[], map: google.maps.Map): Grupo[] {
  const zoom = map.getZoom() ?? 15;
  const factor = 60 / Math.pow(2, zoom);
  const grupos: Grupo[] = [];
  for (const b of banos) {
    let asignado = false;
    for (const g of grupos) {
      if (
        Math.abs(g.lat - b.lat_bano) < factor &&
        Math.abs(g.lng - b.lng_bano) < factor
      ) {
        g.banos.push(b);
        asignado = true;
        break;
      }
    }
    if (!asignado) {
      grupos.push({ lat: b.lat_bano, lng: b.lng_bano, banos: [b] });
    }
  }
  return grupos;
}

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
  const [, setTick] = useState(0);

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
    const idle = map.addListener("idle", () => {
      cargarBanos();
      setTick((t) => t + 1);
    });
    return () => google.maps.event.removeListener(idle);
  }, [map, recargar, supabase, onBanosCargados]);

  useEffect(() => {
    if (!map) return;
    const z = map.addListener("zoom_changed", () => setTick((t) => t + 1));
    return () => google.maps.event.removeListener(z);
  }, [map]);

  const grupos = map ? agruparBanos(banos, map) : [];

  return (
    <>
      {miPos && (
        <AdvancedMarker position={miPos} title="Estás aquí">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-6 w-6 animate-ping rounded-full bg-blue-500/40" />
            <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-md" />
          </div>
        </AdvancedMarker>
      )}
      {grupos.map((g, i) =>
        g.banos.length === 1 ? (
          <AdvancedMarker
            key={g.banos[0].id}
            position={{ lat: g.banos[0].lat_bano, lng: g.banos[0].lng_bano }}
            title={g.banos[0].nombre}
            onClick={() => onSeleccionBano(g.banos[0])}
          >
            <MarcadorBano
              estado={estadoDesdeRating(
                g.banos[0].rating_medio,
                g.banos[0].total_valoraciones
              )}
              size={55}
              verificado={!!g.banos[0].verificado_dueno}
            />
          </AdvancedMarker>
        ) : (
          <AdvancedMarker
            key={`grupo-${i}`}
            position={{ lat: g.lat, lng: g.lng }}
            title={`${g.banos.length} baños`}
            onClick={() => {
              if (map) {
                map.panTo({ lat: g.lat, lng: g.lng });
                map.setZoom((map.getZoom() ?? 15) + 2);
              }
            }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-primary text-sm font-bold text-white shadow-lg">
              {g.banos.length}
            </div>
          </AdvancedMarker>
        )
      )}
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
  const { t } = useIdioma();
  const [pinProvisional, setPinProvisional] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    setCargado(true);
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

  useEffect(() => {
    if (!mapaRef) return;
    const listener = mapaRef.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (modoAnadir) return;
      if (!e.latLng) return;
      setPinProvisional({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    });
    return () => google.maps.event.removeListener(listener);
  }, [mapaRef, modoAnadir]);

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

  function centrarEnMi() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMiPos(p);
        if (mapaRef) {
          mapaRef.panTo(p);
          mapaRef.setZoom(16);
        }
      },
      () => {
        // Si deniega el permiso, no hacemos nada
      }
    );
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
            <button
              onClick={centrarEnMi}
              title="Centrarme en mi ubicación"
              className="absolute right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-card text-xl shadow-lg ring-1 ring-black/5 transition hover:shadow-xl"
              style={{ bottom: "calc(9rem + env(safe-area-inset-bottom, 1.5rem))" }}
            >
              🎯
            </button>
            <Button
              onClick={() => {
                if (haySesion) {
                  setModoAnadir(true);
                  setPinProvisional(null);
                } else {
                  window.location.href = "/login";
                }
              }}
              className="absolute left-6 z-10 rounded-full shadow-lg"
              size="lg"
              style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom, 1.5rem))" }}
            >
              {t("anadir_bano")}
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
                {t("mueve_mapa")}
              </p>
            </div>
            <div
              className="absolute inset-x-0 z-30 flex justify-center gap-3 px-4"
              style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom, 1.5rem))" }}
            >
              <Button
                variant="outline"
                onClick={() => setModoAnadir(false)}
                className="rounded-full shadow-lg"
                size="lg"
              >
                {t("cancelar")}
              </Button>
              <Button
                onClick={confirmarUbicacion}
                className="rounded-full shadow-lg"
                size="lg"
              >
                {t("confirmar_aqui")}
              </Button>
            </div>
          </>
        )}

        {pinProvisional && !modoAnadir && (
          <div
            className="absolute inset-x-0 z-30 flex justify-center px-4"
            style={{ bottom: "calc(8rem + env(safe-area-inset-bottom, 1.5rem))" }}
          >
            <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-lg">
              <span className="text-sm font-semibold">¿Crear un baño aquí?</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPinProvisional(null)}
              >
                No
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (haySesion) {
                    setNuevoPunto(pinProvisional);
                    setPinProvisional(null);
                  } else {
                    window.location.href = "/login";
                  }
                }}
              >
                Sí, crear
              </Button>
            </div>
          </div>
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

          {pinProvisional && !modoAnadir && (
            <AdvancedMarker position={pinProvisional}>
              <div className="h-8 w-8 animate-bounce rounded-full border-4 border-white bg-red-500 shadow-lg" />
            </AdvancedMarker>
          )}
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