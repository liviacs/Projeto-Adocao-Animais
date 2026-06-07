"use client"

import { PawPrint, Heart, Clock, Users } from "lucide-react"
import { useConsulta } from "@/hooks/useConsulta"
import { buscarEstatisticas, buscarAnimais, buscarSolicitacoes } from "@/lib/api"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { CardEstatistica, Card, Etiqueta, Carregando, Vazio } from "@/components/animais/ui"
import { formatarDataHora } from "@/lib/utils"

export default function PaginaDashboard() {
  const { dados: stats, carregando: carregandoStats } = useConsulta(buscarEstatisticas)

  const { dados: animais, carregando: carregandoAnimais } = useConsulta(() =>
    buscarAnimais()
  )

  const { dados: solicitacoes, carregando: carregandoSolic } = useConsulta(() =>
    buscarSolicitacoes({ status: "pendente", porPagina: 4 })
  )

  return (
    <Layout>
      <BarraSuperior titulo="Dashboard" />

      <div className="space-y-6 p-6">

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-4">
          {carregandoStats ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="flex h-24 items-center justify-center">
                <Carregando />
              </Card>
            ))
          ) : (
            <>
              <CardEstatistica rotulo="Disponíveis"  valor={stats?.disponiveis ?? 0}     icone={<PawPrint size={13} />} />
              <CardEstatistica rotulo="Adotados"     valor={stats?.adotados ?? 0}         icone={<Heart size={13} />} />
              <CardEstatistica rotulo="Em processo"  valor={stats?.emProcesso ?? 0}       icone={<Clock size={13} />} />
              <CardEstatistica rotulo="Adotantes"    valor={stats?.totalUsuarios ?? 0}    icone={<Users size={13} />} />
            </>
          )}
        </div>

        <div className="grid grid-cols-[1fr_340px] gap-6">

          {/* Animais recentes */}
          <Card>
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Animais recentes</p>
              <a href="/animais" className="text-xs text-zinc-400 hover:text-emerald-600">Ver todos →</a>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {carregandoAnimais ? (
                <div className="flex justify-center py-10"><Carregando /></div>
              ) : animais?.dados.length === 0 ? (
                <Vazio titulo="Nenhum animal cadastrado ainda" />
              ) : (
                animais?.dados.map((animal) => (
                  <div key={animal.id} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      {animal.fotos[0]
                        ? <img src={animal.fotos[0]} alt={animal.nome} className="h-full w-full object-cover" />
                        : <PawPrint size={16} className="text-zinc-400" />
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{animal.nome}</p>
                      <p className="text-xs text-zinc-400">
                        {animal.raca} · {animal.idade} {animal.unidadeIdade === "meses" ? "meses" : "anos"} · {animal.sexo === "macho" ? "Macho" : "Fêmea"}
                      </p>
                    </div>
                    <Etiqueta variante={animal.status} />
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Solicitações pendentes */}
          <Card>
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Pendentes</p>
              <a href="/solicitacoes" className="text-xs text-zinc-400 hover:text-emerald-600">Ver todas →</a>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {carregandoSolic ? (
                <div className="flex justify-center py-10"><Carregando /></div>
              ) : solicitacoes?.dados.length === 0 ? (
                <Vazio titulo="Nenhuma pendente" />
              ) : (
                solicitacoes?.dados.map((solic) => (
                  <div key={solic.id} className="px-4 py-3">
                    <p className="text-xs text-zinc-700 dark:text-zinc-300">
                      <span className="font-medium">{solic.usuario.nome}</span> quer adotar{" "}
                      <span className="font-medium">{solic.animal.nome}</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-400">
                      {formatarDataHora(solic.criadaEm)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>
      </div>
    </Layout>
  )
}
