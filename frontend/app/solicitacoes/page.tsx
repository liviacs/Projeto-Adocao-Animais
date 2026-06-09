"use client"

import { useUsuario } from "@/hooks/useUsuario"
import { useState } from "react"
import { Check, X, Plus, ArrowLeft } from "lucide-react"
import { useConsulta } from "@/hooks/useConsulta"
import { buscarSolicitacoes, aprovarSolicitacao, rejeitarSolicitacao, criarSolicitacao, buscarAnimais } from "@/lib/api"
import type { StatusSolicitacao, Animal, Solicitacao } from "@/tipos"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Botao, Card, Etiqueta, Vazio, Carregando, Seletor } from "@/components/animais/ui"
import { formatarDataHora } from "@/lib/utils"

const opcoesStatus = [
  { valor: "",          rotulo: "Todas" },
  { valor: "pendente",  rotulo: "Pendentes" },
  { valor: "aprovada",  rotulo: "Aprovadas" },
  { valor: "rejeitada", rotulo: "Rejeitadas" },
]

const motivosRejeicao = [
  { valor: "Falta de documentos", precisaDetalhe: true,  rotuloDetalhe: "Qual documento está faltando?" },
  { valor: "Pet falecido",        precisaDetalhe: false },
  { valor: "Desistência da adoção", precisaDetalhe: false },
  { valor: "Outro",               precisaDetalhe: true,  rotuloDetalhe: "Descreva o motivo" },
]

export default function PaginaSolicitacoes() {
  const { usuario, ehAdmin } = useUsuario()
  const [status, setStatus] = useState<StatusSolicitacao | "">("")
  const [pagina, setPagina] = useState(1)
  const [processando, setProcessando] = useState<string | null>(null)

  const [modalAberto, setModalAberto] = useState(false)
  const [petEscolhido, setPetEscolhido] = useState<Animal | null>(null)
  const [criando, setCriando] = useState(false)

  const [solicRejeitar, setSolicRejeitar] = useState<Solicitacao | null>(null)
  const [motivoSelecionado, setMotivoSelecionado] = useState("")
  const [detalheMotivo, setDetalheMotivo] = useState("")
  const [rejeitando, setRejeitando] = useState(false)

  const { dados, carregando, recarregar } = useConsulta(
    () => buscarSolicitacoes({ pagina, status, idUsuario: ehAdmin ? undefined : String(usuario?.id ?? "") }),
    [pagina, status, ehAdmin, usuario?.id]
  )

  const { dados: animaisDisp } = useConsulta(
    () => buscarAnimais({ status: "disponivel", porPagina: 100 }),
    [modalAberto]
  )

  const handleAprovar = async (id: string, idUsuario: string, idAnimal: string) => {
    setProcessando(id)
    try {
      await aprovarSolicitacao(id, idUsuario, idAnimal)
      recarregar()
    } catch (e) {
      alert("Erro ao aprovar solicitação")
    } finally {
      setProcessando(null)
    }
  }

  const fecharModal = () => {
    setModalAberto(false)
    setPetEscolhido(null)
  }

  const handleConfirmar = async () => {
    if (!petEscolhido) return
    setCriando(true)
    try {
      await criarSolicitacao(petEscolhido.id)
      fecharModal()
      recarregar()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao criar solicitação")
    } finally {
      setCriando(false)
    }
  }

  const fecharRejeicao = () => {
    setSolicRejeitar(null)
    setMotivoSelecionado("")
    setDetalheMotivo("")
  }

  const motivoAtual = motivosRejeicao.find((m) => m.valor === motivoSelecionado)

  const handleConfirmarRejeicao = async () => {
    if (!solicRejeitar || !motivoSelecionado) {
      alert("Escolha um motivo")
      return
    }
    if (motivoAtual?.precisaDetalhe && !detalheMotivo.trim()) {
      alert("Preencha o detalhe do motivo")
      return
    }
    let motivoFinal = motivoSelecionado
    if (motivoSelecionado === "Falta de documentos") motivoFinal = `Falta de documentos: ${detalheMotivo}`
    else if (motivoSelecionado === "Outro") motivoFinal = detalheMotivo

    setRejeitando(true)
    try {
      await rejeitarSolicitacao(solicRejeitar.id, solicRejeitar.usuario.id, solicRejeitar.animal.id, motivoFinal)
      fecharRejeicao()
      recarregar()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao rejeitar solicitação")
    } finally {
      setRejeitando(false)
    }
  }

  return (
    <Layout>
      <BarraSuperior titulo="Solicitações de adoção" />

      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <Seletor
            opcoes={opcoesStatus}
            value={status}
            onChange={(e) => { setStatus(e.target.value as StatusSolicitacao | ""); setPagina(1) }}
            className="w-44 py-1.5 text-xs"
          />
          <Botao icone={<Plus size={14} />} onClick={() => setModalAberto(true)}>
            Nova solicitação
          </Botao>
        </div>

        {carregando ? (
          <div className="flex justify-center py-20"><Carregando /></div>
        ) : dados?.dados.length === 0 ? (
          <Vazio titulo="Nenhuma solicitação encontrada" />
        ) : (
          <>
            <div className="space-y-3">
              {dados?.dados.map((solic) => (
                <Card key={solic.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      {solic.animal.fotos[0] && (
                        <img src={solic.animal.fotos[0]} alt={solic.animal.nome} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{solic.usuario.nome}</p>
                        <span className="text-xs text-zinc-400">quer adotar</span>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{solic.animal.nome}</p>
                        <Etiqueta variante={solic.status} />
                      </div>
                      <p className="text-xs text-zinc-400">{solic.usuario.email} · {solic.animal.raca}</p>
                      <p className="mt-1 text-[11px] text-zinc-400">{formatarDataHora(solic.criadaEm)}</p>
                    </div>
                    {ehAdmin && solic.status === "pendente" && (
                      <div className="flex gap-2">
                        <Botao variante="secundario" tamanho="pequeno" icone={<Check size={13} className="text-emerald-600" />} carregando={processando === solic.id} onClick={() => handleAprovar(solic.id, solic.usuario.id, solic.animal.id)}>Aprovar</Botao>
                        <Botao variante="perigo" tamanho="pequeno" icone={<X size={13} />} onClick={() => setSolicRejeitar(solic)}>Rejeitar</Botao>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {dados && dados.totalPaginas > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-zinc-400">{dados.total} solicitações · página {dados.pagina} de {dados.totalPaginas}</p>
                <div className="flex gap-2">
                  <Botao variante="secundario" tamanho="pequeno" disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>Anterior</Botao>
                  <Botao variante="secundario" tamanho="pequeno" disabled={pagina === dados.totalPaginas} onClick={() => setPagina((p) => p + 1)}>Próxima</Botao>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de nova solicitação */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={fecharModal}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {petEscolhido && (
                  <button onClick={() => setPetEscolhido(null)} className="text-zinc-400 hover:text-zinc-600">
                    <ArrowLeft size={16} />
                  </button>
                )}
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {petEscolhido ? "Confirmar adoção" : "Escolha um pet"}
                </h2>
              </div>
              <button onClick={fecharModal} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
            </div>

            {!petEscolhido && (
              <div className="space-y-2">
                {animaisDisp?.dados.length === 0 ? (
                  <p className="py-8 text-center text-xs text-zinc-400">Nenhum animal disponível no momento.</p>
                ) : (
                  animaisDisp?.dados.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setPetEscolhido(a)}
                      className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 p-2 text-left hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        {a.fotos[0] && <img src={a.fotos[0]} alt={a.nome} className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{a.nome}</p>
                        <p className="text-xs text-zinc-400">ID #{a.id} · {a.raca} · {a.idade} {a.unidadeIdade}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {petEscolhido && (
              <div>
                <div className="mb-4 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  {petEscolhido.fotos[0] && (
                    <img src={petEscolhido.fotos[0]} alt={petEscolhido.nome} className="h-48 w-full object-contain" />
                  )}
                </div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{petEscolhido.nome}</h3>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-500">
                  <p><span className="text-zinc-400">ID:</span> #{petEscolhido.id}</p>
                  <p><span className="text-zinc-400">Espécie:</span> {petEscolhido.especie}</p>
                  <p><span className="text-zinc-400">Raça:</span> {petEscolhido.raca}</p>
                  <p><span className="text-zinc-400">Idade:</span> {petEscolhido.idade} {petEscolhido.unidadeIdade}</p>
                  <p><span className="text-zinc-400">Sexo:</span> {petEscolhido.sexo}</p>
                  <p><span className="text-zinc-400">Status:</span> {petEscolhido.status}</p>
                </div>
                {petEscolhido.descricao && (
                  <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {petEscolhido.descricao}
                  </p>
                )}
                <div className="mt-5 flex justify-end gap-2">
                  <Botao variante="secundario" tamanho="pequeno" onClick={() => setPetEscolhido(null)}>Voltar</Botao>
                  <Botao tamanho="pequeno" carregando={criando} onClick={handleConfirmar}>Confirmar adoção</Botao>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de rejeição */}
      {solicRejeitar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={fecharRejeicao}>
          <div className="w-full max-w-md rounded-xl bg-white p-5 dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Rejeitar solicitação</h2>
              <button onClick={fecharRejeicao} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
            </div>

            <p className="mb-3 text-xs text-zinc-500">
              {solicRejeitar.usuario.nome} → {solicRejeitar.animal.nome}
            </p>

            <p className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">Motivo da rejeição:</p>
            <div className="space-y-1.5">
              {motivosRejeicao.map((m) => (
                <label key={m.valor} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                  <input
                    type="radio"
                    name="motivo"
                    value={m.valor}
                    checked={motivoSelecionado === m.valor}
                    onChange={(e) => { setMotivoSelecionado(e.target.value); setDetalheMotivo("") }}
                  />
                  {m.valor}
                </label>
              ))}
            </div>

            {motivoAtual?.precisaDetalhe && (
              <div className="mt-3">
                <label className="mb-1 block text-xs text-zinc-500">{motivoAtual.rotuloDetalhe}</label>
                <input
                  type="text"
                  value={detalheMotivo}
                  onChange={(e) => setDetalheMotivo(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="Digite aqui..."
                />
              </div>
            )}

            {motivoSelecionado === "Pet falecido" && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                Atenção: o pet será marcado como falecido e não ficará mais disponível para adoção.
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <Botao variante="secundario" tamanho="pequeno" onClick={fecharRejeicao}>Cancelar</Botao>
              <Botao variante="perigo" tamanho="pequeno" carregando={rejeitando} onClick={handleConfirmarRejeicao}>Confirmar rejeição</Botao>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}