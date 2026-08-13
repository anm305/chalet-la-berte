# Chalet La Berte

Site vitrine + demande de réservation directe.

## Lancer en local

```bash
cp .env.example .env
npm run build
npx vercel dev   # nécessaire pour /api/quote
```

## Tarifs (Excel → site)

Fichier source : **`data/tarifs.xlsx`**

1. Ouvre `data/tarifs.xlsx` (Excel / Numbers / Google Sheets)
2. Onglet **Saisons** : plages de dates + prix Airbnb / nuit (CHF)
3. Onglet **Exceptions** : dates précises (prioritaires)
4. Enregistre, puis :

```bash
npm run import:rates
git add data/tarifs.xlsx data/rates.csv
git commit -m "Update rates"
git push
```

Le site affiche **prix Airbnb − 10 %** (`PUBLIC_DIRECT_DISCOUNT_PERCENT`).

Recréer le modèle (écrase le fichier) :

```bash
npm run tarifs:init
```

### Priorité des sources
1. PriceLabs (si configuré)
2. `data/rates.csv` (généré depuis l’Excel)
3. `PUBLIC_AIRBNB_NIGHTLY_CHF` (tarif plat)

## Calendrier (disponibilités)

```bash
ICAL_FEED_URLS=https://www.airbnb.fr/calendar/ical/XXXX.ics
```

## Formulaire

[Web3Forms](https://web3forms.com) → `PUBLIC_FORM_ACCESS_KEY`.
