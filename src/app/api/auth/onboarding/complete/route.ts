import { NextResponse } from "next/server"
import {
  AUTH_COOKIE_NAME,
  parseAuthSession,
  setAuthSessionCookie,
} from "@/lib/auth-session"

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie")
  const cookieValue = cookieHeader
    ?.split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${AUTH_COOKIE_NAME}=`))
    ?.split("=")
    .slice(1)
    .join("=")

  const session = parseAuthSession(cookieValue ?? null)

  if (!session) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 })
  }

  const updatedSession = {
    ...session,
    onboardingCompleted: true,
  }

  const response = NextResponse.json({ ok: true, session: updatedSession })
  setAuthSessionCookie(response, updatedSession)

  return response
}
