# Fotografické portfolio

Statický web pro fotografa postavený na **[Astro](https://astro.build/)**, nasazený na **GitHub Pages**. Optimalizace fotek probíhá lokálně přes **sharp** — zdrojové soubory se necommitují, hotové varianty ano.

---

## Co dostanete

- **Hero** sekce s velkou featured fotkou
- **Galerie** s filtrováním podle kategorií, masonry layoutem a lightboxem (klávesnice + swipe)
- **Stránka „O mně"** se sticky portrétem
- **Kontakt** s mailto a Instagram odkazy
- **`/admin`** — in-browser editor metadat (žádný backend, žádné tokeny)
- **Optimalizace obrázků** přes sharp: 480, 960, 1600, 2400 px ve formátech JPEG + WebP
- **SEO**: meta tagy, Open Graph, JSON-LD, robots.txt
- **GitHub Actions** pro automatický deploy

---

## Rychlý start

```bash
# 1. instalace závislostí
npm install

# 2. vygeneruj demo placeholder fotky (pro prototypování)
npm run demo-photos

# 3. zoptimalizuj je do generated/ variant
npm run optimize

# 4. spusť dev server
npm run dev
```

Otevři <http://localhost:4321/portfolio>.

---

## Struktura

```
portfolio/
├── photos/originals/        # ZDROJOVÉ JPEGy — NEcommituje se (.gitignore)
├── public/
│   ├── images/generated/    # Optimalizované varianty — COMMITUJE se
│   ├── favicon.svg
│   └── robots.txt
├── scripts/
│   ├── optimize.mjs          # sharp pipeline
│   ├── add-photo.mjs         # interaktivní přidání fotky
│   └── generate-demo-photos.mjs
├── src/
│   ├── data/
│   │   ├── photos.json       # ↞ ZDROJ PRAVDY galerie
│   │   ├── categories.ts     # ↞ definice kategorií
│   │   └── site.ts           # ↞ osobní údaje / konfigurace
│   ├── components/           # Hero, Gallery, PhotoCard, Lightbox, Header, Footer
│   ├── layouts/BaseLayout.astro
│   ├── pages/                # index, galerie, o-mne, kontakt, admin
│   └── styles/global.css
└── .github/workflows/deploy.yml
```

---

## Workflow: jak přidat novou fotku

### Varianta A — interaktivní pomocník (doporučeno)

```bash
npm run add-photo
```

Zeptá se na cestu k souboru, název, kategorii, alt text. Soubor zkopíruje do `photos/originals/`, přidá záznam do `photos.json` a spustí optimalizaci.

### Varianta B — ručně

1. Pojmenuj soubor podle ID, např. `praha-soumrak-001.jpg`.
2. Dej ho do `photos/originals/`.
3. Přidej záznam do `src/data/photos.json`:
   ```json
   {
     "id": "praha-soumrak-001",
     "title": "Praha v soumraku",
     "description": "Pohled na Vltavu z Karlova mostu.",
     "category": "krajina",
     "src": "praha-soumrak-001",
     "alt": "Karlův most při západu slunce",
     "width": 4000,
     "height": 2667,
     "date": "2024-09-15",
     "featured": true,
     "order": 9
   }
   ```
4. `npm run optimize`
5. `git add . && git commit -m "Přidat Praha v soumraku" && git push`

### Varianta C — přes web editor `/admin`

Otevři `https://username.github.io/portfolio/admin`, upravuj v prohlížeči, stáhni nový `photos.json`, nahraď jím lokální soubor, commitni.

> **Pozor:** sám JSON `/admin` neumí v repu změnit — to bys potřeboval GitHub PAT v prohlížeči a tím bys zbytečně exponoval token. Pro reálný workflow zůstaň u varianty A/B.

---

## Změna kategorií

V `src/data/categories.ts`:

```ts
export const categories: Category[] = [
  { slug: 'krajina', label: 'Krajina' },
  { slug: 'nove-tema', label: 'Nové téma' },
  // ...
];
```

Smaž / přidej / přejmenuj — galerie se přizpůsobí. Pamatuj, že hodnota `slug` musí odpovídat poli `category` v `photos.json`.

---

## Změna pořadí

Pořadí v galerii řídí pole `order` v `photos.json` (vzestupně). Buď ho přečísluj ručně, nebo použij `/admin` editor — drag&drop přečísluje automaticky při stažení.

---

## Optimalizace obrázků

```bash
npm run optimize
```

Skript:
- najde všechny JPEG/PNG v `photos/originals/`
- pro každý vygeneruje 4 šířky × 2 formáty = 8 variant
- pokud varianta už existuje a je novější než zdroj, přeskočí
- výstup: `public/images/generated/{id}-{šířka}.{jpg|webp}`

Pokud chceš upravit kvalitu, šířky, mozjpeg, edituj konstanty na začátku `scripts/optimize.mjs`.

---

## Deploy na GitHub Pages

### Jednorázové nastavení

1. **Vytvoř repo** na GitHubu (např. `portfolio`).
2. **Uprav `astro.config.mjs`**:
   ```js
   site: 'https://TVE-USERNAME.github.io',
   base: '/portfolio',  // nebo '/' pokud je repo username.github.io
   ```
3. **Zapni GitHub Pages**: repo → Settings → Pages → Source = **GitHub Actions**.
4. Push do `main`. Workflow `.github/workflows/deploy.yml` automaticky postaví a nasadí.

### Při každé změně

```bash
git add .
git commit -m "Aktualizace galerie"
git push
```

A je to — GH Action build + deploy proběhne sám.

---

## Lokální preview produkčního buildu

```bash
npm run build
npm run preview
```

---

## Limity tohoto řešení

GitHub Pages je výborný free hosting, ale má hranice:

| Limit | Hodnota | Co s tím |
|-------|---------|----------|
| Velikost repa | ~1 GB doporučeno | Originály nejsou v repu, jen varianty. Při ~50–150 fotkách OK. |
| Velikost souboru | 100 MB max | Jednotlivé varianty mají ~50–500 KB, není problém. |
| Bandwidth | 100 GB/měs (soft) | Pro osobní portfolio prakticky nedosažitelné. |
| Build time | 10 min | Optimalizace běží lokálně, ne v Action — build je rychlý. |
| Admin panel | žádný backend | Použij lokální editor / npm skripty. |

**Až vyrosteš nad 200 fotek**, přepni úložiště obrázků na Cloudflare R2 / Bunny.net — Astro to ustojí, stačí změnit URL v `PhotoCard.astro` a optimalizační skript.

---

## Customizace designu

- **Barvy** → `src/styles/global.css`, sekce `:root`
- **Fonty** → `src/layouts/BaseLayout.astro`, link na Google Fonts + `--font-display` / `--font-body` v CSS
- **Texty** (autor, intro, kontakt) → `src/data/site.ts`
- **Hero fotka** → automaticky se vybere první `featured: true` s nejširším poměrem

---

## Co teď nedělá (vědomě)

- žádné kontaktní formuláře s backend voláním (bez serveru nedává smysl; mailto stačí)
- žádný komentářový systém
- žádné stahování originálů (ochrana autorství)
- žádný OAuth / heslem chráněný admin (`/admin` je v `robots.txt`, ale technicky veřejný — pracuje jen lokálně, nic to nepřinese útočníkovi)

---

## License

Kód MIT. Fotky a obsah jsou tvoje.
