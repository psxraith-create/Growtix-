import { Suspense } from "react"
import { SignupForm } from "./SignupForm"

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-lg items-center px-4 py-10"><p className="w-full text-center text-sm text-muted-foreground">Loading…</p></div>}>
      <SignupForm />
    </Suspense>
  )
}