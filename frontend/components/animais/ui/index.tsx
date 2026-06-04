import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const coresEtiqueta = {
  disponivel:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  em_processo:  "bg-amber-50 text-amber-700 border-amber-200",
  adotado:      "bg-blue-50 text-blue-700 border-blue-200",
  pendente:     "bg-amber-50 text-amber-700 border-amber-200",
  aprovada:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejeitada:    "bg-red-50 text-red-700 border-red-200",
  admin:        "bg-violet-50 text-violet-700 border-violet-200",
  adotante:     "bg-zinc-100 text-zinc-600 border-zinc-200",
}

const textosEtiqueta: Record<string, string> = {
  disponivel:  "Disponível",
  em_processo: "Em processo",
  adotado:     "Adotado",
  pendente:    "Pendente",
  aprovada:    "Aprovada",
  rejeitada:   "Rejeitada",
  admin:       "Admin",
  adotante:    "Adotante",
}

interface EtiquetaProps {
  variante: keyof typeof coresEtiqueta
  className?: string
}

export function Etiqueta({ variante, className }: EtiquetaProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
      coresEtiqueta[variante],
      className
    )}>
      {textosEtiqueta[variante]}
    </span>
  )
}

// ── Botão ─────────────────────────────────────────────────────────────────────

interface BotaoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primario" | "secundario" | "fantasma" | "perigo"
  tamanho?: "pequeno" | "normal"
  carregando?: boolean
  icone?: React.ReactNode
}

const coresBotao = {
  primario:   "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50",
  secundario: "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  fantasma:   "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800",
  perigo:     "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
}

const tamanhosBotao = {
  pequeno: "gap-1.5 rounded-lg px-2.5 py-1.5 text-xs",
  normal:  "gap-2 rounded-lg px-4 py-2 text-sm",
}

export function Botao({
  variante = "primario",
  tamanho = "normal",
  carregando,
  icone,
  children,
  className,
  disabled,
  ...props
}: BotaoProps) {
  return (
    <button
      disabled={disabled || carregando}
      className={cn(
        "inline-flex items-center font-medium transition-colors disabled:cursor-not-allowed",
        coresBotao[variante],
        tamanhosBotao[tamanho],
        className
      )}
      {...props}
    >
      {carregando ? <Loader2 size={14} className="animate-spin" /> : icone}
      {children}
    </button>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
        onClick && "cursor-pointer transition-shadow hover:shadow-md",
        className
      )}
    >
      {children}
    </div>
  )
}

// ── Vazio ─────────────────────────────────────────────────────────────────────

interface VazioProps {
  titulo: string
  descricao?: string
  acao?: React.ReactNode
}

export function Vazio({ titulo, descricao, acao }: VazioProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{titulo}</p>
      {descricao && <p className="mt-1 text-xs text-zinc-500">{descricao}</p>}
      {acao && <div className="mt-4">{acao}</div>}
    </div>
  )
}

// ── Carregando ────────────────────────────────────────────────────────────────

export function Carregando({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin text-zinc-400", className)} size={20} />
}

// ── Card de estatística ───────────────────────────────────────────────────────

interface CardEstatisticaProps {
  rotulo: string
  valor: number | string
  icone: React.ReactNode
  variacao?: string
  subindo?: boolean
}

export function CardEstatistica({ rotulo, valor, icone, variacao, subindo }: CardEstatisticaProps) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2 text-xs text-zinc-500">
        {icone}
        {rotulo}
      </div>
      <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{valor}</p>
      {variacao && (
        <p className={cn("mt-1 text-xs", subindo ? "text-emerald-600" : "text-red-500")}>
          {variacao}
        </p>
      )}
    </Card>
  )
}

// ── Campo de texto ────────────────────────────────────────────────────────────

interface CampoProps extends React.InputHTMLAttributes<HTMLInputElement> {
  rotulo?: string
  erro?: string
}

export function Campo({ rotulo, erro, className, id, ...props }: CampoProps) {
  return (
    <div className="flex flex-col gap-1">
      {rotulo && (
        <label htmlFor={id} className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {rotulo}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
          erro && "border-red-400 focus:border-red-500 focus:ring-red-100",
          className
        )}
        {...props}
      />
      {erro && <p className="text-xs text-red-500">{erro}</p>}
    </div>
  )
}

// ── Seletor ───────────────────────────────────────────────────────────────────

interface SeletorProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  rotulo?: string
  erro?: string
  opcoes: { valor: string; rotulo: string }[]
}

export function Seletor({ rotulo, erro, opcoes, className, id, ...props }: SeletorProps) {
  return (
    <div className="flex flex-col gap-1">
      {rotulo && (
        <label htmlFor={id} className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {rotulo}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
          className
        )}
        {...props}
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>{o.rotulo}</option>
        ))}
      </select>
      {erro && <p className="text-xs text-red-500">{erro}</p>}
    </div>
  )
}

// ── Textarea ──────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  rotulo?: string
  erro?: string
}

export function AreaTexto({ rotulo, erro, className, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {rotulo && (
        <label htmlFor={id} className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          {rotulo}
        </label>
      )}
      <textarea
        id={id}
        rows={4}
        className={cn(
          "rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
          erro && "border-red-400",
          className
        )}
        {...props}
      />
      {erro && <p className="text-xs text-red-500">{erro}</p>}
    </div>
  )
}
