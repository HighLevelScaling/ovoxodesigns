import { Request, Response } from 'express';
import { constructWebhookEvent } from './checkout';
import { ENV } from '../_core/env';
import { createPurchase, updatePurchase, getPurchaseBySessionId } from '../db';
import { PRODUCTS, ProductId } from './products';

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'] as string;
  
  if (!signature) {
    console.error('[Webhook] Missing stripe-signature header');
    return res.status(400).json({ error: 'Missing signature' });
  }

  let event;
  try {
    event = constructWebhookEvent(
      req.body,
      signature,
      ENV.stripeWebhookSecret
    );
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Handle test events for webhook verification
  if (event.id.startsWith('evt_test_')) {
    console.log('[Webhook] Test event detected, returning verification response');
    return res.json({ verified: true });
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const metadata = session.metadata || {};
        const userId = parseInt(metadata.user_id || '0', 10);
        const productId = metadata.product_id as ProductId;
        
        if (!userId || !productId) {
          console.error('[Webhook] Missing user_id or product_id in metadata');
          break;
        }

        const product = PRODUCTS[productId];
        if (!product) {
          console.error(`[Webhook] Invalid product_id: ${productId}`);
          break;
        }

        // Check if purchase already exists
        const existingPurchase = await getPurchaseBySessionId(session.id);
        
        if (existingPurchase) {
          // Update existing purchase
          await updatePurchase(existingPurchase.id, {
            status: 'completed',
            stripePaymentIntentId: session.payment_intent as string,
          });
          console.log(`[Webhook] Updated existing purchase ${existingPurchase.id}`);
        } else {
          // Create new purchase record
          await createPurchase({
            userId,
            packageType: productId,
            amount: (product.price / 100).toFixed(2),
            currency: 'USD',
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string,
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
          console.log(`[Webhook] Created new purchase for user ${userId}`);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        console.log(`[Webhook] Payment succeeded: ${event.data.object.id}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        console.log(`[Webhook] Payment failed: ${event.data.object.id}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing event:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
