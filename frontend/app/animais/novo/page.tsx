"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload } from "lucide-react"
import { criarAnimal, enviarFotoAnimal } from "@/lib/api"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Botao, Card, Campo, Seletor } from "@/components/animais/ui"

const opcoesEspecie = [
  { valor: "Cachorro", rotulo: "Cachorro" },
  { valor: "Gato",     rotulo: "Gato" },
  { valor: "Coelho",   rotulo: "Coelho" },
  { valor: "Pássaro",  rotulo: "Pássaro" },
  { valor: "Outro",    rotulo: "Outro" },
]
const opcoesSexo = [
  { valor: "Macho", rotulo: "Macho" },
  { valor: "Fêmea", rotulo: "Fêmea" },
]
const opcoesPorte = [
  { valor: "Pequeno", rotulo: "Pequeno" },
  { valor: "Médio",   rotulo: "Médio" },
  { valor: "Grande",  rotulo: "Grande" },
]
const opcoesStatus = [
  { valor: "DISPONIVEL",  rotulo: "Disponível" },
  { valor: "EM_PROCESSO", rotulo: "Em processo" },
  { valor: "ADOTADO",     rotulo: "Adotado" },
]

export default function PaginaNovoAnimal() {
  const router = useRouter()

  const [nome, setNome] = useState("")
  const [especie, setEspecie] = useState("Cachorro")
  const [raca, setRaca] = useState("")
  const [idade, setIdade] = useState("")
  const [sexo, setSexo] = useState("Macho")
  const [porte, setPorte] = useState("Médio")
  const [condSaude, setCondSaude] = useState("")
  const [descricao, setDescricao] = useState("")
  const [status, setStatus] = useState("DISPONIVEL")

  const [foto, setFoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")

  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState("")

  const aoEscolherFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0]
    if (arquivo) {
      setFoto(arquivo)
      setPreview(URL.createObjectURL(arquivo))
    }
  }

  const cadastrar = async () => {
    setMsg("")
    if (!nome || !especie) {
      setMsg("Nome e espécie são obrigatórios.")
      return
    }
    setSalvando(true)
    try {
      // 1. cria o animal com os dados
      const animal: any = await criarAnimal({
        nome,
        especie,
        raca,
        idade: Number(idade) || 0,
        sexo,
        porte,
        cond_saude: condSaude,
        descricao,
        status,
      } as any)

      // 2. se escolheu foto, envia (o backend devolve o animal com id_animal)
      const idNovo = animal?.id_animal ?? animal?.id
      if (foto && idNovo) {
        await enviarFotoAnimal(String(idNovo), foto)
      }

      // 3. volta pra lista
      router.push("/animais")
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erro ao cadastrar animal")
      setSalvando(false)
    }
  }

  return (
    <Layout>
      <BarraSuperior titulo="Cadastrar animal" />

      <div className="mx-auto max-w-2xl p-6">
        <button
          onClick={() => router.push("/animais")}
          className="mb-4 flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700"
        >
          <ArrowLeft size={14} /> Voltar
        </button>

        <Card className="p-6">
          {/* Foto */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-medium text-zinc-500">Foto do animal</label>
            <div className="flex items-center gap-4">
              <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                {preview ? (
                  <img src={preview} alt="prévia" className="h-full w-full object-cover" />
                ) : (
                  <Upload size={22} className="text-zinc-300" />
                )}
              </div>
              <label className="cursor-pointer rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300">
                Escolher foto
                <input type="file" accept="image/*" onChange={aoEscolherFoto} className="hidden" />
              </label>
            </div>
          </div>

          {/* Dados */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Campo id="nome" rotulo="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Espécie</label>
              <Seletor opcoes={opcoesEspecie} value={especie} onChange={(e) => setEspecie(e.target.value)} className="w-full py-2 text-sm" />
            </div>
            <Campo id="raca" rotulo="Raça" value={raca} onChange={(e) => setRaca(e.target.value)} />
            <Campo id="idade" rotulo="Idade (anos)" type="number" value={idade} onChange={(e) => setIdade(e.target.value)} />
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Sexo</label>
              <Seletor opcoes={opcoesSexo} value={sexo} onChange={(e) => setSexo(e.target.value)} className="w-full py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Porte</label>
              <Seletor opcoes={opcoesPorte} value={porte} onChange={(e) => setPorte(e.target.value)} className="w-full py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">Status</label>
              <Seletor opcoes={opcoesStatus} value={status} onChange={(e) => setStatus(e.target.value)} className="w-full py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <Campo id="condSaude" rotulo="Condição de saúde" value={condSaude} onChange={(e) => setCondSaude(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-zinc-500">Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="Conte um pouco sobre o animal..."
              />
            </div>
          </div>

          {msg && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">{msg}</p>}

          <div className="mt-6 flex justify-end gap-2">
            <Botao variante="secundario" onClick={() => router.push("/animais")}>Cancelar</Botao>
            <Botao carregando={salvando} onClick={cadastrar}>Cadastrar animal</Botao>
          </div>
        </Card>
      </div>
    </Layout>
  )
}