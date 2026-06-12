"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Protege páginas que só admin pode acessar.
// Se o usuário não for ADMIN, redireciona para /animais.
export function useApenasAdmin() {
  const router = useRouter()
  const [liberado, setLiberado] = useState(false)

  useEffect(() => {
    try {
      const u = localStorage.getItem("usuario")
      const usuario = u ? JSON.parse(u) : null
      if (usuario?.tipo === "ADMIN") {
        setLiberado(true)
      } else {
        router.replace("/animais")
      }
    } catch {
      router.replace("/animais")
    }
  }, [router])

  return liberado
}