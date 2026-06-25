import express from "express";
import { generateQuery } from "../controllers/query.controller.js";

const router = express.Router();

router.post("/generate", generateQuery);

export default router;
