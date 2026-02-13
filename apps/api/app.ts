import express from "express";
import userRoutes from "./user/routes";
const app = express();

app.use(express.json());
app.use("/", userRoutes);

app.get("/status", (req, res) => {
  res.json({
    status: "Running",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.REVERIE_API_PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
