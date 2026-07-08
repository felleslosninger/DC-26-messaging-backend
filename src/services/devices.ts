import { db } from "../db";

export interface Device {
  id: number;
  token: string;
  created_at: string;
}

export function registerDevice(token: string): Device {
  db.prepare(
    `INSERT INTO devices (token) VALUES (?) ON CONFLICT(token) DO NOTHING`
  ).run(token);

  return db.prepare(`SELECT * FROM devices WHERE token = ?`).get(token) as Device;
}

export function listDevices(): Device[] {
  return db.prepare(`SELECT * FROM devices`).all() as Device[];
}
