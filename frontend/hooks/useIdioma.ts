"use client"

import { useState, useEffect } from "react"

type Idioma = "pt-BR" | "en" | "es"

const dicionario: Record<Idioma, Record<string, string>> = {
  "pt-BR": {
    // menu
    dashboard: "Dashboard",
    animais: "Animais",
    solicitacoes: "Solicitações",
    usuarios: "Usuários",
    relatorios: "Relatórios",
    notificacoes: "Notificações",
    logs: "Logs do sistema",
    configuracoes: "Configurações",
    // seções
    secaoPrincipal: "Principal",
    secaoGestao: "Gestão",
    secaoSistema: "Sistema",
    // títulos das telas
    tituloDashboard: "Dashboard",
    tituloAnimais: "Animais",
    tituloSolicitacoes: "Solicitações",
    tituloUsuarios: "Usuários",
    tituloRelatorios: "Relatórios",
    tituloNotificacoes: "Notificações",
    tituloLogs: "Logs do sistema",
    tituloConfiguracoes: "Configurações",
    tituloPerfil: "Meu perfil",
    tituloDetalhesPet: "Detalhes do pet",
    tituloCadastrarAnimal: "Cadastrar animal",
    tituloSolicitacoesAdocao: "Solicitações de adoção",
  },
  "en": {
    dashboard: "Dashboard",
    animais: "Animals",
    solicitacoes: "Requests",
    usuarios: "Users",
    relatorios: "Reports",
    notificacoes: "Notifications",
    logs: "System logs",
    configuracoes: "Settings",
    secaoPrincipal: "Main",
    secaoGestao: "Management",
    secaoSistema: "System",
    tituloDashboard: "Dashboard",
    tituloAnimais: "Animals",
    tituloSolicitacoes: "Requests",
    tituloUsuarios: "Users",
    tituloRelatorios: "Reports",
    tituloNotificacoes: "Notifications",
    tituloLogs: "System logs",
    tituloConfiguracoes: "Settings",
    tituloPerfil: "My profile",
    tituloDetalhesPet: "Pet details",
    tituloCadastrarAnimal: "Add animal",
    tituloSolicitacoesAdocao: "Adoption requests",
  },
  "es": {
    dashboard: "Panel",
    animais: "Animales",
    solicitacoes: "Solicitudes",
    usuarios: "Usuarios",
    relatorios: "Informes",
    notificacoes: "Notificaciones",
    logs: "Registros del sistema",
    configuracoes: "Configuración",
    secaoPrincipal: "Principal",
    secaoGestao: "Gestión",
    secaoSistema: "Sistema",
    tituloDashboard: "Panel",
    tituloAnimais: "Animales",
    tituloSolicitacoes: "Solicitudes",
    tituloUsuarios: "Usuarios",
    tituloRelatorios: "Informes",
    tituloNotificacoes: "Notificaciones",
    tituloLogs: "Registros del sistema",
    tituloConfiguracoes: "Configuración",
    tituloPerfil: "Mi perfil",
    tituloDetalhesPet: "Detalles de la mascota",
    tituloCadastrarAnimal: "Registrar animal",
    tituloSolicitacoesAdocao: "Solicitudes de adopción",
  },
}

export function useIdioma() {
  const [idioma, setIdioma] = useState<Idioma>("pt-BR")

  useEffect(() => {
    const ler = () => {
      try {
        const cfg = JSON.parse(localStorage.getItem("petadopt_config") || "{}")
        if (cfg.idioma) setIdioma(cfg.idioma)
      } catch {}
    }
    ler()
    // atualiza quando a config muda (mesmo em outra aba ou na própria tela)
    window.addEventListener("storage", ler)
    window.addEventListener("petadopt-config-mudou", ler)
    return () => {
      window.removeEventListener("storage", ler)
      window.removeEventListener("petadopt-config-mudou", ler)
    }
  }, [])

  const t = (chave: string) => dicionario[idioma]?.[chave] ?? dicionario["pt-BR"][chave] ?? chave

  return { idioma, t }
}