"use client"

import { useState } from "react"
import { useConsulta } from "@/hooks/useConsulta"
import { useIdioma } from "@/hooks/useIdioma"
import { useApenasAdmin } from "@/hooks/useApenasAdmin"
import { buscarDadosRelatorios } from "@/lib/api"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Card, Carregando, Seletor } from "@/components/animais/ui"
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts"

const CORES = ["#0d9488", "#6366f1", "#f59e0b", "#e11d48", "#0ea5e9", "#a855f7", "#84cc16", "#fb923c"]

const TooltipCustom = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      {label && <p className="mb-1 font-medium text-zinc-700 dark:text-zinc-200">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-zinc-500 dark:text-zinc-400">
          {p.name}: <span className="font-medium text-zinc-800 dark:text-zinc-100">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

function CardGrafico({ titulo, children, full }: { titulo: string; children: React.ReactNode; full?: boolean }) {
  return (
    <Card className={`p-5 ${full ? "lg:col-span-2" : ""}`}>
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-zinc-400">{titulo}</p>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>{children as any}</ResponsiveContainer>
      </div>
    </Card>
  )
}

export default function PaginaRelatorios() {
  const liberado = useApenasAdmin()
  const { t } = useIdioma()
  const [especie, setEspecie] = useState("")
  const { dados, carregando } = useConsulta(() => buscarDadosRelatorios(especie), [especie])

  const opcoesEspecie = [
    { valor: "", rotulo: "Todas as espécies" },
    ...(dados?.especiesDisponiveis ?? []).map((e) => ({ valor: e, rotulo: e })),
  ]

  const totalSolics = (dados?.porStatus ?? []).reduce((acc, s) => acc + s.valor, 0)
  const adotadas = (dados?.porStatus ?? []).find((s) => s.nome === "Adotadas")?.valor ?? 0

  if (!liberado) return null

  return (
    <Layout>
      <BarraSuperior titulo={t("tituloRelatorios")} />
      <div className="space-y-5 p-4 sm:p-6">

        {/* gradiente reaproveitável (fora do grid pra não ocupar célula) */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="gradEmerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.55} />
            </linearGradient>
          </defs>
        </svg>

        {/* Filtro */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400">Filtrar por espécie:</span>
          <Seletor
            opcoes={opcoesEspecie}
            value={especie}
            onChange={(e) => setEspecie(e.target.value)}
            className="w-48 py-1.5 text-xs"
          />
        </div>

        {/* Destaques */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="flex flex-col p-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
              Aprovação {especie ? `· ${especie}` : "geral"}
            </p>
            <div className="relative flex-1" style={{ minHeight: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ valor: dados?.taxaAprovacao ?? 0 }]} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="valor" cornerRadius={10} fill="#0d9488" background={{ fill: "rgba(161,161,170,0.15)" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-semibold text-teal-600">{dados?.taxaAprovacao ?? 0}%</span>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col items-center justify-center p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Solicitações</p>
            <p className="my-1 text-5xl font-semibold text-zinc-900 dark:text-zinc-50">{totalSolics}</p>
            <p className="text-xs text-zinc-400">no total {especie ? `· ${especie}` : ""}</p>
          </Card>

          <Card className="flex flex-col items-center justify-center p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Adotadas</p>
            <p className="my-1 text-5xl font-semibold text-emerald-600">{adotadas}</p>
            <p className="text-xs text-zinc-400">solicitações aprovadas</p>
          </Card>

          <Card className="flex flex-col justify-center p-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-400">Aprovação por espécie</p>
            <div className="space-y-2.5">
              {(dados?.taxaPorEspecie ?? []).slice(0, 4).map((t) => (
                <div key={t.especie} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">{t.especie}</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-100">{t.taxa}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {carregando ? (
          <div className="flex justify-center py-20"><Carregando /></div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <CardGrafico titulo="Solicitações por status">
              <BarChart data={dados?.porStatus ?? []}>
                <XAxis dataKey="nome" fontSize={11} stroke="#a1a1aa" tickLine={false} axisLine={false} />
                <YAxis fontSize={11} stroke="#a1a1aa" allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={<TooltipCustom />} cursor={{ fill: "rgba(161,161,170,0.08)" }} />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                  {(dados?.porStatus ?? []).map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                </Bar>
              </BarChart>
            </CardGrafico>

            <CardGrafico titulo="Animais por situação">
              <PieChart>
                <Pie data={dados?.visaoAbrigo ?? []} dataKey="valor" nameKey="nome" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {(dados?.visaoAbrigo ?? []).map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                </Pie>
                <Tooltip content={<TooltipCustom />} />
              </PieChart>
            </CardGrafico>

            <CardGrafico titulo="Animais por espécie">
              <PieChart>
                <Pie data={dados?.porEspecie ?? []} dataKey="valor" nameKey="nome" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {(dados?.porEspecie ?? []).map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                </Pie>
                <Tooltip content={<TooltipCustom />} />
              </PieChart>
            </CardGrafico>

            <CardGrafico titulo="Animais por porte">
              <BarChart data={dados?.porPorte ?? []}>
                <XAxis dataKey="nome" fontSize={11} stroke="#a1a1aa" tickLine={false} axisLine={false} />
                <YAxis fontSize={11} stroke="#a1a1aa" allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={<TooltipCustom />} cursor={{ fill: "rgba(161,161,170,0.08)" }} />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]} fill="url(#gradEmerald)" />
              </BarChart>
            </CardGrafico>

            <CardGrafico titulo="Animais por raça (top 8)" full>
              <BarChart data={dados?.porRaca ?? []} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" fontSize={11} stroke="#a1a1aa" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="nome" fontSize={11} stroke="#a1a1aa" width={80} tickLine={false} axisLine={false} />
                <Tooltip content={<TooltipCustom />} cursor={{ fill: "rgba(161,161,170,0.08)" }} />
                <Bar dataKey="valor" fill="url(#gradEmerald)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </CardGrafico>
          </div>
        )}
      </div>
    </Layout>
  )
}