import React from 'react';
import { getProductById } from '../../../lib/rentman';
import { Header } from '../../../components/Header';
import { ProductDetails } from '../../../components/ProductDetails';

import { getUserRole } from '../../../lib/auth';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = await getUserRole();
  const product = await getProductById(id, role);

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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <ProductDetails product={product} />
      </main>
    </div>
  );
}
