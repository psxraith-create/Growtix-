import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const AUTH_COOKIE_NAME = "bhr_session"

export type PlanTier = "starter" | "growth" | "scale"

export interface AuthSession {
  email: string
  fullName: string
  plan: PlanTier
  onboardingCompleted: boolean
  createdAt: string
}

export function parseAuthSession(rawValue?: string | null): AuthSession | null {
  if (!rawValue) return null

  try {
    const parsed = JSON.parse(decodeURIComponent(rawValue)) as Partial<AuthSession>

    if (!parsed.email) return null

    return {
      email: parsed.email,
      fullName: parsed.fullName ?? "Business Owner",
      plan: parsed.plan ?? "starter",
      onboardingCompleted: parsed.onboardingCompleted ?? false,
      createdAt: parsed.createdAt ?? new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function serializeAuthSession(session: AuthSession): string {
  return encodeURIComponent(JSON.stringify(session))
}

export async function getServerAuthSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(AUTH_COOKIE_NAME)?.value
  return parseAuthSession(raw)
}

export function setAuthSessionCookie(response: NextResponse, session: AuthSession) {
  response.cookies.set(AUTH_COOKIE_NAME, serializeAuthSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

export function clearAuthSessionCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  })
}
