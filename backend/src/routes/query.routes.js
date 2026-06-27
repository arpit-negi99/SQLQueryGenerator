import express from "express";
import { executeQuery } from "../controllers/execution.controller.js";
import { generateQuery } from "../controllers/query.controller.js";

const router = express.Router();

router.post("/generate", generateQuery);
router.post("/execute", executeQuery);

export default router;
