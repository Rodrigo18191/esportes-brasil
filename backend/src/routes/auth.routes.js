/**
 * Camada de Apresentacao — rotas de autenticacao. Sem logica.
 */
const { Router } = require('express');
const authController = require('../controllers/auth.controller');

const router = Router();

// RF-001 — cadastro de usuario (publica)
router.post('/cadastro', authController.cadastro);

// RF-002 — login, devolve o JWT (publica)
router.post('/login', authController.login);

module.exports = router;
