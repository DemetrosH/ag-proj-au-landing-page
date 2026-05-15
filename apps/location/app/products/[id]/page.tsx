import { getProductById, getAccessories } from '../../../lib/rentman';
import { Header } from '../../../components/Header';
import { ProductDetails } from '../../../components/ProductDetails';
import { Footer } from '../../../components/Footer';
import { getUserRole } from '../../../lib/auth';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const role = await getUserRole();
  const product = await getProductById(id, role);

  if (!product) return { title: 'Produit non trouvé' };

  const title = product.seo_title || `${product.name} | Artéfact Urbain Location`;
  const description = product.seo_description || product.description?.substring(0, 160);
  const image = product.og_image || product.image;

  return {
    title,
    description,
    keywords: product.seo_keywords,
    alternates: {
      canonical: product.canonical_url,
    },
    robots: {
      index: !product.no_index,
      follow: !product.no_index,
    },
    openGraph: {
      title,
      description,
      images: [image],
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = await getUserRole();
  
  // Fetch product and accessories in parallel
  const [product, accessories] = await Promise.all([
    getProductById(id, role),
    getAccessories(id, role)
  ]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Produit non trouvé</h1>
          <p className="text-gray-500 mt-4">Désolé, nous n'avons pas pu trouver cet article.</p>
        </div>
      </div>
    );
  }

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    sku: product.product_sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.product_brand || 'Artéfact Urbain',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'CAD',
      availability: product.stock_level && product.stock_level > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: `https://artefacturbain.ca/location/products/${product.id}`,
    },
  };

  // Attach accessories to product object
  const productWithAccessories = {
    ...product,
    accessories
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Add JSON-LD to head */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <main className="container mx-auto px-4 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] 5xl:max-w-[3200px] py-16">
        <ProductDetails product={productWithAccessories} />
      </main>
      <Footer />
    </div>
  );
}
