"use client"

import { useState, useEffect } from "react"

interface UsuarioLogado {
  id?: string | number
  nome?: string
  email?: string
  tipo?: string
}

export function useUsuario() {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    try {
      const u = localStorage.getItem("usuario")
      if (u) setUsuario(JSON.parse(u))
    } catch {}
    setCarregando(false)
  }, [])

  const ehAdmin = usuario?.tipo === "ADMIN"

  return { usuario, ehAdmin, carregando }
}