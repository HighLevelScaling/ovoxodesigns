import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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

describe("products.list", () => {
  it("returns all three products with correct pricing", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const products = await caller.products.list();

    expect(products).toHaveLength(3);
    
    // Verify Basic package
    const basic = products.find(p => p.id === "basic");
    expect(basic).toBeDefined();
    expect(basic?.price).toBe(500); // $5.00 in cents
    expect(basic?.name).toBe("Basic Logo");
    expect(basic?.formattedPrice).toBe("$5");

    // Verify Premium package
    const premium = products.find(p => p.id === "premium");
    expect(premium).toBeDefined();
    expect(premium?.price).toBe(900); // $9.00 in cents
    expect(premium?.name).toBe("Premium Logo");
    expect(premium?.formattedPrice).toBe("$9");

    // Verify Brand Kit package
    const brandkit = products.find(p => p.id === "brandkit");
    expect(brandkit).toBeDefined();
    expect(brandkit?.price).toBe(1900); // $19.00 in cents
    expect(brandkit?.name).toBe("Brand Kit");
    expect(brandkit?.formattedPrice).toBe("$19");
  });
});

describe("products.get", () => {
  it("returns correct product by id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const premium = await caller.products.get({ id: "premium" });

    expect(premium.id).toBe("premium");
    expect(premium.name).toBe("Premium Logo");
    expect(premium.price).toBe(900);
    expect(premium.formattedPrice).toBe("$9");
  });

  it("returns brand kit with all features", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const brandkit = await caller.products.get({ id: "brandkit" });

    expect(brandkit.id).toBe("brandkit");
    expect(brandkit.features).toContain("Email signature template");
    expect(brandkit.features).toContain("Business card (front & back)");
    expect(brandkit.features).toContain("Letterhead design");
    expect(brandkit.features).toContain("Folder design");
  });
});
