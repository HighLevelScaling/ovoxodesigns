import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { TRPCError } from "@trpc/server";

// Mock the stripe checkout module
vi.mock("./stripe/checkout", () => ({
  createCheckoutSession: vi.fn().mockResolvedValue("https://checkout.stripe.com/test-session"),
  retrieveSession: vi.fn().mockResolvedValue({
    id: "cs_test_123",
    payment_status: "paid",
    metadata: {
      product_id: "premium",
      user_id: "1",
      company_name: "Test Company",
      tagline: "Test Tagline",
      industry: "Technology",
      style: "modern",
      color_scheme: "blue",
    },
  }),
}));

// Mock the db module
vi.mock("./db", () => ({
  createPurchase: vi.fn().mockResolvedValue(1),
  updatePurchase: vi.fn().mockResolvedValue(undefined),
  getPurchaseBySessionId: vi.fn().mockResolvedValue(null),
  getUserPurchases: vi.fn().mockResolvedValue([]),
  getCompletedPurchases: vi.fn().mockResolvedValue([]),
  createLogo: vi.fn().mockResolvedValue(1),
  updateLogo: vi.fn().mockResolvedValue(undefined),
  getLogoById: vi.fn().mockResolvedValue(null),
  getUserLogos: vi.fn().mockResolvedValue([]),
  createBrandKit: vi.fn().mockResolvedValue(1),
  updateBrandKit: vi.fn().mockResolvedValue(undefined),
  getBrandKitById: vi.fn().mockResolvedValue(null),
  getUserBrandKits: vi.fn().mockResolvedValue([]),
  createLogoGeneration: vi.fn().mockResolvedValue(1),
  updateLogoGeneration: vi.fn().mockResolvedValue(undefined),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {
        origin: "http://localhost:3000",
      },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("checkout.create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates checkout session for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.checkout.create({
      productId: "premium",
      logoData: {
        companyName: "Test Company",
        tagline: "Test Tagline",
        industry: "Technology",
        style: "modern",
        colorScheme: "blue",
      },
    });

    expect(result.checkoutUrl).toBe("https://checkout.stripe.com/test-session");
    expect(result.purchaseId).toBe(1);
  });

  it("rejects unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.checkout.create({
        productId: "premium",
        logoData: {
          companyName: "Test Company",
        },
      })
    ).rejects.toThrow();
  });

  it("validates company name is required", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.checkout.create({
        productId: "premium",
        logoData: {
          companyName: "",
        },
      })
    ).rejects.toThrow();
  });
});

describe("checkout.verify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifies successful payment", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.checkout.verify({
      sessionId: "cs_test_123",
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe("paid");
    expect(result.productId).toBe("premium");
    expect(result.logoData?.companyName).toBe("Test Company");
  });
});
