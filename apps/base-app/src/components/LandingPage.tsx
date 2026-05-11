"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@repo/ui/button";
import { urlFor } from "../lib/sanity";

interface Division {
  _id: string;
  title: string;
  description: string;
  image: any;
  imageUrl: string;
  link: string;
}

interface LandingPageProps {
  divisions: Division[];
}

export default function LandingPage({ divisions }: LandingPageProps) {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('https://artefacturbain.ca/wp-content/uploads/2022/11/3P7A4098_openWith_DxO-1-1-1024x683.jpg')` }}
          />
          <div className="absolute inset-0 bg-brand-charcoal/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-cream via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Créateurs d'expériences. <br />
            <span className="text-brand-gold italic">De la fouille à la scène.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto"
          >
            Artéfact urbain est un partenaire de confiance spécialisé dans la conception technique et la réalisation de projets culturels sur mesure.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              size="lg"
              className="text-lg px-8 py-4"
              onClick={() => {
                document.getElementById('divisions')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Découvrir nos divisions
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Gateway Grid Section */}
      <section id="divisions" className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-charcoal mb-4">
            Nos Domaines d'Expertise
          </h2>
          <div className="brand-line w-24 mx-auto mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explorez nos différentes divisions dédiées à la mise en valeur du patrimoine et à la production événementielle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {divisions.map((division, index) => (
            <motion.a
              key={division._id}
              href={division.link}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative h-96 rounded-2xl overflow-hidden bg-brand-charcoal shadow-lg hover:shadow-2xl transition-all duration-300 block"
            >
              {/* Background Image */}
              {division.image && (
                <Image
                  src={urlFor(division.image).width(800).height(1000).url()}
                  alt={division.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/90 via-brand-charcoal/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end transform transition-transform duration-300">
                <h3 className="font-display text-2xl font-bold text-white mb-2 group-hover:text-brand-gold transition-colors">
                  {division.title}
                </h3>
                <div className="brand-line w-12 mb-4 origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                <p className="text-gray-200 text-sm mb-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
                  {division.description}
                </p>
                <div className="flex items-center text-brand-gold font-medium text-sm uppercase tracking-wider opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-200">
                  Visiter le portail
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>
    </>
  );
}
