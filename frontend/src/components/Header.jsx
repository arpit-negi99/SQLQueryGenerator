function Header({ connected = false }) {
  return (
    <header className="rounded-lg border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Module 2
          </p>
          <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
            AI SQL Query Generator
          </h1>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Generate SQL from natural language using your discovered schema
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
          <span
            className={`h-3 w-3 rounded-full ${
              connected ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-semibold text-slate-700">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
