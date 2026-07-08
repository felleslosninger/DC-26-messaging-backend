import { db } from "../db";

export interface Message {
  id: number;
  issuer_name: string;
  title: string;
  body: string;
  action_url: string | null;
  created_at: string;
}

export interface CreateMessageInput {
  issuerName: string;
  title: string;
  body: string;
  actionUrl?: string;
}

export function createMessage(input: CreateMessageInput): Message {
  const result = db
    .prepare(
      `INSERT INTO messages (issuer_name, title, body, action_url) VALUES (?, ?, ?, ?)`
    )
    .run(input.issuerName, input.title, input.body, input.actionUrl ?? null);

  return db.prepare(`SELECT * FROM messages WHERE id = ?`).get(result.lastInsertRowid) as Message;
}

export function listMessagesSince(since?: string): Message[] {
  if (since) {
    return db
      .prepare(`SELECT * FROM messages WHERE created_at > ? ORDER BY created_at ASC`)
      .all(since) as Message[];
  }
  return db.prepare(`SELECT * FROM messages ORDER BY created_at ASC`).all() as Message[];
}
