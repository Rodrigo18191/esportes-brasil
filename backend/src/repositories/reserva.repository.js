/**
 * Camada de Persistencia — tabela `reserva`.
 */
const db = require('../database/connection');

const STATUS_VALIDOS = ['SOLICITADO', 'AGENDADO', 'CANCELADO', 'REALIZADO'];

/** Insere uma reserva. */
function criar({
  id,
  usuario_id,
  quadra_id,
  dia_semana,
  horario,
  status,
  criado_em,
}) {
  db.prepare(
    `INSERT INTO reserva (id, usuario_id, quadra_id, dia_semana, horario, status, criado_em)
     VALUES (@id, @usuario_id, @quadra_id, @dia_semana, @horario, @status, @criado_em)`
  ).run({ id, usuario_id, quadra_id, dia_semana, horario, status, criado_em });

  return buscarPorId(id);
}

/** Busca uma reserva pelo id. */
function buscarPorId(id) {
  return db.prepare(`SELECT * FROM reserva WHERE id = ?`).get(id);
}

/**
 * RNE-002 — apoio a regra de disponibilidade.
 * Indica se ja existe reserva ativa (status diferente de CANCELADO) para a
 * mesma combinacao quadra + dia_semana + horario.
 */
function existeConflito(quadraId, diaSemana, horario) {
  const linha = db
    .prepare(
      `SELECT COUNT(*) AS total
         FROM reserva
        WHERE quadra_id = ?
          AND dia_semana = ?
          AND horario = ?
          AND status <> 'CANCELADO'`
    )
    .get(quadraId, diaSemana, horario);

  return linha.total > 0;
}

/**
 * Lista as reservas de um usuario, com filtro opcional por status.
 * Traz dados da quadra e da arena para a tela de historico (RF-007).
 */
function listarPorUsuario(usuarioId, { status } = {}) {
  let sql = `
    SELECT r.*,
           q.tipo_esporte AS quadra_tipo_esporte,
           a.id           AS arena_id,
           a.nome         AS arena_nome,
           a.cidade       AS arena_cidade
      FROM reserva r
      JOIN quadra q ON q.id = r.quadra_id
      JOIN arena  a ON a.id = q.arena_id
     WHERE r.usuario_id = @usuario_id`;
  const params = { usuario_id: usuarioId };

  if (status) {
    sql += ` AND r.status = @status`;
    params.status = status;
  }

  sql += ` ORDER BY r.criado_em DESC`;
  return db.prepare(sql).all(params);
}

/** Atualiza o status de uma reserva. */
function atualizarStatus(id, status) {
  db.prepare(`UPDATE reserva SET status = ? WHERE id = ?`).run(status, id);
  return buscarPorId(id);
}

/** Remove todas as reservas (usado pelo seed idempotente). */
function limpar() {
  db.prepare(`DELETE FROM reserva`).run();
}

module.exports = {
  STATUS_VALIDOS,
  criar,
  buscarPorId,
  existeConflito,
  listarPorUsuario,
  atualizarStatus,
  limpar,
};
