import { getHomeCategories } from '../../../lib/rentman';

export default async function DebugCategoriesPage() {
  let categories: any = null;
  let error: string | null = null;

  try {
    categories = await getHomeCategories();
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Landing Page Debug</h1>
      
      {error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-700">
          <p className="font-semibold text-gray-900">Error:</p>
          <pre className="mt-1 font-mono text-sm">{error}</pre>
        </div>
      ) : (
        <div>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2 text-gray-900">getHomeCategories Output ({categories?.length || 0} categories)</h2>
            <div className="grid gap-4">
              {categories?.map((cat: any) => (
                <div key={cat.id} className="p-4 border rounded-lg bg-white shadow-sm text-gray-900">
                  <div className="font-bold text-gray-900">{cat.name}</div>
                  <div className="text-sm text-gray-500">Slug: {cat.slug}</div>
                  <div className="text-sm text-gray-500">Description: {cat.description || 'No description'}</div>
                  <div className="mt-2 text-sm">
                    <span className="font-semibold text-gray-900">Preview Images ({cat.previewImages?.length || 0}):</span>
                    <div className="flex gap-2 mt-1">
                      {cat.previewImages?.map((img: string, i: number) => (
                        <div key={i} className="w-16 h-16 border rounded overflow-hidden">
                          <img src={img} className="w-full h-full object-cover" alt="preview" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Raw Data:</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[500px] text-sm text-gray-900">
            {JSON.stringify(categories, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
