/* =====================================================
   VALIDAÇÕES DA TABELA USUARIOS
   ===================================================== */

ALTER TABLE usuarios
ADD CONSTRAINT chk_tipo_usuario
CHECK (tipo IN ('ADMIN', 'ADOTANTE'));

ALTER TABLE usuarios
ADD CONSTRAINT unq_email
UNIQUE (email);

ALTER TABLE usuarios
ADD CONSTRAINT chk_senha
CHECK (length(senha) >= 6);

ALTER TABLE usuarios
ADD CONSTRAINT chk_telefone
CHECK (telefone ~ '^[0-9]{11}$');


/* =====================================================
   VALIDAÇÕES DA TABELA ANIMAIS
   ===================================================== */

ALTER TABLE animais
ADD CONSTRAINT chk_idade
CHECK (idade >= 0);

ALTER TABLE animais
ADD CONSTRAINT chk_sexo
CHECK (sexo IN ('Macho', 'Fêmea'));

ALTER TABLE animais
ADD CONSTRAINT chk_porte
CHECK (porte IN ('Pequeno', 'Médio', 'Grande'));

ALTER TABLE animais
ADD CONSTRAINT chk_status_animal
CHECK (
    status IN (
        'DISPONIVEL',
        'EM_PROCESSO',
        'ADOTADO'
    )
);


/* =====================================================
   VALIDAÇÕES DA TABELA SOLICITACOES
   ===================================================== */

ALTER TABLE solicitacoes
ADD CONSTRAINT chk_status_solicitacao
CHECK (
    status IN (
        'PENDENTE',
        'APROVADA',
        'REJEITADA'
    )
);


/* =====================================================
   VALIDAÇÕES DA TABELA ENDERECOS
   ===================================================== */

ALTER TABLE enderecos
ADD CONSTRAINT chk_cep
CHECK (cep ~ '^[0-9]{5}-[0-9]{3}$');


/* =====================================================
   VALIDAÇÕES DA TABELA FAVORITOS
   ===================================================== */

ALTER TABLE favoritos
ADD CONSTRAINT unq_favorito
UNIQUE (id_usuario, id_animal);


/* =====================================================
   VALIDAÇÕES DA TABELA ADOCOES
   ===================================================== */

ALTER TABLE adocoes
ADD CONSTRAINT unq_adocao_animal
UNIQUE (id_animal);


/* =====================================================
   TRIGGER PARA IMPEDIR ADOÇÃO DUPLICADA
   ===================================================== */

CREATE OR REPLACE FUNCTION validar_adocao()
RETURNS TRIGGER AS $$
BEGIN

    IF EXISTS (
        SELECT 1
        FROM animais
        WHERE id_animal = NEW.id_animal
          AND status = 'ADOTADO'
    ) THEN
        RAISE EXCEPTION 'Este animal já foi adotado.';
    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_adocao
BEFORE INSERT ON adocoes
FOR EACH ROW
EXECUTE FUNCTION validar_adocao();


/* =====================================================
   TRIGGER PARA ALTERAR STATUS DO ANIMAL
   ===================================================== */

CREATE OR REPLACE FUNCTION atualizar_status_adocao()
RETURNS TRIGGER AS $$
BEGIN

    UPDATE animais
    SET status = 'ADOTADO'
    WHERE id_animal = NEW.id_animal;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizar_status_adocao
AFTER INSERT ON adocoes
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_adocao();
