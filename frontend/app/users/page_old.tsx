"use client"

import { useState } from "react"
import { useConsulta } from "@/hooks/useConsulta"
import { useIdioma } from "@/hooks/useIdioma"
import { buscarUsuarios } from "@/lib/api"
import { Layout, BarraSuperior } from "@/components/layout"
import { Card, Etiqueta, Carregando, Vazio } from "@/components/ui"
import { formatarData, iniciais } from "@/lib/utils"

export default function PaginaUsuarios() {
  const [busca, setBusca]   = useState("")
  const [pagina, setPagina] = useState(1)

  const { dados, carregando } = useConsulta(
    () => buscarUsuarios({ pagina, busca }),
    [pagina, busca]
  )

  return (
    <Layout>
      <BarraSuperior
        titulo="Usuários"
        aoBuscar={(v) => { setBusca(v); setPagina(1) }}
      />

      <div className="space-y-4 p-6">
        <Card className="overflow-hidden">
          {carregando ? (
            <div className="flex justify-center py-20"><Carregando /></div>
          ) : dados?.dados.length === 0 ? (
            <Vazio titulo="Nenhum usuário encontrado" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-400">Nome</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-400">Email</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-400">Perfil</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-400">Cadastro</th>
                  <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-zinc-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {dados?.dados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {iniciais(usuario.nome)}
                        </div>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{usuario.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{usuario.email}</td>
                    <td className="px-4 py-3"><Etiqueta variante={usuario.perfil} /></td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{formatarData(usuario.criadoEm)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        usuario.ativo ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                      }`}>
                        {usuario.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {dados && dados.totalPaginas > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              {dados.total} usuários · página {dados.pagina} de {dados.totalPaginas}
            </p>
            <div className="flex gap-2">
              <button disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs disabled:opacity-40 hover:bg-zinc-50 dark:border-zinc-700">Anterior</button>
              <button disabled={pagina === dados.totalPaginas} onClick={() => setPagina((p) => p + 1)} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs disabled:opacity-40 hover:bg-zinc-50 dark:border-zinc-700">Próxima</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
