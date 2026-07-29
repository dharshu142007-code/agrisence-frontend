
-- Signup trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Scans storage bucket RLS: owners only (path prefix = user id)
CREATE POLICY "own scan objects select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'scans' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own scan objects insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'scans' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own scan objects update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'scans' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own scan objects delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'scans' AND (storage.foldername(name))[1] = auth.uid()::text);
