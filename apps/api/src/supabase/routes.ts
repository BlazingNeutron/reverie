import express from "express";
import register from "./keys";

const supabaseRouter = express.Router();
supabaseRouter.post("/keys", register);

export default supabaseRouter;
