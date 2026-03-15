export default function ErrorView({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-4">TripRescue Claims</h1>
        <p className="text-slate-300">{message}</p>
      </div>
    </main>
  );
}
