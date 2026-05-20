import { redirect } from "next/navigation"

// /auth redirects to /auth/login
export default function AuthPage() {
  redirect("/auth/login")
}
