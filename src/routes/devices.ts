import { Router } from "express";
import { z } from "zod";
import { registerDevice } from "../services/devices";

export const devicesRouter = Router();

const registerSchema = z.object({
  deviceToken: z.string().min(1)
});

devicesRouter.post("/", (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const device = registerDevice(parsed.data.deviceToken);
  res.status(201).json(device);
});
