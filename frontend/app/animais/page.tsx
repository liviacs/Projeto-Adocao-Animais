"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PawPrint } from "lucide-react"

export default function PaginaLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [entrando, setEntrando] = useState(false)

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    setEntrando(true)
    const resultado = await signIn("credentials", { email, password: senha, redirect: false })
    setEntrando(false)
    if (resultado?.error) {
      setErro("Email ou senha inválidos.")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#000", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 360, background: "#0a0a0a", borderRadius: 16, border: "1px solid #1f1f1f", padding: "32px 28px", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 28, textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#000" }}>
            <PawPrint size={22} />
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>PetAdopt</h1>
          <p style={{ fontSize: 13, color: "#525252", margin: 0 }}>Acesse sua conta</p>
        </div>

        <form onSubmit={entrar} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#737373" }}>Email</label>
            <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{ borderRadius: 8, border: "1px solid #262626", background: "#141414", padding: "8px 12px", fontSize: 14, color: "#fff", outline: "none" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: "#737373" }}>Senha</label>
            <input type="password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} required
              style={{ borderRadius: 8, border: "1px solid #262626", background: "#141414", padding: "8px 12px", fontSize: 14, color: "#fff", outline: "none" }} />
          </div>

          {erro && (
            <p style={{ borderRadius: 8, background: "#1a0a0a", padding: "8px 12px", fontSize: 12, color: "#f87171", border: "1px solid #3f1111", margin: 0 }}>
              {erro}
            </p>
          )}

          <button type="submit" disabled={entrando}
            style={{ borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 500, background: "#fff", color: "#000", border: "none", cursor: entrando ? "not-allowed" : "pointer", marginTop: 4 }}>
            {entrando ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <a href="/auth/esqueci-senha" style={{ fontSize: 12, color: "#404040", textDecoration: "none" }}>
            Esqueceu a senha?
          </a>
        </div>
      </div>
    </div>
  )
}