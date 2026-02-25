export type ImageSize =
  | 'square_hd'
  | 'square'
  | 'portrait_4_3'
  | 'portrait_16_9'
  | 'landscape_4_3'
  | 'landscape_16_9';

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface ImageGeneration {
  id: string;
  prompt: string;
  image_url: string;
  seed?: number;
  image_size?: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      image_generations: {
        Row: ImageGeneration;
        Insert: Omit<ImageGeneration, 'id' | 'created_at'>;
        Update: Partial<Omit<ImageGeneration, 'id' | 'created_at'>>;
      };
    };
  };
}

export interface GenerateImageParams {
  prompt: string;
  imageSize?: ImageSize;
  seed?: number;
}

export interface GeneratedImage {
  url: string;
  seed: number;
}
