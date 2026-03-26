import { createClient } from "@supabase/supabase-js";
import { type Request, type Response } from "express";
import { passwordCheck, isValidEmail } from "@repo/validators";

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceKey = process.env.SERVICE_ROLE_KEY!;

export default async function register(req: Request, res: Response) {
  if (!supabaseUrl) {
    res.status(500).json({
      success: false,
      error: {
        message: "Missing SUPABASE_URL in .env",
      },
    });
    return;
  }
  if (!serviceKey) {
    res.status(500).json({
      success: false,
      error: {
        message: "SERVICE_ROLE_KEY in .env not set",
      },
    });
    return;
  }

  const {
    email,
    password,
    confirm,
    invite_code,
  }: { email: string; password: string; confirm: string; invite_code: string } =
    req.body;

  if (!validateSignUp(res, email, password, confirm, invite_code)) {
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: checkInviteData, error: checkInviteError } = await supabase.rpc(
    "check_invite_code",
    {
      check_code: invite_code,
    },
  );
  if (checkInviteError) {
    res.status(500).json({ success: false, error: checkInviteError });
    return;
  }
  if (checkInviteData === true) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: email,
        password: password,
      },
    );
    if (signUpError) {
      res.status(500).json({ success: false, error: signUpError });
      return;
    }
    res.status(201).json({
      success: true,
      data: signUpData,
    });
  }
  res
    .status(500)
    .json({
      success: false,
      error: {
        message: "An unexpected error occurred during account creation",
      },
    });
}

function validateSignUp(
  res: Response,
  email: string,
  password: string,
  confirm: string,
  invite_code: string,
) {
  if (!invite_code) {
    res.status(500).json({
      success: false,
      error: { message: "An invite code is required to create an account" },
    });
    return false;
  }
  if (!email || !isValidEmail(email)) {
    res.status(500).json({
      success: false,
      error: { message: "Email address is not a valid email address format" },
    });
    return false;
  }

  if (!password || !passwordCheck(password) || confirm != password) {
    res.status(500).json({
      success: false,
      error: {
        message:
          "Password does not meet requirements or does not match repeated password",
      },
    });
    return false;
  }
  return true;
}
