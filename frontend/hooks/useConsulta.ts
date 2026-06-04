import { useState, useEffect, useCallback } from "react"

interface EstadoConsulta<T> {
  dados: T | null
  carregando: boolean
  erro: string | null
  recarregar: () => void
}

export function useConsulta<T>(fn: () => Promise<T>, deps: unknown[] = []): EstadoConsulta<T> {
  const [dados, setDados] = useState<T | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const buscar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const resultado = await fn()
      setDados(resultado)
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido")
    } finally {
      setCarregando(false)
    }
  }, deps)

  useEffect(() => { buscar() }, [buscar])

  return { dados, carregando, erro, recarregar: buscar }
}

interface EstadoMutacao<TDados, TVars> {
  executar: (vars: TVars) => Promise<TDados>
  carregando: boolean
  erro: string | null
}

export function useMutacao<TDados, TVars>(
  fn: (vars: TVars) => Promise<TDados>
): EstadoMutacao<TDados, TVars> {
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const executar = async (vars: TVars): Promise<TDados> => {
    setCarregando(true)
    setErro(null)
    try {
      return await fn(vars)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido"
      setErro(msg)
      throw e
    } finally {
      setCarregando(false)
    }
  }

  return { executar, carregando, erro }
}
