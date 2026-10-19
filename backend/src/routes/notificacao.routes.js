/**
 * Camada de Apresentacao — rotas de notificacoes. Sem logica.
 *
 * Cada usuario so enxerga as proprias notificacoes, por isso a rota exige JWT.
 */
const { Router } = require('express');
const { autenticar } = require('../middlewares/auth.middleware');
const notificacaoController = require('../controllers/notificacao.controller');

const router = Router();

router.get('/', autenticar, notificacaoController.listarMinhas);

module.exports = router;
