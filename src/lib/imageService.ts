import { supabase } from './supabase';
import type { GenerateImageParams, GeneratedImage } from './types';

export async function generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
  const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

  if (refreshError || !session) {
    const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !existingSession) {
      throw new Error('You must be logged in to generate images');
    }
    const token = existingSession.access_token;
    return callGenerateApi(params, token);
  }

  return callGenerateApi(params, session.access_token);
}

async function callGenerateApi(params: GenerateImageParams, token: string): Promise<GeneratedImage> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      prompt: params.prompt,
      imageSize: params.imageSize || 'landscape_4_3',
      ...(params.seed && { seed: params.seed }),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate image' }));
    console.error('Image generation error:', error);
    throw new Error(error.details || error.error || 'Failed to generate image');
  }

  const result = await response.json();
  const imageUrl = result.images?.[0]?.url || result.image?.url;
  const seed = result.seed;

  return {
    url: imageUrl,
    seed: seed,
  };
}

export async function getRecentGenerations(limit: number = 20) {
  const { data, error } = await supabase
    .from('image_generations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
