declare module '@supabase/supabase-js' {
  // Minimal typings needed for the app – we expose the real types from the package
  // but also provide a fallback any‑typed createClient for safety.

  // Re‑export everything the original package provides (so other imports keep working)
  export * from 'node_modules/@supabase/supabase-js/dist/module';

  // Explicitly declare the named export that the app uses.
  export function createClient<Database = any>(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): any;
}