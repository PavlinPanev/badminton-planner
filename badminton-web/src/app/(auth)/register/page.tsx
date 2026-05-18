import { redirect } from "next/navigation";

import { getCurrentUser } from "@/auth/session";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return <RegisterForm />;
}
