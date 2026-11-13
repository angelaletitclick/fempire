// Legt ein Admin-Konto an oder macht ein bestehendes Konto zum Admin.
//
//   node scripts/admin-anlegen.mjs "angela@example.com" "Angela Pister" "LET IT CLICK GmbH" "Geschäftsführerin"
//
// Liest NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY aus .env.local.
// Danach meldet sich die Person unter /club/login mit ihrer E-Mail-Adresse an.
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const [email, fullName, company = null, position = null] = process.argv.slice(2);
if (!email || !fullName) {
  console.error('Aufruf: node scripts/admin-anlegen.mjs "email" "Name" ["Firma"] ["Position"]');
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
if (!url || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY fehlen in .env.local");
  process.exit(1);
}
const supabase = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const normalized = email.trim().toLowerCase();

async function findUser() {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const user = data.users.find((entry) => entry.email?.toLowerCase() === normalized);
    if (user) return user;
    if (data.users.length < 200) return null;
  }
  return null;
}

let user = await findUser();
if (!user) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: normalized,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw error;
  user = data.user;
  console.log(`Konto angelegt: ${normalized}`);
} else {
  console.log(`Konto existiert bereits: ${normalized}`);
}

const { error } = await supabase.from("members").upsert(
  {
    user_id: user.id,
    email: normalized,
    full_name: fullName,
    role: "admin",
    tier: null,
    status: "active",
    company,
    position,
    city_slug: "osnabrueck",
    updated_at: new Date().toISOString(),
  },
  { onConflict: "user_id" },
);
if (error) throw error;
console.log(`Admin-Rechte gesetzt für ${fullName}.`);
