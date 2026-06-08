"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, PawPrint, Heart } from "lucide-react"
import { useConsulta } from "@/hooks/useConsulta"
import { buscarAnimal, criarSolicitacao } from "@/lib/api"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Botao, Card, Etiqueta, Carregando, Vazio } from "@/components/animais/ui"

const mensagensIndisponivel: Record<string, string> = {
  em_processo: "Este pet já está em processo de adoção.",
  adotado: "Este pet já foi adotado.",
  falecido: "Este pet não está mais disponível.",
}

export default function PaginaDetalheAnimal() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)

  const [solicitando, setSolicitando] = useState(false)
  const [mensagem, setMensagem] = useState("")

  const { dados: animal, carregando } = useConsulta(() => buscarAnimal(id), [id])

  const handleSolicitar = async () => {
    if (!animal) return
    setSolicitando(true)
    setMensagem("")
    try {
      await criarSolicitacao(animal.id)
      setMensagem("Solicitação enviada com sucesso!")
    } catch (e) {
      setMensagem(e instanceof Error ? e.message : "Erro ao enviar solicitação")
    } finally {
      setSolicitando(false)
    }
  }

  return (
    <Layout>
      <BarraSuperior titulo="Detalhes do pet" />

      <div className="p-6">
        <button
          onClick={() => router.push("/animais")}
          className="mb-4 flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700"
        >
          <ArrowLeft size={14} /> Voltar para a lista
        </button>

        {carregando ? (
          <div className="flex justify-center py-20"><Carregando /></div>
        ) : !animal ? (
          <Vazio titulo="Pet não encontrado" />
        ) : (
          <Card className="mx-auto max-w-2xl overflow-hidden">
            {/* Foto inteira no topo */}
            <div className="flex max-h-[420px] items-center justify-center bg-zinc-100 dark:bg-zinc-800">
              {animal.fotos[0] ? (
                <img
                  src={animal.fotos[0]}
                  alt={animal.nome}
                  className="max-h-[420px] w-full object-contain"
                />
              ) : (
                <div className="flex h-64 w-full items-center justify-center">
                  <PawPrint size={48} className="text-zinc-300" />
                </div>
              )}
            </div>

            {/* Dados */}
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{animal.nome}</h1>
                <Etiqueta variante={animal.status} />
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                <Campo rotulo="ID" valor={`#${animal.id}`} />
                <Campo rotulo="Espécie" valor={animal.especie} />
                <Campo rotulo="Raça" valor={animal.raca || "—"} />
                <Campo rotulo="Idade" valor={`${animal.idade} ${animal.unidadeIdade}`} />
                <Campo rotulo="Sexo" valor={animal.sexo} />
                <Campo rotulo="Vacinado" valor={animal.vacinado ? "Sim" : "Não"} />
                <Campo rotulo="Castrado" valor={animal.castrado ? "Sim" : "Não"} />
              </div>

              {animal.descricao && (
                <div className="mt-5">
                  <p className="mb-1 text-xs font-medium text-zinc-400">Descrição</p>
                  <p className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {animal.descricao}
                  </p>
                </div>
              )}

              {/* Botão de solicitar adoção */}
              <div className="mt-6">
                <Botao
                  icone={<Heart size={15} />}
                  carregando={solicitando}
                  disabled={animal.status !== "disponivel"}
                  onClick={handleSolicitar}
                  className="w-full justify-center"
                >
                  {animal.status === "disponivel" ? "Solicitar adoção" : "Indisponível para adoção"}
                </Botao>

                {animal.status !== "disponivel" && (
                  <p className="mt-2 text-center text-xs text-zinc-400">
                    {mensagensIndisponivel[animal.status] ?? "Indisponível."}
                  </p>
                )}

                {mensagem && (
                  <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    {mensagem}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}

// pequeno componente auxiliar pra cada dado
function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-400">{rotulo}</p>
      <p className="font-medium text-zinc-800 dark:text-zinc-200">{valor}</p>
    </div>
  )
}