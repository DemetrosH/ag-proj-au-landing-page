import { getFilesLookup, mapRentmanToProduct, rentmanFetchAll } from './apps/location/lib/rentman.ts';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env from apps/location/.env.local
const envPath = path.resolve('apps/location/.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

async function run() {
  console.log('Fetching files lookup...');
  const filesLookup = await getFilesLookup();
  
  console.log('Fetching equipment...');
  const allEquipment = await rentmanFetchAll('/equipment');
  
  const item = allEquipment.find(i => i.name.includes('Support ordinateur portable'));
  if (!item) {
    console.log('Item not found');
    return;
  }
  
  console.log('Mapping item...');
  const product = mapRentmanToProduct(item, 'test-cat', filesLookup);
  
  console.log(`Product Name: ${product.name}`);
  console.log(`Resolved Image: ${product.image}`);
  
  if (product.image) {
    console.log('SUCCESS: Image was resolved via fallback mapping!');
  } else {
    console.log('FAILURE: Image was not resolved.');
  }
}

run();
