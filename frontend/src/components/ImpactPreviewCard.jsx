const riskClasses = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  blocked: "bg-red-100 text-red-700",
};

function ValueList({ values }) {
  if (!values?.length) {
    return <span className="text-slate-400">None</span>;
  }

  return <span>{values.join(", ")}</span>;
}

function Detail({ label, children }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{children}</p>
    </div>
  );
}

function ImpactPreviewCard({ result }) {
  if (!result) {
    return null;
  }

  const estimatedLabel =
    result.impact?.estimatedRows === null || result.impact?.estimatedRows === undefined
      ? "Unable to estimate"
      : result.impact.estimatedRows;

  return (
    <div
      className={`mt-4 rounded-lg border p-4 ${
        result.blocked
          ? "border-red-200 bg-red-50"
          : "border-emerald-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className={result.blocked ? "font-bold text-red-900" : "font-bold text-slate-950"}>
            Impact Preview
          </h4>
          <p className={result.blocked ? "mt-1 text-sm text-red-700" : "mt-1 text-sm text-slate-600"}>
            {result.message}
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${
            riskClasses[result.riskLevel] || riskClasses.medium
          }`}
        >
          {result.riskLevel} risk
        </span>
      </div>

      {!result.blocked && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Query Type">{result.queryType}</Detail>
          <Detail label="Tables Used">
            <ValueList values={result.tablesUsed} />
          </Detail>
          <Detail label="Columns Used">
            <ValueList values={result.columnsUsed} />
          </Detail>
          <Detail label={result.impact?.type === "READ" ? "Estimated Rows" : "Estimated Rows Affected"}>
            {estimatedLabel}
          </Detail>
          <Detail label="Impact Type">{result.impact?.type || "Unknown"}</Detail>
          <Detail label="Safety">{result.safe ? "Safe for preview" : "Blocked"}</Detail>
        </div>
      )}

      {result.impact?.description && !result.blocked && (
        <p className="mt-4 rounded-lg bg-indigo-50 p-3 text-sm font-medium text-indigo-700">
          {result.impact.description}
        </p>
      )}

      {result.warnings?.length > 0 && (
        <div className={result.blocked ? "mt-4 text-sm text-red-800" : "mt-4 text-sm text-amber-800"}>
          <p className="font-bold">Warnings</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ImpactPreviewCard;
