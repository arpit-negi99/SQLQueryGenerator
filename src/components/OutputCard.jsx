function EmptyState() {
  return (
    <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="max-w-sm text-sm leading-6 text-slate-500">
        Your generated SQL query, explanation, query type, and tables used will
        appear here.
      </p>
    </div>
  );
}

function OutputSection({ title, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="mb-2 text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </section>
  );
}

function OutputCard({ output }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-950">Generated Result</h2>
        <p className="mt-1 text-sm text-slate-500">
          Static response for the first frontend module.
        </p>
      </div>

      {!output ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          <OutputSection title="SQL Query">
            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-6 text-indigo-100">
              <code>{output.sqlQuery}</code>
            </pre>
          </OutputSection>

          <OutputSection title="Explanation">
            <p className="text-sm leading-6 text-slate-600">
              {output.explanation}
            </p>
          </OutputSection>

          <div className="grid gap-4 sm:grid-cols-2">
            <OutputSection title="Query Type">
              <p className="text-sm font-semibold text-indigo-700">
                {output.queryType}
              </p>
            </OutputSection>

            <OutputSection title="Tables Used">
              <p className="text-sm font-semibold text-indigo-700">
                {output.tablesUsed}
              </p>
            </OutputSection>
          </div>
        </div>
      )}
    </section>
  );
}

export default OutputCard;
