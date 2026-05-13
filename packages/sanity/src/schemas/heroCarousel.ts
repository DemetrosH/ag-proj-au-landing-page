import { defineType, defineField } from "sanity";

export default defineType({
  name: "heroCarousel",
  title: "Hero Carousel",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Internal reference title",
    }),
    defineField({
      name: "items",
      title: "Carousel Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "productName",
              title: "Product Name",
              type: "string",
              description: "The exact name of the product to show",
            },
            {
              name: "rentmanId",
              title: "Rentman ID",
              type: "string",
              description: "The Rentman ID of the product (more reliable)",
            },
            {
              name: "label",
              title: "Highlight Label",
              type: "string",
              description: "e.g. 'Vedette', 'Nouveau', 'Populaire'",
              initialValue: "Vedette",
            },
          ],
          preview: {
            select: {
              title: "productName",
              subtitle: "rentmanId",
            },
          },
        },
      ],
    }),
  ],
});
