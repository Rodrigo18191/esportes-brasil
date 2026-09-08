/**
 * Ponto de entrada do backend do Esportes Brasil.
 * Uso: npm start (producao) ou npm run dev (nodemon).
 */
const app = require('./app');
const env = require('./config/env');

app.listen(env.PORT, () => {
  console.log('==================================================');
  console.log(' Esportes Brasil — API');
  console.log(` Servidor: http://localhost:${env.PORT}`);
  console.log(` Health:   http://localhost:${env.PORT}/api/health`);
  console.log(` Banco:    ${env.DB_PATH}`);
  console.log('==================================================');
});
