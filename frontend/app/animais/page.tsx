"use client"

import { useUsuario } from "@/hooks/useUsuario"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, PawPrint, Pencil, X } from "lucide-react"
import { useConsulta } from "@/hooks/useConsulta"
import { useIdioma } from "@/hooks/useIdioma"
import { buscarAnimais, atualizarAnimal, enviarFotoAnimal } from "@/lib/api"
import type { StatusAnimal, EspecieAnimal, Animal } from "@/tipos"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Botao, Card, Etiqueta, Vazio, Carregando, Seletor, Campo } from "@/components/animais/ui"

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

// formata idade em anos e meses a partir da data de nascimento
function formatarIdade(dataNascimento?: string, idadeFallback?: number): string {
  if (!dataNascimento) {
    if (idadeFallback != null) return `${idadeFallback} ${idadeFallback === 1 ? "ano" : "anos"}`
    return "Idade desconhecida"
  }
  const nasc = new Date(dataNascimento)
  const hoje = new Date()
  let anos = hoje.getFullYear() - nasc.getFullYear()
  let meses = hoje.getMonth() - nasc.getMonth()
  if (hoje.getDate() < nasc.getDate()) meses--
  if (meses < 0) { anos--; meses += 12 }

  const pAnos = anos > 0 ? `${anos} ${anos === 1 ? "ano" : "anos"}` : ""
  const pMeses = meses > 0 ? `${meses} ${meses === 1 ? "mês" : "meses"}` : ""
  if (pAnos && pMeses) return `${pAnos} e ${pMeses}`
  if (pAnos) return pAnos
  if (pMeses) return pMeses
  return "Recém-nascido"
}

// opções no formato que o backend espera (para o modal de edição)
const opcoesEspecieEdit = [
  { valor: "Cachorro", rotulo: "Cachorro" },
  { valor: "Gato", rotulo: "Gato" },
  { valor: "Coelho", rotulo: "Coelho" },
  { valor: "Passaro", rotulo: "Pássaro" },
  { valor: "Outro", rotulo: "Outro" },
]
const opcoesSexoEdit = [
  { valor: "Macho", rotulo: "Macho" },
  { valor: "Fêmea", rotulo: "Fêmea" },
]
const opcoesPorteEdit = [
  { valor: "Pequeno", rotulo: "Pequeno" },
  { valor: "Médio", rotulo: "Médio" },
  { valor: "Grande", rotulo: "Grande" },
]
const opcoesStatusEdit = [
  { valor: "DISPONIVEL", rotulo: "Disponível" },
  { valor: "EM_PROCESSO", rotulo: "Em processo" },
  { valor: "ADOTADO", rotulo: "Adotado" },
  { valor: "FALECIDO", rotulo: "Falecido" },
]

// converte os valores adaptados (minúsculo) de volta pro formato do backend
const paraEspecieBackend: Record<string, string> = {
  cachorro: "Cachorro", gato: "Gato", coelho: "Coelho", passaro: "Passaro", outro: "Outro",
}
const paraSexoBackend: Record<string, string> = {
  macho: "Macho", femea: "Fêmea", "fêmea": "Fêmea",
}
const paraPorteBackend: Record<string, string> = {
  pequeno: "Pequeno", medio: "Médio", "médio": "Médio", grande: "Grande",
}
const paraStatusBackend: Record<string, string> = {
  disponivel: "DISPONIVEL", em_processo: "EM_PROCESSO", adotado: "ADOTADO", falecido: "FALECIDO",
}

export default function PaginaAnimais() {
  
  const router = useRouter()
  const { ehAdmin } = useUsuario()
  const opcoesStatusVisiveis = ehAdmin
    ? opcoesStatus
    : opcoesStatus.filter((o) => o.valor !== "falecido")
  const [busca, setBusca]     = useState("")
  const [status, setStatus]   = useState<StatusAnimal | "">("")
  const [especie, setEspecie] = useState<EspecieAnimal | "">("")
  const [pagina, setPagina]   = useState(1)

  // edição de animal (modal)
  const [editando, setEditando] = useState<Animal | null>(null)
  const [edNome, setEdNome] = useState("")
  const [edEspecie, setEdEspecie] = useState("Cachorro")
  const [edRaca, setEdRaca] = useState("")
  const [edDataNascimento, setEdDataNascimento] = useState("")
  const [edSexo, setEdSexo] = useState("Macho")
  const [edPorte, setEdPorte] = useState("Médio")
  const [edStatus, setEdStatus] = useState("DISPONIVEL")
  const [edCondSaude, setEdCondSaude] = useState("")
  const [edCastrado, setEdCastrado] = useState(false)
  const [edChipado, setEdChipado] = useState(false)
  const [edFoto, setEdFoto] = useState<File | null>(null)
  const [salvandoEd, setSalvandoEd] = useState(false)
  const [msgEd, setMsgEd] = useState("")

  const { dados, carregando, recarregar } = useConsulta(
    () => buscarAnimais({ pagina, porPagina: 12, busca, status, especie, ocultarFalecidos: !ehAdmin }),
    [pagina, busca, status, especie, ehAdmin]
  )

  const limparFiltros = () => {
    setStatus("")
    setEspecie("")
    setBusca("")
    setPagina(1)
  }

  const abrirEdicao = (animalOrig: Animal) => {
    const animal: any = animalOrig
    setEditando(animalOrig)
    setEdNome(animal.nome ?? "")
    setEdEspecie(paraEspecieBackend[animal.especie] ?? "Cachorro")
    setEdRaca(animal.raca ?? "")
    setEdDataNascimento((animal as any).dataNascimento ? String((animal as any).dataNascimento).slice(0, 10) : "")
    setEdSexo(paraSexoBackend[(animal.sexo ?? "").toLowerCase()] ?? "Macho")
    setEdPorte(paraPorteBackend[((animal as any).porte ?? "").toLowerCase()] ?? "Médio")
    setEdStatus(paraStatusBackend[animal.status] ?? "DISPONIVEL")
    setEdCondSaude((animal as any).condSaude ?? (animal as any).cond_saude ?? "")
    setEdCastrado(!!animal.castrado)
    setEdChipado(!!animal.chipado)
    setEdFoto(null)
    setMsgEd("")
  }

  const salvarEdicao = async () => {
    if (!editando) return
    setMsgEd("")
    setSalvandoEd(true)
    try {
      await atualizarAnimal(editando.id, {
        nome: edNome,
        especie: edEspecie,
        raca: edRaca,
        data_nascimento: edDataNascimento || null,
        sexo: edSexo,
        porte: edPorte,
        status: edStatus,
        cond_saude: edCondSaude,
        castrado: edCastrado,
        chipado: edChipado,
      } as any)
      if (edFoto) {
        await enviarFotoAnimal(editando.id, edFoto)
      }
      setEditando(null)
      recarregar()
    } catch (e) {
      setMsgEd(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setSalvandoEd(false)
    }
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
            opcoes={opcoesStatusVisiveis}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                      {animal.raca} · {formatarIdade(animal.dataNascimento, animal.idade)}
                    </p>
                    <div className="flex items-center justify-between">
                      <Etiqueta variante={animal.status} />
                      {ehAdmin && (
                        <button
                          onClick={(e) => { e.stopPropagation(); abrirEdicao(animal) }}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-emerald-600 dark:hover:bg-zinc-800"
                        >
                          <Pencil size={12} /> Editar
                        </button>
                      )}
                    </div>
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
      
 {/* Modal de edição do animal */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !salvandoEd && setEditando(null)}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5 dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Editar {editando.nome}</h2>
              <button onClick={() => setEditando(null)} className="text-zinc-400 hover:text-zinc-600"><X size={16} /></button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="col-span-2">
                <Campo id="edNome" rotulo="Nome" value={edNome} onChange={(e) => setEdNome(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Espécie</label>
                <Seletor opcoes={opcoesEspecieEdit} value={edEspecie} onChange={(e) => setEdEspecie(e.target.value)} className="w-full py-2 text-sm" />
              </div>
              <Campo id="edRaca" rotulo="Raça" value={edRaca} onChange={(e) => setEdRaca(e.target.value)} />
              <Campo id="edDataNascimento" rotulo="Data de nascimento" type="date" value={edDataNascimento} onChange={(e) => setEdDataNascimento(e.target.value)} />
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Sexo</label>
                <Seletor opcoes={opcoesSexoEdit} value={edSexo} onChange={(e) => setEdSexo(e.target.value)} className="w-full py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Porte</label>
                <Seletor opcoes={opcoesPorteEdit} value={edPorte} onChange={(e) => setEdPorte(e.target.value)} className="w-full py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Status</label>
                <Seletor opcoes={opcoesStatusEdit} value={edStatus} onChange={(e) => setEdStatus(e.target.value)} className="w-full py-2 text-sm" />
              </div>
              <div className="col-span-2">
                <Campo id="edCondSaude" rotulo="Condição de saúde" value={edCondSaude} onChange={(e) => setEdCondSaude(e.target.value)} />
              </div>
              <div className="col-span-2 flex gap-6">
                <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input type="checkbox" checked={edCastrado} onChange={(e) => setEdCastrado(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                  Castrado
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input type="checkbox" checked={edChipado} onChange={(e) => setEdChipado(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                  Chipado
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm text-zinc-700 dark:text-zinc-300">Trocar foto</label>
              <input type="file" accept="image/*" onChange={(e) => setEdFoto(e.target.files?.[0] ?? null)} className="block w-full text-xs text-zinc-500 file:mr-2 file:rounded file:border-0 file:bg-zinc-100 file:px-2 file:py-1 file:text-xs dark:file:bg-zinc-800 dark:file:text-zinc-300" />
            </div>
            {msgEd && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">{msgEd}</p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <Botao variante="secundario" tamanho="pequeno" onClick={() => setEditando(null)}>Cancelar</Botao>
              <Botao tamanho="pequeno" carregando={salvandoEd} onClick={salvarEdicao}>Salvar alterações</Botao>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
