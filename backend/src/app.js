/**
 * Montagem da aplicacao Express (camada de Apresentacao).
 *
 * Ordem: middlewares globais -> rotas (/api) -> 404 -> tratador de erros.
 */
const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const { naoEncontrado, tratarErros } = require('./middlewares/error.middleware');

const app = express();

// CORS liberado para permitir o consumo futuro por outros clientes (web/Flutter).
app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use(naoEncontrado);
app.use(tratarErros);

module.exports = app;
