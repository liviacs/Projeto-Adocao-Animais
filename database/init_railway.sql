--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: atualizar_data_vacina(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.atualizar_data_vacina() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: adocoes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.adocoes (
    id_adocao integer NOT NULL,
    id_usuario integer NOT NULL,
    id_animal integer NOT NULL,
    data_adocao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'PENDENTE'::character varying NOT NULL,
    CONSTRAINT chk_adocoes_status CHECK (((status)::text = ANY (ARRAY[('PENDENTE'::character varying)::text, ('ADOTADO'::character varying)::text, ('REJEITADO'::character varying)::text])))
);


--
-- Name: adocoes_id_adocao_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.adocoes_id_adocao_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: adocoes_id_adocao_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.adocoes_id_adocao_seq OWNED BY public.adocoes.id_adocao;


--
-- Name: animais; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.animais (
    id_animal integer NOT NULL,
    nome character varying(100) NOT NULL,
    especie character varying(50) NOT NULL,
    raca character varying(100),
    idade integer,
    sexo character varying(10),
    porte character varying(20),
    cond_saude character varying(150),
    descricao text,
    status character varying(20) DEFAULT 'DISPONIVEL'::character varying,
    data_cadastro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    qtd_adocoes integer DEFAULT 0,
    castrado boolean DEFAULT false,
    chipado boolean DEFAULT false,
    data_nascimento date
);


--
-- Name: animais_id_animal_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.animais_id_animal_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: animais_id_animal_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.animais_id_animal_seq OWNED BY public.animais.id_animal;


--
-- Name: documentos_pet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documentos_pet (
    id_documento_pet integer NOT NULL,
    id_animal integer NOT NULL,
    certidao_nascimento bytea,
    certidao_obito bytea,
    rga bytea,
    carteira_vacinacao bytea
);


--
-- Name: documentos_pet_id_documento_pet_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documentos_pet_id_documento_pet_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documentos_pet_id_documento_pet_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documentos_pet_id_documento_pet_seq OWNED BY public.documentos_pet.id_documento_pet;


--
-- Name: documentos_usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documentos_usuario (
    id_documento_usuario integer NOT NULL,
    id_usuario integer NOT NULL,
    documento_identidade bytea CONSTRAINT documentos_usuario_rg_not_null NOT NULL,
    comprovante_residencia bytea NOT NULL
);


--
-- Name: documentos_usuario_id_documento_usuario_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documentos_usuario_id_documento_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documentos_usuario_id_documento_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documentos_usuario_id_documento_usuario_seq OWNED BY public.documentos_usuario.id_documento_usuario;


--
-- Name: enderecos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enderecos (
    id_endereco integer NOT NULL,
    id_usuario integer NOT NULL,
    cep character varying(10),
    rua character varying(100),
    numero character varying(10),
    bairro character varying(100),
    cidade character varying(100),
    estado character varying(50)
);


--
-- Name: enderecos_id_endereco_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.enderecos_id_endereco_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: enderecos_id_endereco_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.enderecos_id_endereco_seq OWNED BY public.enderecos.id_endereco;


--
-- Name: favoritos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favoritos (
    id_favorito integer NOT NULL,
    id_usuario integer NOT NULL,
    id_animal integer NOT NULL
);


--
-- Name: favoritos_id_favorito_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.favoritos_id_favorito_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: favoritos_id_favorito_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.favoritos_id_favorito_seq OWNED BY public.favoritos.id_favorito;


--
-- Name: fotos_animais; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fotos_animais (
    id_foto integer NOT NULL,
    id_animal integer NOT NULL,
    caminho_foto character varying(255) NOT NULL
);


--
-- Name: fotos_animais_id_foto_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fotos_animais_id_foto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fotos_animais_id_foto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fotos_animais_id_foto_seq OWNED BY public.fotos_animais.id_foto;


--
-- Name: notificacoes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notificacoes (
    id_notificacao integer NOT NULL,
    id_usuario integer NOT NULL,
    tipo character varying(20) NOT NULL,
    mensagem text NOT NULL,
    lida boolean DEFAULT false NOT NULL,
    data_criacao timestamp without time zone DEFAULT now() NOT NULL,
    id_solicitacao integer
);


--
-- Name: notificacoes_id_notificacao_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notificacoes_id_notificacao_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notificacoes_id_notificacao_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notificacoes_id_notificacao_seq OWNED BY public.notificacoes.id_notificacao;


--
-- Name: solicitacoes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitacoes (
    id_solicitacao integer NOT NULL,
    id_usuario integer NOT NULL,
    id_animal integer NOT NULL,
    data_solicitacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'PENDENTE'::character varying,
    motivo_rejeicao text
);


--
-- Name: solicitacoes_id_solicitacao_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.solicitacoes_id_solicitacao_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: solicitacoes_id_solicitacao_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.solicitacoes_id_solicitacao_seq OWNED BY public.solicitacoes.id_solicitacao;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    nome character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    senha character varying(255) NOT NULL,
    telefone character varying(20),
    tipo character varying(20) NOT NULL,
    data_cadastro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cpf character varying(14),
    orientacao_sexual character varying(50),
    qtd_adocoes integer DEFAULT 0,
    token_recuperacao character varying(6),
    token_expira timestamp without time zone
);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- Name: vacinas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vacinas (
    id_vacina integer NOT NULL,
    id_animal integer NOT NULL,
    antirrabica date,
    v8 date,
    v10 date,
    giardia date,
    leishmaniose date,
    triplice_felina date,
    quadrupla_felina date,
    data_atualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: vacinas_id_vacina_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vacinas_id_vacina_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vacinas_id_vacina_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vacinas_id_vacina_seq OWNED BY public.vacinas.id_vacina;


--
-- Name: adocoes id_adocao; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.adocoes ALTER COLUMN id_adocao SET DEFAULT nextval('public.adocoes_id_adocao_seq'::regclass);


--
-- Name: animais id_animal; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.animais ALTER COLUMN id_animal SET DEFAULT nextval('public.animais_id_animal_seq'::regclass);


--
-- Name: documentos_pet id_documento_pet; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos_pet ALTER COLUMN id_documento_pet SET DEFAULT nextval('public.documentos_pet_id_documento_pet_seq'::regclass);


--
-- Name: documentos_usuario id_documento_usuario; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos_usuario ALTER COLUMN id_documento_usuario SET DEFAULT nextval('public.documentos_usuario_id_documento_usuario_seq'::regclass);


--
-- Name: enderecos id_endereco; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enderecos ALTER COLUMN id_endereco SET DEFAULT nextval('public.enderecos_id_endereco_seq'::regclass);


--
-- Name: favoritos id_favorito; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoritos ALTER COLUMN id_favorito SET DEFAULT nextval('public.favoritos_id_favorito_seq'::regclass);


--
-- Name: fotos_animais id_foto; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fotos_animais ALTER COLUMN id_foto SET DEFAULT nextval('public.fotos_animais_id_foto_seq'::regclass);


--
-- Name: notificacoes id_notificacao; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificacoes ALTER COLUMN id_notificacao SET DEFAULT nextval('public.notificacoes_id_notificacao_seq'::regclass);


--
-- Name: solicitacoes id_solicitacao; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitacoes ALTER COLUMN id_solicitacao SET DEFAULT nextval('public.solicitacoes_id_solicitacao_seq'::regclass);


--
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- Name: vacinas id_vacina; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacinas ALTER COLUMN id_vacina SET DEFAULT nextval('public.vacinas_id_vacina_seq'::regclass);


--
-- Name: adocoes adocoes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.adocoes
    ADD CONSTRAINT adocoes_pkey PRIMARY KEY (id_adocao);


--
-- Name: animais animais_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.animais
    ADD CONSTRAINT animais_pkey PRIMARY KEY (id_animal);


--
-- Name: documentos_pet documentos_pet_id_animal_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos_pet
    ADD CONSTRAINT documentos_pet_id_animal_key UNIQUE (id_animal);


--
-- Name: documentos_pet documentos_pet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos_pet
    ADD CONSTRAINT documentos_pet_pkey PRIMARY KEY (id_documento_pet);


--
-- Name: documentos_usuario documentos_usuario_id_usuario_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos_usuario
    ADD CONSTRAINT documentos_usuario_id_usuario_key UNIQUE (id_usuario);


--
-- Name: documentos_usuario documentos_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos_usuario
    ADD CONSTRAINT documentos_usuario_pkey PRIMARY KEY (id_documento_usuario);


--
-- Name: enderecos enderecos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enderecos
    ADD CONSTRAINT enderecos_pkey PRIMARY KEY (id_endereco);


--
-- Name: favoritos favoritos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT favoritos_pkey PRIMARY KEY (id_favorito);


--
-- Name: fotos_animais fotos_animais_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fotos_animais
    ADD CONSTRAINT fotos_animais_pkey PRIMARY KEY (id_foto);


--
-- Name: notificacoes notificacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificacoes
    ADD CONSTRAINT notificacoes_pkey PRIMARY KEY (id_notificacao);


--
-- Name: solicitacoes solicitacoes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitacoes
    ADD CONSTRAINT solicitacoes_pkey PRIMARY KEY (id_solicitacao);


--
-- Name: usuarios usuarios_cpf_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_cpf_key UNIQUE (cpf);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: vacinas vacinas_id_animal_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacinas
    ADD CONSTRAINT vacinas_id_animal_key UNIQUE (id_animal);


--
-- Name: vacinas vacinas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacinas
    ADD CONSTRAINT vacinas_pkey PRIMARY KEY (id_vacina);


--
-- Name: vacinas trg_atualizar_vacina; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_atualizar_vacina BEFORE UPDATE ON public.vacinas FOR EACH ROW EXECUTE FUNCTION public.atualizar_data_vacina();


--
-- Name: adocoes fk_adocao_animal; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.adocoes
    ADD CONSTRAINT fk_adocao_animal FOREIGN KEY (id_animal) REFERENCES public.animais(id_animal);


--
-- Name: adocoes fk_adocao_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.adocoes
    ADD CONSTRAINT fk_adocao_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- Name: documentos_pet fk_documento_pet; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos_pet
    ADD CONSTRAINT fk_documento_pet FOREIGN KEY (id_animal) REFERENCES public.animais(id_animal);


--
-- Name: documentos_usuario fk_documento_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos_usuario
    ADD CONSTRAINT fk_documento_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- Name: enderecos fk_endereco_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enderecos
    ADD CONSTRAINT fk_endereco_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: favoritos fk_favorito_animal; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT fk_favorito_animal FOREIGN KEY (id_animal) REFERENCES public.animais(id_animal) ON DELETE CASCADE;


--
-- Name: favoritos fk_favorito_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favoritos
    ADD CONSTRAINT fk_favorito_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: fotos_animais fk_foto_animal; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fotos_animais
    ADD CONSTRAINT fk_foto_animal FOREIGN KEY (id_animal) REFERENCES public.animais(id_animal) ON DELETE CASCADE;


--
-- Name: solicitacoes fk_solicitacao_animal; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitacoes
    ADD CONSTRAINT fk_solicitacao_animal FOREIGN KEY (id_animal) REFERENCES public.animais(id_animal);


--
-- Name: solicitacoes fk_solicitacao_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitacoes
    ADD CONSTRAINT fk_solicitacao_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- Name: vacinas fk_vacina_animal; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacinas
    ADD CONSTRAINT fk_vacina_animal FOREIGN KEY (id_animal) REFERENCES public.animais(id_animal);


--
-- Name: notificacoes notificacoes_id_solicitacao_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificacoes
    ADD CONSTRAINT notificacoes_id_solicitacao_fkey FOREIGN KEY (id_solicitacao) REFERENCES public.solicitacoes(id_solicitacao);


--
-- Name: notificacoes notificacoes_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificacoes
    ADD CONSTRAINT notificacoes_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario);


--
-- PostgreSQL database dump complete
--


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