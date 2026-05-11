const { syncRentmanToSupabase } = require('./lib/sync');

async function run() {
  console.log('--- MANUAL SYNC START ---');
  const result = await syncRentmanToSupabase();
  console.log('--- MANUAL SYNC RESULT ---');
  console.log(JSON.stringify(result, null, 2));
}

run().catch(console.error);
