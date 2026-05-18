import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;

  return <LoginForm redirectTo={params?.next} />;
}
