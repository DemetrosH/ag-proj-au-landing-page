import { createClient as createSupabaseServerClient } from './supabase/server';
import { client as sanityClient } from './sanity';

export interface HeroProduct {
  id: string;
  name: string;
  rentman_id?: string;
  image_url?: string;
  price?: number;
  heroLabel?: string;
  categories?: {
    name: string;
    slug: string;
  };
}

export async function getHeroProducts(): Promise<HeroProduct[]> {
  // 0. Default Fallback List (Always ready)
  const fallbackItems = [
    { name: "Machine à popcorn commerciale 12 Oz", rentmanId: "8035", label: "Populaire" },
    { name: "Machine à slush (simple)", rentmanId: "5459", label: "Nouveauté" },
    { name: "Chapiteau 10 x 10 pi, rouge et blanc ", rentmanId: "1519", label: "Essentiel" },
    { name: "KIT - Prise de parole (2 caisses de son, 2 pieds pour caisse de son, 1 micro, 1 pied de micro, console)", rentmanId: "1610", label: "Pro Audio" },
    { name: "Scène portative – 48 x 48 po (stage)", rentmanId: "4766", label: "Structure" },
    { name: "Jeux de lancer de haches et fléchettes", rentmanId: "8034", label: "Animation" }
  ];

  try {
    // 1. Fetch Carousel Config from Sanity
    let productsToFetch = fallbackItems;
    
    try {
      const sanityConfig = await sanityClient.fetch(`*[_type == "heroCarousel"][0]`);
      if (sanityConfig?.items?.length > 0) {
        productsToFetch = sanityConfig.items;
      }
    } catch (sErr) {
      console.warn("Server: Sanity fetch failed, using fallbacks:", sErr);
    }
    
    // 2. Fetch from Supabase with Category Data
    const rentmanIds = productsToFetch.map(item => item.rentmanId).filter(Boolean);
    const supabase = await createSupabaseServerClient();
    
    const { data: supabaseData, error } = await supabase
      .from('products')
      .select('*, categories (name, slug)')
      .in('rentman_id', rentmanIds);

    if (error) {
      console.error("Server: Supabase Error in getHeroProducts:", error);
    }

    if (supabaseData && supabaseData.length > 0) {
      // Map back to include labels and maintain order
      const finalProducts = productsToFetch.map(item => {
        const match = supabaseData.find(p => p.rentman_id === item.rentmanId);
        return match ? { ...match, heroLabel: item.label || 'Vedette' } : null;
      }).filter(Boolean) as HeroProduct[];

      return finalProducts;
    } else {
      console.warn("Server: Supabase returned no data, using emergency fallback");
      const { data: emergencyData } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .limit(6);
      return (emergencyData || []) as HeroProduct[];
    }
  } catch (err) {
    console.error("Server: getHeroProducts error:", err);
    return [];
  }
}
