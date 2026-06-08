import { NextResponse } from "next/server"
import { AuthSession, setAuthSessionCookie } from "@/lib/auth-session"

type LoginPayload = {
  email?: string
  password?: string
}

export async function POST(request: Request) {
  let payload: LoginPayload = {}

  try {
    payload = await request.json()
  } catch {
    payload = {}
  }

  if (!payload.email || !payload.password) {
    return NextResponse.json(
      { ok: false, error: "Email and password are required." },
      { status: 400 }
    )
  }

  // MVP scaffold: accepts any non-empty credentials and stores an auth cookie.
  const session: AuthSession = {
    email: payload.email,
    fullName: payload.email.split("@")[0] || "Business Owner",
    plan: "starter",
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
  }

  const response = NextResponse.json({ ok: true, session })
  setAuthSessionCookie(response, session)

  return response
}
