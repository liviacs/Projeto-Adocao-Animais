import type {
  Animal,
  Usuario,
  Solicitacao,
  EstatisticasDashboard,
  RespostaPaginada,
  StatusAnimal,
  EspecieAnimal,
  StatusSolicitacao,
} from "@/tipos"

const URL_API = process.env.NEXT_PUBLIC_URL_API ?? "http://localhost:3001/api"

async function requisitar<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  const resposta = await fetch(`${URL_API}${caminho}`, {
    headers: { "Content-Type": "application/json" },
    ...opcoes,
  })

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}))
    throw new Error(erro.mensagem ?? "Algo deu errado")
  }

  return resposta.json()
}

// ── Animais ──────────────────────────────────────────────────────────────────

export interface FiltrosAnimal {
  pagina?: number
  porPagina?: number
  busca?: string
  status?: StatusAnimal | ""
  especie?: EspecieAnimal | ""
}

export const buscarAnimais = (filtros: FiltrosAnimal = {}) => {
  const params = new URLSearchParams()
  if (filtros.pagina) params.set("pagina", String(filtros.pagina))
  if (filtros.porPagina) params.set("porPagina", String(filtros.porPagina))
  if (filtros.busca) params.set("busca", filtros.busca)
  if (filtros.status) params.set("status", filtros.status)
  if (filtros.especie) params.set("especie", filtros.especie)
  return requisitar<RespostaPaginada<Animal>>(`/animais?${params}`)
}

export const buscarAnimal = (id: string) =>
  requisitar<Animal>(`/animais/${id}`)

export const criarAnimal = (dados: Omit<Animal, "id" | "criadoEm" | "atualizadoEm">) =>
  requisitar<Animal>("/animais", { method: "POST", body: JSON.stringify(dados) })

export const atualizarAnimal = (id: string, dados: Partial<Animal>) =>
  requisitar<Animal>(`/animais/${id}`, { method: "PATCH", body: JSON.stringify(dados) })

export const deletarAnimal = (id: string) =>
  requisitar<void>(`/animais/${id}`, { method: "DELETE" })

// foto vai como multipart, não como json
export const enviarFotoAnimal = (id: string, arquivo: File) => {
  const form = new FormData()
  form.append("foto", arquivo)
  return fetch(`${URL_API}/animais/${id}/fotos`, { method: "POST", body: form }).then(
    (r) => r.json()
  )
}

// ── Usuários ─────────────────────────────────────────────────────────────────

export const buscarUsuarios = (filtros: { pagina?: number; busca?: string } = {}) => {
  const params = new URLSearchParams()
  if (filtros.pagina) params.set("pagina", String(filtros.pagina))
  if (filtros.busca) params.set("busca", filtros.busca)
  return requisitar<RespostaPaginada<Usuario>>(`/usuarios?${params}`)
}

export const buscarUsuario = (id: string) =>
  requisitar<Usuario>(`/usuarios/${id}`)

export const atualizarUsuario = (id: string, dados: Partial<Usuario>) =>
  requisitar<Usuario>(`/usuarios/${id}`, { method: "PATCH", body: JSON.stringify(dados) })

// ── Solicitações ──────────────────────────────────────────────────────────────

export const buscarSolicitacoes = (filtros: { pagina?: number; status?: StatusSolicitacao | "" } = {}) => {
  const params = new URLSearchParams()
  if (filtros.pagina) params.set("pagina", String(filtros.pagina))
  if (filtros.status) params.set("status", filtros.status)
  return requisitar<RespostaPaginada<Solicitacao>>(`/solicitacoes?${params}`)
}

export const criarSolicitacao = (idAnimal: string, mensagem?: string) =>
  requisitar<Solicitacao>("/solicitacoes", {
    method: "POST",
    body: JSON.stringify({ idAnimal, mensagem }),
  })

export const aprovarSolicitacao = (id: string) =>
  requisitar<Solicitacao>(`/solicitacoes/${id}/aprovar`, { method: "POST" })

export const rejeitarSolicitacao = (id: string) =>
  requisitar<Solicitacao>(`/solicitacoes/${id}/rejeitar`, { method: "POST" })

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const buscarEstatisticas = () =>
  requisitar<EstatisticasDashboard>("/dashboard/estatisticas")


export const baixarRelatorio = async (tipo: "mensal" | "especies" | "adocoes") => {
  const resposta = await fetch(`${URL_API}/relatorios/${tipo}`)
  if (!resposta.ok) throw new Error("Falha ao gerar relatório")
  const blob = await resposta.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `relatorio-${tipo}-${new Date().toISOString().slice(0, 10)}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
