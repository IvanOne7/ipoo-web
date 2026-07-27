"use client";

import { useState } from "react";
import Link from "next/link";

const FAQS = [
  {
    p: "¿Qué es iPoo?",
    r: "iPoo es una app colaborativa para encontrar, puntuar y reseñar baños públicos y de acceso libre cerca de ti. La información la aportan los usuarios como tú.",
  },
  {
    p: "¿Cómo añado un baño?",
    r: "Pulsa el botón '➕ Añadir baño', mueve el mapa para colocar el pin en la ubicación exacta, pulsa 'Confirmar aquí' y rellena los datos. Necesitas haber iniciado sesión.",
  },
  {
    p: "¿Cómo valoro un baño?",
    r: "Toca un baño en el mapa para abrir su ficha y pulsa 'Valorar 🧻'. Puedes puntuar limpieza, olor, equipamiento y accesibilidad, además de dejar un comentario y fotos.",
  },
  {
    p: "¿Cómo funcionan los puntos y rangos?",
    r: "Ganas puntos por colaborar: añadir un baño, valorar, o subir fotos. Con los puntos subes de rango en el ranking. Puedes ver tu progreso en la sección de ajustes.",
  },
  {
    p: "Soy dueño de un local, ¿cómo verifico mi baño?",
    r: "Abre tu baño en el mapa y pulsa '🏪 Soy el propietario'. Rellena la solicitud y la revisaremos. Una vez verificado, tu baño mostrará un sello oficial y podrás gestionarlo desde 'Mi negocio'.",
  },
  {
    p: "¿Puedo editar o borrar un baño que añadí?",
    r: "Sí. Abre el baño que creaste y pulsa '✏️ Editar este baño'. Si necesitas eliminar contenido, escríbenos.",
  },
  {
    p: "¿Cómo elimino mi cuenta o mis datos?",
    r: "Escríbenos a [TU-EMAIL] y nos encargaremos. Consulta también nuestra política de privacidad.",
  },
];

function Acordeon({ p, r }: { p: string; r: string }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <div className="rounded-2xl border bg-card">
      <button
        onClick={() => setAbierto(!abierto)}
        className="flex w-full items-center justify-between p-4 text-left font-semibold"
      >
        {p}
        <span className="ml-2 text-primary">{abierto ? "−" : "+"}</span>
      </button>
      {abierto && (
        <p className="px-4 pb-4 text-sm text-muted-foreground">{r}</p>
      )}
    </div>
  );
}

export default function AyudaPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm font-semibold text-primary">
        ← Volver a iPoo
      </Link>

      <div className="mt-6 mb-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="iPoo" className="mx-auto h-16 w-auto" />
        <h1 className="mt-3 text-2xl font-bold">Centro de ayuda</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ¿Tienes dudas? Aquí tienes las preguntas más frecuentes.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((f) => (
          <Acordeon key={f.p} p={f.p} r={f.r} />
        ))}
      </div>

      {/* Contacto */}
      <div className="mt-8 rounded-2xl bg-primary/5 p-6 text-center">
        <p className="font-semibold">¿No encuentras lo que buscas?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Escríbenos y te ayudamos.
        </p>
        
         <button
          onClick={() => (window.location.href = "mailto:[TU-EMAIL]")}
          className="mt-3 inline-block font-semibold text-primary underline"
        >
          [TU-EMAIL]
        </button>
      </div>

      {/* Enlaces legales */}
      <div className="mt-10 flex flex-wrap justify-center gap-4 border-t pt-6 text-sm text-muted-foreground">
        <Link href="/legal/privacidad" className="hover:text-primary">
          Privacidad
        </Link>
        <Link href="/legal/aviso-legal" className="hover:text-primary">
          Aviso legal
        </Link>
        <Link href="/legal/cookies" className="hover:text-primary">
          Cookies
        </Link>
      </div>
    </main>
  );
}