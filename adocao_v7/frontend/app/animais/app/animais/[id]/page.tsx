"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { ArrowLeft, PawPrint, Edit, Heart, Check, X } from "lucide-react"
import { useConsulta } from "@/hooks/useConsulta"
import { buscarAnimal, criarSolicitacao } from "@/lib/api"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Botao, Card, Etiqueta, Carregando } from "@/components/animais/ui"

export default function PaginaDetalheAnimal({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: sessao } = useSession()
  const tipoUsuario = (sessao?.user as { tipo?: string })?.tipo

  const { dados: animal, carregando } = useConsulta(() => buscarAnimal(id), [id])

  const [solicitando, setSolicitando] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [mostrarForm, setMostrarForm] = useState(false)
  const [feedback, setFeedback] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null)

  const solicitarAdocao = async () => {
    setSolicitando(true)
    setFeedback(null)
    try {
      await criarSolicitacao(id, mensagem || undefined)
      setFeedback({ tipo: "sucesso", texto: "Solicitação enviada! Aguarde o contato da equipe." })
      setMostrarForm(false)
      setMensagem("")
    } catch {
      setFeedback({ tipo: "erro", texto: "Não foi possível enviar a solicitação. Tente novamente." })
    } finally {
      setSolicitando(false)
    }
  }

  return (
    <Layout>
      <BarraSuperior
        titulo={animal ? animal.nome : "Detalhe do animal"}
        acao={
          <div className="flex gap-2">
            <Botao variante="secundario" icone={<ArrowLeft size={14} />} onClick={() => router.back()}>
              Voltar
            </Botao>
            {tipoUsuario === "admin" && animal && (
              <Botao icone={<Edit size={14} />} onClick={() => router.push(`/animais/${id}/editar`)}>
                Editar
              </Botao>
            )}
          </div>
        }
      />

      <div className="p-6">
        {carregando ? (
          <div className="flex justify-center py-20">
            <Carregando />
          </div>
        ) : !animal ? (
          <div className="py-20 text-center text-sm text-zinc-400">Animal não encontrado.</div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">

            <div className="grid grid-cols-[280px_1fr] gap-6">
              {/* Foto */}
              <div className="flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                {animal.fotos[0] ? (
                  <img src={animal.fotos[0]} alt={animal.nome} className="h-full w-full object-cover" />
                ) : (
                  <PawPrint size={48} className="text-zinc-300" />
                )}
              </div>

              {/* Informações */}
              <Card className="space-y-4 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{animal.nome}</h1>
                    <p className="text-sm text-zinc-400">{animal.raca} · {animal.especie}</p>
                  </div>
                  <Etiqueta variante={animal.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-zinc-400">Idade</p>
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">
                      {animal.idade} {animal.unidadeIdade === "meses" ? "meses" : "anos"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Sexo</p>
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">
                      {animal.sexo === "macho" ? "Macho" : "Fêmea"}
                    </p>
                  </div>
                  {animal.peso && (
                    <div>
                      <p className="text-xs text-zinc-400">Peso</p>
                      <p className="font-medium text-zinc-800 dark:text-zinc-200">{animal.peso} kg</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 text-sm">
                  <span className={`flex items-center gap-1 ${animal.vacinado ? "text-emerald-600" : "text-zinc-400"}`}>
                    {animal.vacinado ? <Check size={13} /> : <X size={13} />} Vacinado
                  </span>
                  <span className={`flex items-center gap-1 ${animal.castrado ? "text-emerald-600" : "text-zinc-400"}`}>
                    {animal.castrado ? <Check size={13} /> : <X size={13} />} Castrado
                  </span>
                </div>

                {/* Botão adotar — só para adotante quando disponível */}
                {tipoUsuario === "adotante" && animal.status === "disponivel" && (
                  <div className="pt-2">
                    {!mostrarForm ? (
                      <Botao icone={<Heart size={14} />} onClick={() => setMostrarForm(true)} className="w-full">
                        Quero adotar
                      </Botao>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          rows={3}
                          placeholder="Deixe uma mensagem para a equipe (opcional)..."
                          value={mensagem}
                          onChange={(e) => setMensagem(e.target.value)}
                          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        />
                        <div className="flex gap-2">
                          <Botao carregando={solicitando} onClick={solicitarAdocao} className="flex-1">
                            Enviar solicitação
                          </Botao>
                          <Botao variante="secundario" onClick={() => setMostrarForm(false)}>
                            Cancelar
                          </Botao>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`rounded-lg border px-4 py-3 text-sm ${
                feedback.tipo === "sucesso"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}>
                {feedback.texto}
              </div>
            )}

            {/* Descrição */}
            {animal.descricao && (
              <Card className="p-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">Sobre</p>
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{animal.descricao}</p>
              </Card>
            )}

          </div>
        )}
      </div>
    </Layout>
  )
}
