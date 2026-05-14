// Centrální definice kategorií. Přidej / odeber dle potřeby.
// `slug` se používá v URL a v `photos.json` jako hodnota pole `category`.
// `label` je to, co vidí návštěvník.

export type Category = {
  slug: string;
  label: string;
  description?: string;
};

export const categories: Category[] = [
  { slug: 'krajina', label: 'Krajina', description: 'Hory, lesy, moře, ticho.' },
  { slug: 'cestovani', label: 'Cestování', description: 'Místa, kam jsem se zatoulal.' },
  { slug: 'priroda', label: 'Příroda', description: 'Detaily, světlo, atmosféra.' },
  { slug: 'zvirata', label: 'Zvířata', description: 'Ptáci, divoká fauna, drobné okamžiky.' },
  { slug: 'portrety', label: 'Portréty', description: 'Lidé a jejich příběhy.' },
  { slug: 'street', label: 'Street', description: 'Okamžiky ve městě.' },
  { slug: 'udalosti', label: 'Události', description: 'Svatby, koncerty, akce.' },
];

export const categoryBySlug = (slug: string): Category | undefined =>
  categories.find((c) => c.slug === slug);