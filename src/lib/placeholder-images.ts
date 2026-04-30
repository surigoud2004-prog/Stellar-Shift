
import data from '@/app/lib/placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

/**
 * Direct reference to space-themed placeholder images for the celestial grid.
 */
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
