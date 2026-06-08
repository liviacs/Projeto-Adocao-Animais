"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Clock, CheckCircle, XCircle } from "lucide-react"
import { buscarNotificacoes, marcarNotificacaoLida, type Notificacao } from "@/lib/api"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Card, Vazio, Carregando } from "@/components/animais/ui"
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
  const router = useRouter()
  const [itens, setItens] = useState<Notificacao[]>([])
  const [carregando, setCarregando] = useState(true)

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
        // atualiza localmente sem refazer tudo
        setItens((prev) => prev.map((x) => (x.id === n.id ? { ...x, lida: true } : x)))
      } catch {}
    }
    router.push("/solicitacoes")
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
    </Layout>
  )
}