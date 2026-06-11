"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, RefreshCw, Download, FileText, BarChart2, Heart } from "lucide-react"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Card, Vazio, Carregando, Botao } from "@/components/animais/ui"
import { buscarLogs, baixarRelatorio, type LogSistema } from "@/lib/api"
import { useIdioma } from "@/hooks/useIdioma"

type TipoLog = "info" | "aviso" | "erro" | "sucesso"

const estilos: Record<TipoLog, { badge: string; ponto: string; label: string }> = {
  sucesso: { badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400", ponto: "bg-emerald-500", label: "Sucesso" },
  info:    { badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",             ponto: "bg-blue-500",    label: "Info"    },
  aviso:   { badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",         ponto: "bg-amber-500",   label: "Aviso"   },
  erro:    { badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",                 ponto: "bg-red-500",     label: "Erro"    },
}

const relatorios = [
  { id: "mensal"   as const, titulo: "Relatório mensal",         descricao: "Resumo de adoções, cadastros e atividades do mês.", icone: FileText },
  { id: "especies" as const, titulo: "Distribuição por espécie", descricao: "Animais cadastrados agrupados por espécie.",        icone: BarChart2 },
  { id: "adocoes"  as const, titulo: "Histórico de adoções",     descricao: "Lista completa de todas as adoções realizadas.",    icone: Heart },
]

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
}

export default function PaginaLogs() {
  const { t } = useIdioma()
  const [logs, setLogs] = useState<LogSistema[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const [busca, setBusca] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<TipoLog | "todos">("todos")
  const [baixando, setBaixando] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro("")
    try {
      const dados = await buscarLogs({ tipo: filtroTipo, busca, limite: 200 })
      setLogs(dados)
    } catch (e: any) {
      setErro(e.message ?? "Erro ao carregar logs")
    } finally {
      setCarregando(false)
    }
  }, [filtroTipo, busca])

  useEffect(() => {
    const t = setTimeout(carregar, 300)
    return () => clearTimeout(t)
  }, [carregar])

  const exportar = async (tipo: "mensal" | "especies" | "adocoes") => {
    setBaixando(tipo)
    try {
      await baixarRelatorio(tipo)
    } catch (e) {
      // silencioso
    } finally {
      setBaixando(null)
    }
  }

  return (
    <Layout>
      <BarraSuperior titulo={t("tituloLogs")} />

      <div className="mx-auto max-w-3xl p-6">
        {/* Exportação de relatórios CSV */}
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">Exportar relatórios (CSV)</p>
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          {relatorios.map((r) => {
            const Icone = r.icone
            return (
              <Card key={r.id} className="flex flex-col p-4">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
                  <Icone size={18} />
                </div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{r.titulo}</p>
                <p className="mb-3 flex-1 text-xs text-zinc-400">{r.descricao}</p>
                <Botao variante="secundario" tamanho="pequeno" carregando={baixando === r.id} onClick={() => exportar(r.id)} className="w-full justify-center">
                  <Download size={13} /> Exportar CSV
                </Botao>
              </Card>
            )
          })}
        </div>

        {/* Lista de logs */}
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">Registros do sistema</p>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar por mensagem ou usuário…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 placeholder-zinc-400 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center gap-1">
            <Filter size={13} className="text-zinc-400" />
            {(["todos", "sucesso", "info", "aviso", "erro"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFiltroTipo(t)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                style={filtroTipo === t ? { backgroundColor: "var(--cor-600)", color: "#fff" } : undefined}
              >
                {t === "todos" ? "Todos" : estilos[t as TipoLog].label}
              </button>
            ))}
          </div>

          <button
            onClick={carregar}
            title="Atualizar"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <RefreshCw size={12} className={carregando ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>

        {carregando ? (
          <div className="flex justify-center py-16"><Carregando /></div>
        ) : erro ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{erro}</p>
        ) : logs.length === 0 ? (
          <Vazio titulo="Nenhum log encontrado" descricao="Tente ajustar os filtros de busca." />
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const e = estilos[log.tipo as TipoLog]
              return (
                <Card key={log.id} className="flex items-start gap-3 p-4">
                  <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${e.ponto}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${e.badge}`}>
                        {e.label}
                      </span>
                      <p className="text-sm text-zinc-800 dark:text-zinc-100">{log.mensagem}</p>
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      {log.usuario} · {formatarData(log.data)}
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
