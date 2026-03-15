type ClaimViewProps = {
  data: {
    incident: any;
    expenses: any[];
    documents: any[];
    shareLink: any;
  };
};

export default function ClaimView({ data }: ClaimViewProps) {
  const { incident, expenses, documents } = data;

  const amount =
    incident?.claim_amount ??
    incident?.estimated_value_loss ??
    incident?.amount ??
    0;

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <h1 className="text-4xl font-bold mb-2">Claim Summary</h1>
          <p className="text-slate-400 mb-8">ID: {incident?.id ?? 'N/A'}</p>

          <div className="space-y-4 mb-8">
            <div className="rounded-2xl bg-slate-800/60 p-4">
              <div className="text-slate-400 text-sm mb-1">Incident Type</div>
              <div className="text-lg font-semibold">
                {incident?.type ?? incident?.incident_type ?? 'Unknown'}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-800/60 p-4">
              <div className="text-slate-400 text-sm mb-1">Description</div>
              <div className="text-base">
                {incident?.description ?? incident?.title ?? 'No description'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-800/60 p-4">
                <div className="text-slate-400 text-sm mb-1">Airline</div>
                <div>{incident?.airline ?? 'N/A'}</div>
              </div>

              <div className="rounded-2xl bg-slate-800/60 p-4">
                <div className="text-slate-400 text-sm mb-1">Flight Number</div>
                <div>{incident?.flight_number ?? 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-blue-950/60 border border-blue-900 p-5 mb-8">
            <div className="text-slate-300 text-sm mb-2">Claim Amount</div>
            <div className="text-4xl font-bold text-blue-400">
              ${Number(amount).toFixed(2)}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Expenses</h2>
            {expenses.length === 0 ? (
              <p className="text-slate-400">No expenses attached.</p>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-2xl bg-slate-800/60 p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {expense.description ?? 'Expense'}
                      </div>
                    </div>
                    <div className="text-blue-400 font-semibold">
                      ${Number(expense.amount ?? 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Documents</h2>
            {documents.length === 0 ? (
              <p className="text-slate-400">No documents attached.</p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-2xl bg-slate-800/60 p-4"
                  >
                    <div className="font-medium">
                      {doc.name ?? doc.file_name ?? 'Document'}
                    </div>
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 underline break-all"
                      >
                        Open file
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
