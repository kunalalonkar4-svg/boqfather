# BOQFather – Free website (Phase 2)

House construction cost estimate + 9 construction calculators for India, in English and Hindi, with step-by-step working, PDF report and WhatsApp share.

## Run it on your laptop

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # calculation engine tests (vitest)
npm run build      # static site in ./out
```

Needs Node.js 20 or newer.

## Deploy (Vercel)

1. Push this folder to a private GitHub repo.
2. On vercel.com → New Project → import the repo → Deploy (no settings needed).
3. Add your domain in Vercel → Settings → Domains, then change `SITE_URL` in `src/lib/site.ts`.

## Pages

| URL | Page |
| --- | --- |
| `/` and `/hi/` | Home with live house-cost widget |
| `/calculators/` and `/hi/calculators/` | All calculators |
| `/house-construction-cost-calculator/` | Quick estimate: total, materials, stages, split, payment schedule, PDF |
| `/concrete-calculator/` | Cement, sand, aggregate (M5–M25) |
| `/brick-calculator/` | Bricks, cement, sand for walls |
| `/plaster-calculator/` | Cement and sand for plaster |
| `/steel-calculator/` | Bar weight (d²/162), kg/m³ by member, kg/sqft |
| `/tile-calculator/` | Tiles and boxes |
| `/paint-calculator/` | Paint, primer, putty |
| `/excavation-calculator/` | Volume, brass, loose soil, cost |
| `/construction-unit-converter/` | m³/cft/brass, m²/sqft/gaj, cement bags, kg/tonne, feet-inch |

Every calculator page has a Hindi twin under `/hi/…`, its own title and description, hreflang links, FAQ + WebApplication + Breadcrumb schema, and is listed in `sitemap.xml`.

## Folder structure

```
src/engine/          Calculation engine (pure TypeScript, no UI) + tests
  units.ts           Units, ft-in parsing, Indian number format
  concrete.ts        Nominal mixes, 1.54 dry factor
  masonry.ts         Brickwork, plaster
  steel.ts           Bar weight, kg/m³, kg/sqft
  finishes.ts        Tiles, paint
  excavation.ts      Pits / trenches
  house.ts           Quick house estimate (thumb rules, stages, payments)
  engine.test.ts     17 tests against textbook values
src/content/         Calculator SEO copy (English + Hindi), FAQs
src/i18n/ui.ts       UI text in English and Hindi
src/components/calcs Calculator screens (one per calculator)
src/components/site  Header, footer, home, calculator page template
src/lib/housePdf.ts  Quick-estimate PDF (jsPDF, BOQFather branding)
src/app/             Routes, sitemap, robots, manifest
```

## Engineering values to review (founder)

All defaults live in the engine and can be changed in one place:

- `house.ts` – base rates (₹1,600 / 1,900 / 2,600 per sqft), location factors, material thumb rules and rates, stage %, payment milestones, time formula.
- `masonry.ts` – mortar dry factor 1.33 (brickwork), 1.27 + 20% (plaster), brick sizes.
- `steel.ts` – kg/m³ by member (footing 80, column 180, plinth beam 120, beam 150, slab 90, staircase 90).
- `finishes.ts` – tiles per box, paint 120 sqft/L/coat, primer 110 sqft/L, putty 15 sqft/kg.

When a value changes, update the matching test in `engine.test.ts`.

## Not in this phase

Login, saved projects, payments (Razorpay), detailed plan-based estimate, SOR rates — these are Phase 3–4 in the PRD. The site is a static export now; it switches to a normal Vercel server build when accounts arrive.
