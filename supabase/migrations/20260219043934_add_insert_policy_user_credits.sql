/*
  # Add INSERT policy for user_credits
  
  This policy allows authenticated users to insert their own credit records.
  This is needed when the edge function tries to create a credits record 
  if one doesn't exist.
  
  1. Security Changes
    - Add INSERT policy to user_credits table
    - Users can only insert records for themselves
*/

CREATE POLICY "Users can create their own credits record"
  ON user_credits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
