import {dashboardImages} from '../assets/dashboardImages';

/** A single orderable dish. */
export type MenuItem = {
  id: string;
  brand: BrandKey;
  name: string;
  desc: string;
  price: number;
  oldPrice?: number;
  discountPct?: number;
  category: string;
  image: ReturnType<typeof require>;
  popular?: boolean;
  soldOut?: boolean;
};

export type BrandKey = 'Karaz' | 'Jade';

export type BrandInfo = {
  key: BrandKey;
  name: string;
  cuisine: string;
  tagline: string;
  rating: number;
  ratingCount: string;
  priceLevel: string;
  tags: string;
  color: string;
  logo: ReturnType<typeof require>;
  branch: string;
  distance: string;
  address: string;
  prepTime: string;
  categories: string[];
};

const D = dashboardImages.dishes;

export const KARAZ_ITEMS: MenuItem[] = [
  {
    id: 'k-truffle-hummus',
    brand: 'Karaz',
    name: 'Truffle Hummus',
    desc: 'Chickpea purée · black truffle · olive oil · pine nuts...',
    price: 65,
    category: 'Mezze',
    image: D.hummus,
    popular: true,
  },
  {
    id: 'k-mansaf',
    brand: 'Karaz',
    name: 'Mansaf Royale',
    desc: 'Lamb on jameed yogurt sauce · saffron rice almonds...',
    price: 78,
    category: 'Grills',
    image: D.mansaf,
    popular: true,
  },
  {
    id: 'k-shish',
    brand: 'Karaz',
    name: 'Shish Tawook',
    desc: 'Marinated chicken skewers · garlic toum · pickles...',
    price: 78,
    category: 'Grills',
    image: D.shish,
    popular: true,
  },
  {
    id: 'k-maklouba',
    brand: 'Karaz',
    name: 'Maklouba',
    desc: 'Upside-down spiced rice, chicken, eggplant pine nuts...',
    price: 55,
    oldPrice: 78,
    discountPct: 30,
    category: 'Grills',
    image: D.maklouba,
  },
  {
    id: 'k-hummus',
    brand: 'Karaz',
    name: 'Hummus Beiruti',
    desc: 'Chickpea purée · tahini · parsley · pomegranate...',
    price: 78,
    category: 'Mezze',
    image: D.hummus,
    popular: true,
  },
  {
    id: 'k-kibbeh',
    brand: 'Karaz',
    name: 'Kibbeh Nayyeh',
    desc: 'Raw spiced lamb · bulgur · mint · onion · olive oil...',
    price: 78,
    category: 'Mezze',
    image: D.kibbeh,
  },
  {
    id: 'k-fattoush',
    brand: 'Karaz',
    name: 'Fattoush Salad',
    desc: 'Mixed greens · sumac · pomegranate molasses · pita...',
    price: 78,
    category: 'Mezze',
    image: D.fattoush,
    soldOut: true,
  },
  {
    id: 'k-kanafeh',
    brand: 'Karaz',
    name: 'Kanafeh',
    desc: 'Sweet cheese · semolina · syrup · pistachio crumbs...',
    price: 78,
    category: 'Desserts',
    image: D.kanafeh,
  },
  {
    id: 'k-phyllo',
    brand: 'Karaz',
    name: 'Creamy Phyllo Pistachio',
    desc: 'Crisp phyllo · ashta cream · pistachio · syrup...',
    price: 55,
    oldPrice: 78,
    discountPct: 30,
    category: 'Desserts',
    image: D.phyllo,
  },
  {
    id: 'k-coffee',
    brand: 'Karaz',
    name: 'Lebanese Coffee',
    desc: 'Cardamom-spiced Arabic coffee · served with dates...',
    price: 78,
    category: 'Drinks',
    image: D.coffee,
  },
  {
    id: 'k-ayran',
    brand: 'Karaz',
    name: 'Ayran',
    desc: 'Salted yogurt drink · fresh mint · ice...',
    price: 78,
    category: 'Drinks',
    image: D.ayran,
  },
];

export const JADE_ITEMS: MenuItem[] = [
  {
    id: 'j-cardamom-lamb',
    brand: 'Jade',
    name: 'Cardamom Lamb',
    desc: 'Slow-cooked lamb · cardamom · saffron rice · almonds...',
    price: 78,
    category: 'Mains',
    image: D.mansaf,
    popular: true,
  },
  {
    id: 'j-fukhara',
    brand: 'Jade',
    name: 'Fukhara Beans With Meat',
    desc: 'Slow-stewed beans · tender beef · tomato · spices...',
    price: 55,
    oldPrice: 78,
    discountPct: 30,
    category: 'Mains',
    image: D.maklouba,
    popular: true,
  },
  {
    id: 'j-mezze',
    brand: 'Jade',
    name: 'Garden Mezze Platter',
    desc: 'Hummus · moutabal · tabbouleh · vine leaves · pita...',
    price: 78,
    category: 'Mezze',
    image: D.hummus,
    popular: true,
  },
  {
    id: 'j-kanafeh',
    brand: 'Jade',
    name: 'Pistachio Kanafeh',
    desc: 'Sweet cheese · semolina · syrup · pistachio crumbs...',
    price: 78,
    category: 'Desserts',
    image: D.kanafeh,
  },
];

export const BRANDS: Record<BrandKey, BrandInfo> = {
  Karaz: {
    key: 'Karaz',
    name: 'Karaz',
    cuisine: 'LEVANTINE · MEZZE & GRILL',
    tagline: 'Charcoal-grilled Levantine · family-run since 2019',
    rating: 4.7,
    ratingCount: '1.3k',
    priceLevel: '$$',
    tags: 'Mezze · Grills',
    color: '#BC1E3C',
    logo: dashboardImages.karazLogo,
    branch: 'Dubai Mall',
    distance: '0.8 km',
    address: 'Ground Floor · The Avenue',
    prepTime: 'Usually ready in 35–50 mins',
    categories: ['Most Ordered', 'Mezze', 'Grills', 'Desserts', 'Drinks'],
  },
  Jade: {
    key: 'Jade',
    name: 'Jade',
    cuisine: 'MODERN ARABIC · FINE DINING',
    tagline: 'Refined Arabic plates · crafted for the evening',
    rating: 4.8,
    ratingCount: '940',
    priceLevel: '$$$',
    tags: 'Mains · Mezze',
    color: '#1B4A55',
    logo: dashboardImages.jadeLogo,
    branch: 'Yas Island',
    distance: '12 km',
    address: 'Yas Mall · Ground Level',
    prepTime: 'Usually ready in 40–60 mins',
    categories: ['Most Ordered', 'Mezze', 'Mains', 'Desserts'],
  },
};

export const ITEMS_BY_BRAND: Record<BrandKey, MenuItem[]> = {
  Karaz: KARAZ_ITEMS,
  Jade: JADE_ITEMS,
};

export function itemsForCategory(brand: BrandKey, category: string): MenuItem[] {
  const items = ITEMS_BY_BRAND[brand];
  if (category === 'Most Ordered') {
    return items.filter(i => i.popular);
  }
  return items.filter(i => i.category === category);
}

export const ALL_ITEMS: MenuItem[] = [...KARAZ_ITEMS, ...JADE_ITEMS];

export function findItem(id: string): MenuItem | undefined {
  return ALL_ITEMS.find(i => i.id === id);
}
