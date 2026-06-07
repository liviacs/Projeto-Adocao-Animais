"use client"

import { useState } from "react"

function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

function PawPrint({ size = 20 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="20" cy="16" r="2" />
      <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
    </svg>
  )
}

function Loader2({ size = 14 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function Campo({ rotulo, erro, id, className, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {rotulo && (
        <label
          htmlFor={id}
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "#3f3f46",
          }}
        >
          {rotulo}
        </label>
      )}
      <input
        id={id}
        style={{
          borderRadius: 8,
          border: erro ? "1px solid #7f1d1d" : "1px solid #262626",
          background: "#141414",
          padding: "8px 12px",
          fontSize: 14,
          color: "#fff",
          outline: "none",
          transition: "border 0.15s, box-shadow 0.15s",
        }}
        onFocus={(e) => {
          e.target.style.border = "1px solid #525252"
          e.target.style.boxShadow = "0 0 0 3px #1a1a1a"
        }}
        onBlur={(e) => {
          e.target.style.border = erro ? "1px solid #7f1d1d" : "1px solid #262626"
          e.target.style.boxShadow = "none"
        }}
        {...props}
      />
      {erro && <p style={{ fontSize: 12, color: "#ef4444" }}>{erro}</p>}
    </div>
  )
}

function Botao({ carregando, children, disabled, style, ...props }) {
  return (
    <button
      disabled={disabled || carregando}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 8,
        padding: "8px 16px",
        fontSize: 14,
        fontWeight: 500,
        background: disabled || carregando ? "#262626" : "#fff",
        color: disabled || carregando ? "#525252" : "#000",
        border: "none",
        cursor: disabled || carregando ? "not-allowed" : "pointer",
        transition: "background 0.15s",
        width: "100%",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !carregando) e.currentTarget.style.background = "#e5e5e5"
      }}
      onMouseLeave={(e) => {
        if (!disabled && !carregando) e.currentTarget.style.background = "#fff"
      }}
      {...props}
    >
      {carregando && <Loader2 size={14} />}
      {children}
    </button>
  )
}


export default function PaginaLogin() {
  const [email, setEmail]       = useState("")
  const [senha, setSenha]       = useState("")
  const [erro, setErro]         = useState("")
  const [entrando, setEntrando] = useState(false)

  const entrar = async (e) => {
    e.preventDefault()
    setErro("")
    setEntrando(true)

  
    await new Promise((r) => setTimeout(r, 1500))
    setEntrando(false)

    if (!email.includes("@")) {
      setErro("Email ou senha inválidos.")
    } else {
      alert("Login efetuado! Redirecionando para /dashboard")
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-login {
          animation: fadeUp 0.4s ease both;
        }
      `}</style>

      {/* Fundo */}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          padding: "16px",
        }}
      >
        {/* Card */}
        <div
          className="card-login"
          style={{
            width: "100%",
            maxWidth: 360,
            background: "#0a0a0a",
            borderRadius: 16,
            border: "1px solid #1f1f1f",
            padding: "32px 28px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
            position: "relative",
          }}
        >
          {/* Logo + Título */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              marginBottom: 28,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#000",
              }}
            >
              <PawPrint size={22} />
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>
              PetAdopt
            </h1>
            <p style={{ fontSize: 13, color: "#525252" }}>
              Acesse sua conta
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={entrar} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Campo
              id="email"
              rotulo="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Campo
              id="senha"
              rotulo="Senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />

            {/* Erro */}
            {erro && (
              <p
                style={{
                  borderRadius: 8,
                  background: "#1a0a0a",
                  padding: "8px 12px",
                  fontSize: 12,
                  color: "#f87171",
                  border: "1px solid #3f1111",
                }}
              >
                {erro}
              </p>
            )}

            <Botao carregando={entrando} type="submit" style={{ marginTop: 4 }}>
              {entrando ? "Entrando…" : "Entrar"}
            </Botao>
          </form>

          {/* Link esqueci senha */}
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <a
              href="/auth/esqueci-senha"
              style={{
                fontSize: 12,
                color: "#404040",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#a3a3a3")}
              onMouseLeave={(e) => (e.target.style.color = "#404040")}
            >
              Esqueceu a senha?
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
