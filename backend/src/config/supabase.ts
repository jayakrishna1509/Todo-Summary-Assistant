import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Add verbose error checking
if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is not defined in environment variables");
}

if (!process.env.SUPABASE_KEY) {
  throw new Error("SUPABASE_KEY is not defined in environment variables");
}

// Create and export Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Optional: Test connection function
export async function testConnection() {
  try {
    const { data, error } = await supabase.from("todos").select("*").limit(1);

    if (error) {
      console.error("Connection failed:", error.message);
      return false;
    }

    console.log("Connection successful!");
    console.log("Test query result:", data);
    return true;
  } catch (error) {
    console.error("Connection error:", error);
    return false;
  }
}
