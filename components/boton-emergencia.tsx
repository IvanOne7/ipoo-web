import type { Bano } from "@/components/panel-buscador";

export default function BotonEmergencia({
  banos,
  onEmergencia,
}: {
  banos: Bano[];
  onEmergencia: (b: Bano) => void;
}) {
  function activar() {
    if (banos.length === 0) return;
    // El más cercano: la lista ya viene ordenada por distancia desde banos_cercanos
    const masCercano = [...banos].sort(
      (a, b) => a.distancia_metros - b.distancia_metros
    )[0];
    onEmergencia(masCercano);
  }

  return (
    <button
      onClick={activar}
      className="absolute bottom-6 right-6 z-10 flex flex-col items-center justify-center rounded-full bg-red-600 px-5 py-4 text-white shadow-2xl animate-pulse-emergencia"
      title="Baño más cercano ¡ya!"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/emergencia.png"
        alt=""
        className="h-16 w-16 object-contain"
      />
      <span className="mt-1 text-xs font-bold tracking-wide">EMERGENCIA</span>
    </button>
  );
}