"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Idioma = "es" | "en" | "de" | "fr" | "it";

export const IDIOMAS: { codigo: Idioma; nombre: string; bandera: string }[] = [
  { codigo: "es", nombre: "Español", bandera: "🇪🇸" },
  { codigo: "en", nombre: "English", bandera: "🇬🇧" },
  { codigo: "de", nombre: "Deutsch", bandera: "🇩🇪" },
  { codigo: "fr", nombre: "Français", bandera: "🇫🇷" },
  { codigo: "it", nombre: "Italiano", bandera: "🇮🇹" },
];

// Diccionario de textos. Cada clave tiene una traducción por idioma.
const TEXTOS: Record<string, Record<Idioma, string>> = {
  buscar_banos: {
    es: "Buscar baños",
    en: "Find toilets",
    de: "Toiletten finden",
    fr: "Trouver des toilettes",
    it: "Trova bagni",
  },
  anadir_bano: {
    es: "➕ Añadir baño",
    en: "➕ Add toilet",
    de: "➕ Toilette hinzufügen",
    fr: "➕ Ajouter des toilettes",
    it: "➕ Aggiungi bagno",
  },
  confirmar_aqui: {
    es: "Confirmar aquí",
    en: "Confirm here",
    de: "Hier bestätigen",
    fr: "Confirmer ici",
    it: "Conferma qui",
  },
  cancelar: {
    es: "Cancelar",
    en: "Cancel",
    de: "Abbrechen",
    fr: "Annuler",
    it: "Annulla",
  },
  mueve_mapa: {
    es: "Mueve el mapa para colocar el baño",
    en: "Move the map to place the toilet",
    de: "Bewege die Karte, um die Toilette zu platzieren",
    fr: "Déplace la carte pour placer les toilettes",
    it: "Sposta la mappa per posizionare il bagno",
  },
  ranking: {
    es: "🏆 Ranking",
    en: "🏆 Ranking",
    de: "🏆 Rangliste",
    fr: "🏆 Classement",
    it: "🏆 Classifica",
  },
  mi_negocio: {
    es: "🏪 Mi negocio",
    en: "🏪 My business",
    de: "🏪 Mein Geschäft",
    fr: "🏪 Mon commerce",
    it: "🏪 La mia attività",
  },
  ajustes: {
    es: "⚙️ Ajustes",
    en: "⚙️ Settings",
    de: "⚙️ Einstellungen",
    fr: "⚙️ Paramètres",
    it: "⚙️ Impostazioni",
  },
  salir: {
    es: "Salir",
    en: "Log out",
    de: "Abmelden",
    fr: "Déconnexion",
    it: "Esci",
  },
  idioma: {
    es: "Idioma",
    en: "Language",
    de: "Sprache",
    fr: "Langue",
    it: "Lingua",
  },
buscar_placeholder: {
    es: "Buscar por nombre o zona…",
    en: "Search by name or area…",
    de: "Nach Name oder Gebiet suchen…",
    fr: "Rechercher par nom ou zone…",
    it: "Cerca per nome o zona…",
  },
  filtros_rapidos: {
    es: "Filtros rápidos",
    en: "Quick filters",
    de: "Schnellfilter",
    fr: "Filtres rapides",
    it: "Filtri rapidi",
  },
  ordenar_por: {
    es: "Ordenar por",
    en: "Sort by",
    de: "Sortieren nach",
    fr: "Trier par",
    it: "Ordina per",
  },
  limpiar: {
    es: "Limpiar",
    en: "Clear",
    de: "Zurücksetzen",
    fr: "Effacer",
    it: "Cancella",
  },
  filtro_gratis: {
    es: "Gratis",
    en: "Free",
    de: "Gratis",
    fr: "Gratuit",
    it: "Gratis",
  },
  filtro_con_papel: {
    es: "Con papel",
    en: "With paper",
    de: "Mit Papier",
    fr: "Avec papier",
    it: "Con carta",
  },
  filtro_accesible: {
    es: "Accesible ♿",
    en: "Accessible ♿",
    de: "Barrierefrei ♿",
    fr: "Accessible ♿",
    it: "Accessibile ♿",
  },
  filtro_cambiador: {
    es: "Cambiador 🍼",
    en: "Changing table 🍼",
    de: "Wickeltisch 🍼",
    fr: "Table à langer 🍼",
    it: "Fasciatoio 🍼",
  },
  filtro_sin_consumir: {
    es: "Sin consumir",
    en: "No purchase",
    de: "Ohne Verzehr",
    fr: "Sans consommation",
    it: "Senza consumare",
  },
  orden_cercanos: {
    es: "Más cercanos",
    en: "Nearest",
    de: "Am nächsten",
    fr: "Les plus proches",
    it: "Più vicini",
  },
  orden_mejor_valorados: {
    es: "Mejor valorados",
    en: "Top rated",
    de: "Bestbewertet",
    fr: "Les mieux notés",
    it: "Più votati",
  },
  orden_mas_limpios: {
    es: "Más limpios",
    en: "Cleanest",
    de: "Am saubersten",
    fr: "Les plus propres",
    it: "Più puliti",
  },
  orden_mejor_olor: {
    es: "Mejor olor",
    en: "Best smell",
    de: "Bester Geruch",
    fr: "Meilleure odeur",
    it: "Miglior odore",
  },
  orden_mejor_equipados: {
    es: "Mejor equipados",
    en: "Best equipped",
    de: "Beste Ausstattung",
    fr: "Mieux équipés",
    it: "Meglio attrezzati",
  },
  orden_mas_accesibles: {
    es: "Más accesibles",
    en: "Most accessible",
    de: "Am zugänglichsten",
    fr: "Les plus accessibles",
    it: "Più accessibili",
  },
  sin_valorar: {
    es: "Sin valorar",
    en: "Not rated",
    de: "Nicht bewertet",
    fr: "Non noté",
    it: "Non valutato",
  },
sin_banos_cerca: {
    es: "No hay baños cerca todavía.",
    en: "No toilets nearby yet.",
    de: "Noch keine Toiletten in der Nähe.",
    fr: "Pas encore de toilettes à proximité.",
    it: "Ancora nessun bagno nelle vicinanze.",
  },
  ninguno_coincide: {
    es: "Ningún baño coincide con la búsqueda.",
    en: "No toilets match your search.",
    de: "Keine Toilette entspricht der Suche.",
    fr: "Aucune toilette ne correspond à la recherche.",
    it: "Nessun bagno corrisponde alla ricerca.",
  },
  opinion_singular: {
    es: "opinión",
    en: "review",
    de: "Bewertung",
    fr: "avis",
    it: "recensione",
  },
  opinion_plural: {
    es: "opiniones",
    en: "reviews",
    de: "Bewertungen",
    fr: "avis",
    it: "recensioni",
  },
a_x_de_ti: {
    es: "de ti",
    en: "away",
    de: "entfernt",
    fr: "de vous",
    it: "da te",
  },
  cerrado_temporal: {
    es: "⚠️ Cerrado temporalmente",
    en: "⚠️ Temporarily closed",
    de: "⚠️ Vorübergehend geschlossen",
    fr: "⚠️ Temporairement fermé",
    it: "⚠️ Chiuso temporaneamente",
  },
  verificado_local: {
    es: "✓ Verificado por el local",
    en: "✓ Verified by the venue",
    de: "✓ Vom Lokal bestätigt",
    fr: "✓ Vérifié par l'établissement",
    it: "✓ Verificato dal locale",
  },
  hay_que_consumir: {
    es: "Hay que consumir",
    en: "Purchase required",
    de: "Verzehr erforderlich",
    fr: "Consommation obligatoire",
    it: "Consumazione obbligatoria",
  },
  ins_papel: {
    es: "Papel",
    en: "Paper",
    de: "Papier",
    fr: "Papier",
    it: "Carta",
  },
  ins_jabon: {
    es: "Jabón",
    en: "Soap",
    de: "Seife",
    fr: "Savon",
    it: "Sapone",
  },
  ins_secador: {
    es: "Secador",
    en: "Dryer",
    de: "Trockner",
    fr: "Sèche-mains",
    it: "Asciugatore",
  },
  ins_accesible: {
    es: "Accesible ♿",
    en: "Accessible ♿",
    de: "Barrierefrei ♿",
    fr: "Accessible ♿",
    it: "Accessibile ♿",
  },
  ins_cambiador: {
    es: "Cambiador 🍼",
    en: "Changing table 🍼",
    de: "Wickeltisch 🍼",
    fr: "Table à langer 🍼",
    it: "Fasciatoio 🍼",
  },
  como_llegar: {
    es: "🧭 Cómo llegar",
    en: "🧭 Directions",
    de: "🧭 Route",
    fr: "🧭 Itinéraire",
    it: "🧭 Come arrivare",
  },
  editar_bano: {
    es: "✏️ Editar este baño",
    en: "✏️ Edit this toilet",
    de: "✏️ Diese Toilette bearbeiten",
    fr: "✏️ Modifier ces toilettes",
    it: "✏️ Modifica questo bagno",
  },
  soy_propietario: {
    es: "🏪 Soy el propietario",
    en: "🏪 I'm the owner",
    de: "🏪 Ich bin der Inhaber",
    fr: "🏪 Je suis le propriétaire",
    it: "🏪 Sono il proprietario",
  },
  cargando: {
    es: "Cargando…",
    en: "Loading…",
    de: "Lädt…",
    fr: "Chargement…",
    it: "Caricamento…",
  },
  sin_valoraciones: {
    es: "Aún no hay valoraciones.",
    en: "No reviews yet.",
    de: "Noch keine Bewertungen.",
    fr: "Pas encore d'avis.",
    it: "Ancora nessuna recensione.",
  },
  se_primero: {
    es: "¡Sé el primero en opinar!",
    en: "Be the first to review!",
    de: "Sei der Erste, der bewertet!",
    fr: "Soyez le premier à donner votre avis !",
    it: "Sii il primo a recensire!",
  },
  de_5: {
    es: "de 5",
    en: "of 5",
    de: "von 5",
    fr: "sur 5",
    it: "di 5",
  },
  crit_limpieza: {
    es: "Limpieza",
    en: "Cleanliness",
    de: "Sauberkeit",
    fr: "Propreté",
    it: "Pulizia",
  },
  crit_olor: {
    es: "Olor",
    en: "Smell",
    de: "Geruch",
    fr: "Odeur",
    it: "Odore",
  },
  crit_equipamiento: {
    es: "Equipamiento",
    en: "Facilities",
    de: "Ausstattung",
    fr: "Équipement",
    it: "Attrezzatura",
  },
  crit_accesibilidad: {
    es: "Accesibilidad",
    en: "Accessibility",
    de: "Barrierefreiheit",
    fr: "Accessibilité",
    it: "Accessibilità",
  },
  opiniones_titulo: {
    es: "Opiniones",
    en: "Reviews",
    de: "Bewertungen",
    fr: "Avis",
    it: "Recensioni",
  },
  respuesta_local: {
    es: "🏪 Respuesta del local",
    en: "🏪 Venue's reply",
    de: "🏪 Antwort des Lokals",
    fr: "🏪 Réponse de l'établissement",
    it: "🏪 Risposta del locale",
  },
  cerrar: {
    es: "Cerrar",
    en: "Close",
    de: "Schließen",
    fr: "Fermer",
    it: "Chiudi",
  },
  valorar: {
    es: "Valorar 🧻",
    en: "Rate 🧻",
    de: "Bewerten 🧻",
    fr: "Noter 🧻",
    it: "Valuta 🧻",
  },
  crit_general: {
    es: "General",
    en: "Overall",
    de: "Gesamt",
    fr: "Général",
    it: "Generale",
  },
  como_estaba: {
    es: "¿Cómo estaba? Cuéntanos…",
    en: "How was it? Tell us…",
    de: "Wie war es? Erzähl uns…",
    fr: "Comment c'était ? Dites-nous…",
    it: "Com'era? Raccontaci…",
  },
  fotos_opcional: {
    es: "Fotos (opcional)",
    en: "Photos (optional)",
    de: "Fotos (optional)",
    fr: "Photos (facultatif)",
    it: "Foto (opzionale)",
  },
  volver: {
    es: "Volver",
    en: "Back",
    de: "Zurück",
    fr: "Retour",
    it: "Indietro",
  },
  enviar_valoracion: {
    es: "Enviar valoración",
    en: "Submit review",
    de: "Bewertung senden",
    fr: "Envoyer l'avis",
    it: "Invia recensione",
  },
  debes_iniciar_valorar: {
    es: "Debes iniciar sesión para valorar.",
    en: "You must log in to review.",
    de: "Du musst dich anmelden, um zu bewerten.",
    fr: "Vous devez vous connecter pour noter.",
    it: "Devi accedere per recensire.",
  },
  pon_general: {
    es: "Pon al menos la puntuación general.",
    en: "Give at least an overall score.",
    de: "Gib mindestens eine Gesamtbewertung ab.",
    fr: "Donnez au moins une note globale.",
    it: "Dai almeno un punteggio generale.",
  },
  ya_valoraste: {
    es: "Ya has valorado este baño.",
    en: "You've already reviewed this toilet.",
    de: "Du hast diese Toilette bereits bewertet.",
    fr: "Vous avez déjà noté ces toilettes.",
    it: "Hai già recensito questo bagno.",
  },
titulo_editar: {
    es: "Editar baño 🧻",
    en: "Edit toilet 🧻",
    de: "Toilette bearbeiten 🧻",
    fr: "Modifier les toilettes 🧻",
    it: "Modifica bagno 🧻",
  },
  titulo_anadir: {
    es: "Añadir un baño 🧻",
    en: "Add a toilet 🧻",
    de: "Toilette hinzufügen 🧻",
    fr: "Ajouter des toilettes 🧻",
    it: "Aggiungi un bagno 🧻",
  },
  nombre_sitio: {
    es: "Nombre del sitio *",
    en: "Place name *",
    de: "Name des Ortes *",
    fr: "Nom du lieu *",
    it: "Nome del luogo *",
  },
  tipo_establecimiento: {
    es: "Tipo de establecimiento",
    en: "Type of place",
    de: "Art des Ortes",
    fr: "Type d'établissement",
    it: "Tipo di locale",
  },
  tipo_publico: {
    es: "Público de calle",
    en: "Public street",
    de: "Öffentlich (Straße)",
    fr: "Public (rue)",
    it: "Pubblico (strada)",
  },
  tipo_centro: {
    es: "Centro comercial",
    en: "Shopping mall",
    de: "Einkaufszentrum",
    fr: "Centre commercial",
    it: "Centro commerciale",
  },
  tipo_hosteleria: {
    es: "Hostelería",
    en: "Bar / restaurant",
    de: "Gastronomie",
    fr: "Bar / restaurant",
    it: "Bar / ristorante",
  },
  tipo_otro: {
    es: "Otro",
    en: "Other",
    de: "Andere",
    fr: "Autre",
    it: "Altro",
  },
  direccion_opcional: {
    es: "Dirección (opcional)",
    en: "Address (optional)",
    de: "Adresse (optional)",
    fr: "Adresse (facultatif)",
    it: "Indirizzo (opzionale)",
  },
  horario_opcional: {
    es: "Horario (opcional)",
    en: "Hours (optional)",
    de: "Öffnungszeiten (optional)",
    fr: "Horaires (facultatif)",
    it: "Orario (opzionale)",
  },
  que_tiene: {
    es: "¿Qué tiene este baño?",
    en: "What does this toilet have?",
    de: "Was bietet diese Toilette?",
    fr: "Qu'y a-t-il dans ces toilettes ?",
    it: "Cosa offre questo bagno?",
  },
  notas_opcional: {
    es: "Notas (opcional)",
    en: "Notes (optional)",
    de: "Notizen (optional)",
    fr: "Notes (facultatif)",
    it: "Note (opzionale)",
  },
  notas_placeholder: {
    es: "Cómo llegar, dónde pedir la llave…",
    en: "How to get there, where to ask for the key…",
    de: "Wie man hinkommt, wo man den Schlüssel bekommt…",
    fr: "Comment y aller, où demander la clé…",
    it: "Come arrivare, dove chiedere la chiave…",
  },
  guardar_cambios: {
    es: "Guardar cambios",
    en: "Save changes",
    de: "Änderungen speichern",
    fr: "Enregistrer",
    it: "Salva modifiche",
  },
  guardar_bano: {
    es: "Guardar baño",
    en: "Save toilet",
    de: "Toilette speichern",
    fr: "Enregistrer",
    it: "Salva bagno",
  },
  debes_iniciar: {
    es: "Debes iniciar sesión.",
    en: "You must log in.",
    de: "Du musst dich anmelden.",
    fr: "Vous devez vous connecter.",
    it: "Devi accedere.",
  },
reclamar_titulo: {
    es: "Reclamar este baño 🏪",
    en: "Claim this toilet 🏪",
    de: "Diese Toilette beanspruchen 🏪",
    fr: "Revendiquer ces toilettes 🏪",
    it: "Rivendica questo bagno 🏪",
  },
  reclamar_enviado: {
    es: "Solicitud enviada. Revisaremos que eres el propietario y verás el sello de verificado en cuanto lo aprobemos.",
    en: "Request sent. We'll check you're the owner and you'll see the verified badge once approved.",
    de: "Anfrage gesendet. Wir prüfen, ob du der Inhaber bist, und du siehst das Verifiziert-Abzeichen nach der Freigabe.",
    fr: "Demande envoyée. Nous vérifierons que vous êtes le propriétaire et le badge vérifié apparaîtra après approbation.",
    it: "Richiesta inviata. Verificheremo che sei il proprietario e vedrai il badge verificato una volta approvato.",
  },
  entendido: {
    es: "Entendido",
    en: "Got it",
    de: "Verstanden",
    fr: "Compris",
    it: "Capito",
  },
  reclamar_intro: {
    es: "Si eres el dueño de este local, verifícalo para que aparezca con el sello oficial.",
    en: "If you're the owner of this place, verify it to show the official badge.",
    de: "Wenn du der Inhaber bist, verifiziere es, um das offizielle Abzeichen zu zeigen.",
    fr: "Si vous êtes le propriétaire, vérifiez-le pour afficher le badge officiel.",
    it: "Se sei il proprietario, verificalo per mostrare il badge ufficiale.",
  },
  nombre_negocio: {
    es: "Nombre del negocio *",
    en: "Business name *",
    de: "Name des Geschäfts *",
    fr: "Nom de l'entreprise *",
    it: "Nome dell'attività *",
  },
  email_contacto: {
    es: "Email de contacto *",
    en: "Contact email *",
    de: "Kontakt-E-Mail *",
    fr: "E-mail de contact *",
    it: "Email di contatto *",
  },
  mensaje_opcional: {
    es: "Mensaje (opcional)",
    en: "Message (optional)",
    de: "Nachricht (optional)",
    fr: "Message (facultatif)",
    it: "Messaggio (opzionale)",
  },
  reclamar_msg_placeholder: {
    es: "Cuéntanos cómo verificar que eres el propietario…",
    en: "Tell us how to verify you're the owner…",
    de: "Sag uns, wie wir prüfen können, dass du der Inhaber bist…",
    fr: "Dites-nous comment vérifier que vous êtes le propriétaire…",
    it: "Dicci come verificare che sei il proprietario…",
  },
  enviar_solicitud: {
    es: "Enviar solicitud",
    en: "Send request",
    de: "Anfrage senden",
    fr: "Envoyer la demande",
    it: "Invia richiesta",
  },
  ya_solicitud: {
    es: "Ya has enviado una solicitud para este baño.",
    en: "You've already sent a request for this toilet.",
    de: "Du hast bereits eine Anfrage für diese Toilette gesendet.",
    fr: "Vous avez déjà envoyé une demande pour ces toilettes.",
    it: "Hai già inviato una richiesta per questo bagno.",
  },
ranking_titulo: {
    es: "🏆 Ranking",
    en: "🏆 Ranking",
    de: "🏆 Rangliste",
    fr: "🏆 Classement",
    it: "🏆 Classifica",
  },
  ranking_subtitulo: {
    es: "Los mejores exploradores de baños",
    en: "The top toilet explorers",
    de: "Die besten Toiletten-Entdecker",
    fr: "Les meilleurs explorateurs de toilettes",
    it: "I migliori esploratori di bagni",
  },
  volver_mapa: {
    es: "Volver al mapa",
    en: "Back to map",
    de: "Zurück zur Karte",
    fr: "Retour à la carte",
    it: "Torna alla mappa",
  },
  puntos: {
    es: "puntos",
    en: "points",
    de: "Punkte",
    fr: "points",
    it: "punti",
  },
  tu: {
    es: "Tú",
    en: "You",
    de: "Du",
    fr: "Vous",
    it: "Tu",
  },
  ranking_vacio: {
    es: "Aún no hay nadie en el ranking. ¡Sé el primero!",
    en: "No one on the ranking yet. Be the first!",
    de: "Noch niemand in der Rangliste. Sei der Erste!",
    fr: "Personne dans le classement. Soyez le premier !",
    it: "Ancora nessuno in classifica. Sii il primo!",
  },
rango_1: {
    es: "Papel de una capa",
    en: "One-ply rookie",
    de: "Einlagiges Blatt",
    fr: "Papier une épaisseur",
    it: "Carta a un velo",
  },
  rango_2: {
    es: "Trasero con rollo",
    en: "Roll wrangler",
    de: "Rollen-Reiter",
    fr: "As du rouleau",
    it: "Domatore di rotoli",
  },
  rango_3: {
    es: "Culo explorador",
    en: "Loo explorer",
    de: "Klo-Entdecker",
    fr: "Explorateur du trône",
    it: "Esploratore del cesso",
  },
  rango_4: {
    es: "Culo inquieto",
    en: "Restless rear",
    de: "Ruheloser Hintern",
    fr: "Derrière agité",
    it: "Fondoschiena irrequieto",
  },
  rango_5: {
    es: "Señor del trono",
    en: "Throne lord",
    de: "Herr des Throns",
    fr: "Seigneur du trône",
    it: "Signore del trono",
  },
  rango_6: {
    es: "Leyenda de iPoo",
    en: "iPoo legend",
    de: "iPoo-Legende",
    fr: "Légende iPoo",
    it: "Leggenda iPoo",
  },
ajustes_titulo: {
    es: "Ajustes", en: "Settings", de: "Einstellungen", fr: "Paramètres", it: "Impostazioni",
  },
  perfil: {
    es: "Perfil", en: "Profile", de: "Profil", fr: "Profil", it: "Profilo",
  },
  cambiar_foto: {
    es: "Cambiar foto", en: "Change photo", de: "Foto ändern", fr: "Changer la photo", it: "Cambia foto",
  },
  nombre_usuario: {
    es: "Nombre de usuario", en: "Username", de: "Benutzername", fr: "Nom d'utilisateur", it: "Nome utente",
  },
  mi_nivel: {
    es: "Mi nivel", en: "My level", de: "Mein Level", fr: "Mon niveau", it: "Il mio livello",
  },
  ver_ranking: {
    es: "Ver ranking 🏆", en: "View ranking 🏆", de: "Rangliste ansehen 🏆", fr: "Voir le classement 🏆", it: "Vedi classifica 🏆",
  },
  puntos_siguiente: {
    es: "puntos para el siguiente rango", en: "points to the next rank", de: "Punkte bis zum nächsten Rang", fr: "points pour le rang suivant", it: "punti al prossimo livello",
  },
  radio_busqueda: {
    es: "Radio de búsqueda", en: "Search radius", de: "Suchradius", fr: "Rayon de recherche", it: "Raggio di ricerca",
  },
  buscar_en_radio: {
    es: "Buscar baños en un radio de", en: "Search toilets within", de: "Toiletten suchen im Umkreis von", fr: "Chercher des toilettes dans un rayon de", it: "Cerca bagni entro",
  },
  guardar_cambios: {
    es: "Guardar cambios", en: "Save changes", de: "Änderungen speichern", fr: "Enregistrer", it: "Salva modifiche",
  },
  cambios_guardados: {
    es: "Cambios guardados.", en: "Changes saved.", de: "Änderungen gespeichert.", fr: "Modifications enregistrées.", it: "Modifiche salvate.",
  },
  no_guardado: {
    es: "No se pudo guardar: ", en: "Couldn't save: ", de: "Konnte nicht speichern: ", fr: "Impossible d'enregistrer : ", it: "Impossibile salvare: ",
  },
  mis_valoraciones: {
    es: "Mis valoraciones", en: "My reviews", de: "Meine Bewertungen", fr: "Mes avis", it: "Le mie recensioni",
  },
  sin_mis_valoraciones: {
    es: "Aún no has valorado ningún baño.", en: "You haven't reviewed any toilets yet.", de: "Du hast noch keine Toiletten bewertet.", fr: "Vous n'avez encore noté aucunes toilettes.", it: "Non hai ancora recensito nessun bagno.",
  },
  info_ayuda: {
    es: "Información y ayuda", en: "Info and help", de: "Info und Hilfe", fr: "Infos et aide", it: "Informazioni e aiuto",
  },
  centro_ayuda: {
    es: "Centro de ayuda", en: "Help center", de: "Hilfezentrum", fr: "Centre d'aide", it: "Centro assistenza",
  },
  politica_privacidad: {
    es: "Política de privacidad", en: "Privacy policy", de: "Datenschutz", fr: "Politique de confidentialité", it: "Informativa sulla privacy",
  },
  aviso_legal: {
    es: "Aviso legal", en: "Legal notice", de: "Impressum", fr: "Mentions légales", it: "Note legali",
  },
  politica_cookies: {
    es: "Política de cookies", en: "Cookie policy", de: "Cookie-Richtlinie", fr: "Politique de cookies", it: "Informativa sui cookie",
  },
  cerrar_sesion: {
    es: "Cerrar sesión", en: "Log out", de: "Abmelden", fr: "Déconnexion", it: "Esci",
  },
};

type Ctx = {
  idioma: Idioma;
  setIdioma: (i: Idioma) => void;
  t: (clave: keyof typeof TEXTOS) => string;
};

const IdiomaContext = createContext<Ctx | null>(null);

export function ProveedorIdioma({ children }: { children: React.ReactNode }) {
  const [idioma, setIdiomaState] = useState<Idioma>("es");

  useEffect(() => {
    // Cargar idioma guardado o detectar el del navegador
    const guardado = localStorage.getItem("idioma-iPoo") as Idioma | null;
    if (guardado) {
      setIdiomaState(guardado);
    } else {
      const nav = navigator.language.slice(0, 2) as Idioma;
      if (["es", "en", "de", "fr", "it"].includes(nav)) {
        setIdiomaState(nav);
      }
    }
  }, []);

  function setIdioma(i: Idioma) {
    setIdiomaState(i);
    localStorage.setItem("idioma-iPoo", i);
  }

  function t(clave: keyof typeof TEXTOS): string {
    return TEXTOS[clave]?.[idioma] ?? TEXTOS[clave]?.es ?? String(clave);
  }

  return (
    <IdiomaContext.Provider value={{ idioma, setIdioma, t }}>
      {children}
    </IdiomaContext.Provider>
  );
}

export function useIdioma() {
  const ctx = useContext(IdiomaContext);
  if (!ctx) {
    throw new Error("useIdioma debe usarse dentro de ProveedorIdioma");
  }
  return ctx;
}