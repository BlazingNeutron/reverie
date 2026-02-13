import express from "express";
import register from "./signup";

const router = express.Router();
router.post("/signup", register);

export default router;
