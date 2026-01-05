-- Allow admins to update any bracket (for score recalculation)
CREATE POLICY "Admins can update brackets" ON brackets
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);
