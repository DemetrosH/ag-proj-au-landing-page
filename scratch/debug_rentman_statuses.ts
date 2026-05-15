import { rentmanFetch } from '../apps/location/lib/rentman';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'apps/location/.env.local' });

async function run() {
    try {
        const projects = await rentmanFetch<any[]>('/projects?limit=50');
        console.log('--- PROJECT LIST ---');
        projects.forEach(p => {
            console.log(`ID: ${p.id} | Name: ${p.name} | Status: ${JSON.stringify(p.status)}`);
        });
        
        const requests = await rentmanFetch<any[]>('/projectrequests?limit=50');
        console.log('\n--- REQUEST LIST ---');
        requests.forEach(r => {
            console.log(`ID: ${r.id} | Status: ${JSON.stringify(r.status)} | Linked: ${r.linked_project || 'none'}`);
        });
    } catch (e) {
        console.error(e);
    }
}
run();
