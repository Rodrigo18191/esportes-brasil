/**
 * Camada de Apresentacao — controller de autenticacao (RF-001, RF-002).
 *
 * Le `req`, valida o formato de entrada, chama o servico e monta a resposta.
 * Sem SQL e sem regra de negocio.
 */
const AppError = require('../utils/AppError');
const authService = require('../services/auth.service');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** POST /api/auth/cadastro */
async function cadastro(req, res, next) {
  try {
    const { nome, email, celular, senha } = req.body || {};

    if (!nome || String(nome).trim() === '') {
      throw new AppError('O campo "nome" e obrigatorio.', 400);
    }
    if (!email || !EMAIL_REGEX.test(String(email))) {
      throw new AppError('Informe um e-mail valido.', 400);
    }
    if (!senha || String(senha).length < 6) {
      throw new AppError('A senha deve ter ao menos 6 caracteres.', 400);
    }

    const usuario = await authService.cadastrar({
      nome: String(nome).trim(),
      email: String(email).trim().toLowerCase(),
      celular: celular ? String(celular).trim() : null,
      senha: String(senha),
    });

    return res.status(201).json(usuario);
  } catch (erro) {
    return next(erro);
  }
}

/** POST /api/auth/login */
async function login(req, res, next) {
  try {
    const { email, senha } = req.body || {};

    if (!email || !senha) {
      throw new AppError('Informe e-mail e senha.', 400);
    }

    const resultado = await authService.login({
      email: String(email).trim().toLowerCase(),
      senha: String(senha),
    });

    return res.status(200).json(resultado);
  } catch (erro) {
    return next(erro);
  }
}

module.exports = { cadastro, login };
