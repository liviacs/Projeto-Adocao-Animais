"use client"

import { useState, useEffect } from "react"
import { Bell, Palette, Globe, Moon, Sun, Check } from "lucide-react"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Botao, Card } from "@/components/animais/ui"

type Tema = "claro" | "escuro"
type CorNome = "emerald" | "pink" | "rose" | "blue" | "violet" | "amber" | "orange"

interface Config {
  tema: Tema
  cor: CorNome
  notifEmail: boolean
  notifSistema: boolean
  notifSolicitacoes: boolean
  idioma: string
}

const paletas: Record<CorNome, string[]> = {
  emerald: ["#ecfdf5","#d1fae5","#a7f3d0","#34d399","#10b981","#059669","#047857","#065f46","#064e3b","#022c22"],
  pink:    ["#fdf2f8","#fce7f3","#fbcfe8","#f472b6","#ec4899","#db2777","#be185d","#9d174d","#831843","#500724"],
  rose:    ["#fff1f2","#ffe4e6","#fecdd3","#fb7185","#f43f5e","#e11d48","#be123c","#9f1239","#881337","#4c0519"],
  blue:    ["#eff6ff","#dbeafe","#bfdbfe","#60a5fa","#3b82f6","#2563eb","#1d4ed8","#1e40af","#1e3a8a","#172554"],
  violet:  ["#f5f3ff","#ede9fe","#ddd6fe","#a78bfa","#8b5cf6","#7c3aed","#6d28d9","#5b21b6","#4c1d95","#2e1065"],
  amber:   ["#fffbeb","#fef3c7","#fde68a","#fbbf24","#f59e0b","#d97706","#b45309","#92400e","#78350f","#451a03"],
  orange:  ["#fff7ed","#ffedd5","#fed7aa","#fb923c","#f97316","#ea580c","#c2410c","#9a3412","#7c2d12","#431407"],
}

const nomesCores: Record<CorNome, string> = {
  emerald: "Verde",
  pink:    "Rosa",
  rose:    "Vermelho",
  blue:    "Azul",
  violet:  "Roxo",
  amber:   "Amarelo",
  orange:  "Laranja",
}

const traducoes: Record<string, Record<string, string>> = {
  "pt-BR": {
    titulo: "Configurações",
    notificacoes: "Notificações",
    notifEmail: "Notificações por e-mail",
    notifEmailDesc: "Receba atualizações no seu e-mail",
    notifSistema: "Notificações do sistema",
    notifSistemaDesc: "Alertas dentro da plataforma",
    notifSolicitacoes: "Novas solicitações",
    notifSolicitacoesDesc: "Avisar quando uma solicitação chegar",
    aparencia: "Aparência",
    tema: "Tema",
    claro: "Claro",
    escuro: "Escuro",
    corPrimaria: "Cor primária",
    idioma: "Idioma",
    idiomaLabel: "Idioma da interface",
    salvar: "Salvar configurações",
    salvoSucesso: "Configurações salvas com sucesso!",
  },
  "en": {
    titulo: "Settings",
    notificacoes: "Notifications",
    notifEmail: "Email notifications",
    notifEmailDesc: "Receive updates in your email",
    notifSistema: "System notifications",
    notifSistemaDesc: "Alerts within the platform",
    notifSolicitacoes: "New requests",
    notifSolicitacoesDesc: "Notify when a request arrives",
    aparencia: "Appearance",
    tema: "Theme",
    claro: "Light",
    escuro: "Dark",
    corPrimaria: "Primary color",
    idioma: "Language",
    idiomaLabel: "Interface language",
    salvar: "Save settings",
    salvoSucesso: "Settings saved successfully!",
  },
  "es": {
    titulo: "Configuración",
    notificacoes: "Notificaciones",
    notifEmail: "Notificaciones por correo",
    notifEmailDesc: "Recibe actualizaciones en tu correo",
    notifSistema: "Notificaciones del sistema",
    notifSistemaDesc: "Alertas dentro de la plataforma",
    notifSolicitacoes: "Nuevas solicitudes",
    notifSolicitacoesDesc: "Avisar cuando llegue una solicitud",
    aparencia: "Apariencia",
    tema: "Tema",
    claro: "Claro",
    escuro: "Oscuro",
    corPrimaria: "Color primario",
    idioma: "Idioma",
    idiomaLabel: "Idioma de la interfaz",
    salvar: "Guardar configuración",
    salvoSucesso: "¡Configuración guardada con éxito!",
  },
  "ko": {
    titulo: "설정",
    notificacoes: "알림",
    notifEmail: "이메일 알림",
    notifEmailDesc: "이메일로 업데이트를 받으세요",
    notifSistema: "시스템 알림",
    notifSistemaDesc: "플랫폼 내 알림",
    notifSolicitacoes: "새 요청",
    notifSolicitacoesDesc: "요청이 도착하면 알림",
    aparencia: "외관",
    tema: "테마",
    claro: "라이트",
    escuro: "다크",
    corPrimaria: "주 색상",
    idioma: "언어",
    idiomaLabel: "인터페이스 언어",
    salvar: "설정 저장",
    salvoSucesso: "설정이 저장되었습니다!",
  },
}

const CHAVE = "petadopt_config"

function configPadrao(): Config {
  return { tema: "escuro", cor: "emerald", notifEmail: true, notifSistema: true, notifSolicitacoes: true, idioma: "pt-BR" }
}

function aplicarTema(tema: Tema) {
  if (tema === "escuro") {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
}

function aplicarCor(cor: CorNome) {
  const p = paletas[cor]
  const keys = ["--cor-50","--cor-100","--cor-200","--cor-400","--cor-500","--cor-600","--cor-700","--cor-800","--cor-900","--cor-950"]
  keys.forEach((k, i) => document.documentElement.style.setProperty(k, p[i]))
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={value}
      className="relative h-5 w-9 flex-shrink-0 rounded-full transition-colors"
      style={{ backgroundColor: value ? "var(--cor-600)" : "#d1d5db" }}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${value ? "left-4" : "left-0.5"}`} />
    </button>
  )
}

export default function PaginaConfiguracoes() {
  const [cfg, setCfg] = useState<Config>(configPadrao)
  const [mensagem, setMensagem] = useState("")

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CHAVE)
      if (salvo) setCfg({ ...configPadrao(), ...JSON.parse(salvo) })
    } catch {}
  }, [])

  const t = traducoes[cfg.idioma] ?? traducoes["pt-BR"]

  const atualizar = <K extends keyof Config>(chave: K, valor: Config[K]) => {
    setCfg((prev) => ({ ...prev, [chave]: valor }))
    if (chave === "tema") aplicarTema(valor as Tema)
    if (chave === "cor")  aplicarCor(valor as CorNome)
  }

  const salvar = () => {
    localStorage.setItem(CHAVE, JSON.stringify(cfg))
    window.dispatchEvent(new Event("petadopt-config-mudou"))
    setMensagem(t.salvoSucesso)
    setTimeout(() => setMensagem(""), 3000)
  }

  return (
    <Layout>
      <BarraSuperior titulo={t.titulo} />

      <div className="mx-auto max-w-xl space-y-4 p-6">

        {/* Notificações */}
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Bell size={16} style={{ color: "var(--cor-600)" }} />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t.notificacoes}</h2>
          </div>
          <div className="space-y-3">
            {([
              { chave: "notifEmail",        label: t.notifEmail,        desc: t.notifEmailDesc },
              { chave: "notifSistema",      label: t.notifSistema,      desc: t.notifSistemaDesc },
              { chave: "notifSolicitacoes", label: t.notifSolicitacoes, desc: t.notifSolicitacoesDesc },
            ] as const).map(({ chave, label, desc }) => (
              <div key={chave} className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800">
                <div>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{label}</p>
                  <p className="text-xs text-zinc-400">{desc}</p>
                </div>
                <Toggle value={cfg[chave]} onChange={() => atualizar(chave, !cfg[chave])} />
              </div>
            ))}
          </div>
        </Card>

        {/* Aparência */}
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Palette size={16} style={{ color: "var(--cor-600)" }} />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t.aparencia}</h2>
          </div>

          {/* Tema */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-zinc-500">{t.tema}</label>
            <div className="flex gap-2">
              {(["claro", "escuro"] as Tema[]).map((op) => (
                <button
                  key={op}
                  onClick={() => atualizar("tema", op)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors"
                  style={cfg.tema === op
                    ? { backgroundColor: "var(--cor-600)", color: "#fff", borderColor: "transparent" }
                    : undefined
                  }
                >
                  {op === "claro" ? <Sun size={14} /> : <Moon size={14} />}
                  {op === "claro" ? t.claro : t.escuro}
                </button>
              ))}
            </div>
          </div>

          {/* Cor primária */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-500">{t.corPrimaria}</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(nomesCores) as [CorNome, string][]).map(([cor, nome]) => {
                const hex = paletas[cor][5]
                const ativo = cfg.cor === cor
                return (
                  <button
                    key={cor}
                    onClick={() => atualizar("cor", cor)}
                    title={nome}
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
                    style={{
                      borderColor: ativo ? hex : undefined,
                      backgroundColor: ativo ? hex + "18" : undefined,
                      color: ativo ? hex : undefined,
                    }}
                  >
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: hex }} />
                    {nome}
                    {ativo && <Check size={11} />}
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Idioma */}
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Globe size={16} style={{ color: "var(--cor-600)" }} />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{t.idioma}</h2>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">{t.idiomaLabel}</label>
            <select
              value={cfg.idioma}
              onChange={(e) => atualizar("idioma", e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="ko">한국어</option>
            </select>
          </div>
        </Card>

        {mensagem && (
          <p className="rounded-lg px-4 py-3 text-sm font-medium text-white" style={{ backgroundColor: "var(--cor-600)" }}>
            {mensagem}
          </p>
        )}

        <div className="flex justify-end">
          <Botao onClick={salvar}>{t.salvar}</Botao>
        </div>

      </div>
    </Layout>
  )
}