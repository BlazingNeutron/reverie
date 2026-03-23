import { type Request, type Response } from "express";

const serviceKey = process.env.SERVICE_ROLE_KEY!;

export default async function register(req: Request, res: Response) {
  if (!serviceKey) {
    throw "Missing SERVICE_ROLE_KEY in .env";
  }
  // TODO check origin, key or something to auth
  console.log(req.headers.origin);
  res.status(200).json({
    success: true,
    keys: {
      publishableKey: serviceKey,
    },
  });
}
