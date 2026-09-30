import { and, eq, gt } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { sessions, userCollectionStates, users } from "../../../db/schema";

export const dynamic = "force-dynamic";
export const DAILY_ATTENDANCE_REWARD = 10000;

function todayKst() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

async function currentUser(request: Request) {
  const sessionId = request.headers.get("Cookie")?.match(/(?:^|; )session=([^;]+)/)?.[1];
  if (!sessionId) return null;
  return (await getDb().select({ user: users }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, Math.floor(Date.now() / 1000)))).get())?.user ?? null;
}

async function ensureCollectionState(userId: string) {
  // The production database predates the attendance column migration. Use only
  // the original collection-state columns here so first-time attendance claims
  // do not fail while the legacy schema is still in place.
  await env.DB.prepare("INSERT OR IGNORE INTO user_collection_states (user_id, coin, showcase_json, updated_at) VALUES (?, ?, ?, ?)")
    .bind(userId, 3000, "[]", new Date().toISOString())
    .run();
}

async function ensureAttendanceTable() {
  // Keep the reward ledger independent of collection-state migrations. This also
  // lets an already-deployed database begin supporting attendance safely.
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_attendance_claims (
    user_id TEXT NOT NULL,
    attendance_date TEXT NOT NULL,
    claim_token TEXT NOT NULL,
    claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, attendance_date)
  )`).run();
}

export async function POST(request: Request) {
  const user = await currentUser(request);
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const date = todayKst();
  await ensureCollectionState(user.id);
  await ensureAttendanceTable();

  const claimToken = crypto.randomUUID();
  const [claim] = await env.DB.batch([
    env.DB.prepare("INSERT OR IGNORE INTO user_attendance_claims (user_id, attendance_date, claim_token) VALUES (?, ?, ?)").bind(user.id, date, claimToken),
    env.DB.prepare("UPDATE user_collection_states SET coin = coin + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND EXISTS (SELECT 1 FROM user_attendance_claims WHERE user_id = ? AND attendance_date = ? AND claim_token = ?)").bind(DAILY_ATTENDANCE_REWARD, user.id, user.id, date, claimToken),
  ]);
  const state = await getDb().select({ coin: userCollectionStates.coin }).from(userCollectionStates).where(eq(userCollectionStates.userId, user.id)).get();
  return Response.json({ claimed: claim.meta.changes === 1, reward: DAILY_ATTENDANCE_REWARD, coin: state?.coin ?? 3000, date, lastAttendanceDate: date });
}
