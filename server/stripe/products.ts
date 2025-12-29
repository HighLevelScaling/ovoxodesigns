/**
 * LogoForge Product Configuration
 * 
 * Pricing Strategy (65% profit margin):
 * - Basic Logo: $5 (competitors charge $20)
 * - Premium Logo: $9 (competitors charge $65)
 * - Brand Kit: $19 (competitors charge $96)
 */

export const PRODUCTS = {
  basic: {
    id: 'basic',
    name: 'Basic Logo',
    description: '1 AI-generated logo with PNG format and commercial license',
    price: 500, // in cents
    currency: 'usd',
    features: [
      '1 AI-generated logo',
      'PNG format (1024x1024)',
      '3 regeneration attempts',
      'Commercial license',
      'Transparent background',
    ],
    logoCount: 1,
    regenerations: 3,
    includesBrandKit: false,
  },
  premium: {
    id: 'premium',
    name: 'Premium Logo',
    description: '3 logo variations with multiple formats and unlimited regenerations',
    price: 900, // in cents
    currency: 'usd',
    features: [
      '3 logo variations',
      'Transparent backgrounds',
      'PNG & JPEG formats',
      'Unlimited regenerations',
      'Commercial license',
      'Full ownership rights',
    ],
    logoCount: 3,
    regenerations: -1, // unlimited
    includesBrandKit: false,
  },
  brandkit: {
    id: 'brandkit',
    name: 'Brand Kit',
    description: 'Complete brand identity package with logo and business materials',
    price: 1900, // in cents
    currency: 'usd',
    features: [
      'Everything in Premium Logo',
      'Email signature template',
      'Business card (front & back)',
      'Letterhead design',
      'Folder design',
      'All formats (PNG, JPEG)',
      'Commercial license',
      'Full ownership rights',
    ],
    logoCount: 3,
    regenerations: -1, // unlimited
    includesBrandKit: true,
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;
export type Product = typeof PRODUCTS[ProductId];

export function getProduct(id: ProductId): Product {
  return PRODUCTS[id];
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export function getAllProducts(): Product[] {
  return Object.values(PRODUCTS);
}
