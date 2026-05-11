export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  price: number;
  description: string;
  image: string;
  features: string[];
}

export const MOCK_PRODUCTS: Product[] = [
  // Alimentaire
  {
    id: 'prod-1',
    name: 'Machine à Barbe à Papa Professionnelle',
    slug: 'machine-barbe-a-papa',
    categoryId: 'alimentaire',
    price: 75,
    description: 'Créez une ambiance de fête foraine avec notre machine haute performance.',
    image: '/mock/popcorn.png',
    features: ['Production rapide', 'Facile à utiliser', 'Fournie avec dôme de protection'],
  },
  {
    id: 'prod-2',
    name: 'Machine à Popcorn Vintage',
    slug: 'machine-popcorn',
    categoryId: 'alimentaire',
    price: 65,
    description: 'Le goût authentique du cinéma pour vos événements.',
    image: '/mock/popcorn.png',
    features: ['Style rétro', 'Arôme irrésistible', 'Kit de démarrage inclus'],
  },
  // Chapiteaux
  {
    id: 'prod-3',
    name: 'Tente Pop-Up 10x10 Blanche',
    slug: 'tente-10x10',
    categoryId: 'chapiteaux',
    price: 120,
    description: 'Protection rapide et élégante contre le soleil et la pluie légère.',
    image: '/mock/tent.png',
    features: ['Installation 60 secondes', 'Qualité commerciale', 'Murs optionnels'],
  },
  {
    id: 'prod-4',
    name: 'Chapiteau Élégance 20x20',
    slug: 'chapiteau-20x20',
    categoryId: 'chapiteaux',
    price: 450,
    description: 'Parfait pour les mariages et réceptions de taille moyenne.',
    image: '/mock/tent.png',
    features: ['Look premium', 'Structure robuste', 'Installation par notre équipe'],
  },
  // Add more as needed...
];

export function getProductsByCategory(categoryId: string) {
  return MOCK_PRODUCTS.filter(p => p.categoryId === categoryId);
}

export function getProductBySlug(slug: string) {
  return MOCK_PRODUCTS.find(p => p.slug === slug);
}
