const RENTMAN_BASE_URL = 'https://api.rentman.net';
const RENTMAN_API_TOKEN = process.env.RENTMAN_API_TOKEN;

async function rentmanFetch(endpoint, options = {}) {
  const url = new URL(`${RENTMAN_BASE_URL}${endpoint}`);
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Authorization': `Bearer ${RENTMAN_API_TOKEN}`,
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  return response.json();
}

async function analyze() {
  if (!RENTMAN_API_TOKEN) {
    console.error('RENTMAN_API_TOKEN env var is required');
    process.exit(1);
  }

  console.log('Fetching all equipment...');
  let allItems = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await rentmanFetch('/equipment', { params: { limit, offset } });
    const items = response.data || response;
    if (!Array.isArray(items) || items.length === 0) break;
    allItems = allItems.concat(items);
    if (items.length < limit) break;
    offset += limit;
  }

  console.log(`Total items retrieved: ${allItems.length}`);

  const keywords = {
    'Alimentaire': ['slush', 'popcorn', 'barbe', 'café', 'nourriture', 'yogourt'],
    'Chapiteaux': ['tente', 'chapiteau', 'abri', 'canopy'],
    'Sonorisation': ['haut-parleur', 'speaker', 'micro', 'audio', 'son', 'mixeur', 'console'],
    'Éclairage': ['eclairage', 'luminaire', 'led', 'spot', 'par', 'projecteur', 'lumière'],
    'Vidéo': ['télé', 'tv', 'moniteur', 'écran', 'projecteur', 'hdmi', 'vidéo'],
    'Électrique': ['câble', 'cable', 'extension', 'rallonge', 'prise', 'power', 'electrique'],
    'Ameublements': ['chaise', 'table', 'banc', 'mobilier', 'meuble'],
    'Jeux': ['jeu', 'game', 'puzzle', 'jouet'],
    'Poids/Supports': ['poids', 'lest', 'support', 'chariot', 'base'],
  };

  const matches = {};
  Object.keys(keywords).forEach(cat => matches[cat] = []);

  allItems.forEach(item => {
    const name = item.name.toLowerCase();
    Object.entries(keywords).forEach(([cat, keys]) => {
      if (keys.some(k => name.includes(k))) {
        matches[cat].push(item.name);
      }
    });
  });

  console.log('\n--- Keyword Category Analysis ---');
  Object.entries(matches).forEach(([cat, list]) => {
    console.log(`${cat}: ${list.length} matches | Examples: ${list.slice(0, 5).join(', ')}`);
  });

  // Check tags for specific categories
  const tagCategories = ['location a', 'location b', 'location c'];
  tagCategories.forEach(tag => {
    const list = allItems.filter(item => item.tags && item.tags.includes(tag)).map(item => item.name);
    console.log(`\nTag "${tag}": ${list.length} items | Examples: ${list.slice(0, 5).join(', ')}`);
  });
}

analyze().catch(console.error);
