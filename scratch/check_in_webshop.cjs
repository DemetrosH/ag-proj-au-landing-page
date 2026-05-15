const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../apps/location/.env.local') });

async function checkInWebshopField() {
  const token = process.env.RENTMAN_API_TOKEN;
  if (!token) return;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  };

  // Get products that are in_shop
  const productsRes = await fetch('https://api.rentman.net/equipment?in_shop=true&limit=10', { headers });
  const productsResult = await productsRes.json();
  const products = productsResult.data || productsResult;

  if (Array.isArray(products)) {
    for (const product of products) {
        const filesRes = await fetch(`https://api.rentman.net/files?item=${product.id}&itemtype=Materiaal`, { headers });
        const filesResult = await filesRes.json();
        const files = filesResult.data || filesResult;

        if (Array.isArray(files)) {
            files.forEach(f => {
                if (f.in_webshop) {
                    console.log(`Product: ${product.name}, File: ${f.displayname}, in_webshop: ${f.in_webshop}`);
                }
            });
        }
    }
  }
}

checkInWebshopField();
