function PromptInput({
  prompt,
  error,
  loading,
  onPromptChange,
  onGenerateSql,
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <label
          htmlFor="queryPrompt"
          className="block text-sm font-semibold text-slate-800"
        >
          Natural Language Request
        </label>
        <p className="mt-1 text-sm text-slate-500">
          Ask for a SQL query based on the connected database schema.
        </p>
      </div>

      <textarea
        id="queryPrompt"
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder="Example: Show top 5 students with highest CGPA"
        className="min-h-36 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
      />

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onGenerateSql}
        disabled={loading}
        className="mt-5 w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
      >
        {loading ? "Generating SQL query..." : "Generate SQL"}
      </button>
    </section>
  );
}

export default PromptInput;
