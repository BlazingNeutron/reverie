// import type { TestProject } from "vitest/node";
import { supabase } from "./lib/supabase/client";


await supabase.auth.signUp({ email: 'test@integration.test', password: 'testPassword' })
await supabase.auth.signUp({ email: 'test2@integration.test', password: 'test2Password' })
