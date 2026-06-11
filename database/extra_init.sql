-- ============ TABELA DE LOGS ============
CREATE TABLE IF NOT EXISTS logs (
  id_log        SERIAL PRIMARY KEY,
  tipo          VARCHAR(10)  NOT NULL CHECK (tipo IN ('sucesso','info','aviso','erro')),
  mensagem      TEXT         NOT NULL,
  usuario       VARCHAR(255) NOT NULL DEFAULT 'sistema',
  data_criacao  TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_logs_data ON logs (data_criacao DESC);

-- ============ USUÁRIO ADMIN ============
INSERT INTO usuarios (nome, email, senha, tipo)
VALUES ('Vitoria Pereira', 'admin@petadopt.com', '$2b$10$2IXD5H.TkFTyoZTwis7xM.fjsyYpjMlAQYHCTNl8ia.Mw44VJ1gdG', 'ADMIN');