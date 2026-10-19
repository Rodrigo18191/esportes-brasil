/**
 * Camada de Apresentacao — agregador de rotas.
 * Todas as rotas da API vivem sob o prefixo `/api`.
 */
const { Router } = require('express');

const authRoutes = require('./auth.routes');
const arenaRoutes = require('./arena.routes');
const reservaRoutes = require('./reserva.routes');
const turmaRoutes = require('./turma.routes');
const avaliacaoRoutes = require('./avaliacao.routes');
const notificacaoRoutes = require('./notificacao.routes');

const router = Router();

/** Verificacao de saude do servico. */
router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

router.use('/auth', authRoutes);
router.use('/arenas', arenaRoutes);
router.use('/reservas', reservaRoutes);
router.use('/turmas', turmaRoutes);
router.use('/avaliacoes', avaliacaoRoutes);
router.use('/notificacoes', notificacaoRoutes);

module.exports = router;
