licitacoes, aprovarSolicitacao, rejeitarSolicitacao } from "@/lib/api"
import type { StatusSolicitacao } from "@/tipos"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Botao, Card, Etiqueta, Vazio, Carregando, Seletor } from "@/components/animais/ui"
import { formatarDataHora } from "@/lib/utils"

const opcoesStatus = [
  { valor: "",         rotulo: "Todas" },
  { valor: "pendente", rotulo: "Pendentes" },
  { valor: "aprovada", rotulo: "Aprovadas" },
  { valor: "rejeitada",rotulo: "Rejeitadas" },
]

export default function PaginaSolicitacoes() {
  const [status, setStatus] = useState<StatusSolicitacao | "">("")
  const [pagina, setPagina] = useState(1)

  const { dados, carregando, recarregar } = useConsulta(
    () => buscarSolicitacoes({ pagina, status }),
    [pagina, status]
  )

  const { executar: aprovar, carregando: aprovando } = useMutacao(aprovarSolicitacao)
  const { executar: rejeitar, carregando: rejeitando } = useMutacao(rejeitarSolicitacao)

  const handleAprovar = async (id: string) => {
    await aprovar(id)
    recarregar()
  }

  const handleRejeitar = async (id: string) => {
    await rejeitar(id)
    recarregar()
  }

  return (
    <Layout>
      <BarraSuperior titulo="Solicitações de adoção" />

      <div className="space-y-4 p-6">
        <div className="flex gap-3">
          <Seletor
            opcoes={opcoesStatus}
            value={status}
            onChange={(e) => { setStatus(e.target.value as StatusSolicitacao | ""); setPagina(1) }}
            className="w-44 py-1.5 text-xs"
          />
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

                    {/* Foto do animal */}
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      {solic.animal.fotos[0] && (
                        <img src={solic.animal.fotos[0]} alt={solic.animal.nome} className="h-full w-full object-cover" />
                      )}
                    </div>

                    {/* Informações */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{solic.usuario.nome}</p>
                        <span className="text-xs text-zinc-400">quer adotar</span>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{solic.animal.nome}</p>
                        <Etiqueta variante={solic.status} />
                      </div>
                      <p className="text-xs text-zinc-400">{solic.usuario.email} · {solic.animal.raca}</p>

                      {solic.mensagem && (
                        <p className="mt-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          "{solic.mensagem}"
                        </p>
                      )}

                      <p className="mt-1 text-[11px] text-zinc-400">
                        {formatarDataHora(solic.criadaEm)}
                      </p>
                    </div>

                    {/* Ações — só aparece se ainda estiver pendente */}
                    {solic.status === "pendente" && (
                      <div className="flex gap-2">
                        <Botao
                          variante="secundario"
                          tamanho="pequeno"
                          icone={<Check size={13} className="text-emerald-600" />}
                          carregando={aprovando}
                          onClick={() => handleAprovar(solic.id)}
                        >
                          Aprovar
                        </Botao>
                        <Botao
                          variante="perigo"
                          tamanho="pequeno"
                          icone={<X size={13} />}
                          carregando={rejeitando}
                          onClick={() => handleRejeitar(solic.id)}
                        >
                          Rejeitar
                        </Botao>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {dados && dados.totalPaginas > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-zinc-400">
                  {dados.total} solicitações · página {dados.pagina} de {dados.totalPaginas}
                </p>
                <div className="flex gap-2">
                  <Botao variante="secundario" tamanho="pequeno" disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>Anterior</Botao>
                  <Botao variante="secundario" tamanho="pequeno" disabled={pagina === dados.totalPaginas} onClick={() => setPagina((p) => p + 1)}>Próxima</Botao>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
