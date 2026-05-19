import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { LoginForm } from "./login-form";

function readSafeRedirect(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }

  if (value === "/login" || value === "/register") {
    return undefined;
  }

  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string; redirect?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const redirectTo = readSafeRedirect(params?.redirect ?? params?.next);

  if (user) {
    redirect(redirectTo ?? "/dashboard");
  }

  return <LoginForm redirectTo={redirectTo} />;
}
