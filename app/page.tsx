import { redirect } from "next/navigation";

import { getUserOrNull } from "@/lib/auth";

export default async function Home() {
  const user = await getUserOrNull();

  redirect(user ? "/dashboard" : "/login");
}
