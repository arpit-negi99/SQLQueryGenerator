import { useState } from "react";
import { executeSqlQuery } from "../api/queryApi.js";
import { validateQueryImpact } from "../api/validationApi.js";
import ImpactPreviewCard from "./ImpactPreviewCard.jsx";
import ValidationStatus from "./ValidationStatus.jsx";

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

function QueryStep({ active, complete, label }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
          complete
            ? "bg-emerald-600 text-white"
            : active
              ? "bg-indigo-600 text-white"
              : "bg-slate-200 text-slate-500"
        }`}
      >
        {complete ? "✓" : ""}
      </span>
      <span
        className={`text-xs font-bold ${
          active || complete ? "text-slate-800" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function ExecutionResult({ result }) {
  if (!result) {
    return null;
  }

  const rowLabel = result.rowCount === 1 ? "row" : "rows";
  const affectedLabel = result.affectedRows === 1 ? "row" : "rows";

  return (
    <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="font-bold text-slate-950">
            {result.queryType === "SELECT" ? "Expected Output" : "Impact"}
          </h4>
          <p className="mt-1 text-sm text-slate-600">
            {result.queryType === "SELECT"
              ? `${result.rowCount ?? 0} ${rowLabel} returned.`
              : `Approximately ${result.affectedRows ?? 0} ${affectedLabel} modified.`}
          </p>
        </div>
        <span className="w-fit rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
          {result.queryType}
        </span>
      </div>

      {result.queryType === "SELECT" && (
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
          <p className="font-semibold text-slate-700">Records Hidden</p>
          <p className="mt-1 text-slate-600">
            The query was executed, but database records are not shown in the frontend.
          </p>
        </div>
      )}

      {result.queryType !== "SELECT" && (
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="font-semibold text-slate-700">Affected Rows</p>
            <p className="mt-1 text-slate-600">{result.affectedRows ?? 0}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="font-semibold text-slate-700">Changed Rows</p>
            <p className="mt-1 text-slate-600">{result.changedRows ?? 0}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function GeneratedQueryCard({ query, onQueryExecuted }) {
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [executionResult, setExecutionResult] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [executionError, setExecutionError] = useState("");
  const [copied, setCopied] = useState(false);
  const queryType =
    query.riskLevel === "blocked" ? "BLOCKED" : query.queryType || "UNKNOWN";
  const canExecute = query.canExecute !== false && query.riskLevel !== "blocked";
  const isWriteQuery = ["INSERT", "UPDATE", "DELETE"].includes(query.queryType);
  const readyToExecute =
    canExecute && validationResult?.valid && validationResult?.safe && !validationResult?.blocked;

  const handleValidate = async () => {
    if (!query.sql) {
      setValidationError("This generated query is empty and cannot be validated.");
      return;
    }

    try {
      setValidating(true);
      setValidationError("");
      const result = await validateQueryImpact({
        sql: query.sql,
        queryType: query.queryType,
      });
      setValidationResult(result);
      setExecutionError("");
    } catch (apiError) {
      const message =
        apiError.response?.data?.message ||
        "Network error while validating query. Make sure the backend is running.";
      setValidationError(message);
      setValidationResult(null);
    } finally {
      setValidating(false);
    }
  };

  const handleCopySql = async () => {
    if (!query.sql) {
      return;
    }

    try {
      await navigator.clipboard.writeText(query.sql);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleExecute = async () => {
    if (!query.sql) {
      setExecutionError("This generated query is empty and cannot be executed.");
      return;
    }

    if (!canExecute) {
      setExecutionError("This query is blocked and cannot be executed.");
      return;
    }

    const needsConfirmation =
      query.requiresConfirmation ||
      isWriteQuery ||
      validationResult?.riskLevel === "high";

    if (
      needsConfirmation &&
      !window.confirm("Execute this SQL query against the connected database?")
    ) {
      return;
    }

    try {
      setExecuting(true);
      setExecutionError("");
      const result = await executeSqlQuery(query.sql);
      setExecutionResult(result);
      setValidationResult(result.validation || validationResult);
      onQueryExecuted?.(result);
    } catch (apiError) {
      const message =
        apiError.response?.data?.message ||
        "Network error while executing query. Make sure the backend and database are running.";
      setExecutionError(message);
      setExecutionResult(null);

      if (apiError.response?.data?.validation) {
        setValidationResult(apiError.response.data.validation);
      }
    } finally {
      setExecuting(false);
    }
  };

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
        <code>{query.sql || "-- No SQL was generated."}</code>
      </pre>

      <div className="mt-3 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-4">
          <QueryStep
            label="Validate"
            active={!validationResult && !executionResult}
            complete={Boolean(validationResult?.valid && validationResult?.safe)}
          />
          <QueryStep
            label="Execute"
            active={Boolean(validationResult?.valid && !executionResult)}
            complete={Boolean(executionResult)}
          />
          <QueryStep
            label={isWriteQuery ? "Database Updated" : "Count Shown"}
            active={Boolean(executionResult)}
            complete={Boolean(executionResult)}
          />
        </div>

        <button
          type="button"
          onClick={handleCopySql}
          disabled={!query.sql}
          className="w-fit rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          {copied ? "Copied" : "Copy SQL"}
        </button>
      </div>

      {query.riskLevel === "blocked" && query.sql && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          This query is shown for review only. It is blocked and cannot be executed.
        </div>
      )}

      {!canExecute && !query.sql && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          This unsafe request was blocked before executable SQL was returned.
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleValidate}
            disabled={validating || !query.sql}
            className="inline-flex w-fit items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {validating ? "Validating..." : validationResult ? "Validate Again" : "Validate Impact"}
          </button>

          <button
            type="button"
            onClick={handleExecute}
            disabled={executing || !query.sql || !canExecute}
            className="inline-flex w-fit items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {executing ? "Executing..." : isWriteQuery ? "Execute & Save" : "Run Query"}
          </button>
        </div>

        <ValidationStatus result={validationResult} />
      </div>

      {validating && (
        <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm font-semibold text-indigo-700">
          Validating query and estimating impact...
        </div>
      )}

      {validationError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {validationError}
        </div>
      )}

      {executing && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
          Executing query against the connected database...
        </div>
      )}

      {executionError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {executionError}
        </div>
      )}

      {canExecute && !readyToExecute && !validationResult && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-600">
          Validate first to preview affected rows, or run directly if you already reviewed the SQL.
        </div>
      )}

      <ImpactPreviewCard result={validationResult} />
      <ExecutionResult result={executionResult} />

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
