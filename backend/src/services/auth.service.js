/**
 * Camada de Servicos — Autenticacao (RF-001, RF-002).
 *
 * Orquestra cadastro e login: hash de senha (RNF-001), emissao de JWT e
 * chamadas ao repositorio de usuarios. Nao contem SQL.
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const env = require('../config/env');
const AppError = require('../utils/AppError');
const { uuid, agoraISO } = require('../utils/uuid');
const usuarioRepository = require('../repositories/usuario.repository');
const notificacaoService = require('./notificacao.service');

/**
 * RF-001 — Cadastra um novo usuario.
 * A senha nunca e persistida em texto puro: e gravada como hash bcrypt.
 * E-mail duplicado -> HTTP 409.
 */
async function cadastrar({ nome, email, celular, senha }) {
  if (usuarioRepository.existeEmail(email)) {
    throw new AppError('Ja existe um usuario cadastrado com este e-mail.', 409);
  }

  const senha_hash = await bcrypt.hash(senha, env.BCRYPT_ROUNDS);

  const usuario = usuarioRepository.criar({
    id: uuid(),
    nome,
    email,
    celular: celular || null,
    senha_hash,
    criado_em: agoraISO(),
  });

  notificacaoService.notificar(
    usuario.id,
    `Bem-vindo ao Esportes Brasil, ${usuario.nome}!`
  );

  // Retorno enxuto: `senha_hash` nunca sai do backend.
  return { id: usuario.id, nome: usuario.nome, email: usuario.email };
}

/**
 * RF-002 — Autentica o usuario e devolve um JWT.
 * Credencial invalida -> HTTP 401 com mensagem generica, para nao revelar se o
 * e-mail existe na base.
 */
async function login({ email, senha }) {
  const CREDENCIAL_INVALIDA = 'E-mail ou senha invalidos.';

  const usuario = usuarioRepository.buscarPorEmail(email);
  if (!usuario) {
    throw new AppError(CREDENCIAL_INVALIDA, 401);
  }

  const senhaConfere = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaConfere) {
    throw new AppError(CREDENCIAL_INVALIDA, 401);
  }

  const token = jwt.sign(
    { sub: usuario.id, email: usuario.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return {
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  };
}

module.exports = { cadastrar, login };
