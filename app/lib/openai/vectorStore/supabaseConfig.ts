import { createClient } from "@supabase/supabase-js";

const vectorStoreUrl = process.env.VECTOR_STORE_URL!;
const vectorStoreApiKey = process.env.SUPABASE_VECTOR_STORE_API_KEY!;
const vectorStoreClient = createClient(vectorStoreUrl, vectorStoreApiKey);

export { vectorStoreClient };
