import { sql } from './db.js';

export async function getProfile(userId) {
  const db = sql();
  const rows = await db`SELECT data, updated_at FROM mm_profiles WHERE user_id = ${userId}`;
  return rows[0] ? { ...rows[0].data, updatedAt: rows[0].updated_at } : null;
}

export async function saveProfile(userId, data) {
  const db = sql();
  await db`
    INSERT INTO mm_profiles (user_id, data, updated_at)
    VALUES (${userId}, ${JSON.stringify(data)}, now())
    ON CONFLICT (user_id) DO UPDATE SET data = ${JSON.stringify(data)}, updated_at = now()
  `;
  return data;
}

export async function savePlan(userId, planDate, plan) {
  const db = sql();
  const rows = await db`
    INSERT INTO mm_plans (user_id, plan_date, data)
    VALUES (${userId}, ${planDate}, ${JSON.stringify(plan)})
    RETURNING id, plan_date, created_at
  `;
  return rows[0];
}

export async function listPlans(userId, limit = 10) {
  const db = sql();
  const rows = await db`
    SELECT id, plan_date, data, created_at
    FROM mm_plans
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({ id: r.id, planDate: r.plan_date, createdAt: r.created_at, plan: r.data }));
}

export async function saveAdvisory(userId, trip, advisory) {
  const db = sql();
  const rows = await db`
    INSERT INTO mm_advisories (user_id, trip, data)
    VALUES (${userId}, ${JSON.stringify(trip)}, ${JSON.stringify(advisory)})
    RETURNING id, created_at
  `;
  return rows[0];
}

export async function listAdvisories(userId, limit = 10) {
  const db = sql();
  const rows = await db`
    SELECT id, trip, data, created_at
    FROM mm_advisories
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({ id: r.id, trip: r.trip, createdAt: r.created_at, advisory: r.data }));
}
