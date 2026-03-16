type ClaimViewProps = {
  data: {
    incident: any;
    expenses: any[];
    documents: any[];
    shareLink: any;
  };
};

function formatIncidentType(value?: string) {
  if (!value) return 'Unknown';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function isProbablyImage(doc: any) {
  const url = String(doc?.file_url ?? '').toLowerCase();
  const name = String(doc?.name ?? doc?.file_name ?? '').toLowerCase();
  return (
    url.includes('/storage/v1/object/public/') ||
    url.includes('baggage-photo') ||
    url.endsWith('.jpg') ||
    url.endsWith('.jpeg') ||
    url.endsWith('.png') ||
    url.endsWith('.webp') ||
    name.includes('baggage-photo') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png') ||
    name.endsWith('.webp')
  );
}

export default function ClaimView({ data }: ClaimViewProps) {
  const { incident, expenses, documents } = data;
  const imageDocs = documents.filter(isProbablyImage);
  const otherDocs = documents.filter((doc) => !isProbablyImage(doc));

  const amount =
    incident?.claim_amount ??
    incident?.estimated_value_loss ??
    incident?.amount ??
    0;

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <div className="inline-flex items-center rounded-full border border-blue-800 bg-blue-950/50 px-3 py-1 text-xs font-medium text-blue-300 mb-4">
            Shared Claim
          </div>

          <h1 className="text-4xl font-bold mb-2">Claim Summary</h1>
          <p className="text-slate-400 mb-8">ID: {incident?.id ?? 'N/A'}</p>

          <div className="space-y-4 mb-8">
            <div className="rounded-2xl bg-slate-800/60 p-4">
              <div className="text-slate-400 text-sm mb-1">Incident Type</div>
              <div className="text-lg font-semibold">
                {formatIncidentType(incident?.type ?? incident?.incident_type)}
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

          <div className="rounded-2xl bg-blue-950/60 border border-blue-900/50 p-5 mb-8">
            <div className="text-slate-300 text-sm mb-2">Claim Amount</div>
            <div className="text-4xl font-bold text-blue-400">
              ${Number(amount).toFixed(2)}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Expenses</h2>
            {expenses.length === 0 ? (
              <div className="rounded-2xl bg-slate-800/40 p-4 text-slate-400">
                No expenses attached.
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-2xl bg-slate-800/60 p-4 flex items-center justify-between"
                  >
                    <div className="font-medium">
                      {expense.description ?? 'Expense'}
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

            {imageDocs.length > 0 && (
              <div className="mb-6">
                <div className="text-slate-400 text-sm mb-2">Images</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {imageDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-2xl overflow-hidden bg-slate-800/60 p-1"
                    >
                      <a href={doc.file_url} target="_blank" rel="noreferrer">
                        <img
                          src={doc.file_url}
                          alt={doc.name ?? doc.file_name ?? 'Incident image'}
                          className="w-full h-48 object-cover rounded-xl"
                        />
                      </a>
                      <div className="p-2 text-xs text-slate-400 break-all">
                        {doc.name ?? doc.file_name ?? 'Image'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {otherDocs.length > 0 && (
              <div className="space-y-3">
                {otherDocs.map((doc) => (
                  <div key={doc.id} className="rounded-2xl bg-slate-800/60 p-4">
                    <div className="font-medium mb-2">
                      {doc.name ?? doc.file_name ?? 'Document'}
                    </div>

                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-xl border border-blue-800 bg-blue-950/50 px-3 py-2 text-sm font-medium text-blue-300 hover:bg-blue-900/50"
                      >
                        Open file
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {documents.length === 0 && (
              <div className="rounded-2xl bg-slate-800/40 p-4 text-slate-400">
                No documents attached.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
