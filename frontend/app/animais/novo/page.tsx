"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload } from "lucide-react"
import { criarAnimal, enviarFotoAnimal, salvarVacinas, enviarDocumentosPet } from "@/lib/api"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Botao, Card, Campo, Seletor } from "@/components/animais/ui"
import { useIdioma } from "@/hooks/useIdioma"

const { t } = useIdioma()

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

const vacinasPorEspecie: Record<string, { campo: string; rotulo: string }[]> = {
  Cachorro: [
    { campo: "antirrabica", rotulo: "Antirrábica" },
    { campo: "v8", rotulo: "V8" },
    { campo: "v10", rotulo: "V10" },
    { campo: "giardia", rotulo: "Giárdia" },
    { campo: "leishmaniose", rotulo: "Leishmaniose" },
  ],
  Gato: [
    { campo: "antirrabica", rotulo: "Antirrábica" },
    { campo: "triplice_felina", rotulo: "Tríplice felina" },
    { campo: "quadrupla_felina", rotulo: "Quádrupla felina" },
    { campo: "giardia", rotulo: "Giárdia" },
  ],
}

export default function PaginaNovoAnimal() {
  const router = useRouter()

  const [nome, setNome] = useState("")
  const [especie, setEspecie] = useState("Cachorro")
  const [raca, setRaca] = useState("")
  const [dataNascimento, setDataNascimento] = useState("")
  const [sexo, setSexo] = useState("Macho")
  const [porte, setPorte] = useState("Médio")
  const [condSaude, setCondSaude] = useState("")
  const [descricao, setDescricao] = useState("")
  const [status, setStatus] = useState("DISPONIVEL")
  const [castrado, setCastrado] = useState(false)
  const [chipado, setChipado] = useState(false)
  const [vacinas, setVacinas] = useState<Record<string, string>>({})
  const [docNascimento, setDocNascimento] = useState<File | null>(null)
  const [docObito, setDocObito] = useState<File | null>(null)
  const [docRga, setDocRga] = useState<File | null>(null)
  const [docCarteira, setDocCarteira] = useState<File | null>(null)
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
        data_nascimento: dataNascimento || null,
        sexo,
        porte,
        cond_saude: condSaude,
        descricao,
        status,
        castrado,
        chipado,
      } as any)

      // 2. se escolheu foto, envia (o backend devolve o animal com id_animal)
      const idNovo = animal?.id_animal ?? animal?.id
      if (foto && idNovo) {
        await enviarFotoAnimal(String(idNovo), foto)
      }

      // envia documentos do pet, se houver algum
      if (docNascimento || docObito || docRga || docCarteira) {
        const docs: any = {}
        if (docNascimento) docs.certidao_nascimento = docNascimento
        if (docObito) docs.certidao_obito = docObito
        if (docRga) docs.rga = docRga
        if (docCarteira) docs.carteira_vacinacao = docCarteira
        await enviarDocumentosPet(String(idNovo), docs)
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
      <BarraSuperior titulo={t("tituloCadastrarAnimal")} />

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
            <Campo id="dataNascimento" rotulo="Data de nascimento" type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
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
            <div className="col-span-2 flex gap-6">
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input type="checkbox" checked={castrado} onChange={(e) => setCastrado(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                Castrado
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input type="checkbox" checked={chipado} onChange={(e) => setChipado(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
                Chipado
              </label>
            </div>

            {vacinasPorEspecie[especie] && (
              <div className="col-span-2">
                <label className="mb-2 block text-xs font-medium text-zinc-500">Carteira de vacinação</label>
                <div className="grid grid-cols-2 gap-3">
                  {vacinasPorEspecie[especie].map((v) => (
                    <div key={v.campo}>
                      <label className="mb-1 block text-xs text-zinc-400">{v.rotulo}</label>
                      <input
                        type="date"
                        value={vacinas[v.campo] ?? ""}
                        onChange={(e) => setVacinas({ ...vacinas, [v.campo]: e.target.value })}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="col-span-2">
              <label className="mb-2 block text-xs font-medium text-zinc-500">Documentos do pet (PDF, opcional)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Certidão de nascimento</label>
                  <input type="file" accept="application/pdf" onChange={(e) => setDocNascimento(e.target.files?.[0] ?? null)} className="block w-full text-xs text-zinc-500 file:mr-2 file:rounded file:border-0 file:bg-zinc-100 file:px-2 file:py-1 file:text-xs dark:file:bg-zinc-800 dark:file:text-zinc-300" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Certidão de óbito</label>
                  <input type="file" accept="application/pdf" onChange={(e) => setDocObito(e.target.files?.[0] ?? null)} className="block w-full text-xs text-zinc-500 file:mr-2 file:rounded file:border-0 file:bg-zinc-100 file:px-2 file:py-1 file:text-xs dark:file:bg-zinc-800 dark:file:text-zinc-300" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">RGA</label>
                  <input type="file" accept="application/pdf" onChange={(e) => setDocRga(e.target.files?.[0] ?? null)} className="block w-full text-xs text-zinc-500 file:mr-2 file:rounded file:border-0 file:bg-zinc-100 file:px-2 file:py-1 file:text-xs dark:file:bg-zinc-800 dark:file:text-zinc-300" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-400">Carteira de vacinação</label>
                  <input type="file" accept="application/pdf" onChange={(e) => setDocCarteira(e.target.files?.[0] ?? null)} className="block w-full text-xs text-zinc-500 file:mr-2 file:rounded file:border-0 file:bg-zinc-100 file:px-2 file:py-1 file:text-xs dark:file:bg-zinc-800 dark:file:text-zinc-300" />
                </div>
              </div>
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