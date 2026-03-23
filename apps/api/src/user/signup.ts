import { createClient } from "@supabase/supabase-js";
import { type Request, type Response } from "express";
import { passwordCheck } from "@repo/validators";

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceKey = process.env.SERVICE_ROLE_KEY!;

export default async function register(req: Request, res: Response) {
  if (!supabaseUrl) {
    throw "Missing SUPABASE_URL in .env";
  }
  if (!serviceKey) {
    throw "Missing SERVICE_ROLE_KEY in .env";
  }

  const {
    email,
    password,
    confirm,
    invite_code,
  }: { email: string; password: string; confirm: string; invite_code: string } =
    req.body;

  if (!invite_code) {
    res.status(500).json({
      success: false,
      error: { message: "An invite code is required to create an account" },
    });
    return;
  }

  if (!email || !isValidEmail(email)) {
    res.status(500).json({
      success: false,
      error: { message: "Email address is not a valid email address format" },
    });
    return;
  }

  if (!password || !passwordCheck(password) || confirm != password) {
    res.status(500).json({
      success: false,
      error: {
        message:
          "Password does not meet requirements or does not match repeated password",
      },
    });
    return;
  }
  console.log(supabaseUrl, serviceKey);
  const supabase = createClient(
    "http://supabase_kong_reverie.supabase_network_reverie:8000",
    serviceKey,
  );
  const { data, error } = await supabase.rpc("check_invite_code", {
    check_code: invite_code,
  });
  if (error) {
    res.status(500).json({ success: false, error });
    return;
  }
  if (data === true) {
    const { data: data2, error: error2 } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error2) {
      res.status(500).json({ success: false, error: error2 });
      return;
    }
    res.status(201).json({
      success: true,
      data: data2,
    });
  }
}

function isValidEmail(email: string) {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (pattern.test(email)) {
    return true;
  }
  return false;
}
