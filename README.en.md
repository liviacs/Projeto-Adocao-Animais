[🇧🇷 Português](./README.md) · [🇺🇸 English](./README.en.md)

# 🐾 Animal Adoption

> A web platform to connect animals available for adoption with their future owners.

---

## 🎯 The Problem We Solve

Many animals wait for adoption in shelters without enough visibility. This platform centralizes the registration of available animals, facilitates contact between shelters and adopters, and tracks the entire adoption process transparently.

---

## ✨ Features

- User registration, login and password recovery
- User profile management
- Animal registration, editing and deletion
- Animal photo upload
- Listing, search and filtering of available animals
- Adoption requests and status tracking
- Approval and rejection of adoption requests
- Animal status updates (available, in process, adopted)
- Favorite animals
- Adoption history
- Admin panel with dashboard and statistics
- Report generation and PDF export
- Role-based access control (administrator and adopter)
- Notifications about adoption requests
- System activity logs

---

## 🛠 Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** React + Vite
- **Database:** PostgreSQL
- **Authentication:** JWT
- **File upload:** Multer
- **Email:** Nodemailer

---

## 📁 Project Structure

```
adocao-animais/
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── README.en.md
├── backend/
│   ├── migrations/
│   │   └── 001_create_tables.sql  # All table definitions
│   ├── scripts/
│   │   └── migrate.js             # Migration runner
│   └── src/
│       ├── server.js
│       ├── routes/
│       ├── controllers/
│       ├── middlewares/
│       └── db/
├── database/
│   └── seed.sql                   # Test data
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

## 🗄 Database Tables

| Table | Description |
|-------|-------------|
| `usuarios` | User accounts (adopters and administrators) |
| `enderecos` | Addresses linked to users |
| `animais` | Animals available for adoption |
| `fotos_animais` | Animal photos |
| `solicitacoes` | Adoption requests |
| `adocoes` | Completed adoption history |
| `favoritos` | Animals favorited by users |

---

## 🚀 Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/) v14 or higher

### 1. Clone the repository

```bash
git clone https://github.com/your-username/adocao-animais.git
cd adocao-animais
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open the `.env` file and fill in your local settings:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adocao_db
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=a_long_secret_key
```

### 4. Create the database

Access PostgreSQL and create the database:

```bash
psql -U postgres
```

```sql
CREATE DATABASE adocao_db;
\q
```

### 5. Run the migrations

```bash
npm run db:migrate
```

If everything is set up correctly, you should see:

```
✅ Connected to the database.
✅ Executed: 001_create_tables.sql
🎉 Migrations complete!
```

### 6. (Optional) Seed with test data

```bash
psql -U postgres -d adocao_db -f database/seed.sql
```

This inserts sample users, animals, requests and favorites to speed up development.

### 7. Start the server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

---

## 🌐 Deploy

> Coming soon.

---

## 👥 Team

| Name | GitHub |
|------|--------|
| Member 1 | [@username1](https://github.com/username1) |
| Member 2 | [@username2](https://github.com/username2) |
| Member 3 | [@username3](https://github.com/username3) |
| Member 4 | [@username4](https://github.com/username4) |

---

## 📄 License

This project was developed for academic purposes.
