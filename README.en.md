# 🐾 Animal Adoption Project

A web application developed to support the animal adoption process, allowing the management of users, animals available for adoption, adoption requests, and completed adoptions.

## 📋 About the Project

The Animal Adoption Project aims to connect people interested in adopting pets with animals looking for a new home.

The application is composed of:

- Frontend built with Next.js
- Backend built with Node.js and Express
- PostgreSQL database

---

## 🚀 Features

### Users

- User registration
- User listing and search
- User information updates
- Address management

### Animals

- Animal registration
- Animal listing and search
- Animal information updates
- Animal status management

Available statuses:

- AVAILABLE
- IN_PROCESS
- ADOPTED

### Adoption Requests

- Create adoption requests
- View adoption requests
- Approve or reject requests
- Automatic animal status updates

### Adoptions

- Register completed adoptions
- View adoption history
- Link adopted animals to adopters

---

## 🏗 Architecture

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

## 🛠 Technologies Used

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

### Database

- PostgreSQL

---

## 📁 Project Structure

```text
Animal-Adoption-Project/
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
│   ├── Insert_test_records.sql
│   ├── validations.sql
│   └── localhost.session.sql
│
└── README.md
```

---

## 🗄 Database

The system uses PostgreSQL as its database management system.

Main entities:

### users

Stores registered user information.

### addresses

Stores addresses linked to users.

### animals

Stores animals available for adoption.

### requests

Stores adoption requests submitted by users.

### adoptions

Stores records of completed adoptions.

---

## ⚙️ Environment Configuration

Create a `.env` file based on your project requirements.

Example:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=animal_adoption_db
DB_USER=postgres
DB_PASSWORD=your_password
```

---

## ▶️ Running the Backend

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The backend will be available at:

```text
http://localhost:3005
```

---

## ▶️ Running the Frontend

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

---

## 📡 API Endpoints

### Users

| Method | Endpoint |
|----------|----------|
| GET | /api/users |
| GET | /api/users/:id |
| POST | /api/users |
| PUT | /api/users/:id |

### Animals

| Method | Endpoint |
|----------|----------|
| GET | /api/animals |
| GET | /api/animals/:id |
| POST | /api/animals |
| PUT | /api/animals/:id |

### Adoption Requests

| Method | Endpoint |
|----------|----------|
| GET | /api/requests |
| GET | /api/requests/:user_id |
| POST | /api/requests |
| PUT | /api/requests/:id |

### Adoptions

| Method | Endpoint |
|----------|----------|
| GET | /api/adoptions |
| GET | /api/adoptions/:id |
| POST | /api/adoptions |
| PUT | /api/adoptions/:id |

---

## 👨‍💻 Team

- Ana Carolina
- Giovanni Pinheiro
- Hellen Atanasio
- Livia Caroline
- Marcus Vinicius
- Victoria Lungov
- Vitoria Pereira
- Yohann Mazario

---

## 📄 License

This project was developed for academic purposes.
