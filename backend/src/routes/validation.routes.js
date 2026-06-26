import express from "express";
import { validateImpact } from "../controllers/validation.controller.js";

const router = express.Router();

router.post("/validate-impact", validateImpact);

export default router;
