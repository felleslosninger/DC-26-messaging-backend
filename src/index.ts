import "dotenv/config";
import express from "express";
import { devicesRouter } from "./routes/devices";
import { messagesRouter } from "./routes/messages";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/devices", devicesRouter);
app.use("/api/messages", messagesRouter);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Messaging backend listening on port ${port}`);
});
