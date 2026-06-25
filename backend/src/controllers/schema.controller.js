import {
  getCompleteSchema,
  getFormattedSchema,
  getTableByName,
  getTables,
} from "../services/schema.service.js";

export async function fetchSchema(req, res, next) {
  try {
    const schema = await getCompleteSchema();
    res.json({
      success: true,
      connected: true,
      data: schema,
    });
  } catch (error) {
    next(error);
  }
}

export async function fetchFormattedSchema(req, res, next) {
  try {
    const formattedSchema = await getFormattedSchema();
    res.json({
      success: true,
      connected: true,
      data: formattedSchema,
    });
  } catch (error) {
    next(error);
  }
}

export async function fetchTables(req, res, next) {
  try {
    const tables = await getTables();
    res.json({
      success: true,
      connected: true,
      data: tables,
    });
  } catch (error) {
    next(error);
  }
}

export async function fetchTableByName(req, res, next) {
  try {
    const table = await getTableByName(req.params.tableName);
    res.json({
      success: true,
      connected: true,
      data: table,
    });
  } catch (error) {
    next(error);
  }
}
