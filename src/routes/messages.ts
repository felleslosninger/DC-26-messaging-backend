import { Router } from "express";
import { z } from "zod";
import { createMessage, listMessagesSince } from "../services/messages";
import { listDevices } from "../services/devices";
import { sendWakeUpPush } from "../services/apns";

export const messagesRouter = Router();

const createSchema = z.object({
  issuerName: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  actionUrl: z.string().url().optional()
});

// Creates a message and pushes a silent "wake up" notification to every
// registered device. There is no per-user targeting yet — every device
// receives every message. Add a recipient/device mapping before this goes
// further than a demo.
messagesRouter.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const message = createMessage(parsed.data);

  const tokens = listDevices().map((device) => device.token);
  try {
    await sendWakeUpPush(tokens, { title: parsed.data.title, body: parsed.data.body });
  } catch (error) {
    // The message is already stored — only the push delivery failed (e.g. APNs
    // key not configured yet). Surface it without losing the saved message.
    console.error("Failed to send wake-up push", error);
    return res.status(201).json({ ...message, pushDelivery: "failed" });
  }

  res.status(201).json(message);
});

messagesRouter.get("/", (req, res) => {
  const since = typeof req.query.since === "string" ? req.query.since : undefined;
  res.json(listMessagesSince(since));
});
