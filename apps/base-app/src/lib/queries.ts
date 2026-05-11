import { client } from "./sanity";

export async function getProjects() {
  return await client.fetch(`*[_type == "project"] {
    _id,
    title,
    "slug": slug.current,
    division,
    "imageUrl": mainImage.asset->url,
    publishedAt,
    body
  }`);
}

export async function getTeamMembers() {
  return await client.fetch(`*[_type == "teamMember"] | order(order asc) {
    _id,
    name,
    role,
    "imageUrl": image.asset->url,
    bio,
    department,
    email,
    order,
    externalImageUrl
  }`);
}
export async function getDivisions() {
  return await client.fetch(`*[_type == "division"] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    description,
    image,
    "imageUrl": image.asset->url,
    link,
    order
  }`);
}
