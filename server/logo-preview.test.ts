import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the ideogram client
vi.mock("./ideogram/client", () => ({
  generateLogo: vi.fn().mockResolvedValue({
    imageUrl: "https://example.com/logo.png",
    imageKey: "logos/test-logo.png",
    prompt: "Test logo prompt",
  }),
  generateLogoVariations: vi.fn().mockResolvedValue([
    { imageUrl: "https://example.com/logo1.png", imageKey: "logos/test-logo1.png", prompt: "Test logo 1" },
    { imageUrl: "https://example.com/logo2.png", imageKey: "logos/test-logo2.png", prompt: "Test logo 2" },
    { imageUrl: "https://example.com/logo3.png", imageKey: "logos/test-logo3.png", prompt: "Test logo 3" },
  ]),
  generateBrandKitAssets: vi.fn(),
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
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("logo.preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates 3 logo previews with valid input", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.logo.preview({
      companyName: "TechCorp",
      tagline: "Innovation First",
      industry: "Technology",
      style: "modern",
      colorScheme: "blue",
    });

    expect(result.success).toBe(true);
    expect(result.previews).toHaveLength(3);
    expect(result.previews[0]).toHaveProperty("imageUrl");
    expect(result.previews[0]).toHaveProperty("prompt");
    expect(result.previews[0]).toHaveProperty("index", 0);
  });

  it("generates previews with minimal input (company name only)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.logo.preview({
      companyName: "SimpleCompany",
    });

    expect(result.success).toBe(true);
    expect(result.previews).toHaveLength(3);
  });

  it("rejects empty company name", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.logo.preview({
        companyName: "",
      })
    ).rejects.toThrow();
  });

  it("requires authentication", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: vi.fn(),
      } as unknown as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.logo.preview({
        companyName: "TestCompany",
      })
    ).rejects.toThrow("Please login");
  });
});
