async function testSync() {
  console.log('Testing Sync API on PORT 3007 for IDs [31, 32]...');
  
  try {
    const res = await fetch('http://localhost:3007/api/rentman/sync-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestIds: ["31", "32"] })
    });
    
    const data = await res.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error calling Sync API:', err);
  }
}

testSync();
