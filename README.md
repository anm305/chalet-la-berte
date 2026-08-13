# Chalet La Berte

Site vitrine + demande de réservation directe.

## Lancer en local

```bash
cp .env.example .env
npm run build
# API /api/quote nécessite `vercel dev` (pas le simple http.server)
npx vercel dev
```

## Indexer le prix sur Airbnb (solution)

Airbnb **ne publie pas** les prix nuit par nuit via iCal (disponibilités seulement).

La solution retenue : **PriceLabs** comme source de vérité tarifaire.

```
Airbnb ←→ PriceLabs → /api/quote → site (− x % direct)
```

1. Crée un compte sur [PriceLabs](https://hello.pricelabs.co/) et **connecte ton annonce Airbnb**.
2. Active la **Customer API** et récupère la clé.
3. Dans Vercel → Settings → Environment Variables :

```bash
PRICELABS_API_KEY=...
PRICELABS_LISTING_ID=...   # ID visible dans PriceLabs
PRICELABS_PMS=airbnb
PUBLIC_DIRECT_DISCOUNT_PERCENT=10
```

4. Redeploy.

Sur le site : le visiteur choisit ses dates → le tarif affiché = **somme des nuits Airbnb (PriceLabs) − remise directe**.

Sans PriceLabs, tu peux temporairement poser un fallback plat :

```bash
PUBLIC_AIRBNB_NIGHTLY_CHF=800
PUBLIC_DIRECT_DISCOUNT_PERCENT=10
```

## Synchroniser le calendrier (iCal)

1. Airbnb hôte → **Calendrier** → **Exporter le calendrier** → URL `.ics`
2. Variable Vercel :

```bash
ICAL_FEED_URLS=https://www.airbnb.fr/calendar/ical/XXXX.ics
```

3. Redeploy. Sans URL → mode « indiquez vos dates ».

## Formulaire

[Web3Forms](https://web3forms.com) → `PUBLIC_FORM_ACCESS_KEY`.
