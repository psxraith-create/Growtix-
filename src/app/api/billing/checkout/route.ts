import { NextResponse } from "next/server"
import { AUTH_COOKIE_NAME, parseAuthSession } from "@/lib/auth-session"

type CheckoutPayload = {
  plan?: "starter" | "growth" | "scale"
}

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

  let payload: CheckoutPayload = {}
  try {
    payload = await request.json()
  } catch {
    payload = {}
  }

  const selectedPlan = payload.plan ?? "growth"

  // Billing scaffold for MVP: replace with Stripe/Supabase Edge Function integration in production.
  const checkoutUrl = `/billing?checkout=started&plan=${selectedPlan}`

  return NextResponse.json({ ok: true, checkoutUrl })
}
