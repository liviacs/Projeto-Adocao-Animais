"use client"

import { useState } from "react"
import { Download, FileText, BarChart2, Heart } from "lucide-react"
import { baixarRelatorio } from "@/lib/api"
import { Layout, BarraSuperior } from "@/components/layout"
import { Botao, Card } from "@/components/ui"

const relatorios = [
  { id: "mensal"   as const, titulo: "Relatório mensal",        descricao: "Resumo de adoções, cadastros e atividades do mês.",     icone: FileText },
  { id: "especies" as const, titulo: "Distribuição por espécie", descricao: "Animais cadastrados agrupados por espécie.",             icone: BarChart2 },
  { id: "adocoes"  as const, titulo: "Histórico de adoções",    descricao: "Lista completa de todas as adoções realizadas.",         icone: Heart },
]

export default function PaginaRelatorios() {
  const [baixando, setBaixando] = useState<string | null>(null)

  const handleBaixar = async (tipo: typeof relatorios[number]["id"]) => {
    setBaixando(tipo)
    try {
      await baixarRelatorio(tipo)
    } catch {
      alert("Erro ao gerar relatório. Tente novamente.")
    } finally {
      setBaixando(null)
    }
  }

  return (
    <Layout>
      <BarraSuperior titulo="Relatórios" />
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          {relatorios.map(({ id, titulo, descricao, icone: Icone }) => (
            <Card key={id} className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
                  <Icone size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{titulo}</p>
                  <p className="text-xs text-zinc-400">{descricao}</p>
                </div>
              </div>
              <Botao
                variante="secundario"
                tamanho="pequeno"
                icone={<Download size={13} />}
                carregando={baixando === id}
                onClick={() => handleBaixar(id)}
                className="w-full justify-center"
              >
                Exportar PDF
              </Botao>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  )
}
