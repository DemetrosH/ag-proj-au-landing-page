import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables IMMEDIATELY before any other imports
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Now we can import the libs that depend on process.env
const { getHomeCategories } = await import('../lib/rentman.js');
const { client } = await import('../lib/sanity.js');

const featuredProductKeywords: Record<string, string[]> = {
  "alimentaire": ["papa", "slush", "popcorn", "hot dog"],
  "chapiteaux": ["10x10", "mur", "photo", "poids"],
  "mobilier": ["table", "chaise", "tabouret", "mange"],
  "ameublement": ["table", "chaise", "tabouret", "mange"],
  "equipements electriques": ["passe", "rallonge", "panneau", "generatrice"],
  "sonorisation": ["qsc", "micro", "pied", "console"],
  "enseigne neon": ["tatou", "bonbon", "neon", "enseigne"],
  "video": ["tv", "ecran", "trepied", "projecteur"],
  "scene": ["praticable", "marche", "jupe", "garde"],
  "eclairage": ["led", "trepied", "lumiere", "dmx"],
  "signaletique": ["potelet", "corde", "chevalet", "panneau"],
  "jeux": ["hache", "cornhole", "geant", "puissance"],
  "blocs d'alimentation": ["ecoflow", "jackery", "batterie", "power"],
  "batteries": ["ecoflow", "jackery", "batterie", "power"],
  "poids": ["base", "pe30", "poids", "sable"],
  "supports": ["base", "pe30", "poids", "sable"]
};

const categoryOrder = [
  "alimentaire",
  "chapiteaux",
  "ameublement",
  "mobilier",
  "equipements electriques",
  "sonorisation",
  "enseigne neon",
  "video",
  "scene",
  "eclairage",
  "signaletique",
  "jeux",
  "blocs d'alimentation",
  "batteries",
  "poids",
  "supports"
];

async function migrate() {
  console.log('🚀 Starting migration to Sanity...');
  
  if (!process.env.RENTMAN_API_TOKEN) {
    console.error('❌ ERROR: RENTMAN_API_TOKEN is missing!');
    process.exit(1);
  }

  try {
    const categories = await getHomeCategories();
    console.log(`📦 Found ${categories.length} categories in Rentman.`);

    for (const category of categories) {
      const normalizedCatName = category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      
      let keywords: string[] = [];
      let orderIndex = 999;

      for (const [key, kw] of Object.entries(featuredProductKeywords)) {
        if (normalizedCatName.includes(key) || key.includes(normalizedCatName)) {
          keywords = kw;
          break;
        }
      }

      const foundOrder = categoryOrder.findIndex(key => normalizedCatName.includes(key) || key.includes(normalizedCatName));
      if (foundOrder !== -1) orderIndex = foundOrder;

      // Find products
      const availableProducts = [...(category.products || [])];
      const featuredProducts: any[] = [];

      keywords.forEach((kw) => {
        if (featuredProducts.length >= 4) return;
        const matchIndex = availableProducts.findIndex(p => 
          p.name.toLowerCase().includes(kw) || 
          p.slug.toLowerCase().includes(kw)
        );
        if (matchIndex !== -1) {
          const p = availableProducts[matchIndex];
          featuredProducts.push({
            _key: Math.random().toString(36).substring(7),
            name: p.name,
            slug: p.slug
          });
          availableProducts.splice(matchIndex, 1);
        }
      });

      // Fill remaining
      while (featuredProducts.length < 4 && availableProducts.length > 0) {
        const p = availableProducts.shift()!;
        featuredProducts.push({
          _key: Math.random().toString(36).substring(7),
          name: p.name,
          slug: p.slug
        });
      }

      const doc = {
        _type: 'categoryConfig',
        _id: `category-config-${category.slug}`,
        rentmanId: category.slug,
        title: category.name,
        description: category.description || `Équipement professionnel de ${category.name.toLowerCase()} pour vos événements de toutes tailles.`,
        featuredProducts,
        order: orderIndex
      };

      console.log(`📝 Creating/Updating config for: ${category.name}...`);
      await client.createOrReplace(doc);
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrate();
