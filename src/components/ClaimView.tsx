type ClaimViewProps = {
  data: {
    incident: any;
    expenses: any[];
    documents: any[];
    shareLink: any;
  };
};

function formatIncidentType(value?: string) {
  if (!value) return "Unknown";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isImageFile(doc: any) {
  const url = String(doc?.file_url ?? "").toLowerCase();
  const name = String(doc?.name ?? doc?.file_name ?? "").toLowerCase();
  return (
    url.endsWith(".jpg") ||
    url.endsWith(".jpeg") ||
    url.endsWith(".png") ||
    url.endsWith(".webp") ||
    url.includes("/image") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp")
  );
}

export default function ClaimView({ data }: ClaimViewProps) {
  const { incident, expenses, documents } = data;

  const amount =
    incident?.claim_amount ??
    incident?.estimated_value_loss ??
    incident?.amount ??
    0;

  const imageDocs = documents.filter(isImageFile);
  const otherDocs = documents.filter((doc) => !isImageFile(doc));

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-2xl">
          <div className="mb-8">
            <div className="inline-flex items-center rounded-full border border-blue-800 bg-blue-950/50 px-3 py-1 text-xs font-medium text-blue-300 mb-4">
              Shared Claim
            </div>
            <h1 className="text-4xl font-bold mb-2">Claim Summary</h1>
            <p className="text-slate-400 break-all">
              ID: {incident?.id ?? "N/A"}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="rounded-2xl bg-slate-800/60 p-4">
              <div className="text-slate-400 text-sm mb-1">Incident Type</div>
              <div className="text-lg font-semibold">
                {formatIncidentType(incident?.type ?? incident?.incident_type)}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-800/60 p-4">
              <div className="text-slate-400 text-sm mb-1">Description</div>
              <div className="text-base leading-7 text-slate-100">
                {incident?.description ?? incident?.title ?? "No description"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-800/60 p-4">
                <div className="text-slate-400 text-sm mb-1">Airline</div>
                <div className="font-medium">{incident?.airline ?? "N/A"}</div>
              </div>

              <div className="rounded-2xl bg-slate-800/60 p-4">
                <div className="text-slate-400 text-sm mb-1">Flight Number</div>
                <div className="font-medium">
                  {incident?.flight_number ?? "N/A"}
                </div>
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
              <div className="rounded-2xl bg-slate-800/40 p-4 text-slate-400">
                No expenses attached.
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-2xl bg-slate-800/60 p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-medium">
                        {expense.description ?? "Expense"}
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
              <div className="rounded-2xl bg-slate-800/40 p-4 text-slate-400">
                No documents attached.
              </div>
            ) : (
              <div className="space-y-6">
                {imageDocs.length > 0 && (
                  <div>
                    <div className="text-sm text-slate-400 mb-3">Images</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {imageDocs.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-2xl overflow-hidden border border-slate-800 bg-slate-800/60"
                        >
                          <img
                            src={doc.file_url}
                            alt={doc.name ?? doc.file_name ?? "Image"}
                            className="h-56 w-full object-cover"
                          />
                          <div className="p-3 text-sm text-slate-200">
                            {doc.name ?? doc.file_name ?? "Image"}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {otherDocs.length > 0 && (
                  <div>
                    <div className="text-sm text-slate-400 mb-3">Files</div>
                    <div className="space-y-3">
                      {otherDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="rounded-2xl bg-slate-800/60 p-4"
                        >
                          <div className="font-medium mb-2">
                            {doc.name ?? doc.file_name ?? "Document"}
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
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
