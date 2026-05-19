import { z } from "zod";

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().int().min(1).max(50).catch(20),
});

const pageSizeSchema = z.object({
  pageSize: z.coerce.number().int().min(1).max(12).catch(6),
});

const idSchema = z.coerce.number().int().positive();

const loginSchema = z.object({
  email: z.string().trim().toLowerCase(),
  password: z.string(),
});

const registerSchema = z.object({
  name: z.string().trim(),
  email: z.string().trim().toLowerCase(),
  password: z.string(),
});

const attendanceSchema = z.object({
  playerId: z.coerce.number().int(),
  status: z.enum(["attending", "absent", "maybe"]),
  note: z.string().optional().default(""),
});

const commentSchema = z.object({
  text: z.string(),
});

const eventRegistrationSchema = z.object({
  playerId: z.union([z.coerce.number().int(), z.null()]).optional(),
});

export function parsePaginationParams(searchParams: URLSearchParams) {
  const parsed = paginationSchema.parse({
    page: searchParams.get("page") ?? "1",
    pageSize: searchParams.get("pageSize") ?? "20",
  });

  return {
    page: parsed.page,
    pageSize: parsed.pageSize,
    offset: (parsed.page - 1) * parsed.pageSize,
  };
}

export function parsePageSizeParam(searchParams: URLSearchParams) {
  const parsed = pageSizeSchema.parse({
    pageSize: searchParams.get("pageSize") ?? "6",
  });

  return parsed.pageSize;
}

export function parseRequiredId(value: string | undefined, message: string) {
  const result = idSchema.safeParse(value);
  return result.success ? { success: true as const, value: result.data } : { success: false as const, error: message };
}

export function parseLoginBody(body: unknown): ParseResult<{ email: string; password: string }> {
  const parsed = loginSchema.safeParse(body ?? {});

  if (!parsed.success || !parsed.data.email || !parsed.data.password) {
    return { success: false, error: "Email and password are required." };
  }

  return { success: true, data: parsed.data };
}

export function parseRegisterBody(body: unknown): ParseResult<{ name: string; email: string; password: string }> {
  const parsed = registerSchema.safeParse(body ?? {});

  if (!parsed.success || !parsed.data.name || !parsed.data.email || !parsed.data.password) {
    return { success: false, error: "Name, email, and password are required." };
  }

  if (parsed.data.password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  return { success: true, data: parsed.data };
}

export function parseAttendanceBody(
  body: unknown,
): ParseResult<{ playerId: number; status: "attending" | "absent" | "maybe"; note: string }> {
  const parsed = attendanceSchema.safeParse(body ?? {});

  if (!parsed.success) {
    const playerIdValue = (body as { playerId?: unknown } | null)?.playerId;
    const playerId = Number(playerIdValue);

    if (!Number.isInteger(playerId)) {
      return { success: false, error: "playerId is required." };
    }

    return { success: false, error: "status must be attending, absent, or maybe." };
  }

  return {
    success: true,
    data: {
      playerId: parsed.data.playerId,
      status: parsed.data.status,
      note: parsed.data.note.trim().slice(0, 240),
    },
  };
}

export function parseCommentBody(body: unknown): ParseResult<{ text: string }> {
  const parsed = commentSchema.safeParse(body ?? {});
  const text = parsed.success ? parsed.data.text.trim().slice(0, 1000) : "";

  if (!text) {
    return { success: false, error: "Comment text is required." };
  }

  return { success: true, data: { text } };
}

export function parseEventRegistrationBody(body: unknown): ParseResult<{ playerId: number | null }> {
  const parsed = eventRegistrationSchema.safeParse(body ?? {});

  if (!parsed.success) {
    return { success: false, error: "playerId must be a number when provided." };
  }

  const playerId = parsed.data.playerId === undefined ? null : parsed.data.playerId;

  if (playerId !== null && !Number.isInteger(playerId)) {
    return { success: false, error: "playerId must be a number when provided." };
  }

  return { success: true, data: { playerId } };
}
