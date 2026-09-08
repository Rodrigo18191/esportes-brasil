/**
 * Camada de Persistencia — tabelas `turma` e `turma_participante`.
 */
const db = require('../database/connection');

/** Insere uma turma. */
function criar({
  id,
  criador_id,
  nome,
  esporte,
  horario,
  vagas_total,
  vagas_preenchidas,
  criado_em,
}) {
  db.prepare(
    `INSERT INTO turma (id, criador_id, nome, esporte, horario, vagas_total, vagas_preenchidas, criado_em)
     VALUES (@id, @criador_id, @nome, @esporte, @horario, @vagas_total, @vagas_preenchidas, @criado_em)`
  ).run({
    id,
    criador_id,
    nome,
    esporte,
    horario,
    vagas_total,
    vagas_preenchidas,
    criado_em,
  });

  return buscarPorId(id);
}

/** Busca uma turma pelo id. */
function buscarPorId(id) {
  return db.prepare(`SELECT * FROM turma WHERE id = ?`).get(id);
}

/**
 * Lista turmas visiveis, com filtro opcional por esporte.
 *
 * RNE-006 — apoio a regra de visibilidade: turmas sem `esporte` ou sem
 * `horario` definidos nao aparecem na listagem publica.
 */
function listarVisiveis({ esporte } = {}) {
  let sql = `
    SELECT t.*, u.nome AS criador_nome
      FROM turma t
      JOIN usuario u ON u.id = t.criador_id
     WHERE TRIM(COALESCE(t.esporte, '')) <> ''
       AND TRIM(COALESCE(t.horario, '')) <> ''`;
  const params = {};

  if (esporte) {
    sql += ` AND UPPER(t.esporte) = UPPER(@esporte)`;
    params.esporte = esporte;
  }

  sql += ` ORDER BY t.criado_em DESC`;
  return db.prepare(sql).all(params);
}

/** Lista as turmas que o usuario criou ou das quais participa. */
function listarPorUsuario(usuarioId) {
  return db
    .prepare(
      `SELECT DISTINCT t.*, u.nome AS criador_nome
         FROM turma t
         JOIN usuario u ON u.id = t.criador_id
         LEFT JOIN turma_participante tp ON tp.turma_id = t.id
        WHERE t.criador_id = @usuario_id
           OR tp.usuario_id = @usuario_id
        ORDER BY t.criado_em DESC`
    )
    .all({ usuario_id: usuarioId });
}

/** Adiciona um participante a turma. */
function adicionarParticipante(turmaId, usuarioId) {
  db.prepare(
    `INSERT INTO turma_participante (turma_id, usuario_id) VALUES (?, ?)`
  ).run(turmaId, usuarioId);
}

/** Indica se o usuario ja participa da turma. */
function ehParticipante(turmaId, usuarioId) {
  const linha = db
    .prepare(
      `SELECT COUNT(*) AS total
         FROM turma_participante
        WHERE turma_id = ? AND usuario_id = ?`
    )
    .get(turmaId, usuarioId);

  return linha.total > 0;
}

/** Lista os participantes de uma turma. */
function listarParticipantes(turmaId) {
  return db
    .prepare(
      `SELECT u.id, u.nome, u.email
         FROM turma_participante tp
         JOIN usuario u ON u.id = tp.usuario_id
        WHERE tp.turma_id = ?
        ORDER BY u.nome`
    )
    .all(turmaId);
}

/** Atualiza a quantidade de vagas preenchidas. */
function atualizarVagasPreenchidas(turmaId, vagasPreenchidas) {
  db.prepare(`UPDATE turma SET vagas_preenchidas = ? WHERE id = ?`).run(
    vagasPreenchidas,
    turmaId
  );
  return buscarPorId(turmaId);
}

/** Remove todas as turmas e participacoes (usado pelo seed idempotente). */
function limpar() {
  db.prepare(`DELETE FROM turma_participante`).run();
  db.prepare(`DELETE FROM turma`).run();
}

module.exports = {
  criar,
  buscarPorId,
  listarVisiveis,
  listarPorUsuario,
  adicionarParticipante,
  ehParticipante,
  listarParticipantes,
  atualizarVagasPreenchidas,
  limpar,
};
