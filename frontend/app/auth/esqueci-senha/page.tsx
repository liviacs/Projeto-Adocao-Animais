"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PawPrint, ArrowLeft } from "lucide-react"
import { Botao, Campo } from "@/components/animais/ui"
import { solicitarTokenSenha, redefinirSenha } from "@/lib/api"

export default function PaginaEsqueciSenha() {
  const router = useRouter()
  const [passo, setPasso] = useState<1 | 2>(1)

  const [email, setEmail] = useState("")
  const [tokenGerado, setTokenGerado] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState("")

  const [token, setToken] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirma, setConfirma] = useState("")
  const [sucesso, setSucesso] = useState(false)

  const solicitar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    if (!email) { setErro("Informe o email."); return }
    setCarregando(true)
    try {
      const res = await solicitarTokenSenha(email)
      setTokenGerado(res.token)
      setPasso(2)
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao solicitar token")
    } finally {
      setCarregando(false)
    }
  }

  const redefinir = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    if (!token || !novaSenha) { setErro("Preencha o token e a nova senha."); return }
    if (novaSenha.length < 6) { setErro("A senha deve ter no mínimo 6 caracteres."); return }
    if (novaSenha !== confirma) { setErro("As senhas não coincidem."); return }
    setCarregando(true)
    try {
      await redefinirSenha(email, token, novaSenha)
      setSucesso(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao redefinir senha")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <PawPrint size={20} />
          </div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Recuperar senha</h1>
        </div>

        {sucesso ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-emerald-600">Senha redefinida com sucesso!</p>
            <button onClick={() => router.push("/auth")} className="mt-4 text-xs text-emerald-600 hover:underline">
              Voltar para o login
            </button>
          </div>
        ) : passo === 1 ? (
          <form onSubmit={solicitar} className="space-y-3">
            <Campo id="email" rotulo="Email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">{erro}</p>}
            <Botao carregando={carregando} type="submit" className="w-full justify-center">Enviar token</Botao>
          </form>
        ) : (
          <form onSubmit={redefinir} className="space-y-3">
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              Seu token (simulação de SMS): <strong>{tokenGerado}</strong>
            </div>
            <Campo id="token" rotulo="Token recebido" value={token} onChange={(e) => setToken(e.target.value)} placeholder="6 dígitos" />
            <Campo id="novaSenha" rotulo="Nova senha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
            <Campo id="confirma" rotulo="Confirmar nova senha" type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} />
            {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">{erro}</p>}
            <Botao carregando={carregando} type="submit" className="w-full justify-center">Redefinir senha</Botao>
          </form>
        )}

        <div className="mt-4 text-center">
          <button onClick={() => router.push("/auth")} className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-emerald-600">
            <ArrowLeft size={12} /> Voltar para o login
          </button>
        </div>
      </div>
    </div>
  )
}