"use client"

import { useState } from "react"
import { Search, Bell } from "lucide-react"
import { useConsulta } from "@/hooks/useConsulta"
import { buscarEstatisticas } from "@/lib/api"
import { BarraLateral } from "./BarraLateral"

// ── Layout principal ──────────────────────────────────────────────────────────

export function Layout({ children }: { children: React.ReactNode }) {
  const { dados } = useConsulta(buscarEstatisticas)

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <BarraLateral solicitacoesPendentes={dados?.solicitacoesPendentes ?? 0} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

// ── Barra superior ────────────────────────────────────────────────────────────

interface BarraSuperiorProps {
  titulo: string
  acao?: React.ReactNode
  aoBuscar?: (valor: string) => void
}

export function BarraSuperior({ titulo, acao, aoBuscar }: BarraSuperiorProps) {
  const [busca, setBusca] = useState("")

  return (
    <header className="flex items-center gap-4 border-b border-zinc-200 bg-white px-6 py-3.5 dark:border-zinc-800 dark:bg-zinc-950">
      <h1 className="flex-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{titulo}</h1>

      {aoBuscar && (
        <div className="flex w-48 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900">
          <Search size={13} className="text-zinc-400" />
          <input
            value={busca}
            onChange={(e) => { setBusca(e.target.value); aoBuscar(e.target.value) }}
            placeholder="Buscar..."
            className="w-full bg-transparent text-xs text-zinc-700 outline-none placeholder:text-zinc-400 dark:text-zinc-300"
          />
        </div>
      )}

      <button className="relative rounded-lg border border-zinc-200 p-1.5 text-zinc-500 hover:text-zinc-800 dark:border-zinc-700">
        <Bell size={15} />
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500" />
      </button>

      {acao}
    </header>
  )
}
