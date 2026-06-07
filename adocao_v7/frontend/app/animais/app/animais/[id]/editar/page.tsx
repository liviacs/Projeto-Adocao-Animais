"use client"

import { use } from "react"
import { useConsulta } from "@/hooks/useConsulta"
import { buscarAnimal } from "@/lib/api"
import { FormAnimal } from "@/components/animais/form"
import { Layout, BarraSuperior } from "@/components/animais/layout"
import { Carregando } from "@/components/animais/ui"

export default function PaginaEditarAnimal({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { dados: animal, carregando } = useConsulta(() => buscarAnimal(id), [id])

  if (carregando) {
    return (
      <Layout>
        <BarraSuperior titulo="Editar animal" />
        <div className="flex justify-center py-20">
          <Carregando />
        </div>
      </Layout>
    )
  }

  if (!animal) {
    return (
      <Layout>
        <BarraSuperior titulo="Editar animal" />
        <div className="py-20 text-center text-sm text-zinc-400">Animal não encontrado.</div>
      </Layout>
    )
  }

  return <FormAnimal animal={animal} />
}
