import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../apps/location/.env.local') });

const RENTMAN_API_TOKEN = process.env.RENTMAN_API_TOKEN;

async function fetchFromRentman(endpoint: string) {
  const url = `https://api.rentman.net${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${RENTMAN_API_TOKEN}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Error fetching ${endpoint}:`, text);
    return null;
  }

  return await response.json();
}

async function debugStatuses(ids: string[]) {
  for (const id of ids) {
    console.log(`--- Checking Project Request ID: ${id} ---`);
    const request = await fetchFromRentman(`/projectrequests/${id}`);
    if (request) {
      console.log('Project Request:', JSON.stringify(request.data || request, null, 2));
      
      const data = request.data || request;
      if (data.project) {
          console.log(`\nFound linked project: ${data.project}`);
          const projectId = data.project.split('/').pop();
          const project = await fetchFromRentman(`/projects/${projectId}`);
          if (project) {
              console.log('Project Details:', JSON.stringify(project.data || project, null, 2));
          }
      }
    }
  }
}

// Use IDs from user's test script
debugStatuses(['31', '32']);
