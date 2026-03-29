import express from "express";
import register from "./logger";

const logRouter = express.Router();
logRouter.post("/logger", register);

export default logRouter;
