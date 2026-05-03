
'use client';

import data from '@/app/lib/placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

/**
 * Universal source of truth for all image placeholder data.
 */
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

/**
 * Specifically filtered lists for tactical shards and user identity.
 */
export const PLANET_IMAGES = data.placeholderImages.filter(img => img.id.startsWith('planet-'));
export const AVATAR_IMAGES = data.placeholderImages.filter(img => img.id.startsWith('avatar-'));
