import { eq, desc } from "drizzle-orm";
import { builds, type InsertBuild, type Build } from "../drizzle/schema";
import { getDb } from "./db";

export async function createBuild(build: InsertBuild): Promise<Build> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(builds).values(build);
  const insertId = Number(result[0].insertId);

  const created = await db.select().from(builds).where(eq(builds.id, insertId)).limit(1);
  if (!created[0]) {
    throw new Error("Failed to create build");
  }

  return created[0];
}

export async function getBuildById(id: number): Promise<Build | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(builds).where(eq(builds.id, id)).limit(1);
  return result[0];
}

export async function updateBuild(id: number, updates: Partial<Build>): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(builds).set(updates).where(eq(builds.id, id));
}

export async function getUserBuilds(userId: number): Promise<Build[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db.select().from(builds).where(eq(builds.userId, userId)).orderBy(desc(builds.createdAt));
}

export async function getAllBuilds(): Promise<Build[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db.select().from(builds).orderBy(desc(builds.createdAt)).limit(100);
}
