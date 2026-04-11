import { supabase } from "../src/lib/supabase";

async function checkColumns() {
  const { data, error } = await supabase.from("chat_messages").select("*").limit(1);
  if (error) {
    console.error("Supabase error:", error);
    return;
  }
  if (data && data.length > 0) {
    console.log("Success! Row keys:", Object.keys(data[0]));
  } else {
    console.log("No data found in chat_messages table.");
  }
}

checkColumns();
