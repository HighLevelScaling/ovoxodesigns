import Stripe from 'stripe';
import { ENV } from '../_core/env';
import { PRODUCTS, ProductId } from './products';

const stripe = new Stripe(ENV.stripeSecretKey || '');

export interface CreateCheckoutParams {
  productId: ProductId;
  userId: number;
  userEmail: string;
  userName?: string;
  logoData?: {
    companyName: string;
    tagline?: string;
    industry?: string;
    style?: string;
    colorScheme?: string;
  };
  origin: string;
}

export async function createCheckoutSession(params: CreateCheckoutParams): Promise<string> {
  const { productId, userId, userEmail, userName, logoData, origin } = params;
  const product = PRODUCTS[productId];

  if (!product) {
    throw new Error(`Invalid product ID: ${productId}`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: product.currency,
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.price,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
    customer_email: userEmail,
    client_reference_id: userId.toString(),
    allow_promotion_codes: true,
    metadata: {
      user_id: userId.toString(),
      customer_email: userEmail,
      customer_name: userName || '',
      product_id: productId,
      company_name: logoData?.companyName || '',
      tagline: logoData?.tagline || '',
      industry: logoData?.industry || '',
      style: logoData?.style || '',
      color_scheme: logoData?.colorScheme || '',
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session URL');
  }

  return session.url;
}

export async function retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId);
}

export function constructWebhookEvent(
  payload: Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export { stripe };
