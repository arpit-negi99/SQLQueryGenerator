import pool from "../config/db.js";
import { formatSchema } from "../utils/schemaFormatter.js";

const databaseName = process.env.DB_NAME;

function ensureDatabaseConfigured() {
  if (!databaseName) {
    const error = new Error("Database name is not configured.");
    error.statusCode = 500;
    throw error;
  }
}

function isValidTableName(tableName) {
  return /^[A-Za-z0-9_$]+$/.test(tableName);
}

async function getRawTables() {
  const [tables] = await pool.execute(
    `SELECT TABLE_NAME
     FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = ?
     ORDER BY TABLE_NAME`,
    [databaseName]
  );

  return tables.map((table) => table.TABLE_NAME);
}

async function getRawColumns() {
  const [columns] = await pool.execute(
    `SELECT
       TABLE_NAME,
       COLUMN_NAME,
       COLUMN_TYPE,
       IS_NULLABLE,
       COLUMN_KEY,
       EXTRA,
       ORDINAL_POSITION
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ?
     ORDER BY TABLE_NAME, ORDINAL_POSITION`,
    [databaseName]
  );

  return columns;
}

async function getRawForeignKeys() {
  const [foreignKeys] = await pool.execute(
    `SELECT
       kcu.TABLE_NAME,
       kcu.COLUMN_NAME,
       kcu.REFERENCED_TABLE_NAME,
       kcu.REFERENCED_COLUMN_NAME,
       rc.UPDATE_RULE,
       rc.DELETE_RULE,
       kcu.CONSTRAINT_NAME
     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
     LEFT JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
       ON kcu.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
      AND kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
     WHERE kcu.TABLE_SCHEMA = ?
       AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
     ORDER BY kcu.TABLE_NAME, kcu.COLUMN_NAME`,
    [databaseName]
  );

  return foreignKeys;
}

function buildSchema(tables, columns, foreignKeys) {
  const foreignKeyMap = new Map();

  foreignKeys.forEach((foreignKey) => {
    foreignKeyMap.set(`${foreignKey.TABLE_NAME}.${foreignKey.COLUMN_NAME}`, {
      constraintName: foreignKey.CONSTRAINT_NAME,
      referencedTable: foreignKey.REFERENCED_TABLE_NAME,
      referencedColumn: foreignKey.REFERENCED_COLUMN_NAME,
      updateRule: foreignKey.UPDATE_RULE,
      deleteRule: foreignKey.DELETE_RULE,
    });
  });

  const formattedTables = tables.map((tableName) => {
    const tableColumns = columns
      .filter((column) => column.TABLE_NAME === tableName)
      .map((column) => {
        const foreignKey = foreignKeyMap.get(
          `${column.TABLE_NAME}.${column.COLUMN_NAME}`
        );

        return {
          name: column.COLUMN_NAME,
          type: column.COLUMN_TYPE,
          primaryKey: column.COLUMN_KEY === "PRI",
          nullable: column.IS_NULLABLE === "YES",
          autoIncrement: column.EXTRA.toLowerCase().includes("auto_increment"),
          foreignKey: foreignKey || null,
        };
      });

    return {
      tableName,
      columns: tableColumns,
      primaryKeys: tableColumns
        .filter((column) => column.primaryKey)
        .map((column) => column.name),
      foreignKeys: tableColumns
        .filter((column) => column.foreignKey)
        .map((column) => ({
          column: column.name,
          ...column.foreignKey,
        })),
    };
  });

  const relationships = foreignKeys.map((foreignKey) => ({
    table: foreignKey.TABLE_NAME,
    column: foreignKey.COLUMN_NAME,
    referencedTable: foreignKey.REFERENCED_TABLE_NAME,
    referencedColumn: foreignKey.REFERENCED_COLUMN_NAME,
    constraintName: foreignKey.CONSTRAINT_NAME,
  }));

  return {
    database: databaseName,
    tableCount: formattedTables.length,
    tables: formattedTables,
    relationships,
  };
}

export async function getCompleteSchema() {
  ensureDatabaseConfigured();

  const [tables, columns, foreignKeys] = await Promise.all([
    getRawTables(),
    getRawColumns(),
    getRawForeignKeys(),
  ]);

  return buildSchema(tables, columns, foreignKeys);
}

export async function getFormattedSchema() {
  const schema = await getCompleteSchema();
  return formatSchema(schema);
}

export async function getTables() {
  const schema = await getCompleteSchema();
  return schema.tables.map((table) => table.tableName);
}

export async function getTableByName(tableName) {
  if (!isValidTableName(tableName)) {
    const error = new Error("Invalid table name.");
    error.statusCode = 400;
    throw error;
  }

  const schema = await getCompleteSchema();
  const table = schema.tables.find(
    (schemaTable) => schemaTable.tableName === tableName
  );

  if (!table) {
    const error = new Error("Table not found.");
    error.statusCode = 404;
    throw error;
  }

  return table;
}
