import { NextResponse } from "next/server"
import { AuthSession, PlanTier, setAuthSessionCookie } from "@/lib/auth-session"

type SignupPayload = {
  fullName?: string
  email?: string
  password?: string
  plan?: PlanTier
}

export async function POST(request: Request) {
  let payload: SignupPayload = {}

  try {
    payload = await request.json()
  } catch {
    payload = {}
  }

  if (!payload.email || !payload.password || !payload.fullName) {
    return NextResponse.json(
      { ok: false, error: "Full name, email, and password are required." },
      { status: 400 }
    )
  }

  const session: AuthSession = {
    email: payload.email,
    fullName: payload.fullName,
    plan: payload.plan ?? "starter",
    onboardingCompleted: false,
    createdAt: new Date().toISOString(),
  }

  const response = NextResponse.json({ ok: true, session })
  setAuthSessionCookie(response, session)

  return response
}
