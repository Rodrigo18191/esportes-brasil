/**
 * Configuracao central do backend.
 * Le as variaveis de ambiente (arquivo .env, quando existir) e expoe valores
 * padrao seguros para o ambiente de desenvolvimento/avaliacao.
 */
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const env = {
  PORT: Number(process.env.PORT || 3000),
  JWT_SECRET: process.env.JWT_SECRET || 'esportes-brasil-segredo-dev',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB_PATH: path.resolve(
    __dirname,
    '..',
    '..',
    process.env.DB_PATH || './esportes-brasil.db'
  ),
  BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS || 10),
};

module.exports = env;
