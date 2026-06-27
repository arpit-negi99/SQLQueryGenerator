import GeneratedQueryCard from "./GeneratedQueryCard.jsx";

function QueryResultList({ result, onBackToPrompt, onQueryExecuted }) {
  if (!result?.queries?.length) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">No query generated yet</h2>
        <p className="mt-2 text-sm text-slate-500">
          Start with a natural language request and generated SQL will appear here.
        </p>
        <button
          type="button"
          onClick={onBackToPrompt}
          className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Go to Ask
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Generated SQL Suggestions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Validate the option you want, then execute it against the connected database.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToPrompt}
          className="w-fit rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          Edit Request
        </button>
      </div>

      {result.queries.map((query) => (
        <GeneratedQueryCard
          key={query.id}
          query={query}
          onQueryExecuted={onQueryExecuted}
        />
      ))}
    </section>
  );
}

export default QueryResultList;
