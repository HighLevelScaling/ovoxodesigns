import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  logos, InsertLogo, Logo,
  brandKits, InsertBrandKit, BrandKit,
  purchases, InsertPurchase, Purchase,
  logoGenerations, InsertLogoGeneration
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Logo functions
export async function createLogo(logo: InsertLogo): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(logos).values(logo);
  return Number(result[0].insertId);
}

export async function updateLogo(id: number, updates: Partial<InsertLogo>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(logos).set(updates).where(eq(logos.id, id));
}

export async function getLogoById(id: number): Promise<Logo | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(logos).where(eq(logos.id, id)).limit(1);
  return result[0];
}

export async function getUserLogos(userId: number): Promise<Logo[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(logos).where(eq(logos.userId, userId)).orderBy(desc(logos.createdAt));
}

// Brand Kit functions
export async function createBrandKit(brandKit: InsertBrandKit): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(brandKits).values(brandKit);
  return Number(result[0].insertId);
}

export async function updateBrandKit(id: number, updates: Partial<InsertBrandKit>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(brandKits).set(updates).where(eq(brandKits.id, id));
}

export async function getBrandKitById(id: number): Promise<BrandKit | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(brandKits).where(eq(brandKits.id, id)).limit(1);
  return result[0];
}

export async function getUserBrandKits(userId: number): Promise<BrandKit[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(brandKits).where(eq(brandKits.userId, userId)).orderBy(desc(brandKits.createdAt));
}

// Purchase functions
export async function createPurchase(purchase: InsertPurchase): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(purchases).values(purchase);
  return Number(result[0].insertId);
}

export async function updatePurchase(id: number, updates: Partial<InsertPurchase>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(purchases).set(updates).where(eq(purchases.id, id));
}

export async function getPurchaseBySessionId(sessionId: string): Promise<Purchase | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(purchases).where(eq(purchases.stripeSessionId, sessionId)).limit(1);
  return result[0];
}

export async function getUserPurchases(userId: number): Promise<Purchase[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(purchases).where(eq(purchases.userId, userId)).orderBy(desc(purchases.createdAt));
}

export async function getCompletedPurchases(userId: number): Promise<Purchase[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(purchases)
    .where(and(eq(purchases.userId, userId), eq(purchases.status, 'completed')))
    .orderBy(desc(purchases.createdAt));
}

// Logo Generation tracking
export async function createLogoGeneration(gen: InsertLogoGeneration): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(logoGenerations).values(gen);
  return Number(result[0].insertId);
}

export async function updateLogoGeneration(id: number, updates: Partial<InsertLogoGeneration>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(logoGenerations).set(updates).where(eq(logoGenerations.id, id));
}
