import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async (): Promise<User | null> => {
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    },
    staleTime: 30_000,
  });
}
