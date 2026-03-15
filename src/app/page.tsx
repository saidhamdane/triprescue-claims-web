export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center shadow-2xl">
        <h1 className="text-4xl font-bold mb-4">TripRescue Claims</h1>
        <p className="text-slate-300">
          Public claim viewer for shared TripRescue incidents.
        </p>
      </div>
    </main>
  );
}
