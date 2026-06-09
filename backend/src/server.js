// server.js
require('dotenv').config();

const express   = require('express');
const path      = require('path');
const cors      = require('cors');
const helmet    = require('helmet');
const session   = require('express-session');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');

const usuariosRoutes     = require('./routes/usuarios.routes');
const enderecosRoutes    = require('./routes/enderecos.routes');
const animaisRoutes      = require('./routes/animais.routes');
const solicitacoesRoutes = require('./routes/solicitacoes.routes');
const adocoesRoutes      = require('./routes/adocoes.routes');
const dashboardRoutes    = require('./routes/dashboard.routes');
const relatoriosRoutes   = require('./routes/relatorios.routes');
const notificacoesRoutes = require('./routes/notificacoes.routes');
const vacinasRoutes      = require('./routes/vacinas.routes');

const app = express();

// Segurança de cabeçalhos HTTP
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use('/img', express.static(path.join(__dirname, '../../database/fotos')));

// Rate limiting global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: 'Muitas requisições. Tente novamente em 15 minutos.' },
}));

// CORS configurado para o frontend
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// Arquivos estáticos de upload
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Sessões HTTP
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24,
  },
}));

// Rotas
app.use('/api/auth',          authRoutes);
app.use('/api/usuarios',      usuariosRoutes);
app.use('/api/enderecos',     enderecosRoutes);
app.use('/api/animais',       animaisRoutes);
app.use('/api/solicitacoes',  solicitacoesRoutes);
app.use('/api/adocoes',       adocoesRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/relatorios',    relatoriosRoutes);
app.use('/api/notificacoes', notificacoesRoutes);
app.use('/api/vacinas',      vacinasRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handler global de erros
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

const PORT = 3005;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));