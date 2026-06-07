export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/animais/:path*",
    "/usuarios/:path*",
    "/solicitacoes/:path*",
    "/relatorios/:path*",
  ],
}
