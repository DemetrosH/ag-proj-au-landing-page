'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface CategorySEOContentProps {
  slug: string;
}

export function CategorySEOContent({ slug }: CategorySEOContentProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Content map for different categories
  const contentMap: Record<string, React.ReactNode> = {
    'chapiteaux': (
      <div className="py-8 prose prose-brand max-w-4xl text-gray-600">
        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-6">
          Location de Chapiteaux et Pop-up Tents pour vos Événements
        </h2>
        <p>
          Vous organisez un festival, un marché public ou un événement corporatif ? <span className="font-bold text-brand-dark">Artéfact urbain</span> vous propose une sélection de solutions d’abris professionnels alliant style et robustesse. Que vous ayez besoin d’une structure classique ou d’une solution rapide à installer, notre inventaire saura répondre à vos exigences.
        </p>

        <h3 className="text-xl font-bold text-brand-dark mb-4 mt-8">Pourquoi choisir nos modèles ?</h3>
        <p>
          L’installation de votre espace ne devrait jamais être un casse-tête. C’est pourquoi nous misons sur la polyvalence de la <span className="font-bold text-brand-dark">pop-up tent</span> (tente pliante). Appréciée pour sa légèreté et sa facilité de montage, la <span className="font-bold text-brand-dark">pop-up tent</span> est l’alliée indispensable des exposants et des organisateurs d’événements extérieurs.
        </p>

        <ul className="space-y-3 mt-6 list-none p-0">
          <li className="flex gap-2">
            <span className="text-brand-orange mt-1">●</span>
            <span><span className="font-bold text-brand-dark uppercase text-xs tracking-wider">Format standard :</span> Nos modèles 10 x 10 pi sont disponibles en plusieurs coloris (rouge, vert, bleu ou noir) pour s’agencer parfaitement à votre image de marque.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-brand-orange mt-1">●</span>
            <span><span className="font-bold text-brand-dark uppercase text-xs tracking-wider">Grand format :</span> Pour plus d’espace, optez pour notre modèle 10 x 20 pi.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-brand-orange mt-1">●</span>
            <span><span className="font-bold text-brand-dark uppercase text-xs tracking-wider">Spécialisé :</span> Nous offrons même une unité 5 x 5 pi idéale pour un photobooth ou un point d’accueil restreint.</span>
          </li>
        </ul>

        <h3 className="text-xl font-bold text-brand-dark mb-4 mt-8">Accessoires et Personnalisation</h3>
        <p>
          Pour une protection maximale contre les intempéries ou pour créer une zone d’intimité, nous proposons des murs pleins et des demi-murs assortis. La sécurité étant primordiale, n’oubliez pas d’ajouter nos poids en disque ou nos sacs de sable pour stabiliser votre structure, peu importe la surface au sol.
        </p>

        <p className="mt-8 font-medium italic border-l-4 border-brand-orange pl-6 py-2 bg-brand-orange/5">
          Faites confiance à l’expertise d’Artéfact Urbain pour une location simple, efficace et professionnelle. Contactez-nous dès aujourd’hui pour réserver votre équipement !
        </p>
      </div>
    ),
    'scene': (
      <div className="py-8 prose prose-brand max-w-4xl text-gray-600">
        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-6">
          Solutions de location de scène à Québec
        </h2>
        <p>
          Vous organisez un festival, un spectacle ou un événement corporatif ? <span className="font-bold text-brand-dark">Artéfact Urbain</span> propose un inventaire complet dédié à la <span className="font-bold text-brand-dark">location de scène</span> et de structures techniques. Que vous ayez besoin d’une <span className="font-bold text-brand-dark">scène portative</span> facile à installer, d’un podium surélevé ou d’une infrastructure robuste pour un événement de grande envergure, nous fournissons l’équipement professionnel adapté à vos besoins techniques.
        </p>

        <h3 className="text-xl font-bold text-brand-dark mb-4 mt-8">Équipement de scène et structures Truss</h3>
        <p>
          Notre offre ne se limite pas aux plateformes. Pour assurer la sécurité et l’esthétique de votre installation, nous louons également :
        </p>

        <ul className="space-y-3 mt-6 list-none p-0 text-sm">
          <li className="flex gap-3">
            <span className="text-brand-orange mt-1">●</span>
            <span>Des <span className="font-bold text-brand-dark uppercase text-[10px] tracking-wider">garde-corps</span> et marches pour scènes portatives.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-brand-orange mt-1">●</span>
            <span>Des structures <span className="font-bold text-brand-dark uppercase text-[10px] tracking-wider">Box Truss</span> en aluminium pour l’accrochage d’éclairage ou de décors.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-brand-orange mt-1">●</span>
            <span>Des habillages de scène (jupes et rideaux de scène).</span>
          </li>
          <li className="flex gap-3">
            <span className="text-brand-orange mt-1">●</span>
            <span>Des effets spéciaux comme <span className="font-bold text-brand-dark uppercase text-[10px] tracking-wider">des machines à brume</span> et à fumée pour dynamiser vos présentations.</span>
          </li>
        </ul>

        <p className="mt-8 font-medium italic border-l-4 border-brand-orange pl-6 py-2 bg-brand-orange/5">
          Basés à Saint-Marc-des-Carrières, nous desservons la grande région de <span className="font-bold text-brand-dark">Québec</span> et ses environs. Faites confiance à notre expertise technique pour transformer votre espace en un lieu de performance professionnel.
        </p>
      </div>
    )
  };

  if (!contentMap[slug]) return null;

  return (
    <div className="mt-4 pt-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-orange transition-colors group uppercase tracking-widest"
      >
        <span>En savoir plus...</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-500 ${isOpen ? 'rotate-180 text-brand-orange' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            {contentMap[slug]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
