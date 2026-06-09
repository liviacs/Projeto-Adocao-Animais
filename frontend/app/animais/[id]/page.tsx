"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, PawPrint, Heart } from "lucide-react"
import { useConsulta } from "@/hooks/useConsulta"
import { buscarAnimal, criarSolicitacao, buscarVacinas, salvarVacinas, statusDocumentosPet, abrirDocumentoPet, enviarDocumentosPet } from "@/lib/api"
import { useUsuario } from "@/hooks/useUsuario"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Botao, Card, Etiqueta, Carregando, Vazio } from "@/components/animais/ui"

const mensagensIndisponivel: Record<string, string> = {
  em_processo: "Este pet já está em processo de adoção.",
  adotado: "Este pet já foi adotado.",
  falecido: "Este pet não está mais disponível.",
}

const vacinasPorEspecie: Record<string, { campo: string; rotulo: string }[]> = {
  cachorro: [
    { campo: "antirrabica", rotulo: "Antirrábica" },
    { campo: "v8", rotulo: "V8" },
    { campo: "v10", rotulo: "V10" },
    { campo: "giardia", rotulo: "Giárdia" },
    { campo: "leishmaniose", rotulo: "Leishmaniose" },
  ],
  gato: [
    { campo: "antirrabica", rotulo: "Antirrábica" },
    { campo: "triplice_felina", rotulo: "Tríplice felina" },
    { campo: "quadrupla_felina", rotulo: "Quádrupla felina" },
    { campo: "giardia", rotulo: "Giárdia" },
  ],
}

export default function PaginaDetalheAnimal() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)

  const [solicitando, setSolicitando] = useState(false)
  const [mensagem, setMensagem] = useState("")

  const { dados: animal, carregando, recarregar } = useConsulta(() => buscarAnimal(id), [id])
  const { ehAdmin } = useUsuario()
  const { dados: vacinasDados, recarregar: recarregarVacinas } = useConsulta(() => buscarVacinas(id), [id])

  const [vacinas, setVacinas] = useState<Record<string, string>>({})
  const [salvandoVacinas, setSalvandoVacinas] = useState(false)
  const [msgVacinas, setMsgVacinas] = useState("")

  // quando as vacinas chegam do backend, preenche o estado (cortando o ISO pra YYYY-MM-DD)
  useEffect(() => {
    if (vacinasDados) {
      const limpo: Record<string, string> = {}
      Object.entries(vacinasDados).forEach(([k, v]) => {
        if (v && typeof v === "string") limpo[k] = v.slice(0, 10)
      })
      setVacinas(limpo)
    }
  }, [vacinasDados])

  // status da carteira: completa / incompleta / não vacinado
  const statusVacinacao = (() => {
    const lista = vacinasPorEspecie[animal?.especie ?? ""]
    if (!lista) return null // espécie sem protocolo (coelho, ave...)
    const preenchidas = lista.filter((v) => vacinas[v.campo]).length
    if (preenchidas === 0) return { texto: "Não vacinado", cor: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" }
    if (preenchidas === lista.length) return { texto: "Vacinação completa", cor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" }
    return { texto: "Vacinação incompleta", cor: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" }
  })()

  // documentos do pet (só admin)
  const [statusDocs, setStatusDocs] = useState<any>(null)
  const [docNascimento, setDocNascimento] = useState<File | null>(null)
  const [docObito, setDocObito] = useState<File | null>(null)
  const [docRga, setDocRga] = useState<File | null>(null)
  const [docCarteira, setDocCarteira] = useState<File | null>(null)
  const [salvandoDocs, setSalvandoDocs] = useState(false)
  const [msgDocs, setMsgDocs] = useState("")

  useEffect(() => {
    if (ehAdmin && id) {
      statusDocumentosPet(id).then(setStatusDocs).catch(() => {})
    }
  }, [ehAdmin, id])

  const abrirDocPet = async (tipo: "nascimento" | "obito" | "rga" | "carteira") => {
    try {
      await abrirDocumentoPet(id, tipo)
    } catch {
      setMsgDocs("Documento não encontrado.")
    }
  }

  const salvarDocsPet = async () => {
    setMsgDocs("")
    if (!docNascimento && !docObito && !docRga && !docCarteira) {
      setMsgDocs("Anexe ao menos um documento.")
      return
    }
    setSalvandoDocs(true)
    try {
      const docs: any = {}
      if (docNascimento) docs.certidao_nascimento = docNascimento
      if (docObito) docs.certidao_obito = docObito
      if (docRga) docs.rga = docRga
      if (docCarteira) docs.carteira_vacinacao = docCarteira
      await enviarDocumentosPet(id, docs)
      setMsgDocs("Documentos salvos com sucesso!")
      setDocNascimento(null); setDocObito(null); setDocRga(null); setDocCarteira(null)
      statusDocumentosPet(id).then(setStatusDocs).catch(() => {})
    } catch (e) {
      setMsgDocs(e instanceof Error ? e.message : "Erro ao salvar documentos")
    } finally {
      setSalvandoDocs(false)
    }
  }

  const salvarCarteira = async () => {
    setMsgVacinas("")
    setSalvandoVacinas(true)
    try {
      await salvarVacinas(id, vacinas)
      setMsgVacinas("Carteira de vacinação salva!")
      recarregarVacinas()
    } catch (e) {
      setMsgVacinas(e instanceof Error ? e.message : "Erro ao salvar vacinas")
    } finally {
      setSalvandoVacinas(false)
    }
  }

  const [sucesso, setSucesso] = useState(false)

  const handleSolicitar = async () => {
    if (!animal) return
    setSolicitando(true)
    setMensagem("")
    setSucesso(false)
    try {
      await criarSolicitacao(animal.id)
      setSucesso(true)
      setMensagem("Solicitação criada com sucesso. Processo em Analise!")
      recarregar() // recarrega o animal pra o status atualizar pra "em processo"
    } catch (e) {
      setSucesso(false)
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
                <div>
                  <p className="text-xs text-zinc-400">Vacinação</p>
                  {statusVacinacao ? (
                    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusVacinacao.cor}`}>
                      {statusVacinacao.texto}
                    </span>
                  ) : (
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">—</p>
                  )}
                </div>
                <Campo rotulo="Castrado" valor={animal.castrado ? "Sim" : "Não"} />
                <Campo rotulo="Chipado" valor={animal.chipado ? "Sim" : "Não"} />
              </div>

              {vacinasPorEspecie[animal.especie] && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-medium text-zinc-400">Carteira de vacinação</p>
                  <div className="grid grid-cols-2 gap-3">
                    {vacinasPorEspecie[animal.especie].map((v) => (
                      <div key={v.campo}>
                        <label className="mb-1 block text-xs text-zinc-400">{v.rotulo}</label>
                        {ehAdmin ? (
                          <input
                            type="date"
                            value={vacinas[v.campo] ?? ""}
                            onChange={(e) => setVacinas({ ...vacinas, [v.campo]: e.target.value })}
                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                          />
                        ) : (
                          <p className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            {vacinas[v.campo] ? new Date(vacinas[v.campo] + "T00:00:00").toLocaleDateString("pt-BR") : "Não registrada"}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  {ehAdmin && (
                    <div className="mt-3">
                      <Botao carregando={salvandoVacinas} onClick={salvarCarteira}>Salvar vacinas</Botao>
                      {msgVacinas && (
                        <p className={`mt-2 rounded-lg px-3 py-2 text-xs ${msgVacinas.includes("salva") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"}`}>
                          {msgVacinas}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {ehAdmin && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-medium text-zinc-400">Documentos do pet</p>
                  <div className="space-y-2">
                    {[
                      { tipo: "nascimento", rotulo: "Certidão de nascimento", tem: statusDocs?.tem_nascimento, set: setDocNascimento },
                      { tipo: "obito", rotulo: "Certidão de óbito", tem: statusDocs?.tem_obito, set: setDocObito },
                      { tipo: "rga", rotulo: "RGA", tem: statusDocs?.tem_rga, set: setDocRga },
                      { tipo: "carteira", rotulo: "Carteira de vacinação", tem: statusDocs?.tem_carteira, set: setDocCarteira },
                    ].map((d) => (
                      <div key={d.tipo} className="flex items-center gap-3">
                        <span className="w-44 text-xs text-zinc-500">{d.rotulo}</span>
                        {d.tem ? (
                          <button onClick={() => abrirDocPet(d.tipo as any)} className="text-xs text-emerald-600 hover:underline">Ver PDF</button>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                        <input type="file" accept="application/pdf" onChange={(e) => d.set(e.target.files?.[0] ?? null)} className="ml-auto text-xs text-zinc-500 file:mr-2 file:rounded file:border-0 file:bg-zinc-100 file:px-2 file:py-1 file:text-xs dark:file:bg-zinc-800 dark:file:text-zinc-300" />
                      </div>
                    ))}
                  </div>
                  {msgDocs && (
                    <p className={`mt-2 rounded-lg px-3 py-2 text-xs ${msgDocs.includes("sucesso") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"}`}>
                      {msgDocs}
                    </p>
                  )}
                  <div className="mt-3">
                    <Botao carregando={salvandoDocs} onClick={salvarDocsPet}>Salvar documentos</Botao>
                  </div>
                </div>
              )}

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
                  <p className={`mt-3 rounded-lg px-3 py-2 text-center text-xs ${sucesso ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"}`}>
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