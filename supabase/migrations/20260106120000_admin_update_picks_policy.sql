-- Allow admins to update is_correct on any pick (for score recalculation)
CREATE POLICY "Admins can update is_correct on any pick"
ON picks FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
