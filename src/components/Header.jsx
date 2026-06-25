function Header() {
  return (
    <header className="rounded-lg border border-slate-200 bg-white px-6 py-7 text-center shadow-sm sm:px-8">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-600">
        SQL Query Generator
      </p>
      <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
        AI SQL Query Generator
      </h1>
      <p className="mt-3 text-base text-slate-600 sm:text-lg">
        Convert natural language into SQL queries
      </p>
    </header>
  );
}

export default Header;
