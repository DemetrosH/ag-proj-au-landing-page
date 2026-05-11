import { createClient } from "@sanity/client";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: "2023-05-03",
});

const divisions = [
  {
    title: "Production d'événements",
    description: "Conception technique et réalisation de projets culturels sur mesure.",
    imageUrl: "https://artefacturbain.ca/wp-content/uploads/2022/11/3P7A4098_openWith_DxO-1-1-1024x683.jpg",
    link: "https://evenements.artefacturbain.ca",
    order: 1,
  },
  {
    title: "Archéologie",
    description: "Recherche archéologique précise grâce à nos méthodologies et aux nouvelles technologies.",
    imageUrl: "https://artefacturbain.ca/wp-content/uploads/2022/11/3P7A3934_DxO-2-768x512.jpg",
    link: "https://archeologie.artefacturbain.ca",
    order: 2,
  },
  {
    title: "Accompagnement culturel",
    description: "Conseil stratégique et soutien technique pour vos projets patrimoniaux.",
    imageUrl: "https://artefacturbain.ca/wp-content/uploads/2022/11/3P7A4098_openWith_DxO-1-1-1024x683.jpg",
    link: "https://accompagnement.artefacturbain.ca",
    order: 3,
  },
  {
    title: "Fabrication",
    description: "Votre atelier complet pour la conception et la réalisation technique d'éléments uniques.",
    imageUrl: "https://artefacturbain.ca/wp-content/uploads/2022/11/3P7A3934_DxO-2-768x512.jpg",
    link: "https://fabrication.artefacturbain.ca",
    order: 4,
  },
  {
    title: "Conception Web & Solutions 3D",
    description: "Solutions de web design et outils numériques innovants pour la conservation.",
    imageUrl: "https://artefacturbain.ca/wp-content/uploads/2022/11/3P7A4098_openWith_DxO-1-1-1024x683.jpg",
    link: "https://conception.artefacturbain.ca",
    order: 5,
  },
  {
    title: "Location",
    description: "Équipements spécialisés pour la réussite technique et visuelle de vos événements.",
    imageUrl: "https://artefacturbain.ca/wp-content/uploads/2022/11/3P7A3934_DxO-2-768x512.jpg",
    link: "https://location.artefacturbain.ca",
    order: 6,
  },
];

async function migrate() {
  console.log("Clearing existing divisions...");
  const existing = await client.fetch('*[_type == "division"]{_id}');
  for (const doc of existing) {
    await client.delete(doc._id);
  }

  console.log("Starting division migration (6 items)...");

  for (const div of divisions) {
    try {
      console.log(`Migrating: ${div.title}`);
      
      const response = await fetch(div.imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const asset = await client.assets.upload("image", buffer, {
        filename: `${div.title.toLowerCase().replace(/\s+/g, "-")}.jpg`,
      });

      const doc = {
        _type: "division",
        title: div.title,
        slug: {
          _type: "slug",
          current: div.title.toLowerCase().replace(/\s+/g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        },
        description: div.description,
        link: div.link,
        order: div.order,
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
        },
      };

      await client.create(doc);
      console.log(`Successfully created: ${div.title}`);
    } catch (error) {
      console.error(`Error migrating ${div.title}:`, error);
    }
  }

  console.log("Migration finished!");
}

migrate();
