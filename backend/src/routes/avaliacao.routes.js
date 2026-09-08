/**
 * Camada de Apresentacao — rotas de avaliacao. Sem logica.
 *
 * RNE-005 — avaliar uma arena exige usuario autenticado.
 */
const { Router } = require('express');
const { autenticarAvaliacao } = require('../middlewares/auth.middleware');
const avaliacaoController = require('../controllers/avaliacao.controller');

const router = Router();

router.post('/', autenticarAvaliacao, avaliacaoController.criar);

module.exports = router;
