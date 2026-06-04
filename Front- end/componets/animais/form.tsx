"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload } from "lucide-react"
import { criarAnimal, atualizarAnimal, enviarFotoAnimal } from "@/lib/api"
import type { Animal } from "@/tipos"
import { Layout, BarraSuperior } from "@/components/layout"
import { Botao, Card, Campo, Seletor, AreaTexto } from "@/components/ui"

interface FormAnimalProps {
  animal?: Animal
}

export function FormAnimal({ animal }: FormAnimalProps) {
  const router = useRouter()
  const editando = !!animal

  const [form, setForm] = useState({
    nome:         animal?.nome ?? "",
    especie:      animal?.especie ?? "cachorro",
    raca:         animal?.raca ?? "",
    idade:        animal?.idade ?? 1,
    unidadeIdade: animal?.unidadeIdade ?? "anos",
    sexo:         animal?.sexo ?? "macho",
    descricao:    animal?.descricao ?? "",
    peso:         animal?.peso ?? "",
    vacinado:     animal?.vacinado ?? false,
    castrado:     animal?.castrado ?? false,
  })

  const [erros, setErros]           = useState<Partial<Record<keyof typeof form, string>>>({})
  const [salvando, setSalvando]     = useState(false)
  const [arquivoFoto, setArquivoFoto] = useState<File | null>(null)
  const [previewFoto, setPreviewFoto] = useState(animal?.fotos[0] ?? "")

  const atualizar = (campo: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const valor = e.target.type === "checkbox"
      ? (e.target as HTMLInputElement).checked
      : e.target.value
    setForm((prev) => ({ ...prev, [campo]: valor }))
    setErros((prev) => ({ ...prev, [campo]: undefined }))
  }

  const validar = () => {
    const novosErros: typeof erros = {}
    if (!form.nome.trim())      novosErros.nome = "Nome é obrigatório"
    if (!form.raca.trim())      novosErros.raca = "Raça é obrigatória"
    if (!form.descricao.trim()) novosErros.descricao = "Descrição é obrigatória"
    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const selecionarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setArquivoFoto(arquivo)
    setPreviewFoto(URL.createObjectURL(arquivo))
  }

  const salvar = async () => {
    if (!validar()) return
    setSalvando(true)
    try {
      const payload = {
        ...form,
        idade: Number(form.idade),
        peso: form.peso ? Number(form.peso) : undefined,
        fotos: animal?.fotos ?? [],
        status: animal?.status ?? "disponivel",
      } as Omit<Animal, "id" | "criadoEm" | "atualizadoEm">

      const salvo = editando
        ? await atualizarAnimal(animal.id, payload)
        : await criarAnimal(payload)

      if (arquivoFoto) await enviarFotoAnimal(salvo.id, arquivoFoto)

      router.push(`/animais/${salvo.id}`)
    } catch {
      alert("Não foi possível salvar. Tente novamente.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Layout>
      <BarraSuperior
        titulo={editando ? `Editar ${animal.nome}` : "Cadastrar animal"}
        acao={
          <Botao variante="secundario" icone={<ArrowLeft size={14} />} onClick={() => router.back()}>
            Voltar
          </Botao>
        }
      />

      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <Card className="space-y-4 p-5">

          {/* Upload de foto */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">Foto</p>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 py-6 transition hover:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-900">
              {previewFoto ? (
                <img src={previewFoto} alt="Preview" className="h-28 w-28 rounded-lg object-cover" />
              ) : (
                <>
                  <Upload size={20} className="text-zinc-400" />
                  <p className="text-xs text-zinc-400">Clique para enviar uma foto</p>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={selecionarFoto} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Campo id="nome" rotulo="Nome *" placeholder="Ex: Rex" value={form.nome} onChange={atualizar("nome")} erro={erros.nome} />
            <Seletor id="especie" rotulo="Espécie *" value={form.especie} onChange={atualizar("especie")} opcoes={[
              { valor: "cachorro", rotulo: "Cachorro" },
              { valor: "gato",     rotulo: "Gato" },
              { valor: "coelho",   rotulo: "Coelho" },
              { valor: "passaro",  rotulo: "Pássaro" },
              { valor: "outro",    rotulo: "Outro" },
            ]} />
          </div>

          <Campo id="raca" rotulo="Raça *" placeholder="Ex: Golden Retriever" value={form.raca} onChange={atualizar("raca")} erro={erros.raca} />

          <div className="grid grid-cols-3 gap-4">
            <Campo id="idade" rotulo="Idade *" type="number" min={1} value={form.idade} onChange={atualizar("idade")} />
            <Seletor id="unidadeIdade" rotulo="Unidade" value={form.unidadeIdade} onChange={atualizar("unidadeIdade")} opcoes={[
              { valor: "anos",  rotulo: "Anos" },
              { valor: "meses", rotulo: "Meses" },
            ]} />
            <Seletor id="sexo" rotulo="Sexo *" value={form.sexo} onChange={atualizar("sexo")} opcoes={[
              { valor: "macho",  rotulo: "Macho" },
              { valor: "femea",  rotulo: "Fêmea" },
            ]} />
          </div>

          <Campo id="peso" rotulo="Peso (kg)" type="number" step="0.1" placeholder="Ex: 8.5" value={form.peso} onChange={atualizar("peso")} />

          <AreaTexto
            id="descricao"
            rotulo="Descrição *"
            placeholder="Conte um pouco sobre a personalidade e história do animal..."
            value={form.descricao}
            onChange={atualizar("descricao")}
            erro={erros.descricao}
          />

          <div className="flex gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" checked={form.vacinado} onChange={atualizar("vacinado")} className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
              Vacinado
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" checked={form.castrado} onChange={atualizar("castrado")} className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />
              Castrado
            </label>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Botao variante="secundario" onClick={() => router.back()}>Cancelar</Botao>
          <Botao carregando={salvando} onClick={salvar}>
            {editando ? "Salvar alterações" : "Cadastrar animal"}
          </Botao>
        </div>
      </div>
    </Layout>
  )
}
