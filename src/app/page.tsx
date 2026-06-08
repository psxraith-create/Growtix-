import { redirect } from "next/navigation"
import { getServerAuthSession } from "@/lib/auth-session"

export default async function Home() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect("/login")
  }

  if (!session.onboardingCompleted) {
    redirect("/onboarding")
  }

  redirect("/dashboard")
}
