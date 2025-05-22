import express from "express";
import { generateAndSendSummary } from "../controllers/summaryController";

const router = express.Router();

router.post("/", generateAndSendSummary);

export default router;
