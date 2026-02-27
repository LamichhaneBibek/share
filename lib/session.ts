import { cookies } from 'next/headers';
import { getDatabase } from './db';
import { v4 as uuidv4 } from 'uuid';
import { customAlphabet } from 'nanoid';

const SESSION_COOKIE_NAME = 'session_id';
const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// Use nanoid for collision-resistant slugs
const generateNanoSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

export async function getOrCreateSession(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    // no cookie at all, create a fresh session
    sessionId = uuidv4();
    const db = getDatabase();

    const stmt = db.prepare('INSERT INTO sessions (id) VALUES (?)');
    stmt.run(sessionId);

    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      maxAge: SESSION_COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  } else {
    // cookie existed; make sure it corresponds to a real session in the database
    const db = getDatabase();
    const row = db
      .prepare('SELECT id FROM sessions WHERE id = ?')
      .get(sessionId);

    if (!row) {
      // stale cookie (e.g. DB was wiped) – treat as if no session
      // we could either reuse the same id or generate a new one; reusing
      // keeps the cookie value stable, but there is no real advantage either way.
      // Create a fresh entry so that foreign key constraints won't fail later.
      const newId = uuidv4();
      sessionId = newId;
      db.prepare('INSERT INTO sessions (id) VALUES (?)').run(sessionId);

      // update the cookie in case we changed the id
      cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
        maxAge: SESSION_COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }
  }

  return sessionId;
}

export async function getCurrentSession(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

export function generateSlug(): string {
  return generateNanoSlug();
}
