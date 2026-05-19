import { jsonError } from "@/auth/api";
import { parseRegisterBody } from "@/lib/api-validation";
import { registerUser } from "@/services/auth-service";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = parseRegisterBody(body);

  if (!parsed.success) {
    return jsonError(parsed.error, 400);
  }

  const result = await registerUser(parsed.data.name, parsed.data.email, parsed.data.password);

  if (result.error) {
    return jsonError(result.error.message, result.error.status);
  }

  return Response.json(result.data);
}
