// Importa aseos públicos de España desde OpenStreetMap a la tabla "banos" de Supabase.
//
// Uso (desde la carpeta ipoo-web):
//   node --env-file=.env.local scripts/importar-osm.mjs --prueba   (solo descarga y cuenta, no guarda nada)
//   node --env-file=.env.local scripts/importar-osm.mjs            (importa de verdad)
//
// Datos: © Colaboradores de OpenStreetMap (licencia ODbL).
// Es seguro repetirlo: los baños ya importados se saltan, y no se tocan los que añade la gente.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const PRUEBA = process.argv.includes("--prueba");

if (!SUPABASE_URL || !SECRET_KEY) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local");
  process.exit(1);
}

const SERVIDORES = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const CONSULTA = `
[out:json][timeout:300];
area["ISO3166-1"="ES"][admin_level=2]->.es;
nwr["amenity"="toilets"](area.es);
out center tags;
`;

async function descargar() {
  for (const url of SERVIDORES) {
    try {
      console.log(`Descargando de ${url} (puede tardar unos minutos)...`);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "ipoo-importador/1.0",
        },
        body: "data=" + encodeURIComponent(CONSULTA),
      });
      if (!res.ok) {
        console.log(`  Respuesta ${res.status}, probando otro servidor...`);
        continue;
      }
      const json = await res.json();
      return json.elements ?? [];
    } catch (e) {
      console.log(`  Error: ${e.message}. Probando otro servidor...`);
    }
  }
  throw new Error("No se pudo descargar de ningún servidor. Inténtalo más tarde.");
}

function direccion(t) {
  const calle = t["addr:street"];
  if (!calle) return null;
  const num = t["addr:housenumber"] ? ` ${t["addr:housenumber"]}` : "";
  const ciudad = t["addr:city"] ? `, ${t["addr:city"]}` : "";
  return `${calle}${num}${ciudad}`.slice(0, 200);
}

function aBano(el) {
  const t = el.tags ?? {};
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null) return null;

  // Solo aseos de uso público
  if (["private", "customers", "no", "permit"].includes(t.access)) return null;
  if (t.disused || t.abandoned || t["disused:amenity"]) return null;

  const gratis = t.fee === "no" ? true : t.fee === "yes" ? false : null;
  const accesible = t.wheelchair === "yes" ? true : t.wheelchair === "no" ? false : null;
  const cambiador = t.changing_table === "yes" ? true : t.changing_table === "no" ? false : null;

  return {
    nombre: (t.name || t["name:es"] || "Aseo público").slice(0, 120),
    tipo: "publico_calle",
    ubicacion: `SRID=4326;POINT(${lng} ${lat})`,
    direccion: direccion(t),
    es_gratis: gratis,
    es_accesible: accesible,
    tiene_cambiador: cambiador,
    horario: t.opening_hours ? t.opening_hours.slice(0, 200) : null,
    origen: "osm",
    osm_id: `${el.type}/${el.id}`,
  };
}

async function insertarLote(lote) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/banos?on_conflict=osm_id`, {
    method: "POST",
    headers: {
      apikey: SECRET_KEY,
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=minimal",
    },
    body: JSON.stringify(lote),
  });
  if (!res.ok) {
    throw new Error(`Supabase respondió ${res.status}: ${await res.text()}`);
  }
}

const elementos = await descargar();
console.log(`Descargados ${elementos.length} elementos de OpenStreetMap.`);

const banos = elementos.map(aBano).filter(Boolean);
console.log(`Aseos de uso público válidos: ${banos.length}`);
console.log(`Descartados (privados, solo clientes o sin coordenadas): ${elementos.length - banos.length}`);

if (PRUEBA) {
  console.log("\nModo prueba: no se ha guardado nada. Ejemplo de la primera fila:");
  console.log(banos[0]);
  process.exit(0);
}

const TAM = 500;
let hechos = 0;
for (let i = 0; i < banos.length; i += TAM) {
  await insertarLote(banos.slice(i, i + TAM));
  hechos += Math.min(TAM, banos.length - i);
  console.log(`Enviados ${hechos} / ${banos.length}`);
}
console.log("\nListo. Los baños ya importados se habían saltado, y no se ha tocado ninguno de los tuyos.");
