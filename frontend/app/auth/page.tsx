"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PawPrint } from "lucide-react"
import { Botao, Campo } from "@/components/animais/ui"

export default function PaginaLogin() {
  const router = useRouter()
  const [aba, setAba] = useState<"entrar" | "criar">("entrar")

  // login
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [entrando, setEntrando] = useState(false)

  // cadastro
  const [cNome, setCNome] = useState("")
  const [cEmail, setCEmail] = useState("")
  const [cTelefone, setCTelefone] = useState("")
  const [cSenha, setCSenha] = useState("")
  const [cConfirma, setCConfirma] = useState("")
  const [erroCad, setErroCad] = useState("")
  const [criando, setCriando] = useState(false)

  // faz login e entra (reutilizado no entrar e no cadastro automático)
  const fazerLogin = async (emailLogin: string, senhaLogin: string) => {
    const response = await fetch("http://localhost:3005/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailLogin, senha: senhaLogin }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.erro ?? "Email ou senha incorretos")
    localStorage.setItem("token", data.token)
    localStorage.setItem("usuario", JSON.stringify(data.usuario))
    // admin vai pro dashboard; adotante vai pra animais (não vê dashboard)
    router.push(data.usuario?.tipo === "ADMIN" ? "/dashboard" : "/animais")
  }

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    setEntrando(true)
    try {
      await fazerLogin(email, senha)
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao conectar com o servidor")
    } finally {
      setEntrando(false)
    }
  }

  const criarConta = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroCad("")
    if (!cNome || !cEmail || !cSenha) {
      setErroCad("Preencha nome, email e senha.")
      return
    }
    if (cSenha.length < 6) {
      setErroCad("A senha deve ter no mínimo 6 caracteres.")
      return
    }
    if (cSenha !== cConfirma) {
      setErroCad("As senhas não coincidem.")
      return
    }
    setCriando(true)
    try {
      // cria o usuário SEM enviar tipo → backend define como ADOTANTE
      const resp = await fetch("http://localhost:3005/api/usuarios/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: cNome, email: cEmail, telefone: cTelefone, senha: cSenha }),
      })
      const data = await resp.json()
      if (!resp.ok) {
        setErroCad(data.erro ?? "Erro ao criar conta")
        setCriando(false)
        return
      }
      // login automático com as credenciais recém-criadas
      await fazerLogin(cEmail, cSenha)
    } catch (err) {
      setErroCad(err instanceof Error ? err.message : "Erro ao conectar com o servidor")
      setCriando(false)
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
          <p className="text-sm text-zinc-500">{aba === "entrar" ? "Acesse sua conta" : "Crie sua conta"}</p>
        </div>

        {/* Abas */}
        <div className="mb-5 flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
          <button
            onClick={() => setAba("entrar")}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${aba === "entrar" ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50" : "text-zinc-500"}`}
          >
            Entrar
          </button>
          <button
            onClick={() => setAba("criar")}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${aba === "criar" ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50" : "text-zinc-500"}`}
          >
            Criar conta
          </button>
        </div>

        {aba === "entrar" ? (
          <form onSubmit={entrar} className="space-y-3">
            <Campo id="email" rotulo="Email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Campo id="senha" rotulo="Senha" type="password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">{erro}</p>}
            <Botao carregando={entrando} type="submit" className="mt-1 w-full justify-center">Entrar</Botao>
          </form>
        ) : (
          <form onSubmit={criarConta} className="space-y-3">
            <Campo id="cNome" rotulo="Nome" placeholder="Seu nome" value={cNome} onChange={(e) => setCNome(e.target.value)} required />
            <Campo id="cEmail" rotulo="Email" type="email" placeholder="seu@email.com" value={cEmail} onChange={(e) => setCEmail(e.target.value)} required />
            <Campo id="cTelefone" rotulo="Telefone" placeholder="(opcional)" value={cTelefone} onChange={(e) => setCTelefone(e.target.value)} />
            <Campo id="cSenha" rotulo="Senha" type="password" placeholder="Mínimo 6 caracteres" value={cSenha} onChange={(e) => setCSenha(e.target.value)} required />
            <Campo id="cConfirma" rotulo="Confirmar senha" type="password" placeholder="••••••••" value={cConfirma} onChange={(e) => setCConfirma(e.target.value)} required />
            {erroCad && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">{erroCad}</p>}
            <Botao carregando={criando} type="submit" className="mt-1 w-full justify-center">Criar conta</Botao>
          </form>
        )}

        {aba === "entrar" && (
          <div className="mt-4 text-center">
            <a href="/auth/esqueci-senha" className="text-xs text-zinc-400 hover:text-emerald-600">Esqueceu a senha?</a>
          </div>
        )}
      </div>
    </div>
  )
}