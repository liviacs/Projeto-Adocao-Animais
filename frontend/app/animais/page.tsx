"use client"

import { useUsuario } from "@/hooks/useUsuario"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, PawPrint } from "lucide-react"
import { useConsulta } from "@/hooks/useConsulta"
import { buscarAnimais } from "@/lib/api"
import type { StatusAnimal, EspecieAnimal } from "@/tipos"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Botao, Card, Etiqueta, Vazio, Carregando, Seletor } from "@/components/animais/ui"

const opcoesStatus = [
  { valor: "",            rotulo: "Todos os status" },
  { valor: "disponivel",  rotulo: "Disponível" },
  { valor: "em_processo", rotulo: "Em processamento" },
  { valor: "adotado",     rotulo: "Adotado" },
  { valor: "falecido",    rotulo: "Falecido" },
]

const opcoesEspecie = [
  { valor: "",         rotulo: "Todas as espécies" },
  { valor: "cachorro", rotulo: "Cachorro" },
  { valor: "gato",     rotulo: "Gato" },
  { valor: "coelho",   rotulo: "Coelho" },
  { valor: "passaro",  rotulo: "Pássaro" },
  { valor: "outro",    rotulo: "Outro" },
]

export default function PaginaAnimais() {
  const router = useRouter()
  const { ehAdmin } = useUsuario()
  const [busca, setBusca]     = useState("")
  const [status, setStatus]   = useState<StatusAnimal | "">("")
  const [especie, setEspecie] = useState<EspecieAnimal | "">("")
  const [pagina, setPagina]   = useState(1)

  const { dados, carregando } = useConsulta(
    () => buscarAnimais({ pagina, porPagina: 12, busca, status, especie }),
    [pagina, busca, status, especie]
  )

  const limparFiltros = () => {
    setStatus("")
    setEspecie("")
    setBusca("")
    setPagina(1)
  }

  return (
    <Layout>
      <BarraSuperior
        titulo="Animais"
        aoBuscar={(v) => { setBusca(v); setPagina(1) }}
        acao={
          ehAdmin ? (
            <Botao icone={<Plus size={14} />} onClick={() => router.push("/animais/novo")}>
              Cadastrar animal
            </Botao>
          ) : undefined
        }
      />

      <div className="space-y-4 p-6">

        {/* Filtros */}
        <div className="flex items-center gap-3">
          <Seletor
            opcoes={opcoesStatus}
            value={status}
            onChange={(e) => { setStatus(e.target.value as StatusAnimal | ""); setPagina(1) }}
            className="w-44 py-1.5 text-xs"
          />
          <Seletor
            opcoes={opcoesEspecie}
            value={especie}
            onChange={(e) => { setEspecie(e.target.value as EspecieAnimal | ""); setPagina(1) }}
            className="w-44 py-1.5 text-xs"
          />
          {(status || especie || busca) && (
            <button onClick={limparFiltros} className="text-xs text-zinc-400 hover:text-zinc-700">
              Limpar filtros
            </button>
          )}
        </div>

        {/* Grid */}
        {carregando ? (
          <div className="flex justify-center py-20"><Carregando /></div>
        ) : dados?.dados.length === 0 ? (
          <Vazio
            titulo="Nenhum animal encontrado"
            descricao="Tente mudar os filtros ou cadastre um novo animal."
            acao={
              ehAdmin ? (
                <Botao icone={<Plus size={14} />} onClick={() => router.push("/animais/novo")}>
                  Cadastrar animal
                </Botao>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 xl:grid-cols-4">
              {dados?.dados.map((animal) => (
                <Card
                  key={animal.id}
                  onClick={() => router.push(`/animais/${animal.id}`)}
                  className={animal.status === "falecido" ? "opacity-60 grayscale" : ""}
                >
                  <div className="flex h-28 items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                    {animal.fotos[0]
                      ? <img src={animal.fotos[0]} alt={animal.nome} className="h-full w-full object-cover" />
                      : <PawPrint size={28} className="text-zinc-300" />
                    }
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{animal.nome}</p>
                    <p className="mb-2 text-xs text-zinc-400">
                      {animal.raca} · {animal.idade} {animal.unidadeIdade === "meses" ? "meses" : "anos"}
                    </p>
                    <Etiqueta variante={animal.status} />
                  </div>
                </Card>
              ))}
            </div>

            {dados && dados.totalPaginas > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-zinc-400">
                  {dados.total} animais · página {dados.pagina} de {dados.totalPaginas}
                </p>
                <div className="flex gap-2">
                  <Botao variante="secundario" tamanho="pequeno" disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>
                    Anterior
                  </Botao>
                  <Botao variante="secundario" tamanho="pequeno" disabled={pagina === dados.totalPaginas} onClick={() => setPagina((p) => p + 1)}>
                    Próxima
                  </Botao>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
