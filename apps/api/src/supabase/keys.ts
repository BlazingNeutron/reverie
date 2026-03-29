import { type Request, type Response } from "express";

const serviceKey = process.env.SUPABASE_PUBLISHABLE_KEY!;

export default async function register(_req: Request, res: Response) {
  if (!serviceKey) {
    res.status(500).json({
      success: false,
      error: {
        message: "SUPABASE_PUBLISHABLE_KEY in .env not set",
      },
    });
    return;
  }
  // TODO check origin, key or something to validate request
  res.status(200).json({
    success: true,
    keys: {
      publishableKey: serviceKey,
    },
  });
}
