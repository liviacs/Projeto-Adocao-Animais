[🇧🇷 Português](./README.md) · [🇺🇸 English](./README.en.md)

# 🐾 Adoção de Animais

> Plataforma web para conectar animais disponíveis para adoção com seus futuros tutores.

---

## 🎯 O Problema que Resolvemos

Muitos animais aguardam adoção em abrigos sem visibilidade suficiente. Esta plataforma centraliza o cadastro de animais disponíveis, facilita o contato entre abrigos e adotantes e acompanha todo o processo de adoção de forma transparente.

---

## ✨ Funcionalidades

- Cadastro, login e recuperação de senha
- Gerenciamento de perfil do usuário
- Cadastro, edição e exclusão de animais
- Upload de fotos dos animais
- Listagem, busca e filtros de animais disponíveis
- Solicitação e acompanhamento de adoções
- Aprovação e rejeição de solicitações
- Atualização de status do animal (disponível, em processo, adotado)
- Favoritar animais
- Histórico de adoções
- Painel administrativo com dashboard e estatísticas
- Geração e exportação de relatórios em PDF
- Controle de permissões (administrador e adotante)
- Notificações sobre solicitações de adoção
- Registro de atividades do sistema (logs)

---

## 🛠 Stack Tecnológica

- **Backend:** Node.js + Express
- **Frontend:** React + Vite
- **Banco de dados:** PostgreSQL
- **Autenticação:** JWT
- **Upload de arquivos:** Multer
- **E-mail:** Nodemailer

---

## 📁 Estrutura do Projeto

```
adocao-animais/
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── README.en.md
├── backend/
│   ├── migrations/
│   │   └── 001_create_tables.sql  # Criação de todas as tabelas
│   ├── scripts/
│   │   └── migrate.js             # Script de migração
│   └── src/
│       ├── server.js
│       ├── routes/
│       ├── controllers/
│       ├── middlewares/
│       └── db/
├── database/
│   └── seed.sql                   # Dados de teste
└── frontend/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── pages/
        ├── components/
        ├── services/
        └── hooks/
```

---

## 🗄 Tabelas do Banco de Dados

| Tabela | Descrição |
|--------|-----------|
| `usuarios` | Cadastro de usuários (adotantes e administradores) |
| `enderecos` | Endereços vinculados aos usuários |
| `animais` | Animais disponíveis para adoção |
| `fotos_animais` | Fotos dos animais |
| `solicitacoes` | Solicitações de adoção |
| `adocoes` | Histórico de adoções concluídas |
| `favoritos` | Animais favoritados pelos usuários |

---

## 🚀 Executar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [PostgreSQL](https://www.postgresql.org/) v14 ou superior

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/adocao-animais.git
cd adocao-animais
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Abra o arquivo `.env` e preencha com seus dados locais:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adocao_db
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
JWT_SECRET=uma_chave_secreta_longa
```

### 4. Crie o banco de dados

Acesse o PostgreSQL e crie o banco:

```bash
psql -U postgres
```

```sql
CREATE DATABASE adocao_db;
\q
```

### 5. Execute as migrations

```bash
npm run db:migrate
```

Se tudo estiver correto, você verá:

```
✅ Conectado ao banco de dados.
✅ Executada: 001_create_tables.sql
🎉 Migrations concluídas!
```

### 6. (Opcional) Populando com dados de teste

```bash
psql -U postgres -d adocao_db -f database/seed.sql
```

Isso insere usuários, animais, solicitações e favoritos de exemplo para facilitar o desenvolvimento.

### 7. Inicie o servidor

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`.

---

## 🌐 Deploy

> Em breve.

---

## 👥 Equipe

| Nome | GitHub |
|------|--------|
| Ana Carolina  | [@usuario1](https://github.com/usuario1) |
| Giovanni Pinheiro | [@GIPB12](https://github.com/GIPB12) |
| Hellen Atanasio | [@4allen](https://github.com/4allen) |
| Livia Caroline | [@liviacs](https://github.com/liviacs) |
| Marcus Vinicus | [@Ladeias2](https://github.com/Ladeias2) |
| Victoria Lungov| [@viihlungov](https://github.com/viihlungov) |
| Vitoria Pereira | [@002-VIKER](https://github.com/002-VIKER) |
| Yohann | [@yohannmazario](https://github.com/yohannmazario) |

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.
