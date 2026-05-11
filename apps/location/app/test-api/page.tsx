import { getEquipment } from '../../lib/rentman';

export default async function TestApiPage() {
  let equipment: any = null;
  let error: string | null = null;

  try {
    equipment = await getEquipment(100);
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Rentman API Test</h1>
      
      {error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-700">
          <p className="font-semibold">Error connecting to Rentman API:</p>
          <p className="mt-1 font-mono text-sm">{error}</p>
          <p className="mt-4 text-sm">
            Please make sure you have added your real API token to 
            <code className="bg-red-100 px-1 rounded mx-1">apps/location/.env.local</code>.
          </p>
        </div>
      ) : (
        <div>
          <div className="bg-green-50 border border-green-200 p-4 rounded-md text-green-700 mb-6">
            <p className="font-semibold">Successfully connected to Rentman API!</p>
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Rentman Catalog (100 Items):</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[500px] text-sm">
            {JSON.stringify(equipment, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8 text-sm text-gray-500 italic">
        This page is for testing purposes and should be removed before production.
      </div>
    </div>
  );
}
