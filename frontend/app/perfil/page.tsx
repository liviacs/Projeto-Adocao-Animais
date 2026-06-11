"use client"

import { useState, useEffect } from "react"
import { User, Lock, FileText } from "lucide-react"
import { atualizarPerfil, enviarDocumentosUsuario, verificarDocumentosUsuario } from "@/lib/api"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Botao, Card, Campo, Seletor } from "@/components/animais/ui"
import { useIdioma } from "@/hooks/useIdioma"

function formatarCpf(v: string): string {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

const opcoesOrientacao = [
  { valor: "", rotulo: "Selecione..." },
  { valor: "Heterossexual", rotulo: "Heterossexual" },
  { valor: "Homossexual", rotulo: "Homossexual" },
  { valor: "Bissexual", rotulo: "Bissexual" },
  { valor: "Outro", rotulo: "Outro" },
  { valor: "Prefiro não informar", rotulo: "Prefiro não informar" },
]

export default function PaginaPerfil() {
  const { t } = useIdioma()
  const [id, setId] = useState("")
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [tipo, setTipo] = useState("")
  const [cpf, setCpf] = useState("")
  const [orientacao, setOrientacao] = useState("")
  const [qtdAdocoes, setQtdAdocoes] = useState(0)

  const [salvandoDados, setSalvandoDados] = useState(false)
  const [msgDados, setMsgDados] = useState("")

  const [novaSenha, setNovaSenha] = useState("")
  const [confirmaSenha, setConfirmaSenha] = useState("")
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [msgSenha, setMsgSenha] = useState("")

  const [docIdentidade, setDocIdentidade] = useState<File | null>(null)
  const [docComprovante, setDocComprovante] = useState<File | null>(null)
  const [temDocs, setTemDocs] = useState(false)
  const [enviandoDocs, setEnviandoDocs] = useState(false)
  const [msgDocs, setMsgDocs] = useState("")

  // carrega os dados do usuário logado do localStorage
  useEffect(() => {
    const u = localStorage.getItem("usuario")
    if (u) {
      try {
        const usuario = JSON.parse(u)
        setId(String(usuario.id ?? ""))
        setNome(usuario.nome ?? "")
        setEmail(usuario.email ?? "")
        setTelefone(usuario.telefone ?? "")
        setTipo(usuario.tipo ?? "")
        setCpf(usuario.cpf ?? "")
        setOrientacao(usuario.orientacaoSexual ?? usuario.orientacao_sexual ?? "")
        setQtdAdocoes(usuario.qtdAdocoes ?? usuario.qtd_adocoes ?? 0)
      } catch {}
    }
  }, [])
// verifica se o usuário já tem documentos enviados
  useEffect(() => {
    if (!id) return
    verificarDocumentosUsuario(id).then(setTemDocs).catch(() => {})
  }, [id])

  const enviarDocs = async () => {
    setMsgDocs("")
    // primeiro envio exige os 2; atualização aceita parcial
    if (!temDocs && (!docIdentidade || !docComprovante)) {
      setMsgDocs("No primeiro envio, anexe os 2 documentos (identidade e comprovante).")
      return
    }
    if (temDocs && !docIdentidade && !docComprovante) {
      setMsgDocs("Anexe ao menos um documento para atualizar.")
      return
    }
    setEnviandoDocs(true)
    try {
      // monta só com os arquivos selecionados
      const form: any = {}
      if (docIdentidade) form.documento_identidade = docIdentidade
      if (docComprovante) form.comprovante_residencia = docComprovante
      await enviarDocumentosUsuario(id, form)
      setMsgDocs("Documentos enviados com sucesso!")
      setTemDocs(true)
      setDocIdentidade(null); setDocComprovante(null)
    } catch (e) {
      setMsgDocs(e instanceof Error ? e.message : "Erro ao enviar documentos")
    } finally {
      setEnviandoDocs(false)
    }
  }

  const salvarDados = async () => {
    setMsgDados("")
    if (!nome || !email) {
      setMsgDados("Nome e email são obrigatórios.")
      return
    }
    setSalvandoDados(true)
    try {
      await atualizarPerfil(id, { nome, email, telefone, cpf, orientacao_sexual: orientacao })
      // atualiza o localStorage pra refletir as mudanças
      const usuario = JSON.parse(localStorage.getItem("usuario") || "{}")
      localStorage.setItem("usuario", JSON.stringify({ ...usuario, nome, email, telefone, cpf, orientacaoSexual: orientacao }))
      setMsgDados("Dados atualizados com sucesso!")
    } catch (e) {
      setMsgDados(e instanceof Error ? e.message : "Erro ao atualizar dados")
    } finally {
      setSalvandoDados(false)
    }
  }

  const salvarSenha = async () => {
    setMsgSenha("")
    if (!novaSenha) {
      setMsgSenha("Digite a nova senha.")
      return
    }
    if (novaSenha.length < 6) {
      setMsgSenha("A senha deve ter no mínimo 6 caracteres.")
      return
    }
    if (novaSenha !== confirmaSenha) {
      setMsgSenha("As senhas não coincidem.")
      return
    }
    setSalvandoSenha(true)
    try {
      await atualizarPerfil(id, { senha: novaSenha })
      setNovaSenha("")
      setConfirmaSenha("")
      setMsgSenha("Senha alterada com sucesso!")
    } catch (e) {
      setMsgSenha(e instanceof Error ? e.message : "Erro ao alterar senha")
    } finally {
      setSalvandoSenha(false)
    }
  }

  return (
    <Layout>
      <BarraSuperior titulo={t("tituloPerfil")} />

      <div className="mx-auto max-w-xl space-y-4 p-6">

        {/* Seção 1: dados pessoais */}
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <User size={16} className="text-emerald-600" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Dados pessoais</h2>
          </div>

          <div className="space-y-3">
            <Campo id="nome" rotulo="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <Campo id="email" rotulo="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Campo id="telefone" rotulo="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            <Campo id="cpf" rotulo="CPF" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(formatarCpf(e.target.value))} />
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Orientação sexual</label>
              <Seletor opcoes={opcoesOrientacao} value={orientacao} onChange={(e) => setOrientacao(e.target.value)} className="w-full py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Adoções realizadas</label>
              <p className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-500 dark:bg-zinc-800">{qtdAdocoes}</p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Tipo de conta</label>
              <p className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-500 dark:bg-zinc-800">
                {tipo}
              </p>
            </div>
          </div>

          {msgDados && (
            <p className={`mt-3 rounded-lg px-3 py-2 text-xs ${msgDados.includes("sucesso") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"}`}>
              {msgDados}
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <Botao carregando={salvandoDados} onClick={salvarDados}>Salvar alterações</Botao>
          </div>
        </Card>

        {/* Seção 2: alterar senha */}
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Lock size={16} className="text-emerald-600" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Alterar senha</h2>
          </div>

          <div className="space-y-3">
            <Campo id="novaSenha" rotulo="Nova senha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
            <Campo id="confirmaSenha" rotulo="Confirmar nova senha" type="password" value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)} />
          </div>

          {msgSenha && (
            <p className={`mt-3 rounded-lg px-3 py-2 text-xs ${msgSenha.includes("sucesso") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"}`}>
              {msgSenha}
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <Botao carregando={salvandoSenha} onClick={salvarSenha}>Alterar senha</Botao>
          </div>
        </Card>

        {/* Seção 3: documentos */}
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileText size={16} className="text-emerald-600" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Documentos</h2>
          </div>

          {temDocs && (
            <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              Você já enviou seus documentos. Envie novamente apenas os que quiser atualizar.
            </p>
          )}

          <p className="mb-3 text-xs text-zinc-400">Apenas arquivos PDF.</p>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Documento de identidade (RG/CPF) {!temDocs && "*"}</label>
              <input type="file" accept="application/pdf" onChange={(e) => setDocIdentidade(e.target.files?.[0] ?? null)}
                className="block w-full text-xs text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-xs file:text-zinc-700 dark:file:bg-zinc-800 dark:file:text-zinc-300" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Comprovante de residência {!temDocs && "*"}</label>
              <input type="file" accept="application/pdf" onChange={(e) => setDocComprovante(e.target.files?.[0] ?? null)}
                className="block w-full text-xs text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-xs file:text-zinc-700 dark:file:bg-zinc-800 dark:file:text-zinc-300" />
            </div>
          </div>

          {msgDocs && (
            <p className={`mt-3 rounded-lg px-3 py-2 text-xs ${msgDocs.includes("sucesso") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"}`}>
              {msgDocs}
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <Botao carregando={enviandoDocs} onClick={enviarDocs}>Enviar documentos</Botao>
          </div>
        </Card>
      </div>
    </Layout>
  )
}