const CONFIG = window.CHALET_CONFIG || {};
const CAPACITY = 15;

/* ============ NAV SCROLL + BURGER ============ */
const siteNav = document.getElementById('siteNav');
window.addEventListener('scroll', () => {
  siteNav.classList.toggle('scrolled', window.scrollY > 40);
});

const navBurger = document.getElementById('navBurger');
const navPanel = document.getElementById('navPanel');
const navLinks = document.getElementById('navLinks');
let lastNavFocus = null;

function menuFocusables(){
  return [navBurger, ...navPanel.querySelectorAll('a[href], button:not([disabled])')];
}

function openNav(){
  lastNavFocus = document.activeElement;
  navPanel.classList.add('open');
  navBurger.setAttribute('aria-expanded', 'true');
  document.body.classList.add('nav-open');
  const first = navLinks.querySelector('a');
  if (first) first.focus();
}

function closeNav(){
  navPanel.classList.remove('open');
  navBurger.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
  const restore = lastNavFocus || navBurger;
  if (restore && typeof restore.focus === 'function') restore.focus();
}

function isNavOpen(){
  return navPanel.classList.contains('open');
}

navBurger.addEventListener('click', () => {
  if (isNavOpen()) closeNav();
  else openNav();
});

navPanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  if (window.matchMedia('(max-width: 899px)').matches) closeNav();
}));

/* ============ LANG DROPDOWN ============ */
const langToggle = document.getElementById('langToggle');
const langMenu = document.getElementById('langMenu');
const langCurrent = document.getElementById('langCurrent');

function setLangMenu(open){
  langToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  langMenu.hidden = !open;
}

langToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  setLangMenu(langMenu.hidden);
});
document.addEventListener('click', () => setLangMenu(false));
langMenu.addEventListener('click', (e) => e.stopPropagation());

/* ============ I18N ============ */
const I18N = {
  fr: {
    "nav.story":"Le chalet", "nav.rooms":"Chambres", "nav.activities":"Activités", "nav.gallery":"Galerie", "nav.amenities":"Équipements",
    "nav.stay":"Séjour & tarifs", "nav.book":"Réserver",
    "season.summer":"Été", "season.winter":"Hiver",
    "hero.eyebrow":"1300 M · VALLÉE DU TRIENT · VALAIS",
    "hero.sub":"Un refuge de bois et de silence, entre sentiers du Tour du Mont-Blanc et sommets valaisans.",
    "hero.cta1":"Vérifier les disponibilités", "hero.cta2":"Découvrir le chalet",
    "stats.guests":"voyageurs", "stats.rooms":"chambres", "stats.beds":"lits", "stats.baths":"salles de bain", "stats.sauna":"sauna",
    "story.eyebrow":"Le chalet", "story.title":"Une bâtisse de mélèze<br>face aux Alpes",
    "story.p1":"Niché dans le hameau discret de Trient, à l'écart du tumulte, le chalet La Berte se dévoile après le dernier virage de la route — grand, lumineux, construit dans les bois clairs de la vallée. L'été, les randonneurs du Tour du Mont-Blanc y posent leur sac. L'hiver, la neige referme le village et le poêle prend le relais.",
    "story.p2":"Sarah et Anthony, qui accueillent ici depuis cinq ans, ont pensé chaque pièce pour les groupes : grande table commune, sauna après les pistes, coin du feu pour refaire le monde, et cette vue sur les sommets qu'on ne se lasse pas de regarder par la fenêtre de la cuisine.",
    "story.badge1":"Arrivée autonome", "story.badge2":"Parking gratuit", "story.badge3":"Hôtes 5 ans d'expérience",
    "rooms.eyebrow":"Où vous dormirez", "rooms.title":"Cinq chambres, un seul toit", "rooms.hint":"← faites glisser pour voir toutes les chambres →",
    "room1.title":"Chambre 1", "room1.beds":"1 lit queen size · 1 lit simple",
    "room2.title":"Chambre 2", "room2.beds":"1 lit double",
    "room3.title":"Chambre 3", "room3.beds":"1 lit queen size",
    "room4.title":"Chambre 4", "room4.beds":"2 lits simples · 1 superposé · 1 couchage d'appoint",
    "room5.title":"Chambre 5", "room5.beds":"1 lit queen size",
    "amenities.eyebrow":"Tout est prévu", "amenities.title":"Équipements",
    "am.kitchen":"Cuisine équipée", "am.wifi":"Wifi haut débit", "am.fire":"Poêle / coin du feu", "am.sauna":"Sauna privatif",
    "am.parking":"Parking gratuit", "am.desk":"Espace de travail", "am.selfcheckin":"Arrivée autonome", "am.view":"Vue sur les Alpes",
    "gallery.eyebrow":"Le chalet en images", "gallery.title":"Galerie",
    "act.eyebrow":"Autour du chalet", "act.title":"Activités",
    "act.sub":"Trient est une étape du Tour du Mont-Blanc, à vingt minutes de Chamonix — randonnées, glacier, barrages l’été ; ski de randonnée, raquettes et domaines voisins l’hiver.",
    "act.summer":"Été", "act.winter":"Hiver",
    "act.gallery":"En images",
    "act.s1.meta":"Grande randonnée", "act.s1.title":"Tour du Mont-Blanc",
    "act.s1.p":"Étape depuis Trient vers le Col de Balme (~2h45). Accès direct aux sentiers GR balisés Suisse–France–Italie.",
    "act.s2.meta":"~1h30 à pied", "act.s2.title":"Glacier du Trient",
    "act.s2.p":"Randonnée jusqu’au glacier, face aux Aiguilles Dorées.",
    "act.s3.meta":"~30 min en voiture", "act.s3.title":"Barrage d’Émosson",
    "act.s3.p":"Lac d’altitude, panoramas Mont-Blanc, et traces de dinosaures au Vieux-Émosson.",
    "act.s4.meta":"Sur place", "act.s4.title":"Bisse &amp; gorges",
    "act.s4.p":"Sentier du Bisse du Trient et Gorges Mystérieuses de Tête-Noire.",
    "act.s5.meta":"Vallée du Trient", "act.s5.title":"Trail, VTT &amp; escalade",
    "act.s5.p":"53 km de chemins balisés, parcours trail, Tour de la Vallée à VTT, et sites d’escalade sur granit.",
    "act.s6.meta":"~20 min", "act.s6.title":"Chamonix-Mont-Blanc",
    "act.s6.p":"Téléphériques, Aiguille du Midi, Mer de Glace — vingt minutes de route.",
    "act.w1.meta":"Ski de montagne", "act.w1.title":"Ski de randonnée &amp; Haute Route",
    "act.w1.p":"Ski de montagne dans l’espace Mont-Blanc — Cabane du Trient, traversées glacier, étapes de la Haute Route.",
    "act.w2.meta":"Itinéraires balisés", "act.w2.title":"Raquettes à neige",
    "act.w2.p":"Sentiers raquettes sur la commune — silence, forêts enneigées, vue sur les sommets.",
    "act.w3.meta":"Déc.–fév.", "act.w3.title":"Cascades de glace",
    "act.w3.p":"Six sites et plus de cinquante cascades répertoriées autour de Trient.",
    "act.w4.meta":"Au village", "act.w4.title":"Jardin des neiges",
    "act.w4.p":"Mini-téléski, pistes de luge et ski de fond selon l’enneigement — pour débutants et familles.",
    "act.w5.meta":"15–30 min", "act.w5.title":"Domaines ski alpins",
    "act.w5.p":"Vallorcine, Le Tour, Les Marécottes — et le domaine de Chamonix à vingt minutes.",
    "act.w6.meta":"Au chalet", "act.w6.title":"Sauna après les pistes",
    "act.w6.p":"Sauna privatif et coin du feu au retour.",
    "stay.eyebrow":"Réservation directe", "stay.title":"Séjour & tarifs",
    "stay.sub":"En réservant directement, vous évitez les frais de plateforme — le même chalet, un contact direct avec vos hôtes.",
    "stay.datesEyebrow":"Vos dates",
    "stay.datesHint":"Indiquez vos dates, nous vous répondons sous 24 h.",
    "stay.datesCta":"Envoyer une demande",
    "stay.calSync":"Dernière synchronisation : {date}",
    "stay.priceEyebrow":"Tarif indicatif", "stay.priceUnit":"/ nuit",
    "stay.priceDetail":"Chalet entier · jusqu'à 15 personnes · linge inclus",
    "stay.priceCompare":"{discount} % de moins que le tarif Airbnb de référence ({airbnb} CHF).",
    "stay.step1":"Vous envoyez votre demande",
    "stay.step2":"Nous confirmons les dates et vous envoyons un lien de paiement sécurisé",
    "stay.step3":"Solde 30 jours avant l'arrivée",
    "stay.payMethods":"Paiement : TWINT, carte bancaire, QR-facture.",
    "stay.li1":"Arrivée dès 16h00 · départ avant 12h00",
    "stay.li2":"Acompte de 30 % après confirmation des dates",
    "contact.eyebrow":"Parlons de votre séjour", "contact.title":"Réserver le chalet",
    "contact.p":"Indiquez vos dates et le nombre de voyageurs — Sarah & Anthony vous répondent en général le jour même.",
    "contact.whatsapp":"WhatsApp / Téléphone",
    "form.name":"Nom", "form.email":"Email", "form.checkin":"Arrivée", "form.checkout":"Départ",
    "form.guests":"Nombre de voyageurs", "form.message":"Message (facultatif)", "form.submit":"Envoyer la demande",
    "form.sending":"Envoi en cours…",
    "form.success":"Demande envoyée. Nous vous répondons sous 24 h.",
    "form.error":"L'envoi a échoué. Réessayez ou écrivez-nous directement.",
    "form.errorEmail":"L'envoi a échoué. Réessayez ou écrivez-nous directement à {email}.",
    "form.errDates":"La date de départ doit être après la date d'arrivée.",
    "form.errEmail":"Indiquez une adresse e-mail valide.",
    "form.errGuests":"Le nombre de voyageurs doit être entre 1 et 15.",
    "form.note":"Vos données servent uniquement à traiter la demande. Voir les <a href=\"mentions-legales/\">mentions légales</a>.",
    "loc.eyebrow":"Trient, Valais", "loc.title":"Entre deux mondes",
    "loc.p":"Trient se trouve à la frontière franco-suisse, à vingt minutes de Chamonix et de Martigny. Le village est une étape du Tour du Mont-Blanc et le point de départ de nombreuses randonnées vers le glacier du Trient et le barrage d'Émosson. L'adresse exacte du chalet vous est communiquée après confirmation de la réservation.",
    "loc.li1":"Glacier du Trient — 1h30 de marche", "loc.li2":"Chamonix-Mont-Blanc — 20 min en voiture",
    "loc.li3":"Martigny — 25 min en voiture", "loc.li4":"Barrage d'Émosson — 30 min en voiture", "loc.li5":"Tour du Mont-Blanc — accès direct",
    "footer.loc":"Trient · Valais · Suisse", "footer.contact":"Contact",
    "footer.legal":"Mentions légales",
    "footer.fine":"Site indépendant — réservation en direct avec vos hôtes."
  },
  en: {
    "nav.story":"The chalet", "nav.rooms":"Rooms", "nav.activities":"Activities", "nav.gallery":"Gallery", "nav.amenities":"Amenities",
    "nav.stay":"Stay & rates", "nav.book":"Book now",
    "season.summer":"Summer", "season.winter":"Winter",
    "hero.eyebrow":"1300 M · TRIENT VALLEY · VALAIS",
    "hero.sub":"A refuge of timber and silence, between the Tour du Mont-Blanc trails and Valais summits.",
    "hero.cta1":"Check availability", "hero.cta2":"Discover the chalet",
    "stats.guests":"guests", "stats.rooms":"bedrooms", "stats.beds":"beds", "stats.baths":"bathrooms", "stats.sauna":"sauna",
    "story.eyebrow":"The chalet", "story.title":"A larch-wood house<br>facing the Alps",
    "story.p1":"Tucked into the quiet hamlet of Trient, away from the crowds, Chalet La Berte reveals itself after the last bend in the road — spacious, bright, built from the pale local timber. In summer, Tour du Mont-Blanc hikers drop their packs here. In winter, snow closes in around the village and the wood stove takes over.",
    "story.p2":"Sarah and Anthony, hosting here for five years, designed every room with groups in mind: a long communal table, a sauna after the slopes, a fireside corner for long conversations, and that mountain view you never tire of from the kitchen window.",
    "story.badge1":"Self check-in", "story.badge2":"Free parking", "story.badge3":"5 years hosting experience",
    "rooms.eyebrow":"Where you'll sleep", "rooms.title":"Five bedrooms, one roof", "rooms.hint":"← swipe to see all bedrooms →",
    "room1.title":"Bedroom 1", "room1.beds":"1 queen bed · 1 single bed",
    "room2.title":"Bedroom 2", "room2.beds":"1 double bed",
    "room3.title":"Bedroom 3", "room3.beds":"1 queen bed",
    "room4.title":"Bedroom 4", "room4.beds":"2 single beds · 1 bunk bed · 1 extra bed",
    "room5.title":"Bedroom 5", "room5.beds":"1 queen bed",
    "amenities.eyebrow":"Everything's covered", "amenities.title":"Amenities",
    "am.kitchen":"Fully equipped kitchen", "am.wifi":"High-speed wifi", "am.fire":"Wood stove / fireplace", "am.sauna":"Private sauna",
    "am.parking":"Free parking", "am.desk":"Dedicated workspace", "am.selfcheckin":"Self check-in", "am.view":"Alpine views",
    "gallery.eyebrow":"The chalet in pictures", "gallery.title":"Gallery",
    "act.eyebrow":"Around the chalet", "act.title":"Activities",
    "act.sub":"Trient is a stage on the Tour du Mont-Blanc, twenty minutes from Chamonix — hiking, glacier and dams in summer; ski touring, snowshoeing and nearby resorts in winter.",
    "act.summer":"Summer", "act.winter":"Winter",
    "act.gallery":"In pictures",
    "act.s1.meta":"Long-distance hike", "act.s1.title":"Tour du Mont-Blanc",
    "act.s1.p":"Stage from Trient to Col de Balme (~2h45). Direct access to marked GR trails across Switzerland, France and Italy.",
    "act.s2.meta":"~1h30 walk", "act.s2.title":"Trient Glacier",
    "act.s2.p":"Hike to the glacier, facing the Aiguilles Dorées.",
    "act.s3.meta":"~30 min drive", "act.s3.title":"Émosson dam",
    "act.s3.p":"High-altitude lake, Mont Blanc panoramas, and dinosaur footprints at Vieux-Émosson.",
    "act.s4.meta":"On site", "act.s4.title":"Bisse &amp; gorges",
    "act.s4.p":"Bisse du Trient trail and the Mystérieuses Gorges of Tête-Noire.",
    "act.s5.meta":"Trient Valley", "act.s5.title":"Trail, MTB &amp; climbing",
    "act.s5.p":"53 km of marked paths, trail routes, valley mountain-bike tour, and granite climbing spots.",
    "act.s6.meta":"~20 min", "act.s6.title":"Chamonix-Mont-Blanc",
    "act.s6.p":"Cable cars, Aiguille du Midi, Mer de Glace — a twenty-minute drive.",
    "act.w1.meta":"Ski mountaineering", "act.w1.title":"Ski touring &amp; Haute Route",
    "act.w1.p":"Ski mountaineering in the Mont Blanc area — Cabane du Trient, glacier crossings, Haute Route stages.",
    "act.w2.meta":"Marked routes", "act.w2.title":"Snowshoeing",
    "act.w2.p":"Snowshoe trails around the village — silence, snowy forests, summit views.",
    "act.w3.meta":"Dec–Feb", "act.w3.title":"Ice climbing",
    "act.w3.p":"Six sites and more than fifty mapped icefalls around Trient.",
    "act.w4.meta":"In the village", "act.w4.title":"Snow garden",
    "act.w4.p":"Mini ski-lift, sledging and cross-country trails depending on snow — for beginners and families.",
    "act.w5.meta":"15–30 min", "act.w5.title":"Alpine ski resorts",
    "act.w5.p":"Vallorcine, Le Tour, Les Marécottes — and the Chamonix ski area twenty minutes away.",
    "act.w6.meta":"At the chalet", "act.w6.title":"Sauna after the slopes",
    "act.w6.p":"Private sauna and fireside when you get back.",
    "stay.eyebrow":"Direct booking", "stay.title":"Stay & rates",
    "stay.sub":"Book directly and skip platform fees — the same chalet, direct contact with your hosts.",
    "stay.datesEyebrow":"Your dates",
    "stay.datesHint":"Tell us your dates — we reply within 24 hours.",
    "stay.datesCta":"Send a request",
    "stay.calSync":"Last synced: {date}",
    "stay.priceEyebrow":"Indicative rate", "stay.priceUnit":"/ night",
    "stay.priceDetail":"Whole chalet · up to 15 guests · linens included",
    "stay.priceCompare":"{discount}% less than the reference Airbnb rate ({airbnb} CHF).",
    "stay.step1":"You send your request",
    "stay.step2":"We confirm the dates and send you a secure payment link",
    "stay.step3":"Balance due 30 days before arrival",
    "stay.payMethods":"Payment: TWINT, bank card, QR-bill.",
    "stay.li1":"Check-in from 4:00 PM · check-out before 12:00 PM",
    "stay.li2":"30% deposit after dates are confirmed",
    "contact.eyebrow":"Let's talk about your stay", "contact.title":"Book the chalet",
    "contact.p":"Tell us your dates and number of guests — Sarah & Anthony usually reply the same day.",
    "contact.whatsapp":"WhatsApp / Phone",
    "form.name":"Name", "form.email":"Email", "form.checkin":"Check-in", "form.checkout":"Check-out",
    "form.guests":"Number of guests", "form.message":"Message (optional)", "form.submit":"Send request",
    "form.sending":"Sending…",
    "form.success":"Request sent. We will reply within 24 hours.",
    "form.error":"Sending failed. Try again, or write to us directly.",
    "form.errorEmail":"Sending failed. Try again, or write to us directly at {email}.",
    "form.errDates":"Check-out must be after check-in.",
    "form.errEmail":"Enter a valid email address.",
    "form.errGuests":"Number of guests must be between 1 and 15.",
    "form.note":"Your details are used only to handle the request. See the <a href=\"mentions-legales/\">legal notice</a>.",
    "loc.eyebrow":"Trient, Valais", "loc.title":"Between two worlds",
    "loc.p":"Trient sits right on the French-Swiss border, twenty minutes from Chamonix and Martigny. The village is a stage on the Tour du Mont-Blanc and a starting point for hikes to the Trient glacier and the Émosson dam. The exact address is shared once your booking is confirmed.",
    "loc.li1":"Trient Glacier — 1h30 walk", "loc.li2":"Chamonix-Mont-Blanc — 20 min drive",
    "loc.li3":"Martigny — 25 min drive", "loc.li4":"Émosson dam — 30 min drive", "loc.li5":"Tour du Mont-Blanc — direct access",
    "footer.loc":"Trient · Valais · Switzerland", "footer.contact":"Contact",
    "footer.legal":"Legal notice",
    "footer.fine":"Independent site — book directly with your hosts."
  },
  de: {
    "nav.story":"Das Chalet", "nav.rooms":"Zimmer", "nav.activities":"Aktivitäten", "nav.gallery":"Galerie", "nav.amenities":"Ausstattung",
    "nav.stay":"Aufenthalt & Preise", "nav.book":"Buchen",
    "season.summer":"Sommer", "season.winter":"Winter",
    "hero.eyebrow":"1300 M · TRIENT-TAL · WALLIS",
    "hero.sub":"Eine Zuflucht aus Holz und Stille, zwischen den Wegen des Tour du Mont-Blanc und Walliser Gipfeln.",
    "hero.cta1":"Verfügbarkeit prüfen", "hero.cta2":"Chalet entdecken",
    "stats.guests":"Gäste", "stats.rooms":"Zimmer", "stats.beds":"Betten", "stats.baths":"Badezimmer", "stats.sauna":"Sauna",
    "story.eyebrow":"Das Chalet", "story.title":"Ein Lärchenholzhaus<br>mit Blick auf die Alpen",
    "story.p1":"Versteckt im ruhigen Weiler Trient, abseits des Trubels, zeigt sich das Chalet La Berte nach der letzten Kurve der Strasse — geräumig, hell, aus hellem Holz der Region gebaut. Im Sommer legen Wanderer des Tour du Mont-Blanc hier ihren Rucksack ab. Im Winter schliesst der Schnee das Dorf ein, und der Ofen übernimmt.",
    "story.p2":"Sarah und Anthony, die seit fünf Jahren hier empfangen, haben jeden Raum für Gruppen gedacht: eine grosse gemeinsame Tafel, eine Sauna nach der Piste, eine Feuerstelle für lange Gespräche und dieser Bergblick aus dem Küchenfenster, an dem man sich nie sattsieht.",
    "story.badge1":"Selbständige Anreise", "story.badge2":"Gratis Parkplatz", "story.badge3":"5 Jahre Gasterfahrung",
    "rooms.eyebrow":"Wo Sie schlafen", "rooms.title":"Fünf Zimmer, ein Dach", "rooms.hint":"← wischen, um alle Zimmer zu sehen →",
    "room1.title":"Zimmer 1", "room1.beds":"1 Queen-Bett · 1 Einzelbett",
    "room2.title":"Zimmer 2", "room2.beds":"1 Doppelbett",
    "room3.title":"Zimmer 3", "room3.beds":"1 Queen-Bett",
    "room4.title":"Zimmer 4", "room4.beds":"2 Einzelbetten · 1 Stockbett · 1 Zustellbett",
    "room5.title":"Zimmer 5", "room5.beds":"1 Queen-Bett",
    "amenities.eyebrow":"Alles inklusive", "amenities.title":"Ausstattung",
    "am.kitchen":"Voll ausgestattete Küche", "am.wifi":"Highspeed-WLAN", "am.fire":"Ofen / Cheminée", "am.sauna":"Private Sauna",
    "am.parking":"Gratis Parkplatz", "am.desk":"Arbeitsplatz", "am.selfcheckin":"Selbständige Anreise", "am.view":"Alpenblick",
    "gallery.eyebrow":"Das Chalet in Bildern", "gallery.title":"Galerie",
    "act.eyebrow":"Rund ums Chalet", "act.title":"Aktivitäten",
    "act.sub":"Trient ist eine Etappe des Tour du Mont-Blanc, zwanzig Minuten von Chamonix — Wandern, Gletscher und Stauseen im Sommer; Skitouren, Schneeschuhe und Nachbargebiete im Winter.",
    "act.summer":"Sommer", "act.winter":"Winter",
    "act.gallery":"In Bildern",
    "act.s1.meta":"Weitwanderung", "act.s1.title":"Tour du Mont-Blanc",
    "act.s1.p":"Etappe von Trient zum Col de Balme (~2h45). Direkter Zugang zu markierten GR-Wegen durch die Schweiz, Frankreich und Italien.",
    "act.s2.meta":"~1h30 zu Fuss", "act.s2.title":"Trientgletscher",
    "act.s2.p":"Wanderung zum Gletscher, mit Blick auf die Aiguilles Dorées.",
    "act.s3.meta":"~30 Min. mit dem Auto", "act.s3.title":"Staudamm Émosson",
    "act.s3.p":"Hochgelegener See, Mont-Blanc-Panorama und Dinosaurierspuren am Vieux-Émosson.",
    "act.s4.meta":"Vor Ort", "act.s4.title":"Suone &amp; Schluchten",
    "act.s4.p":"Bisse-du-Trient-Weg und die Mystérieuses Gorges von Tête-Noire.",
    "act.s5.meta":"Trienttal", "act.s5.title":"Trail, MTB &amp; Klettern",
    "act.s5.p":"53 km markierte Wege, Trailstrecken, Valley-MTB-Tour und Granit-Klettergebiete.",
    "act.s6.meta":"~20 Min.", "act.s6.title":"Chamonix-Mont-Blanc",
    "act.s6.p":"Seilbahnen, Aiguille du Midi, Mer de Glace — zwanzig Minuten Fahrt.",
    "act.w1.meta":"Skibergsteigen", "act.w1.title":"Skitouren &amp; Haute Route",
    "act.w1.p":"Skibergsteigen im Mont-Blanc-Raum — Cabane du Trient, Gletscherübergänge, Haute-Route-Etappen.",
    "act.w2.meta":"Markierte Routen", "act.w2.title":"Schneeschuhwandern",
    "act.w2.p":"Schneeschuhwege in der Gemeinde — Stille, verschneite Wälder, Gipfelblicke.",
    "act.w3.meta":"Dez.–Feb.", "act.w3.title":"Eisklettern",
    "act.w3.p":"Sechs Gebiete und über fünfzig kartierte Eisfälle rund um Trient.",
    "act.w4.meta":"Im Dorf", "act.w4.title":"Schneegarten",
    "act.w4.p":"Mini-Schlepplift, Rodel- und Langlaufpisten je nach Schnee — für Anfänger und Familien.",
    "act.w5.meta":"15–30 Min.", "act.w5.title":"Skigebiete",
    "act.w5.p":"Vallorcine, Le Tour, Les Marécottes — und das Skigebiet Chamonix in zwanzig Minuten.",
    "act.w6.meta":"Im Chalet", "act.w6.title":"Sauna nach der Piste",
    "act.w6.p":"Private Sauna und Feuerplatz bei der Rückkehr.",
    "stay.eyebrow":"Direktbuchung", "stay.title":"Aufenthalt & Preise",
    "stay.sub":"Buchen Sie direkt und sparen Sie Plattformgebühren — dasselbe Chalet, direkter Kontakt zu Ihren Gastgebern.",
    "stay.datesEyebrow":"Ihre Daten",
    "stay.datesHint":"Nennen Sie uns Ihre Daten — wir antworten innert 24 Stunden.",
    "stay.datesCta":"Anfrage senden",
    "stay.calSync":"Letzte Synchronisation: {date}",
    "stay.priceEyebrow":"Richtpreis", "stay.priceUnit":"/ Nacht",
    "stay.priceDetail":"Ganzes Chalet · bis zu 15 Gäste · Bettwäsche inklusive",
    "stay.priceCompare":"{discount} % weniger als der Airbnb-Richtpreis ({airbnb} CHF).",
    "stay.step1":"Sie senden Ihre Anfrage",
    "stay.step2":"Wir bestätigen die Daten und senden Ihnen einen sicheren Zahlungslink",
    "stay.step3":"Restbetrag 30 Tage vor Anreise",
    "stay.payMethods":"Zahlung: TWINT, Bankkarte, QR-Rechnung.",
    "stay.li1":"Anreise ab 16:00 Uhr · Abreise vor 12:00 Uhr",
    "stay.li2":"30 % Anzahlung nach Bestätigung der Daten",
    "contact.eyebrow":"Erzählen Sie uns von Ihrem Aufenthalt", "contact.title":"Chalet buchen",
    "contact.p":"Nennen Sie uns Ihre Daten und die Gästezahl — Sarah & Anthony antworten meist noch am selben Tag.",
    "contact.whatsapp":"WhatsApp / Telefon",
    "form.name":"Name", "form.email":"E-Mail", "form.checkin":"Anreise", "form.checkout":"Abreise",
    "form.guests":"Anzahl Gäste", "form.message":"Nachricht (optional)", "form.submit":"Anfrage senden",
    "form.sending":"Wird gesendet…",
    "form.success":"Anfrage gesendet. Wir antworten innert 24 Stunden.",
    "form.error":"Senden fehlgeschlagen. Versuchen Sie es erneut oder schreiben Sie uns direkt.",
    "form.errorEmail":"Senden fehlgeschlagen. Versuchen Sie es erneut oder schreiben Sie uns direkt an {email}.",
    "form.errDates":"Das Abreisedatum muss nach dem Anreisedatum liegen.",
    "form.errEmail":"Geben Sie eine gültige E-Mail-Adresse ein.",
    "form.errGuests":"Die Gästezahl muss zwischen 1 und 15 liegen.",
    "form.note":"Ihre Angaben dienen nur der Bearbeitung der Anfrage. Siehe <a href=\"mentions-legales/\">rechtliche Hinweise</a>.",
    "loc.eyebrow":"Trient, Wallis", "loc.title":"Zwischen zwei Welten",
    "loc.p":"Trient liegt direkt an der französisch-schweizerischen Grenze, zwanzig Minuten von Chamonix und Martigny entfernt. Das Dorf ist eine Etappe des Tour du Mont-Blanc und Ausgangspunkt für Wanderungen zum Trientgletscher und zum Staudamm von Émosson. Die genaue Adresse erhalten Sie nach Bestätigung der Buchung.",
    "loc.li1":"Trientgletscher — 1,5 Std. zu Fuss", "loc.li2":"Chamonix-Mont-Blanc — 20 Min. mit dem Auto",
    "loc.li3":"Martigny — 25 Min. mit dem Auto", "loc.li4":"Staudamm Émosson — 30 Min. mit dem Auto", "loc.li5":"Tour du Mont-Blanc — direkter Zugang",
    "footer.loc":"Trient · Wallis · Schweiz", "footer.contact":"Kontakt",
    "footer.legal":"Rechtliche Hinweise",
    "footer.fine":"Unabhängige Seite — buchen Sie direkt bei Ihren Gastgebern."
  }
};

function t(key, vars){
  const lang = document.documentElement.getAttribute('data-lang') || 'fr';
  let val = (I18N[lang] && I18N[lang][key]) || (I18N.fr[key] || key);
  if (vars) {
    Object.keys(vars).forEach(k => {
      val = val.replace(`{${k}}`, vars[k]);
    });
  }
  return val;
}

function applyLang(lang){
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('data-lang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = I18N[lang][key];
    if (val !== undefined) el.innerHTML = val;
  });
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    const active = btn.getAttribute('data-lang-btn') === lang;
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  langCurrent.textContent = lang.toUpperCase();
  localStorage.setItem('chaletLang', lang);
  setLangMenu(false);
  renderCalendar();
  setupPricing();
}

document.querySelectorAll('[data-lang-btn]').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.getAttribute('data-lang-btn')));
});

/* ============ CALENDAR ============ */
const MONTH_NAMES = {
  fr: ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  de: ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"]
};

const bookedDates = new Set((CONFIG.availability && CONFIG.availability.booked) || []);
const hasIcal = bookedDates.size > 0 || Boolean(CONFIG.availability && CONFIG.availability.syncedAt);

let calCursor = new Date();
calCursor.setDate(1);

function renderCalendar(){
  const grid = document.getElementById('calendarGrid');
  const label = document.getElementById('calMonthLabel');
  if (!grid || !label || !hasIcal) return;

  const lang = document.documentElement.getAttribute('data-lang') || 'fr';
  grid.innerHTML = '';

  const year = calCursor.getFullYear();
  const month = calCursor.getMonth();
  label.textContent = `${MONTH_NAMES[lang][month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0,10);

  for (let i = 0; i < startOffset; i++){
    const empty = document.createElement('div');
    empty.className = 'day empty';
    grid.appendChild(empty);
  }
  for (let d = 1; d <= daysInMonth; d++){
    const cell = document.createElement('div');
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cell.className = 'day';
    if (bookedDates.has(dateStr)) cell.classList.add('unavailable');
    if (dateStr === todayStr) cell.classList.add('today');
    cell.textContent = d;
    grid.appendChild(cell);
  }

  const syncEl = document.getElementById('calSync');
  if (syncEl && CONFIG.availability && CONFIG.availability.syncedAt){
    const synced = new Date(CONFIG.availability.syncedAt);
    const formatted = synced.toLocaleString(lang, { dateStyle: 'medium', timeStyle: 'short' });
    syncEl.textContent = t('stay.calSync', { date: formatted });
  }
}

const calPrev = document.getElementById('calPrev');
const calNext = document.getElementById('calNext');
if (calPrev) calPrev.addEventListener('click', () => {
  calCursor.setMonth(calCursor.getMonth() - 1);
  renderCalendar();
});
if (calNext) calNext.addEventListener('click', () => {
  calCursor.setMonth(calCursor.getMonth() + 1);
  renderCalendar();
});

function setupStayPanel(){
  const calendarCard = document.getElementById('calendarCard');
  const datesFallback = document.getElementById('datesFallback');
  if (hasIcal){
    calendarCard.hidden = false;
    datesFallback.hidden = true;
    renderCalendar();
  } else {
    calendarCard.hidden = true;
    datesFallback.hidden = false;
  }
}

/* ============ CONTACT FORM ============ */
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const formSubmit = document.getElementById('formSubmit');

function setFormStatus(type, message){
  formStatus.className = 'form-status' + (type ? ` is-${type}` : '');
  formStatus.textContent = message || '';
}

function validEmail(value){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formErrorMessage(){
  const email = (CONFIG.contactEmail || '').trim();
  if (email) return t('form.errorEmail', { email });
  return t('form.error');
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const name = f.name.value.trim();
  const email = f.email.value.trim();
  const checkin = f.checkin.value;
  const checkout = f.checkout.value;
  const guests = Number(f.guests.value);
  const message = f.message.value.trim();
  const honeypot = f.website.value.trim();

  if (!validEmail(email)){
    setFormStatus('error', t('form.errEmail'));
    f.email.focus();
    return;
  }
  if (!checkin || !checkout || checkout <= checkin){
    setFormStatus('error', t('form.errDates'));
    f.checkout.focus();
    return;
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > CAPACITY){
    setFormStatus('error', t('form.errGuests'));
    f.guests.focus();
    return;
  }

  if (honeypot || f.botcheck.checked){
    setFormStatus('success', t('form.success'));
    contactForm.reset();
    return;
  }

  const endpoint = (CONFIG.formEndpoint || '').trim();
  if (!endpoint){
    setFormStatus('error', formErrorMessage());
    return;
  }

  formSubmit.disabled = true;
  setFormStatus('sending', t('form.sending'));

  const payload = {
    name,
    email,
    checkin,
    checkout,
    guests,
    message,
    subject: `Demande de réservation — Chalet La Berte`,
    from_name: name
  };
  if (CONFIG.formAccessKey) payload.access_key = CONFIG.formAccessKey;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('submit-failed');
    setFormStatus('success', t('form.success'));
    contactForm.reset();
  } catch (err) {
    setFormStatus('error', formErrorMessage());
  } finally {
    formSubmit.disabled = false;
  }
});

function formatPhoneDisplay(digits){
  if (digits.startsWith('41') && digits.length === 11){
    return `+${digits.slice(0,2)} ${digits.slice(2,4)} ${digits.slice(4,7)} ${digits.slice(7,9)} ${digits.slice(9)}`;
  }
  return digits.startsWith('+') ? digits : `+${digits}`;
}

function setupPhone(){
  const phone = (CONFIG.contactPhone || '').replace(/\D/g, '');
  const wrap = document.getElementById('contactPhoneWrap');
  const placeholder = document.getElementById('contactPhonePlaceholder');
  const link = document.getElementById('contactPhoneLink');
  const label = document.getElementById('contactPhone');
  if (phone){
    wrap.hidden = false;
    placeholder.hidden = true;
    label.textContent = formatPhoneDisplay(phone);
    link.href = `https://wa.me/${phone}`;
  } else {
    wrap.hidden = true;
    placeholder.hidden = false;
  }
}

function setupPricing(){
  const priceValue = document.getElementById('priceValue');
  const priceCompare = document.getElementById('priceCompare');
  const pricing = CONFIG.pricing;
  if (!priceValue) return;
  if (pricing && pricing.directNightly){
    priceValue.textContent = String(pricing.directNightly);
    if (priceCompare){
      priceCompare.hidden = false;
      priceCompare.setAttribute('data-i18n-dynamic', 'stay.priceCompare');
      priceCompare.textContent = t('stay.priceCompare', {
        discount: String(pricing.discountPercent),
        airbnb: String(pricing.airbnbNightly)
      });
    }
  } else {
    priceValue.textContent = '[PRIX / NUIT]';
    if (priceCompare) priceCompare.hidden = true;
  }
}

/* ============ SITE SEASON (SUMMER / WINTER) ============ */
const SEASON_KEY = 'chaletSeason';
const seasonNavBtns = document.querySelectorAll('[data-season-nav]');
const activitySeasonBtns = document.querySelectorAll('.season-switch [data-season]');
const activitySeasonPanels = document.querySelectorAll('[data-season-panel]');

function autoSeasonFromMonth(){
  const month = new Date().getMonth();
  return (month >= 10 || month <= 3) ? 'winter' : 'summer';
}

function resolveSeason(){
  const saved = localStorage.getItem(SEASON_KEY);
  if (saved === 'summer' || saved === 'winter') return saved;
  return autoSeasonFromMonth();
}

function setActivitySeason(season){
  activitySeasonBtns.forEach(btn => {
    const active = btn.getAttribute('data-season') === season;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  activitySeasonPanels.forEach(panel => {
    const match = panel.getAttribute('data-season-panel') === season;
    panel.classList.toggle('active', match);
    panel.hidden = !match;
  });
}

function applySiteSeason(season, {persist = false} = {}){
  if (season !== 'summer' && season !== 'winter') return;
  document.documentElement.setAttribute('data-season', season);

  if (persist) localStorage.setItem(SEASON_KEY, season);

  seasonNavBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-season-nav') === season);
  });

  document.querySelectorAll('[data-season-src-summer][data-season-src-winter]').forEach(img => {
    const next = img.getAttribute(`data-season-src-${season}`);
    if (next && img.getAttribute('src') !== next) img.setAttribute('src', next);
    const seasonalAlt = img.getAttribute(`data-season-alt-${season}`);
    if (seasonalAlt) img.setAttribute('alt', seasonalAlt);
    const parentBtn = img.closest('[data-gallery-src]');
    if (parentBtn) parentBtn.setAttribute('data-gallery-src', next);
  });

  setActivitySeason(season);
}

seasonNavBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    applySiteSeason(btn.getAttribute('data-season-nav'), {persist: true});
  });
});

activitySeasonBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const season = btn.getAttribute('data-season');
    applySiteSeason(season, {persist: true});
  });
});

/* ============ GALLERY LIGHTBOX ============ */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
let galleryIndex = 0;
let lightboxScope = null;

function getGalleryItems(){
  const root = lightboxScope || document;
  return [...root.querySelectorAll('[data-gallery-src]')];
}

function openLightbox(index, scope = null){
  lightboxScope = scope;
  const galleryItems = getGalleryItems();
  if (!galleryItems.length) return;
  galleryIndex = Math.max(0, Math.min(index, galleryItems.length - 1));
  const item = galleryItems[galleryIndex];
  const img = item.querySelector('img');
  lightboxImg.src = item.getAttribute('data-gallery-src');
  lightboxImg.alt = img && img.alt ? img.alt : 'Vue agrandie';
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  document.getElementById('lightboxClose').focus();
}

function closeLightbox(){
  lightbox.hidden = true;
  lightboxImg.src = '';
  lightboxImg.alt = 'Vue agrandie';
  lightboxScope = null;
  document.body.style.overflow = '';
}

function stepLightbox(delta){
  const galleryItems = getGalleryItems();
  if (!galleryItems.length) return;
  galleryIndex = (galleryIndex + delta + galleryItems.length) % galleryItems.length;
  openLightbox(galleryIndex, lightboxScope);
}

function bindGalleryClicks(gridId){
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.addEventListener('click', (e) => {
    const item = e.target.closest('[data-gallery-src]');
    if (!item) return;
    const items = [...grid.querySelectorAll('[data-gallery-src]')];
    openLightbox(items.indexOf(item), grid);
  });
}

bindGalleryClicks('galleryGrid');
bindGalleryClicks('actGalleryGrid');
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', () => stepLightbox(-1));
document.getElementById('lightboxNext').addEventListener('click', () => stepLightbox(1));
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape'){
    if (!lightbox.hidden){
      closeLightbox();
      return;
    }
    if (!langMenu.hidden){
      setLangMenu(false);
      langToggle.focus();
      return;
    }
    if (isNavOpen()){
      closeNav();
    }
    return;
  }

  if (!lightbox.hidden){
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
    return;
  }

  if (isNavOpen() && e.key === 'Tab'){
    const nodes = menuFocusables();
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first){
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last){
      e.preventDefault();
      first.focus();
    }
  }
});

/* ============ INIT ============ */
const savedLang = localStorage.getItem('chaletLang') || 'fr';
applyLang(savedLang);
applySiteSeason(resolveSeason());
setupStayPanel();
setupPhone();
setupPricing();
