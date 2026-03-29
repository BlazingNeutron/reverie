import { type Request, type Response } from "express";

export default async function register(req: Request, res: Response) {
  const logEntry = req.body;
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: logEntry.level || "info",
      message: logEntry.message,
      metadata: logEntry.metadata || {},
      source: "reverie-web-client",
    }),
  );

  res.status(200).json({
    success: true,
  });
}
