import { withAuth } from "next-auth/middleware"

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET || "my_super_secret_key_change_in_production",
  pages: {
    signIn: "/sign-in",
  }
})

export const config = {
  // Protects all routes except sign-in, sign-up, API routes, and static assets
  matcher: ["/((?!sign-in|sign-up|api|_next/static|_next/image|favicon.ico|icon.svg).*)"],
}
