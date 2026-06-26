const badgeClasses = {
  valid: "bg-emerald-100 text-emerald-700",
  invalid: "bg-red-100 text-red-700",
  safe: "bg-emerald-100 text-emerald-700",
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  blocked: "bg-red-100 text-red-700",
};

function Badge({ children, tone }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badgeClasses[tone]}`}>
      {children}
    </span>
  );
}

function ValidationStatus({ result }) {
  if (!result) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Badge tone={result.valid ? "valid" : "invalid"}>
        {result.valid ? "Valid" : "Invalid"}
      </Badge>
      <Badge tone={result.safe ? "safe" : "blocked"}>
        {result.safe ? "Safe" : "Unsafe"}
      </Badge>
      <Badge tone={result.riskLevel || "medium"}>
        Risk {result.riskLevel || "unknown"}
      </Badge>
    </div>
  );
}

export default ValidationStatus;
