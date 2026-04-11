import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
async function run() {
  const { error } = await supabase.from("events").insert([
    {
      title: "Test",
      description: "Test DESC",
      created_by_name: "Mock User",
      venue: "Cloud Room",
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      clubId: "collaboration-hub"
    }
  ]);
  console.log("Error:", error);
}
run();
