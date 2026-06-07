# 🐾 Projeto Adoção de Animais

Sistema web desenvolvido para auxiliar o processo de adoção de animais, permitindo o gerenciamento de usuários, animais disponíveis, solicitações de adoção e adoções concluídas.

## 📋 Sobre o Projeto

O Projeto Adoção de Animais tem como objetivo facilitar a conexão entre pessoas interessadas em adotar e animais que aguardam um novo lar.

A aplicação é composta por:

- Frontend desenvolvido com Next.js
- Backend desenvolvido com Node.js e Express
- Banco de dados PostgreSQL

---

## 🚀 Funcionalidades

### Usuários

- Cadastro de usuários
- Consulta de usuários
- Atualização de usuários
- Gerenciamento de endereços

### Animais

- Cadastro de animais
- Consulta de animais cadastrados
- Atualização de informações
- Controle de status do animal

Status disponíveis:

- DISPONIVEL
- EM_PROCESSAMENTO
- ADOTADO

### Solicitações de Adoção

- Criação de solicitações
- Consulta de solicitações
- Aprovação ou reprovação de solicitações
- Atualização automática do status do animal

### Adoções

- Registro de adoções realizadas
- Consulta de histórico de adoções
- Associação entre animal e adotante

---

## 🏗 Arquitetura

```text
Frontend (Next.js)
        │
        ▼
Backend (Node.js + Express)
        │
        ▼
PostgreSQL
```

---

## 🛠 Tecnologias Utilizadas

### Frontend

- Next.js 14
- React 18
- TypeScript
- NextAuth
- Tailwind CSS

### Backend

- Node.js
- Express
- PostgreSQL
- bcrypt
- cors
- dotenv

### Banco de Dados

- PostgreSQL

---

## 📁 Estrutura do Projeto

```text
Projeto-Adocao-Animais/
│
├── backend/
│   ├── migrations/
│   ├── scripts/
│   └── src/
│       ├── routes/
│       ├── db.js
│       └── server.js
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
│
├── database/
│   ├── Inserir_registros_teste.sql
│   ├── validacoes.sql
│   └── localhost.session.sql
│
└── README.md
```

---

## 🗄 Banco de Dados

O sistema utiliza PostgreSQL.

Principais entidades:

### usuarios

Armazena informações dos usuários cadastrados.

### enderecos

Endereços vinculados aos usuários.

### animais

Animais disponíveis para adoção.

### solicitacoes

Solicitações realizadas pelos usuários.

### adocoes

Registros de adoções concluídas.

---

## ⚙️ Configuração do Ambiente

Crie um arquivo `.env` baseado em `.env.example`.

Exemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=adocao_db
DB_USER=postgres
DB_PASSWORD=sua_senha
```

---

## ▶️ Executando o Backend

Acesse a pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor:

```bash
npm run dev
```

O backend será iniciado em:

```text
http://localhost:3005
```

---

## ▶️ Executando o Frontend

Acesse a pasta:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Execute:

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:3000
```

---

## 📡 Endpoints da API

### Usuários

| Método | Endpoint |
|----------|----------|
| GET | /api/usuarios |
| GET | /api/usuarios/:id |
| POST | /api/usuarios |
| PUT | /api/usuarios/:id |

### Animais

| Método | Endpoint |
|----------|----------|
| GET | /api/animais |
| GET | /api/animais/:id |
| POST | /api/animais |
| PUT | /api/animais/:id |

### Solicitações

| Método | Endpoint |
|----------|----------|
| GET | /api/solicitacoes |
| GET | /api/solicitacoes/:id_usuario |
| POST | /api/solicitacoes |
| PUT | /api/solicitacoes/:id |

### Adoções

| Método | Endpoint |
|----------|----------|
| GET | /api/adocoes |
| GET | /api/adocoes/:id |
| POST | /api/adocoes |
| PUT | /api/adocoes/:id |

---

## 👨‍💻 Equipe

- Ana Carolina
- Giovanni Pinheiro
- Hellen Atanasio
- Livia Caroline
- Marcus Ladeia
- Victoria Lungov
- Vitoria Pereira
- Yohann Mazario

---

## 📄 Licença

Projeto desenvolvido para fins acadêmicos.
