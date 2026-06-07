require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const usuariosRoutes = require('./routes/usuarios.routes');
const animaisRoutes = require('./routes/animais.routes');
// const fotosRoutes = require('./routes/fotos.routes');
const solicitacoesRoutes = require('./routes/solicitacoes.routes');
const adocoesRoutes = require('./routes/adocoes.routes');
// const favoritosRoutes = require('./routes/favoritos.routes');
// const enderecosRoutes = require('./routes/enderecos.routes');

// rotas da API
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/animais', animaisRoutes);
// app.use('/api/fotos', fotosRoutes);
app.use('/api/solicitacoes', solicitacoesRoutes);
app.use('/api/adocoes', adocoesRoutes);
// app.use('/api/favoritos', favoritosRoutes);
// app.use('/api/enderecos', enderecosRoutes);

const PORT = 3005;

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});