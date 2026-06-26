function normalizeName(value) {
  return String(value || "").replace(/`/g, "").toLowerCase();
}

function addTable(tableMap, aliasMap, tableNode, tablesUsed) {
  if (!tableNode) {
    return;
  }

  const tableName = typeof tableNode === "string" ? tableNode : tableNode.table;
  const alias = typeof tableNode === "object" ? tableNode.as : null;

  if (!tableName) {
    return;
  }

  tablesUsed.add(tableName);
  tableMap.set(normalizeName(tableName), tableName);

  if (alias) {
    aliasMap.set(normalizeName(alias), tableName);
  }
}

function collectTablesFromStatement(statement, tableMap, aliasMap, tablesUsed) {
  if (Array.isArray(statement?.from)) {
    statement.from.forEach((tableNode) => addTable(tableMap, aliasMap, tableNode, tablesUsed));
  }

  if (Array.isArray(statement?.table)) {
    statement.table.forEach((tableNode) => addTable(tableMap, aliasMap, tableNode, tablesUsed));
  } else {
    addTable(tableMap, aliasMap, statement?.table, tablesUsed);
  }

  if (Array.isArray(statement?.into?.table)) {
    statement.into.table.forEach((tableNode) => addTable(tableMap, aliasMap, tableNode, tablesUsed));
  } else {
    addTable(tableMap, aliasMap, statement?.into, tablesUsed);
  }
}

function traverse(value, visitor) {
  if (!value || typeof value !== "object") {
    return;
  }

  visitor(value);

  if (Array.isArray(value)) {
    value.forEach((item) => traverse(item, visitor));
    return;
  }

  Object.values(value).forEach((item) => traverse(item, visitor));
}

function collectColumns(statement) {
  const columns = [];

  traverse(statement, (node) => {
    if (node.type === "column_ref" && node.column && node.column !== "*") {
      columns.push({
        table: node.table || null,
        column: node.column,
      });
    }
  });

  if (Array.isArray(statement?.set)) {
    statement.set.forEach((assignment) => {
      if (assignment.column) {
        columns.push({
          table: null,
          column: assignment.column,
        });
      }
    });
  }

  if (Array.isArray(statement?.columns)) {
    statement.columns.forEach((column) => {
      if (typeof column === "string") {
        columns.push({ table: null, column });
      }
    });
  }

  return columns;
}

function buildSchemaIndex(schema) {
  const tables = new Map();

  schema.tables.forEach((table) => {
    const columns = new Map();

    table.columns.forEach((column) => {
      columns.set(normalizeName(column.name), column.name);
    });

    tables.set(normalizeName(table.tableName), {
      tableName: table.tableName,
      columns,
    });
  });

  return tables;
}

function findColumnInUsedTables(columnName, usedTableNames, schemaIndex) {
  const normalizedColumn = normalizeName(columnName);

  return usedTableNames.some((tableName) => {
    const table = schemaIndex.get(normalizeName(tableName));
    return table?.columns.has(normalizedColumn);
  });
}

export function validateSqlAgainstSchema({ schema, statements }) {
  const schemaIndex = buildSchemaIndex(schema);
  const tableMap = new Map();
  const aliasMap = new Map();
  const tablesUsed = new Set();
  const columnsUsed = new Set();

  statements.forEach((statement) => {
    collectTablesFromStatement(statement, tableMap, aliasMap, tablesUsed);
    collectColumns(statement).forEach((columnRef) => {
      columnsUsed.add(columnRef.column);

      if (columnRef.table) {
        const resolvedTable =
          aliasMap.get(normalizeName(columnRef.table)) ||
          tableMap.get(normalizeName(columnRef.table)) ||
          columnRef.table;

        const schemaTable = schemaIndex.get(normalizeName(resolvedTable));

        if (!schemaTable || !schemaTable.columns.has(normalizeName(columnRef.column))) {
          return;
        }
      }
    });
  });

  const missingTables = [...tablesUsed].filter(
    (tableName) => !schemaIndex.has(normalizeName(tableName))
  );

  const missingColumns = [];

  statements.forEach((statement) => {
    collectColumns(statement).forEach((columnRef) => {
      if (columnRef.column === "*") {
        return;
      }

      if (columnRef.table) {
        const resolvedTable =
          aliasMap.get(normalizeName(columnRef.table)) ||
          tableMap.get(normalizeName(columnRef.table)) ||
          columnRef.table;
        const schemaTable = schemaIndex.get(normalizeName(resolvedTable));

        if (!schemaTable || !schemaTable.columns.has(normalizeName(columnRef.column))) {
          missingColumns.push(`${columnRef.table}.${columnRef.column}`);
        }

        return;
      }

      if (!findColumnInUsedTables(columnRef.column, [...tablesUsed], schemaIndex)) {
        missingColumns.push(columnRef.column);
      }
    });
  });

  return {
    valid: missingTables.length === 0 && missingColumns.length === 0,
    tablesUsed: [...tablesUsed],
    columnsUsed: [...columnsUsed],
    missingTables: [...new Set(missingTables)],
    missingColumns: [...new Set(missingColumns)],
  };
}
