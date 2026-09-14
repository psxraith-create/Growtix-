import { Suspense } from "react"
import { LoginForm } from "./LoginForm"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-md items-center px-4 py-10"><p className="w-full text-center text-sm text-muted-foreground">Loading…</p></div>}>
      <LoginForm />
    </Suspense>
  )
}