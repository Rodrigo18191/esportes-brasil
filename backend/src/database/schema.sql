-- ============================================================================
-- Esportes Brasil — esquema do banco (SQLite)
-- Espelha o diagrama ER da especificacao do projeto (Parte 18).
-- Todos os identificadores sao UUID armazenados como TEXT.
-- ============================================================================

DROP TABLE IF EXISTS avaliacao;
DROP TABLE IF EXISTS turma_participante;
DROP TABLE IF EXISTS turma;
DROP TABLE IF EXISTS reserva;
DROP TABLE IF EXISTS quadra;
DROP TABLE IF EXISTS arena;
DROP TABLE IF EXISTS usuario;

-- Usuario da plataforma (RF-001, RF-002)
CREATE TABLE usuario (
  id         TEXT PRIMARY KEY,
  nome       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  celular    TEXT,
  senha_hash TEXT NOT NULL,
  criado_em  TEXT NOT NULL
);

-- Arena esportiva (RF-003)
CREATE TABLE arena (
  id              TEXT PRIMARY KEY,
  nome            TEXT NOT NULL,
  regiao          TEXT,
  cidade          TEXT,
  avaliacao_media REAL DEFAULT 0
);

-- Quadra pertencente a uma arena (RF-003)
-- `horarios_disponiveis` guarda um array JSON serializado,
-- ex.: ["08:00","09:00","19:00"]
CREATE TABLE quadra (
  id                   TEXT PRIMARY KEY,
  arena_id             TEXT NOT NULL,
  tipo_esporte         TEXT NOT NULL,
  horarios_disponiveis TEXT,
  FOREIGN KEY (arena_id) REFERENCES arena(id)
);

-- Reserva de um horario de quadra (RF-004, RF-007)
-- status: SOLICITADO | AGENDADO | CANCELADO | REALIZADO
CREATE TABLE reserva (
  id         TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL,
  quadra_id  TEXT NOT NULL,
  dia_semana TEXT NOT NULL,
  horario    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'AGENDADO',
  criado_em  TEXT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  FOREIGN KEY (quadra_id) REFERENCES quadra(id)
);

-- Turma esportiva criada por um usuario (RF-005, RF-006)
CREATE TABLE turma (
  id                TEXT PRIMARY KEY,
  criador_id        TEXT NOT NULL,
  nome              TEXT NOT NULL,
  esporte           TEXT NOT NULL,
  horario           TEXT NOT NULL,
  vagas_total       INTEGER NOT NULL,
  vagas_preenchidas INTEGER NOT NULL DEFAULT 1,
  criado_em         TEXT NOT NULL,
  FOREIGN KEY (criador_id) REFERENCES usuario(id)
);

-- Participacao de um usuario em uma turma (RF-006)
-- A PK composta impede que o mesmo usuario entre duas vezes na mesma turma.
CREATE TABLE turma_participante (
  turma_id   TEXT NOT NULL,
  usuario_id TEXT NOT NULL,
  PRIMARY KEY (turma_id, usuario_id),
  FOREIGN KEY (turma_id) REFERENCES turma(id),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

-- Avaliacao de uma arena por um usuario (RF-003)
-- nota: MUITO_BOM | BOM | MEDIO | RUIM
CREATE TABLE avaliacao (
  id         TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL,
  arena_id   TEXT NOT NULL,
  nota       TEXT NOT NULL,
  criado_em  TEXT NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  FOREIGN KEY (arena_id) REFERENCES arena(id)
);
