const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../apps/location/.env.local') });

async function inspectRentmanFileKeys() {
  const token = process.env.RENTMAN_API_TOKEN;
  if (!token) return;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
  };

  const filesRes = await fetch(`https://api.rentman.net/files?limit=10`, { headers });
  const filesResult = await filesRes.json();
  const files = filesResult.data || filesResult;

  if (Array.isArray(files) && files.length > 0) {
    console.log('Fields in a File object:');
    console.log(Object.keys(files[0]).sort());
    
    // Check if any field contains "web" or "shop" or "app" or "display"
    const allKeys = Object.keys(files[0]);
    const interestingKeys = allKeys.filter(k => /web|shop|app|display|show|visible/i.test(k));
    console.log('\nInteresting keys:', interestingKeys);

    // Also check if there are custom fields
    if (files[0].custom_fields) {
        console.log('\nCustom fields keys:', Object.keys(files[0].custom_fields));
    }
    
    // Print values for these interesting keys for all 10 files
    files.forEach(f => {
        const values = {};
        interestingKeys.forEach(k => values[k] = f[k]);
        console.log(`\nFile: ${f.name}`);
        console.log(values);
    });
  }
}

inspectRentmanFileKeys();
