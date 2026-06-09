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
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const resposta = await fetch(`${URL_API}${caminho}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    ...opcoes,
  })
  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}))
    throw new Error(erro.mensagem ?? erro.erro ?? "Algo deu errado")
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
    case "falecido":
      return "falecido"
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
    fotos: bruto.caminho_foto
  ? [`http://localhost:3005/img/${bruto.caminho_foto}`]
  : [],
    peso: bruto.peso != null ? Number(bruto.peso) : undefined,
    vacinado: saude.includes("vacinad"),
    castrado: bruto.castrado ?? saude.includes("castrad"),
    chipado: bruto.chipado ?? false,
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
    cpf: bruto.cpf ?? undefined,
    orientacaoSexual: bruto.orientacao_sexual ?? undefined,
    qtdAdocoes: bruto.qtd_adocoes ?? 0,
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
  ocultarFalecidos?: boolean
}

export const buscarAnimais = async (
  filtros: FiltrosAnimal = {}
): Promise<RespostaPaginada<Animal>> => {
  const { pagina = 1, porPagina = 12, busca = "", status = "", especie = "", ocultarFalecidos = false } = filtros

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
  if (ocultarFalecidos) animais = animais.filter((a) => a.status !== "falecido")

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

export const excluirUsuario = (id: string) =>
  requisitar<{ mensagem: string }>(`/usuarios/${id}`, { method: "DELETE" })

export const atualizarUsuarioAdmin = (
  id: string,
  dados: { nome?: string; email?: string; telefone?: string; tipo?: string }
) =>
  requisitar<any>(`/usuarios/${id}`, { method: "PUT", body: JSON.stringify(dados) })

// atualiza o perfil enviando os campos no formato do backend (nome/email/telefone/senha)
export const atualizarPerfil = (
  id: string,
  dados: { nome?: string; email?: string; telefone?: string; senha?: string; cpf?: string; orientacao_sexual?: string }
) =>
  requisitar<any>(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  })

// adapta status do backend (PENDENTE/APROVADA/REJEITADA/REPROVADA) → frontend
function adaptarStatusSolicitacao(valor: string): StatusSolicitacao {
  switch (normalizar(valor)) {
    case "aprovada": return "aprovada"
    case "rejeitada":
    case "reprovada": return "rejeitada"
    default: return "pendente"
  }
}

export const buscarSolicitacoes = async (
  filtros: { pagina?: number; status?: StatusSolicitacao | ""; idUsuario?: string } = {}
): Promise<RespostaPaginada<Solicitacao>> => {
  const { pagina = 1, status = "", idUsuario } = filtros
  const porPagina = 12

  // busca as 3 listas em paralelo
  const [solicBruto, animaisBruto, usuariosBruto] = await Promise.all([
    requisitar<any[]>("/solicitacoes"),
    requisitar<any[]>("/animais"),
    requisitar<any[]>("/usuarios"),
  ])

  // monta mapas por id para cruzamento rápido
  const animais = (Array.isArray(animaisBruto) ? animaisBruto : []).map(adaptarAnimal)
  const usuarios = (Array.isArray(usuariosBruto) ? usuariosBruto : []).map(adaptarUsuario)
  const mapaAnimais = new Map(animais.map((a) => [String(a.id), a]))
  const mapaUsuarios = new Map(usuarios.map((u) => [String(u.id), u]))

  let solicitacoes = (Array.isArray(solicBruto) ? solicBruto : []).map((s): Solicitacao => ({
    id: String(s.id_solicitacao),
    animal: mapaAnimais.get(String(s.id_animal)) ?? ({ nome: "—", raca: "", fotos: [] } as any),
    usuario: mapaUsuarios.get(String(s.id_usuario)) ?? ({ nome: "—", email: "" } as any),
    status: adaptarStatusSolicitacao(s.status ?? ""),
    mensagem: undefined,
    criadaEm: s.data_solicitacao ?? new Date().toISOString(),
    atualizadaEm: s.data_solicitacao ?? new Date().toISOString(),
  }))

  if (status) solicitacoes = solicitacoes.filter((s) => s.status === status)
  if (idUsuario) solicitacoes = solicitacoes.filter((s) => String(s.usuario.id) === String(idUsuario))

  return paginarLocalmente(solicitacoes, pagina, porPagina)
}

export const criarSolicitacao = (idAnimal: string) => {
  const usuarioStr = typeof window !== "undefined" ? localStorage.getItem("usuario") : null
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null
  const idUsuario = usuario?.id
  if (!idUsuario) throw new Error("Usuário não identificado. Faça login novamente.")
  return requisitar<Solicitacao>("/solicitacoes", {
    method: "POST",
    body: JSON.stringify({ id_usuario: Number(idUsuario), id_animal: Number(idAnimal) }),
  })
}

// backend usa PUT /solicitacoes/:id com { status }
export const aprovarSolicitacao = (id: string, idUsuario: string, idAnimal: string) =>
  requisitar<Solicitacao>(`/solicitacoes/${id}`, {
    method: "PUT",
    body: JSON.stringify({ id_usuario: Number(idUsuario), id_animal: Number(idAnimal), status: "APROVADA" }),
  })

export const rejeitarSolicitacao = (id: string, idUsuario: string, idAnimal: string, motivo: string) =>
  requisitar<Solicitacao>(`/solicitacoes/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      id_usuario: Number(idUsuario),
      id_animal: Number(idAnimal),
      status: "REPROVADA",
      motivo_rejeicao: motivo,
    }),
  })
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
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const resposta = await fetch(`${URL_API}/relatorios/${tipo}`, {
    headers: {
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
  })
  if (!resposta.ok) throw new Error("Falha ao gerar relatório")
  const blob = await resposta.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `relatorio-${tipo}-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export interface Notificacao {
  id: string
  tipo: "nova" | "aprovada" | "rejeitada"
  mensagem: string
  lida: boolean
  data: string
}

export const buscarNotificacoes = async (): Promise<{ itens: Notificacao[]; naoLidas: number }> => {
  const bruto = await requisitar<any[]>("/notificacoes")
  const itens: Notificacao[] = (Array.isArray(bruto) ? bruto : []).map((n) => ({
    id: String(n.id_notificacao),
    tipo: n.tipo,
    mensagem: n.mensagem,
    lida: n.lida,
    data: n.data_criacao,
  }))
  const naoLidas = itens.filter((n) => !n.lida).length
  return { itens, naoLidas }
}

export const marcarNotificacaoLida = (id: string) =>
  requisitar<any>(`/notificacoes/${id}/lida`, { method: "PUT" })


export interface DadosRelatorios {
  porStatus: { nome: string; valor: number }[]
  porEspecie: { nome: string; valor: number }[]
  porRaca: { nome: string; valor: number }[]
  porPorte: { nome: string; valor: number }[]
  visaoAbrigo: { nome: string; valor: number }[]
  taxaAprovacao: number
  taxaPorEspecie: { especie: string; taxa: number }[]
  especiesDisponiveis: string[]
}

export const buscarDadosRelatorios = async (filtroEspecie = ""): Promise<DadosRelatorios> => {
  const [animaisBruto, solicBruto] = await Promise.all([
    requisitar<any[]>("/animais"),
    requisitar<any[]>("/solicitacoes"),
  ])
  const animais = Array.isArray(animaisBruto) ? animaisBruto : []
  const solics = Array.isArray(solicBruto) ? solicBruto : []

  // mapa de id_animal -> espécie (pra cruzar com solicitações)
  const especiePorAnimal = new Map<string, string>()
  animais.forEach((a) => especiePorAnimal.set(String(a.id_animal), a.especie || "Não informado"))

  const contar = (lista: any[], campo: string) => {
    const mapa = new Map<string, number>()
    lista.forEach((item) => {
      const chave = item[campo] || "Não informado"
      mapa.set(chave, (mapa.get(chave) ?? 0) + 1)
    })
    return Array.from(mapa.entries()).map(([nome, valor]) => ({ nome, valor }))
  }

  // espécies disponíveis (pro filtro) — sempre todas
  const especiesDisponiveis = Array.from(new Set(animais.map((a) => a.especie).filter(Boolean)))

  // aplica o filtro de espécie nos animais (afeta porte e situação)
  const animaisFiltrados = filtroEspecie
    ? animais.filter((a) => a.especie === filtroEspecie)
    : animais

  // aplica o filtro nas solicitações (afeta status) — cruza pela espécie do animal
  const solicsFiltradas = filtroEspecie
    ? solics.filter((s) => especiePorAnimal.get(String(s.id_animal)) === filtroEspecie)
    : solics

  // status das solicitações (já filtradas)
  const statusMap = new Map<string, number>()
  solicsFiltradas.forEach((s) => {
    const st = s.status || "—"
    const rotulo = st === "APROVADA" ? "Adotadas" : st === "PENDENTE" ? "Pendentes" : "Rejeitadas"
    statusMap.set(rotulo, (statusMap.get(rotulo) ?? 0) + 1)
  })
  const porStatus = Array.from(statusMap.entries()).map(([nome, valor]) => ({ nome, valor }))

  // taxa de aprovação geral (das solicitações filtradas)
  const aprovadas = solicsFiltradas.filter((s) => s.status === "APROVADA").length
  const taxaAprovacao = solicsFiltradas.length > 0 ? Math.round((aprovadas / solicsFiltradas.length) * 100) : 0

  // taxa por espécie (sempre de TODAS, não depende do filtro)
  const taxaPorEspecie = especiesDisponiveis.map((esp) => {
    const doEsp = solics.filter((s) => especiePorAnimal.get(String(s.id_animal)) === esp)
    const apr = doEsp.filter((s) => s.status === "APROVADA").length
    return { especie: esp, taxa: doEsp.length > 0 ? Math.round((apr / doEsp.length) * 100) : 0 }
  })

  // situação dos animais (filtrados)
  const visaoMap = new Map<string, number>()
  animaisFiltrados.forEach((a) => {
    const st = a.status || "—"
    const rotulo = st === "DISPONIVEL" ? "Disponível" : st === "EM_PROCESSO" ? "Em processo" : st === "ADOTADO" ? "Adotado" : st === "FALECIDO" ? "Falecido" : st
    visaoMap.set(rotulo, (visaoMap.get(rotulo) ?? 0) + 1)
  })
  const visaoAbrigo = Array.from(visaoMap.entries()).map(([nome, valor]) => ({ nome, valor }))

  return {
    porStatus,
    porEspecie: contar(animais, "especie"),          // sempre tudo
    porRaca: contar(animaisFiltrados, "raca").sort((a, b) => b.valor - a.valor).slice(0, 8), // filtrado por espécie
    porPorte: contar(animaisFiltrados, "porte"),      // filtrado
    visaoAbrigo,                                       // filtrado
    taxaAprovacao,                                     // filtrado
    taxaPorEspecie,                                    // sempre tudo
    especiesDisponiveis,
  }
}