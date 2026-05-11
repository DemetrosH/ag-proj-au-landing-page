"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "../lib/sanity";

interface Division {
  title: string;
  description: string;
  image: any;
  link?: string;
  order: number;
}

const values = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "Expertise multidisciplinaire",
    description: "Une équipe polyvalente qui maîtrise l'archéologie, l'événementiel, la fabrication et le numérique.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Entreprise familiale",
    description: "Fondée en 2018, notre entreprise familiale cultive des relations de confiance et un engagement humain fort.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    title: "Ancrage local",
    description: "Enracinés au Québec, nous valorisons le patrimoine culturel local tout en déployant des projets d'envergure nationale.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Innovation constante",
    description: "Nous intégrons les dernières technologies — scan 3D, réalité augmentée — pour repousser les frontières du possible.",
  },
];

export default function EntrepriseContent({ divisions }: { divisions: Division[] }) {
  const stats = [
    { value: "2018", label: "Fondée en" },
    { value: "20+", label: "Professionnels" },
    { value: divisions.length.toString(), label: "Divisions" },
    { value: "100+", label: "Projets réalisés" },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative h-[70vh] min-h-[520px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('https://artefacturbain.ca/wp-content/uploads/2022/11/3P7A4098_openWith_DxO-1-1-1024x683.jpg')` }}
          />
          <div className="absolute inset-0 bg-brand-charcoal/65" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-cream/20" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-brand-gold font-semibold uppercase tracking-widest text-sm mb-4"
          >
            Depuis 2018
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
          >
            L'Entreprise
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed"
          >
            Entreprise familiale spécialisée dans la mise en valeur culturelle et patrimoniale — de la fouille archéologique à la scène événementielle.
          </motion.p>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-brand-charcoal py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="font-display text-4xl font-bold text-brand-gold mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-brand-gold font-semibold uppercase tracking-widest text-sm mb-4">
              Qui sommes-nous
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-charcoal mb-6 leading-tight">
              Artéfact Urbain,<br />
              <span className="text-brand-orange italic">créateurs d'expériences</span>
            </h2>
            <div className="w-16 h-1 bg-brand-gold rounded-full mb-8" />
            <div className="space-y-5 text-gray-600 text-lg leading-relaxed">
              <p>
                Entreprise familiale fondée en 2018, Artéfact Urbain se spécialise dans la réalisation de projets de mise en valeur culturelle et patrimoniale. Nous accompagnons nos clients à chaque étape — de la conception à la diffusion.
              </p>
              <p>
                Notre approche multidisciplinaire réunit archéologues, scénographes, fabricants, techniciens et créateurs numériques sous un même toit, permettant une cohérence unique de la vision à l'exécution.
              </p>
              <p>
                Basés à Saint-Marc-des-Carrières et à Québec, nous intervenons partout au Québec et au-delà pour donner vie à des projets ambitieux.
              </p>
            </div>
          </motion.div>

          {/* Image collage */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-56 rounded-2xl overflow-hidden relative">
                  <Image
                    src="https://artefacturbain.ca/wp-content/uploads/2022/11/3P7A4098_openWith_DxO-1-1-1024x683.jpg"
                    alt="Artéfact Urbain événement"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 20vw"
                  />
                </div>
                <div className="h-36 rounded-2xl overflow-hidden relative">
                  <Image
                    src="https://artefacturbain.ca/wp-content/uploads/2022/11/3P7A3990_DxO-1-1024x683.jpg"
                    alt="Artéfact Urbain fabrication"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 20vw"
                  />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="h-36 rounded-2xl overflow-hidden relative">
                  <Image
                    src="https://artefacturbain.ca/wp-content/uploads/2022/11/3P7A3934_DxO-2-768x512.jpg"
                    alt="Artéfact Urbain archéologie"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 20vw"
                  />
                </div>
                <div className="h-56 rounded-2xl overflow-hidden relative">
                  <Image
                    src="https://artefacturbain.ca/wp-content/uploads/2022/12/DSC01534-1024x683.jpg"
                    alt="Artéfact Urbain exposition"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 20vw"
                  />
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-brand-gold text-white rounded-2xl px-6 py-4 shadow-xl">
              <div className="font-display text-3xl font-bold">{divisions.length}</div>
              <div className="text-sm font-medium opacity-90">divisions</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-brand-gold font-semibold uppercase tracking-widest text-sm mb-3">Ce qui nous définit</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-charcoal mb-4">
              Nos valeurs
            </h2>
            <div className="w-16 h-1 bg-brand-gold rounded-full mx-auto" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-brand-gold hover:shadow-lg transition-all duration-300 bg-brand-cream"
              >
                <div className="text-brand-gold mb-5 group-hover:scale-110 transition-transform duration-300 inline-block">
                  {value.icon}
                </div>
                <h3 className="font-display text-xl font-bold text-brand-charcoal mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divisions (Nos Domaines d'Expertise) ── */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-brand-gold font-semibold uppercase tracking-widest text-sm mb-3">
            Notre écosystème
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brand-charcoal mb-4">
            Nos Domaines d'Expertise
          </h2>
          <div className="w-16 h-1 bg-brand-gold rounded-full mx-auto mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Des divisions complémentaires pour accompagner vos projets culturels et patrimoniaux de A à Z.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {divisions.map((division, index) => (
            <motion.a
              key={division.title}
              href={division.link}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="group relative h-96 rounded-2xl overflow-hidden bg-brand-charcoal shadow-md hover:shadow-2xl transition-all duration-300 block"
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
              <div className={`absolute inset-0 bg-gradient-to-t from-brand-charcoal/90 via-brand-charcoal/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300`} />

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="font-display text-2xl font-bold text-white mb-3 group-hover:text-brand-gold transition-colors duration-300">
                  {division.title}
                </h3>
                <div className="w-12 h-0.5 bg-brand-gold rounded-full mb-4 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                <p className="text-gray-300 text-base leading-relaxed opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75">
                  {division.description}
                </p>
                <div className="flex items-center gap-2 text-brand-gold text-sm font-semibold uppercase tracking-wider mt-5 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-150">
                  Explorer la division
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ── Team CTA ── */}
      <section className="py-24 bg-brand-charcoal relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url('https://artefacturbain.ca/wp-content/uploads/2022/11/3P7A4098_openWith_DxO-1-1-1024x683.jpg')` }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-brand-gold font-semibold uppercase tracking-widest text-sm mb-4">Les humains derrière le projet</p>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
              Rencontrez notre équipe
            </h2>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
              Vingt professionnels passionnés qui donnent vie à chaque projet avec rigueur, créativité et engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/equipe"
                className="inline-flex items-center gap-2 bg-brand-gold text-white px-8 py-4 rounded-full font-semibold hover:bg-brand-gold/90 transition-colors duration-200"
              >
                Voir l'équipe
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border border-white/30 text-white px-8 py-4 rounded-full font-semibold hover:border-brand-gold hover:text-brand-gold transition-colors duration-200"
              >
                Nous contacter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
