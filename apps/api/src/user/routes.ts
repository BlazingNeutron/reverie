import express from "express";
import register from "./signup";

const userRouter = express.Router();
userRouter.post("/signup", register);

export default userRouter;
