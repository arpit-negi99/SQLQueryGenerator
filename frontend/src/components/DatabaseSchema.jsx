import { useState } from "react";

function StatusBadge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    indigo: "bg-indigo-100 text-indigo-700",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function ColumnRow({ column }) {
  return (
    <tr className="border-t border-slate-200">
      <td className="px-4 py-3 text-sm font-medium text-slate-900">
        {column.name}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{column.type}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {column.primaryKey && <StatusBadge tone="green">PK</StatusBadge>}
          {column.foreignKey && <StatusBadge tone="indigo">FK</StatusBadge>}
          {!column.nullable && <StatusBadge tone="amber">NOT NULL</StatusBadge>}
          {column.autoIncrement && <StatusBadge>AUTO</StatusBadge>}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {column.foreignKey
          ? `${column.foreignKey.referencedTable}.${column.foreignKey.referencedColumn}`
          : "-"}
      </td>
    </tr>
  );
}

function TableCard({ table, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
      >
        <div>
          <h3 className="text-base font-bold text-slate-950">
            {table.tableName}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {table.columns.length} columns
            {table.foreignKeys.length > 0
              ? ` - ${table.foreignKeys.length} foreign keys`
              : ""}
          </p>
        </div>
        <span className="text-xl font-semibold text-slate-500">
          {open ? "-" : "+"}
        </span>
      </button>

      {open && (
        <div className="overflow-x-auto border-t border-slate-200">
          <table className="w-full min-w-[680px] border-collapse">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Column
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Keys
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Relationship
                </th>
              </tr>
            </thead>
            <tbody>
              {table.columns.map((column) => (
                <ColumnRow key={column.name} column={column} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

function DatabaseSchema({ schema }) {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Database</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {schema.database}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Tables</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {schema.tableCount}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Relationships</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {schema.relationships.length}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {schema.tables.map((table, index) => (
          <TableCard
            key={table.tableName}
            table={table}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </section>
  );
}

export default DatabaseSchema;
