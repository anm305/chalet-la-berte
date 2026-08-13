# Chalet La Berte

Site vitrine + demande de réservation directe.

## Lancer en local

```bash
cp .env.example .env
npm run build
npx vercel dev   # nécessaire pour /api/quote
```

## Prix indexés sur Airbnb (gratuit)

Airbnb ne publie pas les prix via iCal. Solution gratuite :

1. Installer [Airbnb Host Rate Exporter](https://chromewebstore.google.com/detail/airbnb-host-rate-exporter/kcpoffmbgofohipihbaaphemjodoeinc) (Chrome)
2. Calendrier hôte Airbnb → vue année → exporter le CSV
3. Importer dans le projet :

```bash
npm run import:rates -- ~/Downloads/airbnb-rates.csv
git add data/rates.csv && git commit -m "Update Airbnb rates" && git push
```

Le site calcule alors : **somme des nuits Airbnb − `PUBLIC_DIRECT_DISCOUNT_PERCENT`** (défaut 10 %).

Priorité des sources de prix :
1. PriceLabs (si configuré)
2. `data/rates.csv`
3. `PUBLIC_AIRBNB_NIGHTLY_CHF` (tarif plat de secours)

## PriceLabs (option payante, auto)

```bash
PRICELABS_API_KEY=...
PRICELABS_LISTING_ID=...
PRICELABS_PMS=airbnb
PUBLIC_DIRECT_DISCOUNT_PERCENT=10
```

## Calendrier (disponibilités)

```bash
ICAL_FEED_URLS=https://www.airbnb.fr/calendar/ical/XXXX.ics
```

Sans URL → « indiquez vos dates ».

## Formulaire

[Web3Forms](https://web3forms.com) → `PUBLIC_FORM_ACCESS_KEY`.
