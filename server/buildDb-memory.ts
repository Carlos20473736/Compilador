import { eq, desc } from "drizzle-orm";
import { builds, type InsertBuild, type Build } from "../drizzle/schema";
import { getDb } from "./db";

// In-memory fallback for builds when database is not available
const memoryBuilds = new Map<number, Build>();
let nextBuildId = 1;

export async function createBuild(build: InsertBuild): Promise<Build> {
  const db = await getDb();
  
  if (db) {
    try {
      const result = await db.insert(builds).values(build);
      const insertId = Number(result[0].insertId);

      const created = await db.select().from(builds).where(eq(builds.id, insertId)).limit(1);
      if (!created[0]) {
        throw new Error("Failed to create build");
      }

      return created[0];
    } catch (error) {
      console.warn("[Database] Failed to create build, using memory fallback:", error);
    }
  }

  // Fallback to memory storage
  const id = nextBuildId++;
  const now = new Date();
  const newBuild: Build = {
    id,
    userId: build.userId,
    projectName: build.projectName,
    buildType: build.buildType,
    status: build.status,
    zipFileKey: build.zipFileKey,
    apkUrl: build.apkUrl,
    apkFileKey: build.apkFileKey,
    logs: build.logs,
    errorMessage: build.errorMessage,
    createdAt: now,
    completedAt: build.completedAt,
  };

  memoryBuilds.set(id, newBuild);
  return newBuild;
}

export async function getBuildById(id: number): Promise<Build | undefined> {
  const db = await getDb();
  
  if (db) {
    try {
      const result = await db.select().from(builds).where(eq(builds.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.warn("[Database] Failed to get build, using memory fallback:", error);
    }
  }

  return memoryBuilds.get(id);
}

export async function updateBuild(id: number, updates: Partial<Build>): Promise<void> {
  const db = await getDb();
  
  if (db) {
    try {
      await db.update(builds).set(updates).where(eq(builds.id, id));
      return;
    } catch (error) {
      console.warn("[Database] Failed to update build, using memory fallback:", error);
    }
  }

  // Fallback to memory storage
  const existing = memoryBuilds.get(id);
  if (existing) {
    memoryBuilds.set(id, { ...existing, ...updates });
  }
}

export async function getUserBuilds(userId: number): Promise<Build[]> {
  const db = await getDb();
  
  if (db) {
    try {
      return db.select().from(builds).where(eq(builds.userId, userId)).orderBy(desc(builds.createdAt));
    } catch (error) {
      console.warn("[Database] Failed to get user builds, using memory fallback:", error);
    }
  }

  // Fallback to memory storage
  return Array.from(memoryBuilds.values())
    .filter(b => b.userId === userId)
    .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
}

export async function getAllBuilds(): Promise<Build[]> {
  const db = await getDb();
  
  if (db) {
    try {
      return db.select().from(builds).orderBy(desc(builds.createdAt)).limit(100);
    } catch (error) {
      console.warn("[Database] Failed to get all builds, using memory fallback:", error);
    }
  }

  // Fallback to memory storage
  return Array.from(memoryBuilds.values())
    .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
    .slice(0, 100);
}
