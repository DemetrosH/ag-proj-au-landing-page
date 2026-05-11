'use client';

import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import { Mail } from 'lucide-react';

interface TeamMember {
  _id: string;
  name: string;
  role?: string;
  imageUrl?: string;
  externalImageUrl?: string;
  department?: string;
  email?: string;
}

interface EquipePageProps {
  members: TeamMember[];
}

const departmentTitles: Record<string, string> = {
  administration: 'Administration',
  archeologie: 'Archéologie',
  accompagnement: 'Accompagnement Culturel',
  evenementiel: 'Événementiel',
  numerique: 'Numérique',
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export default function EquipePage({ members }: EquipePageProps) {
  // Group members by department
  const groupedMembers = members.reduce((acc, member) => {
    const dept = member.department || 'other';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  // Department order
  const departmentOrder = [
    'administration',
    'archeologie',
    'accompagnement',
    'evenementiel',
    'numerique',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-20"
      >
        <h1 className="font-display text-5xl md:text-7xl font-bold text-brand-charcoal mb-6">
          Notre Équipe
        </h1>
        <div className="brand-line w-24 mx-auto mb-8 h-1.5 bg-brand-gold rounded-full" />
        <p className="max-w-2xl mx-auto text-lg text-gray-600 font-sans leading-relaxed">
          Une équipe multidisciplinaire passionnée par le patrimoine, l'innovation et la création d'expériences uniques.
        </p>
      </motion.div>

      {departmentOrder.map((dept) => {
        const deptMembers = groupedMembers[dept];
        if (!deptMembers || deptMembers.length === 0) return null;

        return (
          <section key={dept} className="mb-24">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-6 mb-12"
            >
              <h2 className="font-display text-3xl font-bold text-brand-charcoal">
                {departmentTitles[dept] || dept}
              </h2>
              <div className="flex-grow h-px bg-gray-200" />
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {deptMembers.map((member) => (
                <motion.div
                  key={member._id}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="aspect-[4/5] relative overflow-hidden bg-brand-cream-dark">
                    <Image
                      src={member.imageUrl || member.externalImageUrl || '/placeholder-avatar.jpg'}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-2 text-white text-sm font-medium hover:text-brand-gold transition-colors"
                        >
                          <Mail size={16} />
                          {member.email}
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-brand-charcoal mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-brand-orange font-semibold tracking-wide uppercase">
                      {member.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>
        );
      })}
    </div>
  );
}
