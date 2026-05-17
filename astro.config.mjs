import { defineConfig } from 'astro/config';

// POZNÁMKA: Před prvním deployem uprav `site` a `base`:
//   - `site`: URL tvého GitHub Pages (např. https://username.github.io)
//   - `base`: prázdné pro user/organization site (username.github.io),
//             nebo "/nazev-repa" pro project site (username.github.io/nazev-repa)
export default defineConfig({
  site: 'https://vojtamykiska.cz',
  trailingSlash: 'ignore',
  build: {
    assets: 'assets',
  },
  image: {
    // Vlastní pipeline přes sharp v scripts/optimize.mjs — Astro pipeline nepoužíváme
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
