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
  await getDb().insert(userCollectionStates).values({ userId, coin: 3000, showcaseJson: "[]", lastAttendanceDate: "", updatedAt: new Date().toISOString() }).onConflictDoNothing().run();
}

export async function POST(request: Request) {
  const user = await currentUser(request);
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const date = todayKst();
  await ensureCollectionState(user.id);
  const claimed = await env.DB.prepare("UPDATE user_collection_states SET coin = coin + ?, last_attendance_date = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND last_attendance_date <> ?").bind(DAILY_ATTENDANCE_REWARD, date, user.id, date).run();
  const state = await getDb().select({ coin: userCollectionStates.coin, lastAttendanceDate: userCollectionStates.lastAttendanceDate }).from(userCollectionStates).where(eq(userCollectionStates.userId, user.id)).get();
  return Response.json({ claimed: claimed.meta.changes === 1, reward: DAILY_ATTENDANCE_REWARD, coin: state?.coin ?? 3000, date, lastAttendanceDate: state?.lastAttendanceDate ?? "" });
}
