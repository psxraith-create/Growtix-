import { NextResponse } from "next/server"
import {
  AUTH_COOKIE_NAME,
  AuthSession,
  parseAuthSession,
  setAuthSessionCookie,
} from "@/lib/auth-session"

export async function GET(request: Request) {
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
    return NextResponse.json({ ok: false, session: null }, { status: 401 })
  }

  return NextResponse.json({ ok: true, session })
}

type UpdatePayload = {
  fullName?: string
  plan?: AuthSession["plan"]
}

export async function PATCH(request: Request) {
  const cookieHeader = request.headers.get("cookie")
  const cookieValue = cookieHeader
    ?.split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${AUTH_COOKIE_NAME}=`))
    ?.split("=")
    .slice(1)
    .join("=")

  const existingSession = parseAuthSession(cookieValue ?? null)

  if (!existingSession) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 })
  }

  let payload: UpdatePayload = {}

  try {
    payload = await request.json()
  } catch {
    payload = {}
  }

  const updatedSession: AuthSession = {
    ...existingSession,
    fullName: payload.fullName ?? existingSession.fullName,
    plan: payload.plan ?? existingSession.plan,
  }

  const response = NextResponse.json({ ok: true, session: updatedSession })
  setAuthSessionCookie(response, updatedSession)

  return response
}
