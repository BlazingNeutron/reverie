import { type Request, type Response } from "express";

const anonKey = process.env.ANON_KEY!;

export default async function register(_req: Request, res: Response) {
  if (!anonKey) {
    res.status(500).json({
      success: false,
      error: {
        message: "ANON_KEY in .env not set",
      },
    });
    return;
  }
  // TODO check origin, key or something to validate request
  res.status(200).json({
    success: true,
    keys: {
      publishableKey: anonKey,
    },
  });
}
