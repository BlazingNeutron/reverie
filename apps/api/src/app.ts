import express from "express";
import userRouter from "./user/routes";
import healthRouter from "./health/health";
import supabaseRouter from "./supabase/routes";

const app = express();

app.use(express.json());
app.use("/", healthRouter);
app.use("/user", userRouter);
app.use("/supabase", supabaseRouter);

const PORT = process.env.REVERIE_API_PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
