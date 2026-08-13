# Chalet La Berte

Site vitrine + demande de réservation directe (statique).

## Lancer en local

```bash
cp .env.example .env
# renseigner PUBLIC_FORM_ACCESS_KEY, prix, iCal…
npm run build
python3 -m http.server 8765 --bind 127.0.0.1
```

## Prix direct = Airbnb − x %

Dans `.env` :

```bash
PUBLIC_AIRBNB_NIGHTLY_CHF=800   # tarif Airbnb de référence (CHF / nuit)
PUBLIC_DIRECT_DISCOUNT_PERCENT=10
```

Le build affiche `720 CHF / nuit` et la mention « 10 % de moins que le tarif Airbnb de référence ».

## Synchroniser le calendrier (iCal)

1. Airbnb (compte hôte) → **Calendrier** → **Disponibilité** → **Exporter le calendrier** (ou « Connecter un autre calendrier » → Exporter).
2. Copier l’URL `.ics` (elle ressemble à `https://www.airbnb.fr/calendar/ical/….ics`).
3. Si tu as aussi Booking.com : Calendrier → Synchroniser → Exporter → coller la 2ᵉ URL.
4. Dans `.env` (et sur Vercel → Project → Settings → Environment Variables) :

```bash
ICAL_FEED_URLS=https://www.airbnb.fr/calendar/ical/XXXX.ics,https://admin.booking.com/…/ical.ics
```

5. Relancer `npm run build` (ou redéployer). Le site lit les flux **au build**, affiche les dates occupées, et la date de dernière sync. Sans URL, le calendrier reste en mode « indiquez vos dates ».

## Formulaire

[Web3Forms](https://web3forms.com) → clé dans `PUBLIC_FORM_ACCESS_KEY`.
