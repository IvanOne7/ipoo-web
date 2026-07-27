"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BannerCookies() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mostrar solo si aún no ha decidido
    const decidido = localStorage.getItem("cookies-iPoo");
    if (!decidido) setVisible(true);
  }, []);

  function decidir(valor: "aceptadas" | "rechazadas") {
    localStorage.setItem("cookies-iPoo", valor);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9998] p-4">
      <div className="mx-auto max-w-lg rounded-2xl border bg-card p-5 shadow-2xl">
        <p className="text-sm">
          Usamos cookies propias y de terceros (como Google Maps) para que iPoo
          funcione y mejorar tu experiencia. Puedes aceptarlas o rechazar las no
          esenciales. Más info en nuestra{" "}
          <Link href="/legal/cookies" className="font-semibold text-primary underline">
            política de cookies
          </Link>
          .
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => decidir("rechazadas")}
          >
            Rechazar
          </Button>
          <Button className="flex-1" onClick={() => decidir("aceptadas")}>
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}