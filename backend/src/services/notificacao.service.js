/**
 * Camada de Servicos — Notificacoes.
 *
 * Servico de apoio usado pelos demais servicos para avisar o usuario sobre
 * eventos do sistema (reserva criada, entrada em turma, etc.), alimentando a
 * tela de Notificacoes do aplicativo.
 *
 * Nesta fase o canal de entrega e o log do servidor: nao ha integracao com
 * push/e-mail no escopo da entrega. As mensagens ficam tambem em memoria para
 * facilitar a inspecao durante os testes.
 */
const historico = [];

/**
 * Registra uma notificacao destinada a um usuario.
 * @param {string} usuarioId destinatario
 * @param {string} mensagem  texto da notificacao
 */
function notificar(usuarioId, mensagem) {
  const notificacao = {
    usuario_id: usuarioId,
    mensagem,
    criado_em: new Date().toISOString(),
  };

  historico.push(notificacao);
  console.log(`[notificacao] usuario=${usuarioId} :: ${mensagem}`);

  return notificacao;
}

/** Lista as notificacoes registradas para um usuario. */
function listarPorUsuario(usuarioId) {
  return historico.filter((n) => n.usuario_id === usuarioId);
}

module.exports = { notificar, listarPorUsuario };
