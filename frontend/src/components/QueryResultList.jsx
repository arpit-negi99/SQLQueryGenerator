import GeneratedQueryCard from "./GeneratedQueryCard.jsx";

function QueryResultList({ result }) {
  if (!result?.queries?.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-950">
          Generated SQL Suggestions
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          These queries are generated only. They are not executed.
        </p>
      </div>

      {result.queries.map((query) => (
        <GeneratedQueryCard key={query.id} query={query} />
      ))}
    </section>
  );
}

export default QueryResultList;
