import type {
  Animal,
  Usuario,
  Solicitacao,
  EstatisticasDashboard,
  RespostaPaginada,
  StatusAnimal,
  EspecieAnimal,
  StatusSolicitacao,
  SexoAnimal,
  PerfilUsuario,
} from "@/tipos"

const URL_API = process.env.NEXT_PUBLIC_URL_API ?? "http://localhost:3005/api"

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

// ─────────────────────────────────────────────────────────────────────────────
// CAMADA DE ADAPTAÇÃO (backend → frontend)
//
// O backend devolve os dados num formato diferente do que o frontend espera:
//  - arrays "crus" (sem o envelope { dados, total, pagina, ... })
//  - campos como id_animal / id_usuario (em vez de id)
//  - status / especie / sexo / tipo em MAIÚSCULAS ou Capitalizados
//  - não envia o array de fotos, nem vacinado/castrado separados
//
// Estas funções traduzem o formato do backend para os tipos de @/tipos.
// Quando o backend for ajustado, esta camada pode ser removida.
// ─────────────────────────────────────────────────────────────────────────────

// normaliza texto: minúsculo e sem acento (para casar "Fêmea" → "femea")
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

function adaptarStatusAnimal(valor: string): StatusAnimal {
  switch (normalizar(valor)) {
    case "disponivel":
      return "disponivel"
    case "em_processo":
    case "em processo":
      return "em_processo"
    case "adotado":
      return "adotado"
    default:
      return "disponivel"
  }
}

function adaptarEspecie(valor: string): EspecieAnimal {
  switch (normalizar(valor)) {
    case "cachorro":
      return "cachorro"
    case "gato":
      return "gato"
    case "coelho":
      return "coelho"
    case "passaro":
      return "passaro"
    default:
      return "outro"
  }
}

function adaptarSexo(valor: string): SexoAnimal {
  return normalizar(valor).startsWith("f") ? "femea" : "macho"
}

function adaptarPerfil(valor: string): PerfilUsuario {
  return normalizar(valor) === "admin" ? "admin" : "adotante"
}

// converte um animal do backend (id_animal, cond_saude, status MAIÚSCULO, ...)
// para o tipo Animal do frontend
function adaptarAnimal(bruto: any): Animal {
  const saude = normalizar(bruto.cond_saude ?? "")
  return {
    id: String(bruto.id_animal ?? bruto.id),
    nome: bruto.nome ?? "",
    especie: adaptarEspecie(bruto.especie ?? ""),
    raca: bruto.raca ?? "",
    idade: Number(bruto.idade ?? 0),
    unidadeIdade: "anos", // backend não informa; assumimos anos
    sexo: adaptarSexo(bruto.sexo ?? ""),
    status: adaptarStatusAnimal(bruto.status ?? ""),
    descricao: bruto.descricao ?? "",
    fotos: Array.isArray(bruto.fotos) ? bruto.fotos : [], // backend ainda não envia fotos
    peso: bruto.peso != null ? Number(bruto.peso) : undefined,
    vacinado: saude.includes("vacinad"),
    castrado: saude.includes("castrad"),
    criadoEm: bruto.data_cadastro ?? bruto.criadoEm ?? new Date().toISOString(),
    atualizadoEm: bruto.atualizadoEm ?? bruto.data_cadastro ?? new Date().toISOString(),
  }
}

// converte um usuário do backend (id_usuario, tipo, data_cadastro)
function adaptarUsuario(bruto: any): Usuario {
  return {
    id: String(bruto.id_usuario ?? bruto.id),
    nome: bruto.nome ?? "",
    email: bruto.email ?? "",
    perfil: adaptarPerfil(bruto.tipo ?? bruto.perfil ?? ""),
    telefone: bruto.telefone ?? undefined,
    ativo: bruto.ativo ?? true, // backend não informa; assumimos ativo
    criadoEm: bruto.data_cadastro ?? bruto.criadoEm ?? new Date().toISOString(),
  }
}

// pega um array já adaptado e monta o envelope paginado no próprio frontend,
// já que o backend ignora os parâmetros de paginação e devolve tudo de uma vez
function paginarLocalmente<T>(
  itens: T[],
  pagina: number,
  porPagina: number
): RespostaPaginada<T> {
  const total = itens.length
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina))
  const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas)
  const inicio = (paginaSegura - 1) * porPagina
  const dados = itens.slice(inicio, inicio + porPagina)
  return { dados, total, pagina: paginaSegura, porPagina, totalPaginas }
}

// ── Animais ──────────────────────────────────────────────────────────────────

export interface FiltrosAnimal {
  pagina?: number
  porPagina?: number
  busca?: string
  status?: StatusAnimal | ""
  especie?: EspecieAnimal | ""
}

export const buscarAnimais = async (
  filtros: FiltrosAnimal = {}
): Promise<RespostaPaginada<Animal>> => {
  const { pagina = 1, porPagina = 12, busca = "", status = "", especie = "" } = filtros

  // backend devolve um array cru de todos os animais
  const bruto = await requisitar<any[]>("/animais")
  let animais = (Array.isArray(bruto) ? bruto : []).map(adaptarAnimal)

  // filtros aplicados no frontend (o backend não filtra)
  if (busca) {
    const termo = normalizar(busca)
    animais = animais.filter(
      (a) =>
        normalizar(a.nome).includes(termo) ||
        normalizar(a.raca).includes(termo)
    )
  }
  if (status) animais = animais.filter((a) => a.status === status)
  if (especie) animais = animais.filter((a) => a.especie === especie)

  return paginarLocalmente(animais, pagina, porPagina)
}

export const buscarAnimal = async (id: string): Promise<Animal> => {
  // o backend não tem rota GET por id; buscamos todos e achamos o certo
  const bruto = await requisitar<any[]>("/animais")
  const encontrado = (Array.isArray(bruto) ? bruto : []).find(
    (a) => String(a.id_animal ?? a.id) === String(id)
  )
  if (!encontrado) throw new Error("Animal não encontrado")
  return adaptarAnimal(encontrado)
}

export const criarAnimal = (dados: Omit<Animal, "id" | "criadoEm" | "atualizadoEm">) =>
  requisitar<Animal>("/animais", { method: "POST", body: JSON.stringify(dados) })

export const atualizarAnimal = (id: string, dados: Partial<Animal>) =>
  requisitar<Animal>(`/animais/${id}`, { method: "PUT", body: JSON.stringify(dados) })

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

export const buscarUsuarios = async (
  filtros: { pagina?: number; busca?: string } = {}
): Promise<RespostaPaginada<Usuario>> => {
  const { pagina = 1, busca = "" } = filtros
  const porPagina = 12

  const bruto = await requisitar<any[]>("/usuarios")
  let usuarios = (Array.isArray(bruto) ? bruto : []).map(adaptarUsuario)

  if (busca) {
    const termo = normalizar(busca)
    usuarios = usuarios.filter(
      (u) =>
        normalizar(u.nome).includes(termo) ||
        normalizar(u.email).includes(termo)
    )
  }

  return paginarLocalmente(usuarios, pagina, porPagina)
}

export const buscarUsuario = async (id: string): Promise<Usuario> => {
  const bruto = await requisitar<any[]>("/usuarios")
  const encontrado = (Array.isArray(bruto) ? bruto : []).find(
    (u) => String(u.id_usuario ?? u.id) === String(id)
  )
  if (!encontrado) throw new Error("Usuário não encontrado")
  return adaptarUsuario(encontrado)
}

export const atualizarUsuario = (id: string, dados: Partial<Usuario>) =>
  requisitar<Usuario>(`/usuarios/${id}`, { method: "PUT", body: JSON.stringify(dados) })

// ── Solicitações ──────────────────────────────────────────────────────────────
// (rotas ainda não ativas no backend — mantidas para quando forem habilitadas)

export const buscarSolicitacoes = async (
  filtros: { pagina?: number; status?: StatusSolicitacao | "" } = {}
): Promise<RespostaPaginada<Solicitacao>> => {
  const { pagina = 1 } = filtros
  // o backend ainda não expõe /solicitacoes; devolvemos vazio para não quebrar a tela
  return paginarLocalmente<Solicitacao>([], pagina, 12)
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

export const buscarEstatisticas = async (): Promise<EstatisticasDashboard> => {
  // o backend ainda não expõe /dashboard/estatisticas;
  // calculamos as estatísticas a partir das listas de animais e usuários
  const [animaisBruto, usuariosBruto] = await Promise.all([
    requisitar<any[]>("/animais"),
    requisitar<any[]>("/usuarios"),
  ])

  const animais = (Array.isArray(animaisBruto) ? animaisBruto : []).map(adaptarAnimal)
  const usuarios = (Array.isArray(usuariosBruto) ? usuariosBruto : []).map(adaptarUsuario)

  return {
    totalAnimais: animais.length,
    disponiveis: animais.filter((a) => a.status === "disponivel").length,
    emProcesso: animais.filter((a) => a.status === "em_processo").length,
    adotados: animais.filter((a) => a.status === "adotado").length,
    totalUsuarios: usuarios.length,
    solicitacoesPendentes: 0,
    adocoesEsteMes: 0,
  }
}

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