import { generateImage } from '../_core/imageGeneration';
import { storagePut } from '../storage';
import { nanoid } from 'nanoid';

export interface LogoGenerationParams {
  companyName: string;
  tagline?: string;
  industry?: string;
  style?: string;
  colorScheme?: string;
  transparentBackground?: boolean;
}

export interface GeneratedLogo {
  imageUrl: string;
  imageKey: string;
  prompt: string;
}

/**
 * Generate a professional logo using AI image generation
 * Optimized for text rendering and transparent backgrounds
 */
export async function generateLogo(params: LogoGenerationParams): Promise<GeneratedLogo> {
  const { companyName, tagline, industry, style, colorScheme, transparentBackground = true } = params;

  // Build optimized prompt for logo generation
  const promptParts = [
    `Professional minimalist logo design for "${companyName}"`,
    tagline ? `with tagline "${tagline}"` : '',
    industry ? `in the ${industry} industry` : '',
    style ? `${style} style` : 'modern and clean style',
    colorScheme ? `using ${colorScheme} colors` : '',
    'vector-style logo',
    'centered composition',
    'high contrast',
    'professional business logo',
    transparentBackground ? 'on transparent background' : 'on white background',
    'crisp text rendering',
    'scalable design',
  ].filter(Boolean).join(', ');

  const prompt = promptParts;

  // Generate the logo using the built-in image generation
  const result = await generateImage({ prompt });

  if (!result.url) {
    throw new Error('Failed to generate logo image');
  }

  // The image is already saved to S3 by generateImage, create a unique key reference
  const imageKey = `logos/${nanoid()}.png`;

  return {
    imageUrl: result.url,
    imageKey,
    prompt,
  };
}

/**
 * Generate multiple logo variations
 */
export async function generateLogoVariations(
  params: LogoGenerationParams,
  count: number = 3
): Promise<GeneratedLogo[]> {
  const variations: GeneratedLogo[] = [];
  
  const styleVariations = [
    { ...params, style: params.style || 'modern minimalist' },
    { ...params, style: 'bold and dynamic' },
    { ...params, style: 'elegant and sophisticated' },
  ];

  for (let i = 0; i < Math.min(count, styleVariations.length); i++) {
    try {
      const logo = await generateLogo(styleVariations[i]);
      variations.push(logo);
    } catch (error) {
      console.error(`Failed to generate variation ${i + 1}:`, error);
    }
  }

  return variations;
}

/**
 * Generate brand kit assets based on a logo
 */
export interface BrandKitAssets {
  emailSignature: { url: string; key: string };
  businessCardFront: { url: string; key: string };
  businessCardBack: { url: string; key: string };
  letterhead: { url: string; key: string };
  folder: { url: string; key: string };
}

async function generateAndStoreAsset(prompt: string, keyPrefix: string): Promise<{ url: string; key: string }> {
  const result = await generateImage({ prompt });
  if (!result.url) {
    throw new Error(`Failed to generate ${keyPrefix} asset`);
  }
  const key = `brandkits/${nanoid()}-${keyPrefix}.png`;
  return { url: result.url, key };
}

export async function generateBrandKitAssets(
  companyName: string,
  logoUrl: string,
  colorScheme?: string
): Promise<BrandKitAssets> {
  const colors = colorScheme || 'professional blue and white';
  
  // Generate email signature
  const emailSigPrompt = `Professional email signature design for "${companyName}", featuring company logo placeholder, modern layout with name, title, phone, email fields, ${colors} color scheme, clean horizontal design, business professional style`;
  const emailSignature = await generateAndStoreAsset(emailSigPrompt, 'email-signature');

  // Generate business card front
  const cardFrontPrompt = `Professional business card front design for "${companyName}", featuring logo placeholder area, company name, modern minimalist layout, ${colors} color scheme, 3.5x2 inch standard size, premium quality design`;
  const businessCardFront = await generateAndStoreAsset(cardFrontPrompt, 'card-front');

  // Generate business card back
  const cardBackPrompt = `Professional business card back design for "${companyName}", contact information layout with name, title, phone, email, address fields, ${colors} color scheme, matching front design style, clean professional layout`;
  const businessCardBack = await generateAndStoreAsset(cardBackPrompt, 'card-back');

  // Generate letterhead
  const letterheadPrompt = `Professional letterhead design for "${companyName}", A4 size, logo placeholder at top, company name header, ${colors} color scheme, elegant border or accent design, space for letter content, footer with contact information`;
  const letterhead = await generateAndStoreAsset(letterheadPrompt, 'letterhead');

  // Generate folder design
  const folderPrompt = `Professional presentation folder design for "${companyName}", corporate folder mockup, logo placement area, ${colors} color scheme, pocket folder style, business document holder design, premium quality`;
  const folder = await generateAndStoreAsset(folderPrompt, 'folder');

  return {
    emailSignature,
    businessCardFront,
    businessCardBack,
    letterhead,
    folder,
  };
}
