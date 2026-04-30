import data from '@/app/lib/placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// Ensure we export the array directly for easy indexing
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
