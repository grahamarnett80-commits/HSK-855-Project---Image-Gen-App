/*
  # Image Generations Table
  
  Creates a table to store the history of AI-generated images using fal.ai Flux 2 Pro model.
  
  1. New Tables
    - `image_generations`
      - `id` (uuid, primary key) - Unique identifier for each generation
      - `prompt` (text, required) - The text prompt used to generate the image
      - `image_url` (text, required) - URL of the generated image
      - `seed` (integer, optional) - The seed used for generation
      - `image_size` (text, optional) - The size of the generated image (e.g., "landscape_4_3")
      - `created_at` (timestamptz) - Timestamp when the image was generated
      
  2. Security
    - Enable RLS on `image_generations` table
    - Add policy to allow anyone to read all generations (public gallery)
    - Add policy to allow anyone to insert new generations (no auth required for MVP)
  
  3. Important Notes
    - This is an MVP version without user authentication
    - All generated images are publicly viewable
    - Future enhancement: Add user_id column and restrict access based on ownership
*/

CREATE TABLE IF NOT EXISTS image_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt text NOT NULL,
  image_url text NOT NULL,
  seed integer,
  image_size text DEFAULT 'landscape_4_3',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE image_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view image generations"
  ON image_generations
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create image generations"
  ON image_generations
  FOR INSERT
  WITH CHECK (true);
