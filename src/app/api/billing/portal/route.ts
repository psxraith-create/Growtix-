import { NextResponse } from "next/server"
import { AUTH_COOKIE_NAME, parseAuthSession } from "@/lib/auth-session"

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

  // Billing portal scaffold for MVP. Replace with real provider URL.
  return NextResponse.json({ ok: true, portalUrl: "/billing?portal=opened" })
}
