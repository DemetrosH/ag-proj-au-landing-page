import { defineField, defineType } from "sanity";

export default defineType({
  name: "categoryConfig",
  title: "Configuration des Catégories (Location)",
  type: "document",
  fields: [
    defineField({
      name: "rentmanId",
      title: "Identifiant Rentman (ID ou Slug)",
      description: "Doit correspondre au slug de la catégorie dans Rentman pour faire le lien.",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Titre d'affichage",
      description: "Remplace le nom par défaut de la catégorie.",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description personnalisée",
      description: "Remplace la description par défaut.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "featuredProducts",
      title: "Produits Vedettes (Grid 2x2)",
      description: "Ajoutez exactement 4 produits pour remplir la grille. S'il y en a moins, le système complétera avec les produits Rentman.",
      type: "array",
      of: [
        {
          type: "object",
          name: "featuredProduct",
          fields: [
            { name: "name", title: "Nom du produit", type: "string" },
            { name: "slug", title: "Identifiant / Slug Rentman", type: "string" },
            { 
              name: "image", 
              title: "Image personnalisée (Optionnel)", 
              description: "Si laissé vide, l'image sera récupérée de Rentman.",
              type: "image",
              options: { hotspot: true }
            },
          ],
        },
      ],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: "order",
      title: "Ordre d'affichage",
      type: "number",
    }),
    defineField({
      name: "orderedProducts",
      title: "Ordre personnalisé des produits",
      description: "Ajoutez les identifiants / slugs Rentman dans l'ordre souhaité pour l'affichage dans la page catégorie. Les produits non spécifiés apparaîtront après.",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "rentmanId",
    },
    prepare({ title, subtitle }) {
      return {
        title: title || subtitle,
        subtitle: subtitle,
      };
    },
  },
});
