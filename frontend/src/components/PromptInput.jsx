function PromptInput({
  prompt,
  error,
  loading,
  onPromptChange,
  onGenerateSql,
}) {
  const examples = [
    "Show top 5 students with highest CGPA",
    "Insert a new course named Data Mining with 4 credits",
    "Update Priya Verma CGPA to 9.1",
  ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <label
            htmlFor="queryPrompt"
            className="block text-sm font-semibold text-slate-800"
          >
            Natural Language Request
          </label>
          <p className="mt-1 text-sm text-slate-500">
            Describe the record you want to read, insert, update, or delete.
          </p>
        </div>
        <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          Database actions enabled
        </span>
      </div>

      <textarea
        id="queryPrompt"
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder="Example: Insert a new student named Rahul Mehta with CGPA 8.6 in CSE"
        className="min-h-40 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onPromptChange(example)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            {example}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onGenerateSql}
        disabled={loading || !prompt.trim()}
        className="mt-5 w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
      >
        {loading ? "Generating SQL query..." : "Generate SQL"}
      </button>
    </section>
  );
}

export default PromptInput;
