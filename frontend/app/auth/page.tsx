"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PawPrint } from "lucide-react"
import { Botao, Campo } from "@/components/animais/ui"

export default function PaginaLogin() {
  const router = useRouter()
  const [email, setEmail]       = useState("")
  const [senha, setSenha]       = useState("")
  const [erro, setErro]         = useState("")
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm">

        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <PawPrint size={20} />
          </div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">PetAdopt</h1>
          <p className="text-sm text-zinc-500">Acesse sua conta</p>
        </div>

        <form onSubmit={entrar} className="space-y-3">
          <Campo
            id="email"
            rotulo="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Campo
            id="senha"
            rotulo="Senha"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          {erro && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">
              {erro}
            </p>
          )}

          <Botao carregando={entrando} type="submit" className="mt-1 w-full justify-center">
            Entrar
          </Botao>
        </form>

        <div className="mt-4 text-center">
          <a href="/auth/esqueci-senha" className="text-xs text-zinc-400 hover:text-emerald-600">
            Esqueceu a senha?
          </a>
        </div>

      </div>
    </div>
  )
}