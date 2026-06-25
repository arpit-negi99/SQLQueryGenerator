const queryTypeClasses = {
  SELECT: "bg-emerald-100 text-emerald-700",
  INSERT: "bg-blue-100 text-blue-700",
  UPDATE: "bg-yellow-100 text-yellow-800",
  DELETE: "bg-red-100 text-red-700",
  UNKNOWN: "bg-slate-100 text-slate-700",
  BLOCKED: "bg-red-900 text-white",
};

const confidenceClasses = {
  high: "bg-emerald-100 text-emerald-700",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-red-100 text-red-700",
};

const riskClasses = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  blocked: "bg-red-100 text-red-700",
};

function Badge({ children, className }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>
      {children}
    </span>
  );
}

function ValueList({ values }) {
  if (!values?.length) {
    return <span className="text-slate-400">None</span>;
  }

  return <span>{values.join(", ")}</span>;
}

function GeneratedQueryCard({ query }) {
  const queryType =
    query.riskLevel === "blocked" ? "BLOCKED" : query.queryType || "UNKNOWN";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-950">
            Query Option {query.id}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {query.explanation}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className={queryTypeClasses[queryType] || queryTypeClasses.UNKNOWN}>
            {queryType}
          </Badge>
          <Badge
            className={
              confidenceClasses[query.confidence] || confidenceClasses.low
            }
          >
            {query.confidence} confidence
          </Badge>
          <Badge className={riskClasses[query.riskLevel] || riskClasses.medium}>
            {query.riskLevel} risk
          </Badge>
        </div>
      </div>

      <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm leading-6 text-indigo-100">
        <code>{query.sql || "-- Query blocked for safety."}</code>
      </pre>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-semibold text-slate-700">Tables Used</p>
          <p className="mt-1 text-slate-600">
            <ValueList values={query.tablesUsed} />
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-semibold text-slate-700">Columns Used</p>
          <p className="mt-1 text-slate-600">
            <ValueList values={query.columnsUsed} />
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-semibold text-slate-700">Confirmation</p>
          <p className="mt-1 text-slate-600">
            {query.requiresConfirmation ? "Required" : "Not required"}
          </p>
        </div>
      </div>
    </article>
  );
}

export default GeneratedQueryCard;
