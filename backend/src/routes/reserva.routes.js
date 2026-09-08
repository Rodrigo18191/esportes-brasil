/**
 * Camada de Apresentacao — rotas de reservas (RF-004, RF-007). Sem logica.
 *
 * RNE-001 — todas as rotas exigem JWT valido (`autenticar`).
 */
const { Router } = require('express');
const { autenticar } = require('../middlewares/auth.middleware');
const reservaController = require('../controllers/reserva.controller');

const router = Router();

router.post('/', autenticar, reservaController.criar);
router.get('/minhas', autenticar, reservaController.listarMinhas);
router.patch('/:id/cancelar', autenticar, reservaController.cancelar);

module.exports = router;
