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
  X,
} from "lucide-react"
import { cn, iniciais } from "@/lib/utils"
import { useIdioma } from "@/hooks/useIdioma"

const itensNav = [
  {
    secao: "Principal",
    chaveSecao: "secaoPrincipal",
    links: [
      { href: "/dashboard",     rotulo: "Dashboard",      chave: "dashboard",     icone: LayoutDashboard, admin: true },
      { href: "/animais",       rotulo: "Animais",        chave: "animais",       icone: PawPrint },
      { href: "/solicitacoes",  rotulo: "Solicitações",   chave: "solicitacoes",  icone: ClipboardList, mostraBadge: true },
    ],
  },
  {
    secao: "Gestão",
    chaveSecao: "secaoGestao",
    links: [
      { href: "/usuarios",   rotulo: "Usuários",    chave: "usuarios",   icone: Users, admin: true },
      { href: "/relatorios", rotulo: "Relatórios",  chave: "relatorios", icone: BarChart2, admin: true },
    ],
  },
  {
    secao: "Sistema",
    chaveSecao: "secaoSistema",
    links: [
      { href: "/notificacoes", rotulo: "Notificações",    chave: "notificacoes",  icone: Bell },
      { href: "/logs",         rotulo: "Logs do sistema", chave: "logs",          icone: ScrollText, admin: true },
      { href: "/configuracoes",rotulo: "Configurações",   chave: "configuracoes", icone: Settings },
    ],
  },
]

interface BarraLateralProps {
  solicitacoesPendentes?: number
  aberto?: boolean
  aoFechar?: () => void
}

export function BarraLateral({ solicitacoesPendentes = 0, aberto = false, aoFechar }: BarraLateralProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useIdioma()
  const [usuario, setUsuario] = useState<{ nome?: string; email?: string; tipo?: string } | null>(null)
  useEffect(() => {
    const u = localStorage.getItem("usuario")
    if (u) {
      try { setUsuario(JSON.parse(u)) } catch {}
    }
  }, [])

  const ehAdmin = usuario?.tipo === "ADMIN"

  return (
    <>
      {/* Overlay escuro no mobile quando o menu está aberto */}
      {aberto && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={aoFechar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "z-50 flex h-screen w-56 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
          // No mobile: fixa fora da tela, desliza pra dentro quando aberto
          "fixed inset-y-0 left-0 transition-transform duration-200",
          aberto ? "translate-x-0" : "-translate-x-full",
          // No desktop (lg+): sempre visível, posição estática
          "lg:static lg:translate-x-0"
        )}
      >
        {/* Logo + botão fechar (mobile) */}
        <div className="flex items-center gap-2.5 px-4 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <PawPrint size={16} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">PetAdopt</p>
            <p className="text-[10px] text-zinc-400">Sistema de Adoção</p>
          </div>
          {/* Botão fechar - só no mobile */}
          <button
            onClick={aoFechar}
            className="text-zinc-400 hover:text-zinc-600 lg:hidden dark:hover:text-zinc-300"
            title="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto px-2 py-1">
          {itensNav.map(({ secao, chaveSecao, links }) => {
            const linksVisiveis = links.filter((l: any) => !l.admin || ehAdmin)
            if (linksVisiveis.length === 0) return null
            return (
            <div key={secao} className="mb-3">
              <p className="mb-1 px-2 text-[10px] font-medium uppercase tracking-widest text-zinc-400">
                {t(chaveSecao)}
              </p>
              {linksVisiveis.map(({ href, rotulo, chave, icone: Icone, mostraBadge }) => {
                const ativo = pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={aoFechar}
                    className={cn(
                      "mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                      ativo
                        ? "bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                    )}
                  >
                    <Icone size={15} />
                    <span className="flex-1">{t(chave)}</span>
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
              onClick={() => { router.push("/perfil"); aoFechar?.() }}
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
    </>
  )
}
