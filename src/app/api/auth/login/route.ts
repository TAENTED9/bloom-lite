import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE_NAME } from "@/lib/jwt";
import { authCookieOptions } from "@/lib/session";
import { loginUser, AuthError } from "@/services/authService";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  try {
    const { user, token } = await loginUser(parsed.data);
    const response = NextResponse.json({ user }, { status: 200 });
    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
