import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AUTH_COOKIE_NAME, parseAuthSession } from "@/lib/auth-session"

const authPages = ["/login", "/signup"]
const authRequiredPaths = [
  "/dashboard",
  "/products",
  "/suppliers",
  "/investment",
  "/upload",
  "/data-validation",
  "/settings",
  "/billing",
  "/onboarding",
]

const onboardingGatePaths = [
  "/dashboard",
  "/products",
  "/suppliers",
  "/investment",
  "/settings",
  "/billing",
]

function matchesPath(pathname: string, patterns: string[]) {
  return patterns.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next()
  }

  const rawSession = request.cookies.get(AUTH_COOKIE_NAME)?.value
  const session = parseAuthSession(rawSession)
  const isAuthed = Boolean(session)

  if (pathname === "/") {
    if (!isAuthed) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const homePath = session?.onboardingCompleted ? "/dashboard" : "/onboarding"
    return NextResponse.redirect(new URL(homePath, request.url))
  }

  if (!isAuthed && matchesPath(pathname, authRequiredPaths)) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthed && authPages.includes(pathname)) {
    const redirectPath = session?.onboardingCompleted ? "/dashboard" : "/onboarding"
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  if (
    isAuthed &&
    session &&
    !session.onboardingCompleted &&
    matchesPath(pathname, onboardingGatePaths) &&
    !pathname.startsWith("/onboarding")
  ) {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"],
}
