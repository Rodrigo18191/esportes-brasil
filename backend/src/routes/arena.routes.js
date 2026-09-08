/**
 * Camada de Apresentacao — rotas de arenas (RF-003). Sem logica.
 * Todas publicas: consultar arenas nao exige autenticacao.
 */
const { Router } = require('express');
const arenaController = require('../controllers/arena.controller');

const router = Router();

router.get('/', arenaController.listar);
router.get('/:id', arenaController.detalhar);
router.get('/:id/quadras', arenaController.listarQuadras);

module.exports = router;
