import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  // Fetch tournaments to test the connection
  const { data: tournaments, error } = await supabase
    .from("tournaments")
    .select("*");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">
        IFPA Bracket Predictor
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Predict the outcomes of IFPA Pinball State Championships
      </p>

      {/* Connection test display */}
      <div className="mt-8 p-6 border rounded-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Supabase Connection Test</h2>

        {error ? (
          <div className="text-red-600">
            <p className="font-medium">Connection Error:</p>
            <p className="text-sm">{error.message}</p>
          </div>
        ) : tournaments && tournaments.length > 0 ? (
          <div className="text-green-600">
            <p className="font-medium">Connected successfully!</p>
            <p className="text-sm mt-2">Found {tournaments.length} tournament(s):</p>
            <ul className="mt-2 text-gray-700">
              {tournaments.map((t) => (
                <li key={t.id} className="text-sm">
                  • {t.name} ({t.year})
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-yellow-600">
            <p className="font-medium">Connected, but no tournaments found.</p>
            <p className="text-sm">Add a tournament in the Supabase dashboard to test.</p>
          </div>
        )}
      </div>
    </main>
  );
}
