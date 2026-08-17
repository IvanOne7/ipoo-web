// Efectos de sonido sintetizados con Web Audio API (sin archivos)

let contexto: AudioContext | null = null;

function getContexto(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!contexto) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    contexto = new Ctor();
  }
  return contexto;
}

export function sonidoActivado(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("sonido-iPoo") !== "off";
}

export function setSonido(activado: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("sonido-iPoo", activado ? "on" : "off");
}

// Toca una nota simple
function tono(freq: number, inicio: number, duracion: number, tipo: OscillatorType = "square", volumen = 0.15) {
  const ctx = getContexto();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = tipo;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const t = ctx.currentTime + inicio;
  gain.gain.setValueAtTime(volumen, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duracion);
  osc.start(t);
  osc.stop(t + duracion);
}

// Moneda tipo Mario (dos notas rápidas ascendentes)
export function sonidoMoneda() {
  if (!sonidoActivado()) return;
  getContexto()?.resume();
  tono(988, 0, 0.08, "square", 0.12);   // Si5
  tono(1319, 0.07, 0.18, "square", 0.12); // Mi6
}

// Pop / flush al publicar (barrido rápido)
export function sonidoPop() {
  if (!sonidoActivado()) return;
  const ctx = getContexto();
  if (!ctx) return;
  ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

// Sirena corta para emergencia (dos tonos alternos)
export function sonidoEmergencia() {
  if (!sonidoActivado()) return;
  getContexto()?.resume();
  tono(800, 0, 0.15, "sawtooth", 0.1);
  tono(600, 0.15, 0.15, "sawtooth", 0.1);
  tono(800, 0.3, 0.15, "sawtooth", 0.1);
}