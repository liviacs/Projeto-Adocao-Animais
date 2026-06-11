"use client"

import { useState } from "react"
import { Pencil, Trash2, X, FileText } from "lucide-react"
import { useConsulta } from "@/hooks/useConsulta"
import { useIdioma } from "@/hooks/useIdioma"
import { buscarUsuarios, atualizarUsuarioAdmin, excluirUsuario, abrirDocumentoUsuario } from "@/lib/api"
import type { Usuario } from "@/tipos"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Botao, Card, Etiqueta, Vazio, Carregando, Campo, Seletor } from "@/components/animais/ui"

const opcoesTipo = [
  { valor: "ADOTANTE", rotulo: "Adotante" },
  { valor: "ADMIN",    rotulo: "Admin" },
]

export default function PaginaUsuarios() {
  const [busca, setBusca] = useState("")
  const [pagina, setPagina] = useState(1)

  // edição
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [tipo, setTipo] = useState("ADOTANTE")
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState("")

  const [excluindo, setExcluindo] = useState<string | null>(null)

  const { dados, carregando, recarregar } = useConsulta(
    () => buscarUsuarios({ pagina, busca }),
    [pagina, busca]
  )

  const abrirEdicao = (u: Usuario) => {
    setEditando(u)
    setNome(u.nome)
    setEmail(u.email)
    setTelefone(u.telefone ?? "")
    setTipo(u.perfil === "admin" ? "ADMIN" : "ADOTANTE")
    setMsg("")
  }

  const salvar = async () => {
    if (!editando) return
    setMsg("")
    if (!nome || !email) { setMsg("Nome e email são obrigatórios."); return }
    setSalvando(true)
    try {
      await atualizarUsuarioAdmin(editando.id, { nome, email, telefone, tipo })
      setEditando(null)
      recarregar()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setSalvando(false)
    }
  }

  const verDocumento = async (idUsuario: string, tipo: "identidade" | "comprovante") => {
    try {
      await abrirDocumentoUsuario(idUsuario, tipo)
    } catch {
      alert("Este usuário não enviou esse documento.")
    }
  }

  const excluir = async (u: Usuario) => {
    if (!confirm(`Excluir o usuário ${u.nome}?`)) return
    setExcluindo(u.id)
    try {
      await excluirUsuario(u.id)
      recarregar()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir")
    } finally {
      setExcluindo(null)
    }
  }

  return (
    <Layout>
      <BarraSuperior
        titulo="Usuários"
        aoBuscar={(v) => { setBusca(v); setPagina(1) }}
      />

      <div className="space-y-4 p-4 sm:p-6">
        {carregando ? (
          <div className="flex justify-center py-20"><Carregando /></div>
        ) : dados?.dados.length === 0 ? (
          <Vazio titulo="Nenhum usuário encontrado" />
        ) : (
          <>
            <div className="space-y-2">
              {dados?.dados.map((u) => (
                <Card key={u.id} className="flex items-center gap-4 p-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                    {u.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{u.nome}</p>
                    <p className="text-xs text-zinc-400">{u.email} · {u.telefone || "sem telefone"}</p>
                  </div>
                  <Etiqueta variante={u.perfil} />
                  <div className="flex gap-1">
                    <Botao variante="secundario" tamanho="pequeno" icone={<FileText size={13} />} onClick={() => verDocumento(u.id, "identidade")}>Identidade</Botao>
                    <Botao variante="secundario" tamanho="pequeno" icone={<FileText size={13} />} onClick={() => verDocumento(u.id, "comprovante")}>Comprovante</Botao>
                    <Botao variante="secundario" tamanho="pequeno" icone={<Pencil size={13} />} onClick={() => abrirEdicao(u)}>Editar</Botao>
                    <Botao variante="perigo" tamanho="pequeno" icone={<Trash2 size={13} />} carregando={excluindo === u.id} onClick={() => excluir(u)}>Excluir</Botao>
                  </div>
                </Card>
              ))}
            </div>

            {dados && dados.totalPaginas > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-zinc-400">{dados.total} usuários · página {dados.pagina} de {dados.totalPaginas}</p>
                <div className="flex gap-2">
                  <Botao variante="secundario" tamanho="pequeno" disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>Anterior</Botao>
                  <Botao variante="secundario" tamanho="pequeno" disabled={pagina === dados.totalPaginas} onClick={() => setPagina((p) => p + 1)}>Próxima</Botao>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de edição */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditando(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-5 dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Editar usuário</h2>
              <button onClick={() => setEditando(null)} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
            </div>

            <div className="space-y-3">
              <Campo id="e-nome" rotulo="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
              <Campo id="e-email" rotulo="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Campo id="e-telefone" rotulo="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Tipo de conta</label>
                <Seletor opcoes={opcoesTipo} value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full py-2 text-sm" />
              </div>
            </div>

            {msg && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">{msg}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <Botao variante="secundario" tamanho="pequeno" onClick={() => setEditando(null)}>Cancelar</Botao>
              <Botao tamanho="pequeno" carregando={salvando} onClick={salvar}>Salvar</Botao>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}