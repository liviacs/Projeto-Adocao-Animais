// tipos principais do sistema
// se precisar adicionar campo novo, adiciona aqui e no banco também

export type StatusAnimal = "disponivel" | "em_processo" | "adotado" | "falecido"
export type EspecieAnimal = "cachorro" | "gato" | "coelho" | "passaro" | "outro"
export type SexoAnimal = "macho" | "femea"
export type PerfilUsuario = "admin" | "adotante"
export type StatusSolicitacao = "pendente" | "aprovada" | "rejeitada"

export interface Animal {
  id: string
  nome: string
  especie: EspecieAnimal
  raca: string
  idade: number
  unidadeIdade: "meses" | "anos"
  sexo: SexoAnimal
  status: StatusAnimal
  descricao: string
  fotos: string[]
  peso?: number
  porte?: string
  dataNascimento?: string
  condSaude?: string
  vacinado: boolean
  castrado: boolean
  chipado: boolean
  criadoEm: string
  atualizadoEm: string
}

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: PerfilUsuario
  telefone?: string
  ativo: boolean
  cpf?: string
  orientacaoSexual?: string
  qtdAdocoes?: number
  criadoEm: string
}

export interface Solicitacao {
  id: string
  animal: Animal
  usuario: Usuario
  status: StatusSolicitacao
  mensagem?: string
  motivoRejeicao?: string
  criadaEm: string
  atualizadaEm: string
}

export interface EstatisticasDashboard {
  totalAnimais: number
  disponiveis: number
  emProcesso: number
  adotados: number
  totalUsuarios: number
  solicitacoesPendentes: number
  adocoesEsteMes: number
}

export interface RespostaPaginada<T> {
  dados: T[]
  total: number
  pagina: number
  porPagina: number
  totalPaginas: number
}
