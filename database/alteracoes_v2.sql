/* =====================================================
   ALTERAÇÕES NA TABELA USUARIOS
   ===================================================== */

ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14) UNIQUE,
ADD COLUMN IF NOT EXISTS orientacao_sexual VARCHAR(50),
ADD COLUMN IF NOT EXISTS qtd_adocoes INTEGER DEFAULT 0;


/* =====================================================
   ALTERAÇÕES NA TABELA ANIMAIS
   ===================================================== */

ALTER TABLE animais
ADD COLUMN IF NOT EXISTS data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS qtd_adocoes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS castrado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS chipado BOOLEAN DEFAULT FALSE;


/* =====================================================
   DOCUMENTOS DO USUÁRIO
   ===================================================== */

CREATE TABLE IF NOT EXISTS documentos_usuario (
    id_documento_usuario SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL UNIQUE,

    rg BYTEA NOT NULL,
    cpf_documento BYTEA NOT NULL,
    comprovante_residencia BYTEA NOT NULL,

    CONSTRAINT fk_documento_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
);


/* =====================================================
   DOCUMENTOS DO PET
   ===================================================== */

CREATE TABLE IF NOT EXISTS documentos_pet (
    id_documento_pet SERIAL PRIMARY KEY,
    id_animal INTEGER NOT NULL UNIQUE,

    certidao_nascimento BYTEA,
    certidao_obito BYTEA,
    rga BYTEA,
    carteira_vacinacao BYTEA,

    CONSTRAINT fk_documento_pet
        FOREIGN KEY (id_animal)
        REFERENCES animais(id_animal)
);


/* =====================================================
   VACINAS
   ===================================================== */

CREATE TABLE IF NOT EXISTS vacinas (
    id_vacina SERIAL PRIMARY KEY,
    id_animal INTEGER NOT NULL UNIQUE,

    antirrabica DATE,
    v8 DATE,
    v10 DATE,
    giardia DATE,
    leishmaniose DATE,
    triplice_felina DATE,
    quadrupla_felina DATE,

    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_vacina_animal
        FOREIGN KEY (id_animal)
        REFERENCES animais(id_animal)
);


/* =====================================================
   TRIGGER DE ATUALIZAÇÃO DA CARTEIRA DE VACINAS
   ===================================================== */

CREATE OR REPLACE FUNCTION atualizar_data_vacina()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_atualizar_vacina ON vacinas;

CREATE TRIGGER trg_atualizar_vacina
BEFORE UPDATE ON vacinas
FOR EACH ROW
EXECUTE FUNCTION atualizar_data_vacina();
