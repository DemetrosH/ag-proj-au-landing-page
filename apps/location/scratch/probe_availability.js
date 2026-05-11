const RENTMAN_BASE_URL = 'https://api.rentman.net';
const RENTMAN_API_TOKEN = process.env.RENTMAN_API_TOKEN;

async function probe(endpoint) {
  console.log(`Probing ${endpoint}...`);
  try {
    const response = await fetch(`${RENTMAN_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${RENTMAN_API_TOKEN}`,
        'Accept': 'application/json',
      },
    });
    console.log(`Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log('Response sample:', JSON.stringify(data, null, 2).slice(0, 500));
    } else {
      const text = await response.text();
      console.log('Error body:', text.slice(0, 200));
    }
  } catch (e) {
    console.error(`Error: ${e.message}`);
  }
}

async function main() {
  const id = '1332';
  const start = '2026-06-01';
  const end = '2026-06-05';
  
  await probe(`/equipment/${id}/availability`);
  await probe(`/equipment/${id}/availability?start=${start}&end=${end}`);
  await probe(`/equipment/availability?equipment=${id}&start=${start}&end=${end}`);
  await probe(`/equipment/availability?id=${id}&from=${start}&until=${end}`);
}

main();
