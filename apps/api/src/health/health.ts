import express from "express";
import { type Request, type Response } from "express";

const router = express.Router();

router.get("/health", async (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default router;
