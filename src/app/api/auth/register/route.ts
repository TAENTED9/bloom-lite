import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTH_COOKIE_NAME } from "@/lib/jwt";
import { authCookieOptions } from "@/lib/session";
import { registerUser, AuthError } from "@/services/authService";
import { COUNTRY_CODES } from "@/lib/countries";

const registerSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  fullName: z.string().min(2, "Enter your full name"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // Accept any known country code; availability is enforced in authService so
  // unavailable corridors get a friendly "coming soon" message.
  country: z.enum(COUNTRY_CODES, {
    errorMap: () => ({ message: "Select your country" }),
  }),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  try {
    const { user, token } = await registerUser(parsed.data);
    const response = NextResponse.json({ user }, { status: 201 });
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
