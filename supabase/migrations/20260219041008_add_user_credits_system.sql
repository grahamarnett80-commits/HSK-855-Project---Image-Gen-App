/*
  # User Credits System
  
  Creates a comprehensive credit system for managing user image generation credits.
  
  1. New Tables
    - `user_credits`
      - `user_id` (uuid, primary key) - References auth.users
      - `credits` (numeric) - Current available credits (default: 3 for free trial)
      - `total_credits_purchased` (numeric) - Lifetime credits purchased
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Changes to Existing Tables
    - `image_generations` table modified:
      - Added `user_id` column (references auth.users)
      - Added `credits_used` column (default: 1)
  
  3. Security
    - Enable RLS on `user_credits` table
    - Users can view and update only their own credit balance
    - Users can view only their own image generations
    - Users can insert image generations only for themselves
  
  4. Functions
    - `grant_free_credits_on_signup()` - Automatically grants 3 free credits to new users
    - Trigger on auth.users creation to call this function
  
  5. Important Notes
    - New users receive 3 free credits automatically
    - Each image generation costs 1 credit by default
    - Credits are tracked per user with full audit trail
*/

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits numeric NOT NULL DEFAULT 3,
  total_credits_purchased numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credits"
  ON user_credits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON user_credits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add user_id and credits_used to image_generations if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_generations' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE image_generations ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'image_generations' AND column_name = 'credits_used'
  ) THEN
    ALTER TABLE image_generations ADD COLUMN credits_used numeric NOT NULL DEFAULT 1;
  END IF;
END $$;

-- Update RLS policies for image_generations
DROP POLICY IF EXISTS "Anyone can view image generations" ON image_generations;
DROP POLICY IF EXISTS "Anyone can create image generations" ON image_generations;

CREATE POLICY "Users can view their own image generations"
  ON image_generations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own image generations"
  ON image_generations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to grant free credits on signup
CREATE OR REPLACE FUNCTION grant_free_credits_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, credits, total_credits_purchased)
  VALUES (NEW.id, 3, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION grant_free_credits_on_signup();

-- Grant existing users 3 free credits if they don't have a record
INSERT INTO user_credits (user_id, credits, total_credits_purchased)
SELECT id, 3, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_credits)
ON CONFLICT (user_id) DO NOTHING;