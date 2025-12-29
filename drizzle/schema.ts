import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Logos table - stores generated logos
 */
export const logos = mysqlTable("logos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  tagline: varchar("tagline", { length: 500 }),
  industry: varchar("industry", { length: 100 }),
  style: varchar("style", { length: 100 }),
  colorScheme: varchar("colorScheme", { length: 100 }),
  prompt: text("prompt"),
  imageUrl: text("imageUrl"),
  imageKey: varchar("imageKey", { length: 500 }),
  thumbnailUrl: text("thumbnailUrl"),
  format: mysqlEnum("format", ["png", "jpeg"]).default("png"),
  hasTransparentBg: int("hasTransparentBg").default(1),
  variationIndex: int("variationIndex").default(0),
  parentLogoId: int("parentLogoId"),
  status: mysqlEnum("status", ["pending", "generating", "completed", "failed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Logo = typeof logos.$inferSelect;
export type InsertLogo = typeof logos.$inferInsert;

/**
 * Brand Kits table - stores complete brand kit packages
 */
export const brandKits = mysqlTable("brandKits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  logoId: int("logoId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  emailSignatureUrl: text("emailSignatureUrl"),
  emailSignatureKey: varchar("emailSignatureKey", { length: 500 }),
  businessCardFrontUrl: text("businessCardFrontUrl"),
  businessCardFrontKey: varchar("businessCardFrontKey", { length: 500 }),
  businessCardBackUrl: text("businessCardBackUrl"),
  businessCardBackKey: varchar("businessCardBackKey", { length: 500 }),
  letterheadUrl: text("letterheadUrl"),
  letterheadKey: varchar("letterheadKey", { length: 500 }),
  folderUrl: text("folderUrl"),
  folderKey: varchar("folderKey", { length: 500 }),
  status: mysqlEnum("status", ["pending", "generating", "completed", "failed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BrandKit = typeof brandKits.$inferSelect;
export type InsertBrandKit = typeof brandKits.$inferInsert;

/**
 * Purchases table - tracks all user purchases
 */
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  packageType: mysqlEnum("packageType", ["basic", "premium", "brandkit"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  logoId: int("logoId"),
  brandKitId: int("brandKitId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

/**
 * Logo generations table - tracks generation requests and credits
 */
export const logoGenerations = mysqlTable("logoGenerations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  logoId: int("logoId"),
  purchaseId: int("purchaseId"),
  prompt: text("prompt").notNull(),
  apiResponse: json("apiResponse"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LogoGeneration = typeof logoGenerations.$inferSelect;
export type InsertLogoGeneration = typeof logoGenerations.$inferInsert;
