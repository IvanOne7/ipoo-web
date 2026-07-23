import type { EstadoBano } from "@/components/rollo";

export function estadoDesdeRating(
  rating: number,
  totalValoraciones: number
): EstadoBano {
  if (totalValoraciones === 0) return "sin_valorar";
  if (rating >= 4) return "perfecto";
  if (rating >= 2.5) return "regular";
  return "sucio";
}