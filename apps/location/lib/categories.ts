export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  visibility: 'public' | 'internal';
}

export const CATEGORIES: Category[] = [
  {
    id: 'alimentaire',
    name: 'Alimentaire',
    slug: 'alimentaire',
    description: 'Machines à barbe à papa, popcorn, glace et plus pour vos événements gourmands.',
    visibility: 'public',
  },
  {
    id: 'chapiteaux',
    name: 'Chapiteaux',
    slug: 'chapiteaux',
    description: 'Tentes pliantes, baldaquins et abris pour protéger vos invités en extérieur.',
    visibility: 'public',
  },
  {
    id: 'sonorisation',
    name: 'Sonorisation',
    slug: 'sonorisation',
    description: 'Microphones, enceintes, consoles de mixage et systèmes audio complets.',
    visibility: 'public',
  },
  {
    id: 'eclairage',
    name: 'Éclairage',
    slug: 'eclairage',
    description: 'Projecteurs LED, éclairage d\'ambiance, lampes vintage et solutions lumineuses.',
    visibility: 'public',
  },
  {
    id: 'ameublements',
    name: 'Ameublements',
    slug: 'ameublements',
    description: 'Tables pliantes, chaises adirondack et mobilier pratique pour vos sites.',
    visibility: 'public',
  },
  {
    id: 'electrique',
    name: 'Rallonges & multiprises',
    slug: 'equipements-electriques',
    description: 'Câblage, rallonges, générateurs et solutions de distribution électrique.',
    visibility: 'public',
  },
  {
    id: 'neon',
    name: 'Enseigne Néon',
    slug: 'enseigne-neon',
    description: 'Illuminez vos événements avec nos créations et enseignes néon sur mesure.',
    visibility: 'public',
  },
  {
    id: 'video',
    name: 'Vidéo',
    slug: 'video',
    description: 'Téléviseurs, projecteurs HD et écrans pour vos présentations et diffusions.',
    visibility: 'public',
  },
  {
    id: 'scene',
    name: 'Scène',
    slug: 'location-scene',
    description: 'Plateformes portatives, machines à brume et structures de scène.',
    visibility: 'public',
  },
  {
    id: 'signaletique',
    name: 'Signalétique',
    slug: 'signaletique',
    description: 'Barrières de sécurité, signalisation et éléments de guidage pour vos foules.',
    visibility: 'public',
  },
  {
    id: 'jeux',
    name: 'Jeux',
    slug: 'jeux',
    description: 'Jeux géants, cibles lumineuses et activités ludiques pour petits et grands.',
    visibility: 'public',
  },
  {
    id: 'energie',
    name: 'Blocs d’alimentation & batteries',
    slug: 'bloc-dalimentation-batteries',
    description: 'Générateurs portables et batteries pour une autonomie énergétique totale.',
    visibility: 'public',
  },
  {
    id: 'poids',
    name: 'Poids & Supports',
    slug: 'poids-support',
    description: 'Chariots, supports muraux et lests de stabilisation pour vos structures.',
    visibility: 'public',
  },
  // Internal Categories (to be tackled later)
  {
    id: 'internal-1',
    name: 'Maintenance & Réparation',
    slug: 'maintenance-reparation',
    description: 'Outils et pièces pour l\'entretien interne.',
    visibility: 'internal',
  },
  {
    id: 'internal-2',
    name: 'Consommables Bureau',
    slug: 'consommables-bureau',
    description: 'Matériel de bureau pour l\'équipe de location.',
    visibility: 'internal',
  },
  {
    id: 'internal-3',
    name: 'Archives & Documentation',
    slug: 'archives-documentation',
    description: 'Documents techniques et historiques de maintenance.',
    visibility: 'internal',
  },
  {
    id: 'internal-4',
    name: 'Stockage Longue Durée',
    slug: 'stockage-longue-duree',
    description: 'Équipements en attente de déclassement ou réparation majeure.',
    visibility: 'internal',
  },
];

export function getPublicCategories() {
  return CATEGORIES.filter(cat => cat.visibility === 'public');
}

export function getAllCategories() {
  return CATEGORIES;
}
