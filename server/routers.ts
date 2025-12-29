import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { 
  createLogo, updateLogo, getLogoById, getUserLogos,
  createBrandKit, updateBrandKit, getBrandKitById, getUserBrandKits,
  createPurchase, updatePurchase, getPurchaseBySessionId, getUserPurchases, getCompletedPurchases,
  createLogoGeneration, updateLogoGeneration
} from "./db";
import { generateLogo, generateLogoVariations, generateBrandKitAssets } from "./ideogram/client";
import { createCheckoutSession, retrieveSession } from "./stripe/checkout";
import { PRODUCTS, ProductId, formatPrice, getAllProducts } from "./stripe/products";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  products: router({
    list: publicProcedure.query(() => {
      return getAllProducts().map(p => ({
        ...p,
        formattedPrice: formatPrice(p.price),
      }));
    }),
    get: publicProcedure
      .input(z.object({ id: z.enum(['basic', 'premium', 'brandkit']) }))
      .query(({ input }) => {
        const product = PRODUCTS[input.id];
        return { ...product, formattedPrice: formatPrice(product.price) };
      }),
  }),

  checkout: router({
    create: protectedProcedure
      .input(z.object({
        productId: z.enum(['basic', 'premium', 'brandkit']),
        logoData: z.object({
          companyName: z.string().min(1),
          tagline: z.string().optional(),
          industry: z.string().optional(),
          style: z.string().optional(),
          colorScheme: z.string().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        const { productId, logoData } = input;
        const product = PRODUCTS[productId];
        
        const purchaseId = await createPurchase({
          userId: ctx.user.id,
          packageType: productId,
          amount: (product.price / 100).toFixed(2),
          currency: 'USD',
          status: 'pending',
          metadata: { logoData },
        });

        const checkoutUrl = await createCheckoutSession({
          productId,
          userId: ctx.user.id,
          userEmail: ctx.user.email || '',
          userName: ctx.user.name || undefined,
          logoData,
          origin: ctx.req.headers.origin || 'http://localhost:3000',
        });

        return { checkoutUrl, purchaseId };
      }),

    verify: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ ctx, input }) => {
        const session = await retrieveSession(input.sessionId);
        
        if (session.payment_status !== 'paid') {
          return { success: false, status: session.payment_status };
        }

        const existingPurchase = await getPurchaseBySessionId(input.sessionId);
        
        if (!existingPurchase) {
          const metadata = session.metadata || {};
          const productId = metadata.product_id as ProductId;
          const product = PRODUCTS[productId];
          
          await createPurchase({
            userId: ctx.user.id,
            packageType: productId,
            amount: (product.price / 100).toFixed(2),
            currency: 'USD',
            stripeSessionId: input.sessionId,
            status: 'completed',
            metadata: {
              logoData: {
                companyName: metadata.company_name,
                tagline: metadata.tagline,
                industry: metadata.industry,
                style: metadata.style,
                colorScheme: metadata.color_scheme,
              }
            },
          });
        }

        return { 
          success: true, 
          status: 'paid',
          productId: session.metadata?.product_id,
          logoData: {
            companyName: session.metadata?.company_name,
            tagline: session.metadata?.tagline,
            industry: session.metadata?.industry,
            style: session.metadata?.style,
            colorScheme: session.metadata?.color_scheme,
          }
        };
      }),
  }),

  logo: router({
    // Preview endpoint - generates a single logo preview before payment
    preview: protectedProcedure
      .input(z.object({
        companyName: z.string().min(1),
        tagline: z.string().optional(),
        industry: z.string().optional(),
        style: z.string().optional(),
        colorScheme: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { companyName, tagline, industry, style, colorScheme } = input;

        try {
          // Generate 3 preview logos
          const logos = await generateLogoVariations({ companyName, tagline, industry, style, colorScheme }, 3);
          
          return { 
            success: true, 
            previews: logos.map((logo, index) => ({
              index,
              imageUrl: logo.imageUrl,
              prompt: logo.prompt,
            }))
          };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate logo previews',
          });
        }
      }),

    generate: protectedProcedure
      .input(z.object({
        purchaseId: z.number().optional(),
        companyName: z.string().min(1),
        tagline: z.string().optional(),
        industry: z.string().optional(),
        style: z.string().optional(),
        colorScheme: z.string().optional(),
        variationCount: z.number().min(1).max(3).default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const { purchaseId, companyName, tagline, industry, style, colorScheme, variationCount } = input;

        const genId = await createLogoGeneration({
          userId: ctx.user.id,
          purchaseId,
          prompt: `Logo for ${companyName}`,
          status: 'processing',
        });

        try {
          let logos;
          if (variationCount > 1) {
            logos = await generateLogoVariations({ companyName, tagline, industry, style, colorScheme }, variationCount);
          } else {
            const logo = await generateLogo({ companyName, tagline, industry, style, colorScheme });
            logos = [logo];
          }

          const savedLogos = [];
          for (let i = 0; i < logos.length; i++) {
            const logo = logos[i];
            const logoId = await createLogo({
              userId: ctx.user.id,
              companyName,
              tagline,
              industry,
              style,
              colorScheme,
              prompt: logo.prompt,
              imageUrl: logo.imageUrl,
              imageKey: logo.imageKey,
              variationIndex: i,
              status: 'completed',
            });
            savedLogos.push({ id: logoId, ...logo, variationIndex: i });
          }

          await updateLogoGeneration(genId, { status: 'completed' });

          return { success: true, logos: savedLogos };
        } catch (error) {
          await updateLogoGeneration(genId, { 
            status: 'failed', 
            errorMessage: error instanceof Error ? error.message : 'Unknown error' 
          });
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate logo',
          });
        }
      }),

    regenerate: protectedProcedure
      .input(z.object({
        logoId: z.number(),
        style: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const existingLogo = await getLogoById(input.logoId);
        if (!existingLogo || existingLogo.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Logo not found' });
        }

        const newLogo = await generateLogo({
          companyName: existingLogo.companyName,
          tagline: existingLogo.tagline || undefined,
          industry: existingLogo.industry || undefined,
          style: input.style || existingLogo.style || undefined,
          colorScheme: existingLogo.colorScheme || undefined,
        });

        await updateLogo(input.logoId, {
          imageUrl: newLogo.imageUrl,
          imageKey: newLogo.imageKey,
          prompt: newLogo.prompt,
        });

        return { success: true, logo: { id: input.logoId, ...newLogo } };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserLogos(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const logo = await getLogoById(input.id);
        if (!logo || logo.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Logo not found' });
        }
        return logo;
      }),
  }),

  brandKit: router({
    generate: protectedProcedure
      .input(z.object({
        logoId: z.number(),
        name: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const logo = await getLogoById(input.logoId);
        if (!logo || logo.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Logo not found' });
        }

        const brandKitId = await createBrandKit({
          userId: ctx.user.id,
          logoId: input.logoId,
          name: input.name,
          status: 'generating',
        });

        try {
          const assets = await generateBrandKitAssets(
            logo.companyName,
            logo.imageUrl || '',
            logo.colorScheme || undefined
          );

          await updateBrandKit(brandKitId, {
            emailSignatureUrl: assets.emailSignature.url,
            emailSignatureKey: assets.emailSignature.key,
            businessCardFrontUrl: assets.businessCardFront.url,
            businessCardFrontKey: assets.businessCardFront.key,
            businessCardBackUrl: assets.businessCardBack.url,
            businessCardBackKey: assets.businessCardBack.key,
            letterheadUrl: assets.letterhead.url,
            letterheadKey: assets.letterhead.key,
            folderUrl: assets.folder.url,
            folderKey: assets.folder.key,
            status: 'completed',
          });

          const brandKit = await getBrandKitById(brandKitId);
          return { success: true, brandKit };
        } catch (error) {
          await updateBrandKit(brandKitId, { status: 'failed' });
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate brand kit',
          });
        }
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserBrandKits(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const brandKit = await getBrandKitById(input.id);
        if (!brandKit || brandKit.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Brand kit not found' });
        }
        return brandKit;
      }),
  }),

  dashboard: router({
    purchases: protectedProcedure.query(async ({ ctx }) => {
      return getUserPurchases(ctx.user.id);
    }),
    
    completedPurchases: protectedProcedure.query(async ({ ctx }) => {
      return getCompletedPurchases(ctx.user.id);
    }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      const logos = await getUserLogos(ctx.user.id);
      const brandKits = await getUserBrandKits(ctx.user.id);
      const purchases = await getCompletedPurchases(ctx.user.id);
      
      return {
        totalLogos: logos.length,
        totalBrandKits: brandKits.length,
        totalPurchases: purchases.length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
