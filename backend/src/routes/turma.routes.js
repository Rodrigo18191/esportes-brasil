/**
 * Camada de Apresentacao — rotas de turmas (RF-005, RF-006). Sem logica.
 *
 * A listagem publica de turmas dispensa token; criar turma, ver as proprias
 * turmas e participar exigem JWT valido (RNE-001).
 */
const { Router } = require('express');
const { autenticar } = require('../middlewares/auth.middleware');
const turmaController = require('../controllers/turma.controller');

const router = Router();

router.get('/', turmaController.listar);
router.get('/minhas', autenticar, turmaController.listarMinhas);
router.get('/:id', autenticar, turmaController.detalhar);
router.post('/', autenticar, turmaController.criar);
router.post('/:id/participar', autenticar, turmaController.participar);

module.exports = router;
