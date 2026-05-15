import { rentmanFetch } from '../apps/location/lib/rentman';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'apps/location/.env.local' });

async function run() {
    try {
        const project = await rentmanFetch<any>('/projects/537');
        console.log('--- PROJECT 537 KEYS ---');
        console.log(Object.keys(project));
        console.log('\n--- PROJECT 537 CONTENT ---');
        console.log(JSON.stringify(project, null, 2));
    } catch (e) {
        console.error(e);
    }
}
run();
