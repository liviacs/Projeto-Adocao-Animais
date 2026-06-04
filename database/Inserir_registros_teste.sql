INSERT INTO usuarios (nome, email, senha, telefone, tipo)
VALUES
('Livia Caroline', 'livia@email.com', '123456', '11999990001', 'ADOTANTE'),
('Ana', 'ana@email.com', '123456', '11999990002', 'ADOTANTE'),
('Vic Lungov', 'viclungov@email.com', '123456', '11999990003', 'ADOTANTE'),
('Hellen', 'hellen@email.com', '123456', '11999990004', 'ADOTANTE'),
('Marcus', 'marcus@email.com', '123456', '11999990005', 'ADOTANTE'),
('Vitoria Silva', 'Vitoriasilv@email.com', '123456', '11999990006', 'ADOTANTE'),
('Giovanni', 'Giovanni@email.com', '123456', '11999990007', 'ADOTANTE'),
('Yohann', 'yohann@email.com', '123456', '11999990008', 'ADOTANTE'),
('Denis', 'denis@email.com', '123456', '11999990009', 'ADOTANTE'),
('Administrador', 'admin@adocao.com', '123456', '11999990010', 'ADMIN');

INSERT INTO enderecos
(id_usuario, cep, rua, numero, bairro, cidade, estado)
VALUES
(1,'01001-000','Rua A','100','Centro','São Paulo','SP'),
(2,'01002-000','Rua B','101','Centro','São Paulo','SP'),
(3,'01003-000','Rua C','102','Centro','São Paulo','SP'),
(4,'01004-000','Rua D','103','Centro','São Paulo','SP'),
(5,'01005-000','Rua E','104','Centro','São Paulo','SP'),
(6,'01006-000','Rua F','105','Centro','São Paulo','SP'),
(7,'01007-000','Rua G','106','Centro','São Paulo','SP'),
(8,'01008-000','Rua H','107','Centro','São Paulo','SP'),
(9,'01009-000','Rua I','108','Centro','São Paulo','SP'),
(10,'01010-000','Rua J','109','Centro','São Paulo','SP');

INSERT INTO animais
(nome, especie, raca, idade, sexo, porte, cond_saude, descricao, status)
VALUES
('Rex','Cachorro','Labrador',3,'Macho','Grande','Saudável','Muito brincalhão','DISPONIVEL'),
('Mimi','Gato','Siamês',2,'Fêmea','Pequeno','Vacinada','Muito dócil','DISPONIVEL'),
('Thor','Cachorro','Pastor Alemão',5,'Macho','Grande','Saudável','Excelente guarda','DISPONIVEL'),
('Luna','Gato','Persa',1,'Fêmea','Pequeno','Saudável','Muito calma','DISPONIVEL'),
('Bob','Cachorro','Vira-lata',4,'Macho','Médio','Castrado','Carinhoso','EM_PROCESSO'),
('Mel','Cachorro','Poodle',2,'Fêmea','Pequeno','Saudável','Muito ativa','DISPONIVEL'),
('Nina','Gato','Angorá',3,'Fêmea','Pequeno','Vacinada','Adora colo','DISPONIVEL'),
('Max','Cachorro','Golden Retriever',6,'Macho','Grande','Saudável','Muito amigável','ADOTADO'),
('Bela','Gato','SRD',2,'Fêmea','Pequeno','Saudável','Brincalhona','DISPONIVEL'),
('Luke','Cachorro','Beagle',4,'Macho','Médio','Saudável','Cheio de energia','DISPONIVEL');

INSERT INTO fotos_animais
(id_animal, caminho_foto)
VALUES
(1,'/img/rex.jpg'),
(2,'/img/mimi.jpg'),
(3,'/img/thor.jpg'),
(4,'/img/luna.jpg'),
(5,'/img/bob.jpg'),
(6,'/img/mel.jpg'),
(7,'/img/nina.jpg'),
(8,'/img/max.jpg'),
(9,'/img/bela.jpg'),
(10,'/img/luke.jpg');

INSERT INTO solicitacoes
(id_usuario, id_animal, status)
VALUES
(1,1,'PENDENTE'),
(2,2,'APROVADA'),
(3,3,'PENDENTE'),
(4,4,'REJEITADA'),
(5,5,'APROVADA'),
(6,6,'PENDENTE'),
(7,7,'PENDENTE'),
(8,8,'APROVADA'),
(9,9,'PENDENTE'),
(1,10,'PENDENTE');

INSERT INTO adocoes
(id_usuario, id_animal)
VALUES
(2,2),
(5,5),
(8,8),
(3,1),
(4,3),
(6,6),
(7,7),
(9,9),
(1,10),
(2,4);

INSERT INTO favoritos
(id_usuario, id_animal)
VALUES
(1,3),
(2,1),
(3,5),
(4,2),
(5,7),
(6,4),
(7,8),
(8,6),
(9,10),
(1,9);