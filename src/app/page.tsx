export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center shadow-2xl">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-2xl">
          ✈️
        </div>
        <h1 className="text-4xl font-bold mb-4">TripRescue Claims</h1>
        <p className="text-slate-300 text-lg">
          Secure public viewer for shared travel claims.
        </p>
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-left">
          <div className="text-sm text-slate-400 mb-2">How it works</div>
          <ul className="space-y-2 text-slate-200 text-sm">
            <li>• Open a claim link shared from the TripRescue app</li>
            <li>• Review incident details, expenses, and documents</li>
            <li>• View the claim in any browser without installing the app</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
