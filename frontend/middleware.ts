import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const rotasPublicas = ["/auth"]
const secret = process.env.NEXTAUTH_SECRET || "nextauth-secret-padrao-troque-em-producao"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Permite rotas públicas e API do next-auth
  if (rotasPublicas.some((r) => pathname.startsWith(r)) || pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret })

  if (!token) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = "/auth"
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Perfis: adotante não pode acessar /usuarios e /relatorios
  const tipo = (token as { tipo?: string }).tipo
  if (tipo === "adotante") {
    if (pathname.startsWith("/usuarios") || pathname.startsWith("/relatorios")) {
      const dashUrl = req.nextUrl.clone()
      dashUrl.pathname = "/dashboard"
      return NextResponse.redirect(dashUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
}
