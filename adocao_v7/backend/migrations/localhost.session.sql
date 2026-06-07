-- ============================================================
-- Migration principal — Projeto Adoção de Animais v4.1
-- Execute via: npm run db:migrate
-- ============================================================

-- Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario    SERIAL PRIMARY KEY,
    nome          VARCHAR(100)  NOT NULL,
    email         VARCHAR(100)  UNIQUE NOT NULL,
    senha         VARCHAR(255)  NOT NULL,
    telefone      VARCHAR(20),
    tipo          VARCHAR(20)   NOT NULL DEFAULT 'adotante',
    data_cadastro TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- Endereços
CREATE TABLE IF NOT EXISTS enderecos (
    id_endereco SERIAL PRIMARY KEY,
    id_usuario  INT          NOT NULL,
    cep         VARCHAR(10),
    rua         VARCHAR(100),
    numero      VARCHAR(10),
    bairro      VARCHAR(100),
    cidade      VARCHAR(100),
    estado      VARCHAR(50),
    CONSTRAINT fk_endereco_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Animais (com colunas estendidas usadas pelo backend v4)
CREATE TABLE IF NOT EXISTS animais (
    id_animal        SERIAL PRIMARY KEY,
    nome             VARCHAR(100) NOT NULL,
    especie          VARCHAR(50)  NOT NULL,
    raca             VARCHAR(100),
    idade            INT,
    unidade_idade    VARCHAR(10)  DEFAULT 'anos',
    sexo             VARCHAR(10),
    porte            VARCHAR(20),
    cond_saude       VARCHAR(150),
    descricao        TEXT,
    status           VARCHAR(20)  NOT NULL DEFAULT 'disponivel',
    peso             NUMERIC(5,2),
    vacinado         BOOLEAN      DEFAULT FALSE,
    castrado         BOOLEAN      DEFAULT FALSE,
    data_cadastro    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Adiciona colunas novas caso a tabela já exista sem elas
ALTER TABLE animais ADD COLUMN IF NOT EXISTS unidade_idade    VARCHAR(10)  DEFAULT 'anos';
ALTER TABLE animais ADD COLUMN IF NOT EXISTS peso             NUMERIC(5,2);
ALTER TABLE animais ADD COLUMN IF NOT EXISTS vacinado         BOOLEAN      DEFAULT FALSE;
ALTER TABLE animais ADD COLUMN IF NOT EXISTS castrado         BOOLEAN      DEFAULT FALSE;
ALTER TABLE animais ADD COLUMN IF NOT EXISTS data_atualizacao TIMESTAMP    DEFAULT CURRENT_TIMESTAMP;

-- Fotos dos animais
CREATE TABLE IF NOT EXISTS fotos_animais (
    id_foto      SERIAL PRIMARY KEY,
    id_animal    INT          NOT NULL,
    caminho_foto VARCHAR(255) NOT NULL,
    CONSTRAINT fk_foto_animal
        FOREIGN KEY (id_animal) REFERENCES animais(id_animal) ON DELETE CASCADE
);

-- Solicitações
CREATE TABLE IF NOT EXISTS solicitacoes (
    id_solicitacao   SERIAL PRIMARY KEY,
    id_usuario       INT          NOT NULL,
    id_animal        INT          NOT NULL,
    mensagem         TEXT,
    data_solicitacao TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    status           VARCHAR(20)  NOT NULL DEFAULT 'pendente',
    CONSTRAINT fk_solicitacao_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_solicitacao_animal
        FOREIGN KEY (id_animal)  REFERENCES animais(id_animal)   ON DELETE CASCADE
);

-- Adiciona coluna mensagem caso já exista a tabela sem ela
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS mensagem TEXT;

-- Adoções
CREATE TABLE IF NOT EXISTS adocoes (
    id_adocao   SERIAL PRIMARY KEY,
    id_usuario  INT       NOT NULL,
    id_animal   INT       NOT NULL,
    data_adocao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_adocao_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_adocao_animal
        FOREIGN KEY (id_animal)  REFERENCES animais(id_animal)   ON DELETE CASCADE
);

-- Favoritos
CREATE TABLE IF NOT EXISTS favoritos (
    id_favorito SERIAL PRIMARY KEY,
    id_usuario  INT NOT NULL,
    id_animal   INT NOT NULL,
    CONSTRAINT uq_favorito UNIQUE (id_usuario, id_animal),
    CONSTRAINT fk_favorito_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_favorito_animal
        FOREIGN KEY (id_animal)  REFERENCES animais(id_animal)   ON DELETE CASCADE
);
