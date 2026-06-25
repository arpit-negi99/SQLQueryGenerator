import express from "express";
import {
  fetchFormattedSchema,
  fetchSchema,
  fetchTableByName,
  fetchTables,
} from "../controllers/schema.controller.js";

const router = express.Router();

router.get("/", fetchSchema);
router.get("/formatted", fetchFormattedSchema);
router.get("/tables", fetchTables);
router.get("/table/:tableName", fetchTableByName);

export default router;
