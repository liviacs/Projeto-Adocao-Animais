import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PetAdopt",
  description: "Sistema de adoção de animais",
}

const paletas: Record<string, string[]> = {
  emerald: ["#ecfdf5","#d1fae5","#a7f3d0","#34d399","#10b981","#059669","#047857","#065f46","#064e3b","#022c22"],
  pink:    ["#fdf2f8","#fce7f3","#fbcfe8","#f472b6","#ec4899","#db2777","#be185d","#9d174d","#831843","#500724"],
  rose:    ["#fff1f2","#ffe4e6","#fecdd3","#fb7185","#f43f5e","#e11d48","#be123c","#9f1239","#881337","#4c0519"],
  blue:    ["#eff6ff","#dbeafe","#bfdbfe","#60a5fa","#3b82f6","#2563eb","#1d4ed8","#1e40af","#1e3a8a","#172554"],
  violet:  ["#f5f3ff","#ede9fe","#ddd6fe","#a78bfa","#8b5cf6","#7c3aed","#6d28d9","#5b21b6","#4c1d95","#2e1065"],
  amber:   ["#fffbeb","#fef3c7","#fde68a","#fbbf24","#f59e0b","#d97706","#b45309","#92400e","#78350f","#451a03"],
  orange:  ["#fff7ed","#ffedd5","#fed7aa","#fb923c","#f97316","#ea580c","#c2410c","#9a3412","#7c2d12","#431407"],
}

const initScript = `
(function() {
  try {
    var cfg = JSON.parse(localStorage.getItem('petadopt_config') || '{}');
    var tema = cfg.tema || 'escuro';
    if (tema === 'escuro') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    var paletas = ${JSON.stringify(paletas)};
    var cor = cfg.cor || 'emerald';
    var p = paletas[cor] || paletas['emerald'];
    var keys = ['--cor-50','--cor-100','--cor-200','--cor-400','--cor-500','--cor-600','--cor-700','--cor-800','--cor-900','--cor-950'];
    keys.forEach(function(k, i) { document.documentElement.style.setProperty(k, p[i]); });
  } catch(e) {}
})();
`

export const dynamic = 'force-dynamic'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
