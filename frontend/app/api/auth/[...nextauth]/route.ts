import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// URL interna do backend (servidor → servidor, sem passar pelo browser)
const BACKEND_URL = "http://localhost:3005"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const res = await fetch(`${BACKEND_URL}/api/auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // credentials: "include" não é necessário aqui — servidor chama servidor
            body: JSON.stringify({
              email: credentials.email,
              senha: credentials.password,
            }),
          })

          if (!res.ok) return null

          const data = await res.json()
          const usuario = data.usuario

          if (!usuario) return null

          return {
            id:    String(usuario.id),
            name:  usuario.nome,
            email: usuario.email,
            tipo:  usuario.perfil || usuario.tipo || "adotante",
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Na primeira autenticação, copia o tipo para o token JWT
      if (user) token.tipo = (user as { tipo?: string }).tipo
      return token
    },
    async session({ session, token }) {
      // Expõe o tipo na sessão do cliente
      if (session.user) (session.user as { tipo?: string }).tipo = token.tipo as string
      return session
    },
  },
  pages: {
    signIn: "/auth",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "nextauth-secret-padrao-troque-em-producao",
})

export { handler as GET, handler as POST }
