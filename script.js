const CONFIG = window.CHALET_CONFIG || {};
const CAPACITY = 15;

const LODGINGS = {
  whole: { rooms: 5, capacity: 15 },
  four:  { rooms: 4, capacity: 12 },
  three: { rooms: 3, capacity: 9 },
  two:   { rooms: 2, capacity: 6 },
  one:   { rooms: 1, capacity: 3 }
};

/* Room sets for each listing — matches 4+1 and 3+2 splits */
const ROOM_CATALOG = {
  1: { src: 'images/chambre-1.jpg', titleKey: 'room1.title', bedsKey: 'room1.beds', alt: 'Chambre 1 — lit queen avec vue sur la neige' },
  2: { src: 'images/chambre-3.jpg', titleKey: 'room2.title', bedsKey: 'room2.beds', alt: 'Chambre 2 — lit queen, mur en bois' },
  3: { src: 'images/chambre-2.jpg', titleKey: 'room3.title', bedsKey: 'room3.beds', alt: 'Les Drus — lit double' },
  4: { src: 'images/chambre-4.jpg', titleKey: 'room4.title', bedsKey: 'room4.beds', alt: 'Chambre 4 — lits simples, superposé et couchage d\'appoint' },
  5: { src: 'images/chambre-5.jpg', titleKey: 'room5.title', bedsKey: 'room5.beds', alt: 'Chambre 5 — lit queen avec vue montagne' }
};

const LODGING_ROOM_IDS = {
  whole: [1, 2, 3, 4, 5],
  four:  [1, 2, 3, 4],
  three: [1, 2, 3],
  two:   [4, 5],
  one:   [5]
};

let selectedLodging = 'whole';

function lodgingCapacity(id){
  return (LODGINGS[id] && LODGINGS[id].capacity) || CAPACITY;
}

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
    "stay.sub":"Le chalet se loue entier ou par logement. En direct, vous évitez les frais de plateforme — un contact clair avec vos hôtes.",
    "stay.lodgingLabel":"Quelle formule ?",
    "stay.lodgingCombos":"Combinaisons possibles sur les mêmes dates : tout le chalet · 4 ch + 1 ch · 3 ch + 2 ch · 1 chambre seule",
    "lodging.whole.name":"Tout le chalet",
    "lodging.whole.meta":"5 chambres · jusqu'à 15 pers.",
    "lodging.whole.detail":"Tout le chalet · 5 chambres · jusqu'à 15 personnes · linge inclus",
    "lodging.four.name":"4 chambres",
    "lodging.four.meta":"Logement · jusqu'à 12 pers.",
    "lodging.four.detail":"Logement 4 chambres · jusqu'à 12 personnes · linge inclus",
    "lodging.three.name":"3 chambres",
    "lodging.three.meta":"Logement · jusqu'à 9 pers.",
    "lodging.three.detail":"Logement 3 chambres · jusqu'à 9 personnes · linge inclus",
    "lodging.two.name":"2 chambres",
    "lodging.two.meta":"Logement · jusqu'à 6 pers.",
    "lodging.two.detail":"Logement 2 chambres · jusqu'à 6 personnes · linge inclus",
    "lodging.one.name":"1 chambre",
    "lodging.one.meta":"Logement · jusqu'à 3 pers.",
    "lodging.one.detail":"Logement 1 chambre · jusqu'à 3 personnes · linge inclus",
    "lodging.more":"En savoir plus",
    "lodging.sheetEyebrow":"Chambres incluses",
    "lodging.sheetNote":"Cliquez une photo pour l’agrandir.",
    "lodging.sheetSub":"{count} chambres dans cette formule",
    "lodging.sheetSubOne":"1 chambre dans cette formule",
    "stay.datesEyebrow":"Vos dates",
    "stay.datesHint":"Indiquez vos dates, nous vous répondons sous 24 h.",
    "stay.datesCta":"Envoyer une demande",
    "stay.calSync":"Dernière synchronisation : {date}",
    "stay.calNoIcal":"Calendrier interactif — les nuits réservées apparaîtront après branchement iCal.",
    "stay.calLegend":"Cliquez une arrivée, puis un départ. Le calendrier suit la formule choisie (iCal Airbnb). Les prix affichés concernent le chalet entier.",
    "stay.priceEyebrow":"Tarif selon vos dates", "stay.priceUnit":"/ nuit",
    "stay.priceDetail":"Chalet entier · jusqu'à 15 personnes · linge inclus",
    "stay.priceHint":"Choisissez vos dates sur le calendrier (ou dans le formulaire) pour voir le tarif.",
    "stay.priceCompare":"{discount} % de moins que le tarif Airbnb pour ces dates ({airbnb} CHF / nuit).",
    "stay.priceTotal":"{total} CHF pour {nights} nuits",
    "stay.priceLoading":"Calcul du tarif…",
    "stay.priceUnavailable":"Tarif à confirmer pour ces dates — envoyez votre demande.",
    "stay.priceSynced":"Tarifs Airbnb synchronisés le {date}.",
    "stay.step1":"Vous envoyez votre demande",
    "stay.step2":"Nous confirmons les dates et vous envoyons un lien de paiement sécurisé",
    "stay.step3":"Solde 30 jours avant l'arrivée",
    "stay.payMethods":"Paiement : TWINT, carte bancaire, QR-facture.",
    "stay.li1":"Arrivée dès 16h00 · départ avant 12h00",
    "stay.li2":"Acompte de 30 % après confirmation des dates",
    "contact.eyebrow":"Parlons de votre séjour", "contact.title":"Réserver le chalet",
    "contact.p":"Indiquez la formule, vos dates et le nombre de voyageurs — Sarah & Anthony vous répondent en général le jour même.",
    "contact.whatsapp":"WhatsApp / Téléphone",
    "form.name":"Nom", "form.email":"Email", "form.checkin":"Arrivée", "form.checkout":"Départ",
    "form.lodging":"Formule",
    "form.guests":"Nombre de voyageurs", "form.message":"Message (facultatif)", "form.submit":"Envoyer la demande",
    "form.sending":"Envoi en cours…",
    "form.success":"Demande envoyée. Nous vous répondons sous 24 h.",
    "form.error":"L'envoi a échoué. Réessayez ou écrivez-nous directement.",
    "form.errorEmail":"L'envoi a échoué. Réessayez ou écrivez-nous directement à {email}.",
    "form.errDates":"La date de départ doit être après la date d'arrivée.",
    "form.errEmail":"Indiquez une adresse e-mail valide.",
    "form.errGuests":"Le nombre de voyageurs doit être entre 1 et {max}.",
    "form.errLodging":"Choisissez une formule de logement.",
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
    "stay.sub":"Rent the whole chalet or a separate unit. Book directly and skip platform fees — clear contact with your hosts.",
    "stay.lodgingLabel":"Which option?",
    "stay.lodgingCombos":"Possible on the same dates: whole chalet · 4 bed + 1 bed · 3 bed + 2 bed · 1 bedroom alone",
    "lodging.whole.name":"Whole chalet",
    "lodging.whole.meta":"5 bedrooms · up to 15 guests",
    "lodging.whole.detail":"Whole chalet · 5 bedrooms · up to 15 guests · linens included",
    "lodging.four.name":"4 bedrooms",
    "lodging.four.meta":"Unit · up to 12 guests",
    "lodging.four.detail":"4-bedroom unit · up to 12 guests · linens included",
    "lodging.three.name":"3 bedrooms",
    "lodging.three.meta":"Unit · up to 9 guests",
    "lodging.three.detail":"3-bedroom unit · up to 9 guests · linens included",
    "lodging.two.name":"2 bedrooms",
    "lodging.two.meta":"Unit · up to 6 guests",
    "lodging.two.detail":"2-bedroom unit · up to 6 guests · linens included",
    "lodging.one.name":"1 bedroom",
    "lodging.one.meta":"Unit · up to 3 guests",
    "lodging.one.detail":"1-bedroom unit · up to 3 guests · linens included",
    "lodging.more":"See photos",
    "lodging.sheetEyebrow":"Bedrooms included",
    "lodging.sheetNote":"Click a photo to enlarge.",
    "lodging.sheetSub":"{count} bedrooms in this option",
    "lodging.sheetSubOne":"1 bedroom in this option",
    "stay.datesEyebrow":"Your dates",
    "stay.datesHint":"Tell us your dates — we reply within 24 hours.",
    "stay.datesCta":"Send a request",
    "stay.calSync":"Last synced: {date}",
    "stay.calNoIcal":"Interactive calendar — booked nights will appear once iCal is connected.",
    "stay.calLegend":"Click a check-in, then a check-out. The calendar follows the selected option (Airbnb iCal). Displayed prices are for the whole chalet.",
    "stay.priceEyebrow":"Rate for your dates", "stay.priceUnit":"/ night",
    "stay.priceDetail":"Whole chalet · up to 15 guests · linens included",
    "stay.priceHint":"Pick your dates on the calendar (or in the form) to see the rate.",
    "stay.priceCompare":"{discount}% less than the Airbnb rate for these dates ({airbnb} CHF / night).",
    "stay.priceTotal":"{total} CHF for {nights} nights",
    "stay.priceLoading":"Calculating rate…",
    "stay.priceUnavailable":"Rate to confirm for these dates — send your request.",
    "stay.priceSynced":"Airbnb rates synced on {date}.",
    "stay.step1":"You send your request",
    "stay.step2":"We confirm the dates and send you a secure payment link",
    "stay.step3":"Balance due 30 days before arrival",
    "stay.payMethods":"Payment: TWINT, bank card, QR-bill.",
    "stay.li1":"Check-in from 4:00 PM · check-out before 12:00 PM",
    "stay.li2":"30% deposit after dates are confirmed",
    "contact.eyebrow":"Let's talk about your stay", "contact.title":"Book the chalet",
    "contact.p":"Tell us the unit, your dates and number of guests — Sarah & Anthony usually reply the same day.",
    "contact.whatsapp":"WhatsApp / Phone",
    "form.name":"Name", "form.email":"Email", "form.checkin":"Check-in", "form.checkout":"Check-out",
    "form.lodging":"Option",
    "form.guests":"Number of guests", "form.message":"Message (optional)", "form.submit":"Send request",
    "form.sending":"Sending…",
    "form.success":"Request sent. We will reply within 24 hours.",
    "form.error":"Sending failed. Try again, or write to us directly.",
    "form.errorEmail":"Sending failed. Try again, or write to us directly at {email}.",
    "form.errDates":"Check-out must be after check-in.",
    "form.errEmail":"Enter a valid email address.",
    "form.errGuests":"Number of guests must be between 1 and {max}.",
    "form.errLodging":"Please choose a lodging option.",
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
    "stay.sub":"Mieten Sie das ganze Chalet oder eine Einheit. Direkt buchen, Plattformgebühren sparen — klarer Kontakt zu Ihren Gastgebern.",
    "stay.lodgingLabel":"Welche Formel?",
    "stay.lodgingCombos":"Möglich an denselben Daten: ganzes Chalet · 4 Zi + 1 Zi · 3 Zi + 2 Zi · 1 Zimmer allein",
    "lodging.whole.name":"Ganzes Chalet",
    "lodging.whole.meta":"5 Zimmer · bis 15 Pers.",
    "lodging.whole.detail":"Ganzes Chalet · 5 Zimmer · bis 15 Personen · Bettwäsche inkl.",
    "lodging.four.name":"4 Zimmer",
    "lodging.four.meta":"Einheit · bis 12 Pers.",
    "lodging.four.detail":"4-Zimmer-Einheit · bis 12 Personen · Bettwäsche inkl.",
    "lodging.three.name":"3 Zimmer",
    "lodging.three.meta":"Einheit · bis 9 Pers.",
    "lodging.three.detail":"3-Zimmer-Einheit · bis 9 Personen · Bettwäsche inkl.",
    "lodging.two.name":"2 Zimmer",
    "lodging.two.meta":"Einheit · bis 6 Pers.",
    "lodging.two.detail":"2-Zimmer-Einheit · bis 6 Personen · Bettwäsche inkl.",
    "lodging.one.name":"1 Zimmer",
    "lodging.one.meta":"Einheit · bis 3 Pers.",
    "lodging.one.detail":"1-Zimmer-Einheit · bis 3 Personen · Bettwäsche inkl.",
    "lodging.more":"Mehr erfahren",
    "lodging.sheetEyebrow":"Enthaltene Zimmer",
    "lodging.sheetNote":"Klicken Sie ein Foto zum Vergrössern.",
    "lodging.sheetSub":"{count} Zimmer in dieser Formel",
    "lodging.sheetSubOne":"1 Zimmer in dieser Formel",
    "stay.datesEyebrow":"Ihre Daten",
    "stay.datesHint":"Nennen Sie uns Ihre Daten — wir antworten innert 24 Stunden.",
    "stay.datesCta":"Anfrage senden",
    "stay.calSync":"Letzte Synchronisation: {date}",
    "stay.calNoIcal":"Interaktiver Kalender — gebuchte Nächte erscheinen nach iCal-Anbindung.",
    "stay.calLegend":"Klicken Sie Anreise, dann Abreise. Der Kalender folgt der gewählten Formel (Airbnb-iCal). Angezeigte Preise gelten für das ganze Chalet.",
    "stay.priceEyebrow":"Preis für Ihre Daten", "stay.priceUnit":"/ Nacht",
    "stay.priceDetail":"Ganzes Chalet · bis zu 15 Gäste · Bettwäsche inklusive",
    "stay.priceHint":"Wählen Sie Ihre Daten im Kalender (oder im Formular), um den Preis zu sehen.",
    "stay.priceCompare":"{discount} % weniger als der Airbnb-Preis für diese Daten ({airbnb} CHF / Nacht).",
    "stay.priceTotal":"{total} CHF für {nights} Nächte",
    "stay.priceLoading":"Preis wird berechnet…",
    "stay.priceUnavailable":"Preis für diese Daten zu bestätigen — senden Sie Ihre Anfrage.",
    "stay.priceSynced":"Airbnb-Preise synchronisiert am {date}.",
    "stay.step1":"Sie senden Ihre Anfrage",
    "stay.step2":"Wir bestätigen die Daten und senden Ihnen einen sicheren Zahlungslink",
    "stay.step3":"Restbetrag 30 Tage vor Anreise",
    "stay.payMethods":"Zahlung: TWINT, Bankkarte, QR-Rechnung.",
    "stay.li1":"Anreise ab 16:00 Uhr · Abreise vor 12:00 Uhr",
    "stay.li2":"30 % Anzahlung nach Bestätigung der Daten",
    "contact.eyebrow":"Erzählen Sie uns von Ihrem Aufenthalt", "contact.title":"Chalet buchen",
    "contact.p":"Nennen Sie Formel, Daten und Gästezahl — Sarah & Anthony antworten meist noch am selben Tag.",
    "contact.whatsapp":"WhatsApp / Telefon",
    "form.name":"Name", "form.email":"E-Mail", "form.checkin":"Anreise", "form.checkout":"Abreise",
    "form.lodging":"Formel",
    "form.guests":"Anzahl Gäste", "form.message":"Nachricht (optional)", "form.submit":"Anfrage senden",
    "form.sending":"Wird gesendet…",
    "form.success":"Anfrage gesendet. Wir antworten innert 24 Stunden.",
    "form.error":"Senden fehlgeschlagen. Versuchen Sie es erneut oder schreiben Sie uns direkt.",
    "form.errorEmail":"Senden fehlgeschlagen. Versuchen Sie es erneut oder schreiben Sie uns direkt an {email}.",
    "form.errDates":"Das Abreisedatum muss nach dem Anreisedatum liegen.",
    "form.errEmail":"Geben Sie eine gültige E-Mail-Adresse ein.",
    "form.errGuests":"Die Gästezahl muss zwischen 1 und {max} liegen.",
    "form.errLodging":"Bitte wählen Sie eine Wohnformel.",
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
  applyLodging(selectedLodging, { silent: true });
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

const bookedDatesByLodging = (() => {
  const map = {};
  const by = (CONFIG.availability && CONFIG.availability.byLodging) || {};
  for (const key of Object.keys(by)) {
    map[key] = new Set(by[key] || []);
  }
  if (!map.whole && CONFIG.availability && CONFIG.availability.booked) {
    map.whole = new Set(CONFIG.availability.booked);
  }
  return map;
})();

function bookedSetFor(lodging){
  if (bookedDatesByLodging[lodging]) return bookedDatesByLodging[lodging];
  if (bookedDatesByLodging.whole) return bookedDatesByLodging.whole;
  return new Set();
}

const rateMap = CONFIG.rates || {};
const discountPct = (CONFIG.pricing && CONFIG.pricing.discountPercent != null)
  ? Number(CONFIG.pricing.discountPercent)
  : 10;

let calCursor = new Date();
calCursor.setDate(1);
let calCheckin = null;
let calCheckout = null;

function directPriceFor(dateStr){
  const airbnb = rateMap[dateStr];
  if (!Number.isFinite(airbnb)) return null;
  return Math.round(airbnb * (1 - discountPct / 100));
}

function isoToday(){
  return new Date().toISOString().slice(0, 10);
}

function renderCalendar(){
  const grid = document.getElementById('calendarGrid');
  const label = document.getElementById('calMonthLabel');
  if (!grid || !label) return;

  const lang = document.documentElement.getAttribute('data-lang') || 'fr';
  const bookedDates = bookedSetFor(selectedLodging);
  grid.innerHTML = '';

  const year = calCursor.getFullYear();
  const month = calCursor.getMonth();
  label.textContent = `${MONTH_NAMES[lang][month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = isoToday();

  for (let i = 0; i < startOffset; i++){
    const empty = document.createElement('div');
    empty.className = 'day empty';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++){
    const cell = document.createElement('button');
    cell.type = 'button';
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const booked = bookedDates.has(dateStr);
    const past = dateStr < todayStr;
    const direct = selectedLodging === 'whole' ? directPriceFor(dateStr) : null;

    cell.className = 'day';
    cell.dataset.date = dateStr;
    if (booked || past) cell.classList.add('unavailable');
    else cell.classList.add('selectable');
    if (dateStr === todayStr) cell.classList.add('today');
    if (calCheckin && dateStr === calCheckin) cell.classList.add('selected');
    if (calCheckout && dateStr === calCheckout) cell.classList.add('selected');
    if (calCheckin && calCheckout && dateStr > calCheckin && dateStr < calCheckout) {
      cell.classList.add('in-range');
    }

    const num = document.createElement('span');
    num.className = 'day-num';
    num.textContent = d;
    cell.appendChild(num);

    if (direct != null && !booked){
      const priceEl = document.createElement('span');
      priceEl.className = 'day-price';
      priceEl.textContent = String(direct);
      cell.appendChild(priceEl);
    }

    if (!booked && !past){
      cell.addEventListener('click', () => onCalendarDayClick(dateStr));
    } else {
      cell.disabled = true;
    }
    grid.appendChild(cell);
  }

  const syncEl = document.getElementById('calSync');
  if (syncEl){
    if (CONFIG.availability && CONFIG.availability.syncedAt){
      const synced = new Date(CONFIG.availability.syncedAt);
      const formatted = synced.toLocaleString(lang, { dateStyle: 'medium', timeStyle: 'short' });
      syncEl.textContent = t('stay.calSync', { date: formatted });
    } else {
      syncEl.textContent = t('stay.calNoIcal');
    }
  }
}

function onCalendarDayClick(dateStr){
  if (!calCheckin || (calCheckin && calCheckout)){
    calCheckin = dateStr;
    calCheckout = null;
  } else if (dateStr <= calCheckin){
    calCheckin = dateStr;
    calCheckout = null;
  } else {
    calCheckout = dateStr;
  }

  const form = document.getElementById('contactForm');
  if (form){
    if (calCheckin) form.checkin.value = calCheckin;
    if (calCheckout) form.checkout.value = calCheckout;
    else form.checkout.value = '';
  }

  renderCalendar();
  if (calCheckin && calCheckout) refreshQuoteFromForm();
  else setupPricing();
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
  if (calendarCard) calendarCard.hidden = false;
  renderCalendar();
  setupLodgingPicker();
  applyLodging(selectedLodging, { silent: true });
}

/* ============ LODGING FORMULAS ============ */
function lodgingLabel(id){
  return t(`lodging.${id}.name`) || id;
}

function updateLodgingDetail(){
  const detail = document.getElementById('priceDetail');
  if (detail) detail.textContent = t(`lodging.${selectedLodging}.detail`);
}

function applyLodging(id, opts = {}){
  if (!LODGINGS[id]) id = 'whole';
  selectedLodging = id;
  const max = lodgingCapacity(id);
  const booked = bookedSetFor(id);

  document.querySelectorAll('.lodging-option').forEach((card) => {
    const active = card.getAttribute('data-lodging') === id;
    card.classList.toggle('is-active', active);
    const selectBtn = card.querySelector('[data-lodging-select]');
    if (selectBtn) selectBtn.setAttribute('aria-checked', active ? 'true' : 'false');
  });

  const formSelect = document.getElementById('formLodging');
  if (formSelect && formSelect.value !== id) formSelect.value = id;

  const guestsInput = document.getElementById('formGuests') || document.querySelector('#contactForm [name="guests"]');
  if (guestsInput){
    guestsInput.max = String(max);
    const current = Number(guestsInput.value);
    if (Number.isFinite(current) && current > max) guestsInput.value = String(max);
  }

  // Drop selected dates that are unavailable for this listing
  if (calCheckin && booked.has(calCheckin)){
    calCheckin = null;
    calCheckout = null;
  } else if (calCheckout && booked.has(calCheckout)){
    calCheckout = null;
  } else if (calCheckin && calCheckout){
    for (let day = calCheckin; day < calCheckout; ){
      if (booked.has(day)){
        calCheckin = null;
        calCheckout = null;
        break;
      }
      const d = new Date(`${day}T12:00:00Z`);
      d.setUTCDate(d.getUTCDate() + 1);
      day = d.toISOString().slice(0, 10);
    }
  }

  const form = document.getElementById('contactForm');
  if (form){
    form.checkin.value = calCheckin || '';
    form.checkout.value = calCheckout || '';
  }

  updateLodgingDetail();
  renderCalendar();
  if (!opts.silent){
    setupPricing();
    refreshQuoteFromForm();
  }
}

function setupLodgingPicker(){
  document.querySelectorAll('[data-lodging-select]').forEach((btn) => {
    btn.addEventListener('click', () => applyLodging(btn.getAttribute('data-lodging-select')));
  });
  document.querySelectorAll('[data-lodging-more]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-lodging-more');
      applyLodging(id, { silent: true });
      openLodgingSheet(id);
    });
  });
  const formSelect = document.getElementById('formLodging');
  if (formSelect){
    formSelect.addEventListener('change', () => applyLodging(formSelect.value));
  }

  const sheet = document.getElementById('lodgingSheet');
  const closeBtn = document.getElementById('lodgingSheetClose');
  if (closeBtn) closeBtn.addEventListener('click', closeLodgingSheet);
  if (sheet){
    sheet.addEventListener('click', (e) => {
      if (e.target === sheet) closeLodgingSheet();
    });
  }
}

function openLodgingSheet(id){
  const sheet = document.getElementById('lodgingSheet');
  const grid = document.getElementById('lodgingSheetGrid');
  const title = document.getElementById('lodgingSheetTitle');
  const sub = document.getElementById('lodgingSheetSub');
  if (!sheet || !grid || !title) return;

  const roomIds = LODGING_ROOM_IDS[id] || LODGING_ROOM_IDS.whole;
  title.textContent = lodgingLabel(id);
  if (sub){
    sub.textContent = roomIds.length === 1
      ? t('lodging.sheetSubOne')
      : t('lodging.sheetSub', { count: roomIds.length });
  }

  grid.innerHTML = '';
  roomIds.forEach((roomId) => {
    const room = ROOM_CATALOG[roomId];
    if (!room) return;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'lodging-sheet-card';
    card.setAttribute('data-gallery-src', room.src);

    const img = document.createElement('img');
    img.src = room.src;
    img.alt = room.alt;
    img.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'lodging-sheet-card-info';
    const strong = document.createElement('strong');
    strong.textContent = t(room.titleKey);
    const span = document.createElement('span');
    span.className = 'mono';
    span.textContent = t(room.bedsKey);
    info.appendChild(strong);
    info.appendChild(span);

    card.appendChild(img);
    card.appendChild(info);
    grid.appendChild(card);
  });

  grid.onclick = (e) => {
    const item = e.target.closest('[data-gallery-src]');
    if (!item) return;
    const items = [...grid.querySelectorAll('[data-gallery-src]')];
    openLightbox(items.indexOf(item), grid);
  };

  sheet.hidden = false;
  document.body.style.overflow = 'hidden';
  const closeBtn = document.getElementById('lodgingSheetClose');
  if (closeBtn) closeBtn.focus();
}

function closeLodgingSheet(){
  const sheet = document.getElementById('lodgingSheet');
  if (!sheet || sheet.hidden) return;
  sheet.hidden = true;
  if (lightbox && lightbox.hidden) document.body.style.overflow = '';
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
  const lodging = (f.lodging && f.lodging.value) || selectedLodging;
  const message = f.message.value.trim();
  const honeypot = f.website.value.trim();
  const maxGuests = lodgingCapacity(lodging);

  if (!validEmail(email)){
    setFormStatus('error', t('form.errEmail'));
    f.email.focus();
    return;
  }
  if (!LODGINGS[lodging]){
    setFormStatus('error', t('form.errLodging'));
    if (f.lodging) f.lodging.focus();
    return;
  }
  if (!checkin || !checkout || checkout <= checkin){
    setFormStatus('error', t('form.errDates'));
    f.checkout.focus();
    return;
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > maxGuests){
    setFormStatus('error', t('form.errGuests', { max: maxGuests }));
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
    lodging,
    lodging_label: lodgingLabel(lodging),
    checkin,
    checkout,
    guests,
    message,
    subject: `Demande — ${lodgingLabel(lodging)} — Chalet La Berte`,
    from_name: name
  };
  if (CONFIG.formAccessKey) payload.access_key = CONFIG.formAccessKey;

  // Attach last quoted total if available (helps you match Airbnb − discount)
  try {
    const quoteRes = await fetch(`/api/quote?checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}`);
    if (quoteRes.ok) {
      const quote = await quoteRes.json();
      if (quote.direct) {
        payload.quoted_direct_total = quote.direct.total;
        payload.quoted_airbnb_total = quote.airbnb.total;
        payload.quoted_nights = quote.nights;
        payload.quoted_discount_percent = quote.discountPercent;
        payload.quoted_source = quote.source;
      }
    }
  } catch (_) { /* quote is optional */ }

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

let quoteRequestId = 0;

function resetPriceCard(){
  const priceValue = document.getElementById('priceValue');
  const priceCompare = document.getElementById('priceCompare');
  const priceTotal = document.getElementById('priceTotal');
  const priceHint = document.getElementById('priceHint');
  const priceSynced = document.getElementById('priceSynced');
  if (priceValue) priceValue.textContent = '—';
  if (priceCompare){ priceCompare.hidden = true; priceCompare.textContent = ''; }
  if (priceTotal){ priceTotal.hidden = true; priceTotal.textContent = ''; }
  if (priceSynced){ priceSynced.hidden = true; priceSynced.textContent = ''; }
  if (priceHint){
    priceHint.hidden = false;
    priceHint.textContent = t('stay.priceHint');
  }
}

function setupPricing(){
  resetPriceCard();
  // Keep flat fallback visible only when PriceLabs isn't used and a base rate exists
  const pricing = CONFIG.pricing;
  const priceValue = document.getElementById('priceValue');
  const priceCompare = document.getElementById('priceCompare');
  const priceHint = document.getElementById('priceHint');
  if (pricing && pricing.directNightly && priceValue && priceValue.textContent === '—'){
    priceValue.textContent = String(pricing.directNightly);
    if (priceHint) priceHint.hidden = true;
    if (priceCompare){
      priceCompare.hidden = false;
      priceCompare.textContent = t('stay.priceCompare', {
        discount: String(pricing.discountPercent),
        airbnb: String(pricing.airbnbNightly)
      });
    }
  }
}

async function refreshQuoteFromForm(){
  const form = document.getElementById('contactForm');
  if (!form) return;
  const checkin = form.checkin.value;
  const checkout = form.checkout.value;
  const priceValue = document.getElementById('priceValue');
  const priceCompare = document.getElementById('priceCompare');
  const priceTotal = document.getElementById('priceTotal');
  const priceHint = document.getElementById('priceHint');

  if (!checkin || !checkout || checkout <= checkin){
    setupPricing();
    return;
  }

  const reqId = ++quoteRequestId;
  if (priceHint){
    priceHint.hidden = false;
    priceHint.textContent = t('stay.priceLoading');
  }
  if (priceValue) priceValue.textContent = '…';

  try {
    const res = await fetch(`/api/quote?checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}`);
    const data = await res.json();
    if (reqId !== quoteRequestId) return;

    if (!res.ok || !data.direct){
      if (priceValue) priceValue.textContent = '—';
      if (priceTotal) priceTotal.hidden = true;
      if (priceCompare) priceCompare.hidden = true;
      if (priceHint){
        priceHint.hidden = false;
        priceHint.textContent = t('stay.priceUnavailable');
      }
      return;
    }

    if (priceValue) priceValue.textContent = String(data.direct.avgNightly);
    if (priceTotal){
      priceTotal.hidden = false;
      priceTotal.textContent = t('stay.priceTotal', {
        total: String(data.direct.total),
        nights: String(data.nights)
      });
    }
    if (priceCompare){
      priceCompare.hidden = false;
      priceCompare.textContent = t('stay.priceCompare', {
        discount: String(data.discountPercent),
        airbnb: String(data.airbnb.avgNightly)
      });
    }
    if (priceHint) priceHint.hidden = true;
    const priceSynced = document.getElementById('priceSynced');
    if (priceSynced && data.syncedAt){
      const lang = document.documentElement.getAttribute('data-lang') || 'fr';
      const formatted = new Date(data.syncedAt).toLocaleDateString(lang, { dateStyle: 'medium' });
      priceSynced.hidden = false;
      priceSynced.textContent = t('stay.priceSynced', { date: formatted });
    } else if (priceSynced){
      priceSynced.hidden = true;
    }
  } catch (err) {
    if (reqId !== quoteRequestId) return;
    if (priceValue) priceValue.textContent = '—';
    if (priceHint){
      priceHint.hidden = false;
      priceHint.textContent = t('stay.priceUnavailable');
    }
  }
}

function syncCalendarFromForm(){
  const form = document.getElementById('contactForm');
  if (!form) return;
  const cin = form.checkin.value || null;
  const cout = form.checkout.value || null;
  calCheckin = cin;
  calCheckout = (cin && cout && cout > cin) ? cout : null;
  if (cin){
    const d = new Date(`${cin}T12:00:00`);
    calCursor = new Date(d.getFullYear(), d.getMonth(), 1);
  }
  renderCalendar();
}

function bindQuoteInputs(){
  const form = document.getElementById('contactForm');
  if (!form) return;
  ['checkin', 'checkout'].forEach((name) => {
    form[name].addEventListener('change', () => {
      syncCalendarFromForm();
      refreshQuoteFromForm();
    });
    form[name].addEventListener('input', () => {
      syncCalendarFromForm();
      refreshQuoteFromForm();
    });
  });
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
  const sheet = document.getElementById('lodgingSheet');
  if (!sheet || sheet.hidden) document.body.style.overflow = '';
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
    const sheet = document.getElementById('lodgingSheet');
    if (sheet && !sheet.hidden){
      closeLodgingSheet();
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
bindQuoteInputs();
