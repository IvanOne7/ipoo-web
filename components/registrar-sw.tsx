"use client";

import { useEffect } from "react";

export default function RegistrarSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Si falla el registro, no pasa nada — la app funciona igual
      });
    }
  }, []);

  return null;
}