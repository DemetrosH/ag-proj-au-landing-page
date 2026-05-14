import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../apps/location/.env.local') });

async function testSubmission() {
  console.log('Testing Submission API with Correct Keys...');
  
  const payload = {
    name: "Test Workaround",
    firstName: "Test",
    lastName: "Workaround",
    email: "test@example.com",
    phone: "1234567890",
    address: "123 Test St",
    city: "Test City",
    postalCode: "H0H0H0",
    locationName: "Venue A",
    locationAddress: "456 Venue Rd",
    locationCity: "Venue City",
    locationPostalCode: "V1V1V1",
    startDate: "2026-06-01",
    endDate: "2026-06-03",
    items: [
        { id: "300", name: "Test Item", quantity: 1, price: 50 }
    ],
    details: "Test remark"
  };

  try {
    const res = await fetch('http://localhost:3007/api/rentman/create-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error calling API:', err);
  }
}

testSubmission();
