import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireServerEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}

let serverClient: SupabaseClient | undefined;

export function getSupabaseServerClient(): SupabaseClient {
  if (serverClient) {
    return serverClient;
  }

  const url = requireServerEnvironmentVariable("SUPABASE_URL");
  const serviceRoleKey = requireServerEnvironmentVariable(
    "SUPABASE_SERVICE_ROLE_KEY",
  );

  serverClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return serverClient;
}
