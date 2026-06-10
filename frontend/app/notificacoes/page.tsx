"use client"

import { useState, useEffect } from "react"
import { Bell, Clock, CheckCircle, XCircle, X, PartyPopper, Calendar } from "lucide-react"
import { buscarNotificacoes, marcarNotificacaoLida, buscarSolicitacoes, type Notificacao } from "@/lib/api"
import { useUsuario } from "@/hooks/useUsuario"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Card, Vazio, Carregando, Botao } from "@/components/animais/ui"
import { formatarDataHora } from "@/lib/utils"

const estilos = {
  nova:      { icone: Clock,       cor: "text-amber-600 bg-amber-50 dark:bg-amber-950" },
  aprovada:  { icone: CheckCircle, cor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950" },
  rejeitada: { icone: XCircle,     cor: "text-red-600 bg-red-50 dark:bg-red-950" },
}
const titulos = {
  nova: "Nova solicitação",
  aprovada: "Solicitação aprovada",
  rejeitada: "Solicitação recusada",
}

export default function PaginaNotificacoes() {
  const { ehAdmin } = useUsuario()
  const [itens, setItens] = useState<Notificacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [aberta, setAberta] = useState<Notificacao | null>(null)
  const [detalhe, setDetalhe] = useState<any>(null)
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false)

  const carregar = async () => {
    setCarregando(true)
    try {
      const res = await buscarNotificacoes()
      setItens(res.itens)
    } catch {
      setItens([])
    } finally {
      setCarregando(false)
    }
  }
  useEffect(() => { carregar() }, [])

  const aoClicar = async (n: Notificacao) => {
    if (!n.lida) {
      try {
        await marcarNotificacaoLida(n.id)
        setItens((prev) => prev.map((x) => (x.id === n.id ? { ...x, lida: true } : x)))
      } catch {}
    }
    setAberta(n)
    setDetalhe(null)
    
    // busca os detalhes da solicitação ligada à notificação
    if (n.idSolicitacao) {
      setCarregandoDetalhe(true)
      try {
        const todas = await buscarSolicitacoes({})
        
        const s = todas.dados.find((x) => String(x.id) === String(n.idSolicitacao))
        
        setDetalhe(s ?? null)
      } catch {} finally {
        setCarregandoDetalhe(false)
      }
    }
  }

  // calcula o prazo de 5 dias a partir da data da notificação
  const prazoBusca = (dataIso: string) => {
    const d = new Date(dataIso)
    d.setDate(d.getDate() + 5)
    return d.toLocaleDateString("pt-BR")
  }

  return (
    <Layout>
      <BarraSuperior titulo="Notificações" />
      <div className="mx-auto max-w-2xl p-6">
        <div className="max-h-[calc(100vh-9rem)] space-y-3 overflow-y-auto pr-1">
          {carregando ? (
            <div className="flex justify-center py-20"><Carregando /></div>
          ) : itens.length === 0 ? (
            <Vazio titulo="Nenhuma notificação" descricao="Você não tem notificações no momento." />
          ) : (
            itens.map((n) => {
              const e = estilos[n.tipo] ?? estilos.nova
              const Icone = e.icone
              return (
                <Card
                  key={n.id}
                  onClick={() => aoClicar(n)}
                  className={`flex cursor-pointer items-start gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 ${n.lida ? "opacity-60" : ""}`}
                >
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${e.cor}`}>
                    <Icone size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{titulos[n.tipo] ?? "Notificação"}</p>
                      {!n.lida && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{n.mensagem}</p>
                    <p className="mt-1 text-[11px] text-zinc-400">{formatarDataHora(n.data)}</p>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* Modal do card */}
      {aberta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAberta(null)}>
          <Card className="w-full max-w-md p-6" onClick={(ev: any) => ev.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{titulos[aberta.tipo]}</h2>
              <button onClick={() => setAberta(null)} className="text-zinc-400 hover:text-zinc-700"><X size={18} /></button>
            </div>

            {/* Adotante: aprovada → parabéns + prazo */}
            {aberta.tipo === "aprovada" && (
              <div className="text-center">
                <PartyPopper size={40} className="mx-auto mb-3 text-emerald-500" />
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Parabéns! 🎉</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{aberta.mensagem}</p>
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <Calendar size={15} />
                  Busque o pet até <strong>{prazoBusca(aberta.data)}</strong> (5 dias)
                </div>
              </div>
            )}

            {/* Adotante: rejeitada → motivo */}
            {aberta.tipo === "rejeitada" && (
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{aberta.mensagem}</p>
                <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950">
                  <p className="text-xs font-medium text-red-700 dark:text-red-400">Motivo da recusa</p>
                  <p className="mt-0.5 text-sm text-red-600 dark:text-red-300">
                    {carregandoDetalhe ? "Carregando..." : (detalhe?.motivoRejeicao || detalhe?.motivo_rejeicao || "Motivo não informado")}
                  </p>
                </div>
              </div>
            )}

            {/* Admin: nova → detalhes da solicitação */}
            {aberta.tipo === "nova" && (
              <div>
                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">{aberta.mensagem}</p>
                {carregandoDetalhe ? (
                  <p className="text-sm text-zinc-400">Carregando detalhes...</p>
                ) : detalhe ? (
                  <div className="space-y-1.5 rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-800">
                    <p><span className="text-zinc-400">Adotante:</span> {detalhe.usuario?.nome}</p>
                    <p><span className="text-zinc-400">Animal:</span> {detalhe.animal?.nome}</p>
                    <p><span className="text-zinc-400">Status:</span> {detalhe.status}</p>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">Solicitação não encontrada.</p>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </Layout>
  )
}