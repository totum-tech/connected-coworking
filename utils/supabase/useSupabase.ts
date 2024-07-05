import React, {useEffect} from "react";
import {SupabaseClient} from "@supabase/supabase-js";
import {createClient} from "@/utils/supabase/client";

export function useSupabase(): SupabaseClient {
  const [supabase] = React.useState<SupabaseClient>(createClient());

  return supabase
}
