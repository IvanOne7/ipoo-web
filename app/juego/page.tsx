"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Tablero = number[][];

const TAM = 4;

function tableroVacio(): Tablero {
  return Array.from({ length: TAM }, () => Array(TAM).fill(0));
}

function anadirFicha(t: Tablero): Tablero {
  const vacias: [number, number][] = [];
  for (let i = 0; i < TAM; i++)
    for (let j = 0; j < TAM; j++) if (t[i][j] === 0) vacias.push([i, j]);
  if (vacias.length === 0) return t;
  const [fi, fj] = vacias[Math.floor(Math.random() * vacias.length)];
  const nuevo = t.map((fila) => [...fila]);
  nuevo[fi][fj] = Math.random() < 0.9 ? 2 : 4;
  return nuevo;
}

// Comprime y fusiona una fila hacia la izquierda. Devuelve [fila, puntosGanados]
function moverFila(fila: number[]): [number[], number] {
  const nums = fila.filter((n) => n !== 0);
  let puntos = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i] === nums[i + 1]) {
      nums[i] *= 2;
      puntos += nums[i];
      nums.splice(i + 1, 1);
    }
  }
  while (nums.length < TAM) nums.push(0);
  return [nums, puntos];
}

function rotar(t: Tablero): Tablero {
  const nuevo = tableroVacio();
  for (let i = 0; i < TAM; i++)
    for (let j = 0; j < TAM; j++) nuevo[j][TAM - 1 - i] = t[i][j];
  return nuevo;
}

function mover(t: Tablero, dir: "izq" | "der" | "arr" | "aba"): [Tablero, number, boolean] {
  let girado = t.map((f) => [...f]);
  const giros = { izq: 0, aba: 1, der: 2, arr: 3 }[dir];
  for (let g = 0; g < giros; g++) girado = rotar(girado);

  let puntos = 0;
  const movido = girado.map((fila) => {
    const [nueva, p] = moverFila(fila);
    puntos += p;
    return nueva;
  });

  let resultado = movido;
  for (let g = 0; g < (4 - giros) % 4; g++) resultado = rotar(resultado);

  const cambio = JSON.stringify(resultado) !== JSON.stringify(t);
  return [resultado, puntos, cambio];
}

function hayMovimientos(t: Tablero): boolean {
  for (let i = 0; i < TAM; i++)
    for (let j = 0; j < TAM; j++) {
      if (t[i][j] === 0) return true;
      if (j < TAM - 1 && t[i][j] === t[i][j + 1]) return true;
      if (i < TAM - 1 && t[i][j] === t[i + 1][j]) return true;
    }
  return false;
}

const COLORES: Record<number, string> = {
  0: "bg-black/5",
  2: "bg-teal-100 text-teal-800",
  4: "bg-teal-200 text-teal-900",
  8: "bg-emerald-300 text-emerald-900",
  16: "bg-emerald-400 text-white",
  32: "bg-cyan-400 text-white",
  64: "bg-cyan-500 text-white",
  128: "bg-amber-300 text-amber-900",
  256: "bg-amber-400 text-white",
  512: "bg-orange-400 text-white",
  1024: "bg-orange-500 text-white",
  2048: "bg-primary text-white",
};

export default function JuegoPage() {
  const router = useRouter();
  const [tablero, setTablero] = useState<Tablero>(tableroVacio);
  const [puntos, setPuntos] = useState(0);
  const [mejor, setMejor] = useState(0);
  const [finJuego, setFinJuego] = useState(false);

  const reiniciar = useCallback(() => {
    let t = tableroVacio();
    t = anadirFicha(t);
    t = anadirFicha(t);
    setTablero(t);
    setPuntos(0);
    setFinJuego(false);
  }, []);

  useEffect(() => {
    reiniciar();
    const guardado = localStorage.getItem("mejor-2048-iPoo");
    if (guardado) setMejor(Number(guardado));
  }, [reiniciar]);

  const hacerMovimiento = useCallback(
    (dir: "izq" | "der" | "arr" | "aba") => {
      if (finJuego) return;
      setTablero((actual) => {
        const [nuevo, p, cambio] = mover(actual, dir);
        if (!cambio) return actual;
        const conFicha = anadirFicha(nuevo);
        setPuntos((pt) => {
          const total = pt + p;
          setMejor((m) => {
            const nm = Math.max(m, total);
            localStorage.setItem("mejor-2048-iPoo", String(nm));
            return nm;
          });
          return total;
        });
        if (!hayMovimientos(conFicha)) setFinJuego(true);
        return conFicha;
      });
    },
    [finJuego]
  );

  // Teclado (PC)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mapa: Record<string, "izq" | "der" | "arr" | "aba"> = {
        ArrowLeft: "izq",
        ArrowRight: "der",
        ArrowUp: "arr",
        ArrowDown: "aba",
      };
      if (mapa[e.key]) {
        e.preventDefault();
        hacerMovimiento(mapa[e.key]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hacerMovimiento]);

  // Gestos táctiles (móvil)
  const [inicio, setInicio] = useState<{ x: number; y: number } | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    setInicio({ x: t.clientX, y: t.clientY });
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!inicio) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - inicio.x;
    const dy = t.clientY - inicio.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) < 20) return; // demasiado corto
    if (absX > absY) hacerMovimiento(dx > 0 ? "der" : "izq");
    else hacerMovimiento(dy > 0 ? "aba" : "arr");
    setInicio(null);
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-hidden bg-gradient-to-br from-teal-400 via-primary to-emerald-500 px-4 py-6">
      <div className="mb-4 flex w-full max-w-md items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-primary shadow active:scale-95"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-black text-white drop-shadow">2048 🧻</h1>
        <div className="w-20" />
      </div>

      {/* Marcadores */}
      <div className="mb-4 flex w-full max-w-md gap-3">
        <div className="flex-1 rounded-2xl bg-white/90 p-3 text-center shadow">
          <p className="text-xs font-semibold text-muted-foreground">PUNTOS</p>
          <p className="text-2xl font-black text-primary">{puntos}</p>
        </div>
        <div className="flex-1 rounded-2xl bg-white/90 p-3 text-center shadow">
          <p className="text-xs font-semibold text-muted-foreground">MEJOR</p>
          <p className="text-2xl font-black text-primary">{mejor}</p>
        </div>
      </div>

      {/* Tablero */}
      <div
        className="relative rounded-3xl bg-white/90 p-3 shadow-2xl"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "none" }}
      >
        <div className="grid grid-cols-4 gap-2">
          {tablero.flat().map((valor, i) => (
            <div
              key={i}
              className={`flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-black transition-all sm:h-20 sm:w-20 ${
                COLORES[valor] ?? "bg-primary text-white"
              }`}
            >
              {valor !== 0 ? valor : ""}
            </div>
          ))}
        </div>

        {finJuego && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/95">
            <p className="text-3xl font-black text-primary">¡Fin! 🚽</p>
            <p className="text-sm text-muted-foreground">Puntos: {puntos}</p>
            <Button onClick={reiniciar} className="rounded-full font-bold">
              Jugar otra vez
            </Button>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-sm font-medium text-white/90">
        Desliza para mover las fichas.<br />¡Une los números iguales hasta llegar a 2048!
      </p>

      <Button
        onClick={reiniciar}
        variant="outline"
        className="mt-4 rounded-full bg-white/90 font-bold"
      >
        Reiniciar
      </Button>
    </main>
  );
}