/**
 * Montagem da aplicacao Express (camada de Apresentacao).
 *
 * Ordem: middlewares globais -> rotas (/api) -> 404 -> tratador de erros.
 */
const path = require('path');
const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const { naoEncontrado, tratarErros } = require('./middlewares/error.middleware');

const app = express();

// CORS liberado para clientes hospedados em outros dominios (GitHub Pages,
// futura aplicacao Flutter).
app.use(cors());
app.use(express.json());

app.use('/api', routes);

// Frontend web: o mesmo servidor entrega as telas, de modo que telas e API
// ficam na mesma origem (http://localhost:PORT). Apenas as pastas do frontend
// sao expostas — o codigo do backend, o .env e o banco nunca sao servidos.
const raiz = path.resolve(__dirname, '..', '..');
app.use('/css', express.static(path.join(raiz, 'css')));
app.use('/js', express.static(path.join(raiz, 'js')));
app.use('/pages', express.static(path.join(raiz, 'pages')));
app.get('/', (req, res) => res.sendFile(path.join(raiz, 'index.html')));

app.use(naoEncontrado);
app.use(tratarErros);

module.exports = app;
