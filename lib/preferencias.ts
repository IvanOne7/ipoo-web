const CLAVE_RADIO = "ipoo_radio_metros";

export function getRadio(): number {
  if (typeof window === "undefined") return 5000;
  const v = localStorage.getItem(CLAVE_RADIO);
  return v ? Number(v) : 5000;
}

export function setRadio(metros: number) {
  localStorage.setItem(CLAVE_RADIO, String(metros));
}