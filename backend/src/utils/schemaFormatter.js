function formatColumn(column) {
  const labels = [];

  if (column.primaryKey) labels.push("PRIMARY KEY");
  if (column.foreignKey) {
    labels.push(
      `FOREIGN KEY -> ${column.foreignKey.referencedTable}.${column.foreignKey.referencedColumn}`
    );
  }
  if (!column.nullable) labels.push("NOT NULL");
  if (column.autoIncrement) labels.push("AUTO INCREMENT");

  const suffix = labels.length > 0 ? ` ${labels.join(" ")}` : "";
  return `* ${column.name} (${column.type})${suffix}`;
}

export function formatSchema(schema) {
  if (!schema?.tables?.length) {
    return `Database: ${schema?.database || "Unknown"}\nNo tables found.`;
  }

  const tableBlocks = schema.tables.map((table) => {
    const columns = table.columns.map(formatColumn).join("\n");
    return `${table.tableName}\n${columns}`;
  });

  return `Database: ${schema.database}\n\n${tableBlocks.join("\n\n")}`;
}
