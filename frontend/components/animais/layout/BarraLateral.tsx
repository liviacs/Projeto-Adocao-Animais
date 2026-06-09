"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  PawPrint,
  ClipboardList,
  Users,
  BarChart2,
  Bell,
  ScrollText,
  Settings,
  LogOut,
} from "lucide-react"
import { cn, iniciais } from "@/lib/utils"

const itensNav = [
  {
    secao: "Principal",
    links: [
      { href: "/dashboard",     rotulo: "Dashboard",      icone: LayoutDashboard, admin: true },
      { href: "/animais",       rotulo: "Animais",        icone: PawPrint },
      { href: "/solicitacoes",  rotulo: "Solicitações",   icone: ClipboardList, mostraBadge: true },
    ],
  },
  {
    secao: "Gestão",
    links: [
      { href: "/usuarios",   rotulo: "Usuários",    icone: Users, admin: true },
      { href: "/relatorios", rotulo: "Relatórios",  icone: BarChart2, admin: true },
    ],
  },
  {
    secao: "Sistema",
    links: [
      { href: "/notificacoes", rotulo: "Notificações",    icone: Bell },
      { href: "/logs",         rotulo: "Logs do sistema", icone: ScrollText, admin: true },
      { href: "/configuracoes",rotulo: "Configurações",   icone: Settings },
    ],
  },
]

interface BarraLateralProps {
  solicitacoesPendentes?: number
}

export function BarraLateral({ solicitacoesPendentes = 0 }: BarraLateralProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [usuario, setUsuario] = useState<{ nome?: string; email?: string; tipo?: string } | null>(null)
  useEffect(() => {
    const u = localStorage.getItem("usuario")
    if (u) {
      try { setUsuario(JSON.parse(u)) } catch {}
    }
  }, [])

  const ehAdmin = usuario?.tipo === "ADMIN"

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <PawPrint size={16} />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">PetAdopt</p>
          <p className="text-[10px] text-zinc-400">Sistema de Adoção</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto px-2 py-1">
        {itensNav.map(({ secao, links }) => {
          const linksVisiveis = links.filter((l: any) => !l.admin || ehAdmin)
          if (linksVisiveis.length === 0) return null
          return (
          <div key={secao} className="mb-3">
            <p className="mb-1 px-2 text-[10px] font-medium uppercase tracking-widest text-zinc-400">
              {secao}
            </p>
            {linksVisiveis.map(({ href, rotulo, icone: Icone, mostraBadge }) => {
              const ativo = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                    ativo
                      ? "bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  <Icone size={15} />
                  <span className="flex-1">{rotulo}</span>
                  {mostraBadge && solicitacoesPendentes > 0 && (
                    <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {solicitacoesPendentes}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
          )
        })}
      </nav>

      {/* Usuário logado */}
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push("/perfil")}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Meu perfil"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              {iniciais(usuario?.nome ?? "US")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">
                {usuario?.nome ?? "Usuário"}
              </p>
              <p className="truncate text-[10px] text-zinc-400">{usuario?.email}</p>
            </div>
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token")
              localStorage.removeItem("usuario")
              window.location.href = "/auth"
            }}
            title="Sair"
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

    </aside>
  )
}
