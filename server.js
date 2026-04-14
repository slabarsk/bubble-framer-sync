import express from "express";
import { sync } from "./sync.js";
import "dotenv/config";

const app = express();
app.use(express.json());

app.post("/sync-products", async (req, res) => {
  try {
    await sync();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("🚀 Server: http://localhost:3000"));