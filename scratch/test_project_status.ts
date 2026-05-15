import { rentmanFetch } from '../apps/location/lib/rentman';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'apps/location/.env.local' });

async function run() {
    try {
        console.log("Fetching project 537...");
        const p = await rentmanFetch('/projects/537');
        console.log("Project Data:", JSON.stringify(p, null, 2));

        console.log("Fetching project 537 subprojects...");
        const subs = await rentmanFetch('/projects/537/subprojects');
        console.log("Subprojects:", JSON.stringify(subs, null, 2));

        console.log("Fetching project statuses list...");
        const statuses = await rentmanFetch('/projectstatuses');
        console.log("Statuses:", JSON.stringify(statuses, null, 2));
    } catch(e) {
        console.error("Error:", e.message);
    }
}
run();
