
-- =====================================
-- TABELA USUARIOS
-- =====================================

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    tipo VARCHAR(20) NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =====================================
-- TABELA ENDERECOS
-- =====================================

CREATE TABLE enderecos (
    id_endereco SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    cep VARCHAR(10),
    rua VARCHAR(100),
    numero VARCHAR(10),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(50),

    CONSTRAINT fk_endereco_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
);


-- =====================================
-- TABELA ANIMAIS
-- =====================================

CREATE TABLE animais (
    id_animal SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raca VARCHAR(100),
    idade INT,
    sexo VARCHAR(10),
    porte VARCHAR(20),
    cond_saude VARCHAR(150),
    descricao TEXT,
    status VARCHAR(20) DEFAULT 'DISPONIVEL'
);


-- =====================================
-- TABELA FOTOS_ANIMAIS
-- =====================================

CREATE TABLE fotos_animais (
    id_foto SERIAL PRIMARY KEY,
    id_animal INT NOT NULL,
    caminho_foto VARCHAR(255) NOT NULL,

    CONSTRAINT fk_foto_animal
        FOREIGN KEY (id_animal)
        REFERENCES animais(id_animal)
        ON DELETE CASCADE
);


-- =====================================
-- TABELA SOLICITACOES
-- =====================================

CREATE TABLE solicitacoes (
    id_solicitacao SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_animal INT NOT NULL,
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDENTE',

    CONSTRAINT fk_solicitacao_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT fk_solicitacao_animal
        FOREIGN KEY (id_animal)
        REFERENCES animais(id_animal)
);


-- =====================================
-- TABELA ADOCOES
-- =====================================

CREATE TABLE adocoes (
    id_adocao SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_animal INT NOT NULL,
    data_adocao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_adocao_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario),

    CONSTRAINT fk_adocao_animal
        FOREIGN KEY (id_animal)
        REFERENCES animais(id_animal)
);


-- =====================================
-- TABELA FAVORITOS
-- =====================================

CREATE TABLE favoritos (
    id_favorito SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_animal INT NOT NULL,

    CONSTRAINT fk_favorito_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_favorito_animal
        FOREIGN KEY (id_animal)
        REFERENCES animais(id_animal)
        ON DELETE CASCADE
);