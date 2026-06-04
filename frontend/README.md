# PetAdopt — Frontend

## Como rodar

```bash
npm install
npm run dev
```

Abre em: http://localhost:3000

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz:

```
NEXT_PUBLIC_URL_API=http://localhost:3001/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=coloca-qualquer-coisa-aqui
```

## Estrutura

```
petadopt/
├── app/
│   ├── dashboard/page.tsx
│   ├── animais/page.tsx
│   ├── solicitacoes/page.tsx
│   ├── usuarios/page.tsx
│   ├── relatorios/page.tsx
│   └── auth/login/page.tsx
├── components/
│   ├── layout/          → BarraLateral, BarraSuperior, Layout
│   ├── ui/              → Botao, Card, Etiqueta, Campo, Seletor...
│   └── animais/         → FormAnimal
├── hooks/useConsulta.ts → useConsulta + useMutacao
├── lib/api.ts           → todas as chamadas pra API
├── lib/utils.ts         → cn, formatarData, iniciais
└── tipos/index.ts       → tipos TypeScript
```

## Integração com o back

Tudo que faz requisição fica em `lib/api.ts`.
Aponta `NEXT_PUBLIC_URL_API` pro servidor e pronto.
