require('dotenv').config();

const express = require('express');
const cors = require('cors');

const usuariosRoutes = require('./routes/usuarios.routes');
const animaisRoutes = require('./routes/animais.routes');
// const fotosRoutes = require('./routes/fotos.routes');
// const solicitacoesRoutes = require('./routes/solicitacoes.routes');
// const adotacoesRoutes = require('./routes/adotacoes.routes');
// const favoritosRoutes = require('./routes/favoritos.routes');
// const enderecosRoutes = require('./routes/enderecos.routes');

const app = express();

app.use(cors());
app.use(express.json());

// rotas da API
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/animais', animaisRoutes);
// app.use('/api/fotos', fotosRoutes);
// app.use('/api/solicitacoes', solicitacoesRoutes);
// app.use('/api/adotacoes', adotacoesRoutes);
// app.use('/api/favoritos', favoritosRoutes);
// app.use('/api/enderecos', enderecosRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});