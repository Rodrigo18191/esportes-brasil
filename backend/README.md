# Backend — Esportes Brasil

API REST que sustenta o agendamento de quadras esportivas e a organização de turmas do aplicativo Esportes Brasil (Projeto Integrador — Engenharia de Software, UniEVANGÉLICA, Campus Anápolis).

---

## 1. Stack

| Item | Escolha |
|---|---|
| Runtime | Node.js >= 18 (CommonJS) |
| Framework HTTP | Express 4 |
| Banco de dados | SQLite via `better-sqlite3` (SQL escrito à mão) |
| Hash de senha | `bcrypt` (RNF-001) |
| Autenticação | `jsonwebtoken` (JWT) |
| CORS | `cors` |
| Dev | `nodemon` |

Sem TypeScript, sem ORM, sem Docker, sem banco externo.

---

## 2. Como rodar

```bash
cd backend
npm install       # instala as dependências
npm run db:reset  # cria as tabelas (migrate) e popula com dados de teste (seed)
npm run dev       # sobe o servidor com nodemon em http://localhost:3000
```

Para produção use `npm start`. O arquivo `.env` é opcional — copie de `.env.example` se quiser trocar porta, segredo do JWT ou caminho do banco:

```bash
cp .env.example .env
```

Scripts disponíveis:

| Script | O que faz |
|---|---|
| `npm start` | Sobe o servidor |
| `npm run dev` | Sobe o servidor com recarga automática (nodemon) |
| `npm run db:migrate` | Recria as tabelas a partir de `src/database/schema.sql` |
| `npm run db:seed` | Popula o banco (idempotente: limpa antes de inserir) |
| `npm run db:reset` | `db:migrate` seguido de `db:seed` |

Verificação rápida:

```bash
curl http://localhost:3000/api/health
# {"status":"ok"}
```

---

## 3. Arquitetura em camadas

O sistema é um **monolito em camadas**, conforme a especificação do projeto. Uma requisição atravessa as camadas sempre nesta ordem — `rules/` **antes** de `services/`, porque a camada de Serviços é intermediária entre as regras de negócio e o acesso aos dados:

```
                          HTTP (cliente web / Flutter)
                                     |
                                     v
+----------------------------------------------------------------------------+
|  APRESENTAÇÃO                                                              |
|                                                                            |
|   routes/  ------------------->  controllers/                              |
|   define endpoints e             lê req, orquestra a chamada,              |
|   aplica middlewares             monta a resposta HTTP                     |
|                                                                            |
|   middlewares/auth.middleware.js   (RNE-001 / RNE-005 — valida o JWT)      |
|   middlewares/error.middleware.js  (formato único de erro)                 |
+----------------------------------------------------------------------------+
                                     |
                                     v
+----------------------------------------------------------------------------+
|  REGRAS DE NEGÓCIO                                                         |
|                                                                            |
|   rules/   funções de validação. Consultam repositories para checar        |
|            estado e lançam AppError(status, RNE-XXX) quando violadas.      |
|            RNE-002 · RNE-003 · RNE-004 · RNE-005 · RNE-006                 |
+----------------------------------------------------------------------------+
                                     |
                                     v
+----------------------------------------------------------------------------+
|  SERVIÇOS                                                                  |
|                                                                            |
|   services/  orquestram a operação: montam a entidade, chamam um ou mais   |
|              repositories, disparam notificação. Sem SQL.                  |
+----------------------------------------------------------------------------+
                                     |
                                     v
+----------------------------------------------------------------------------+
|  PERSISTÊNCIA                                                              |
|                                                                            |
|   repositories/  único lugar com SQL (criar, buscarPorId, listar,          |
|                  existeConflito, ...)                                      |
|   database/connection.js  handle único do SQLite (PRAGMA foreign_keys=ON)  |
+----------------------------------------------------------------------------+
                                     |
                                     v
                              SQLite (arquivo .db)
```

Fluxo resumido de uma requisição:

```
routes/ -> controllers/ -> rules/ -> services/ -> repositories/ -> SQLite
```

Estrutura de pastas:

```
backend/
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── src/
    ├── server.js              ponto de entrada
    ├── app.js                 montagem do Express
    ├── config/env.js          variáveis de ambiente
    ├── routes/                endpoints (sem lógica)
    ├── controllers/           entrada/saída HTTP
    ├── rules/                 regras de negócio (RNE-XXX)
    ├── services/              orquestração
    ├── repositories/          SQL
    ├── database/              conexão, schema.sql, migrate, seed
    ├── middlewares/           auth (JWT) e tratamento de erros
    └── utils/                 AppError, uuid
```

---

## 4. Mapeamento regra de negócio → arquivo

| Regra | Enunciado | Arquivo | Função | HTTP na violação |
|---|---|---|---|---|
| **RNE-001** | Um usuário só pode realizar uma reserva se estiver autenticado | `src/middlewares/auth.middleware.js` | `autenticar` | `401` |
| **RNE-002** | Apenas horários disponíveis podem ser reservados | `src/rules/reserva.rules.js` | `validarDisponibilidade` (apoio: `reserva.repository.existeConflito`) | `409` |
| **RNE-003** | Uma turma deve ter no mínimo dois participantes para ser criada | `src/rules/turma.rules.js` | `validarMinimoParticipantes` | `400` |
| **RNE-004** | Um usuário só pode entrar em uma turma se houver vagas disponíveis | `src/rules/turma.rules.js` | `validarVagasDisponiveis` | `409` |
| **RNE-005** | A avaliação de uma quadra só pode ser realizada por usuários autenticados | `src/middlewares/auth.middleware.js` (`autenticarAvaliacao`) + `src/rules/avaliacao.rules.js` | `validarAvaliacao` | `401` / `400` / `404` |
| **RNE-006** | Uma turma só fica visível após ser criada com pelo menos um esporte e um horário definido | `src/rules/turma.rules.js` (criação) + `src/repositories/turma.repository.js` (`listarVisiveis`, na listagem) | `validarVisibilidade` | `400` |

---

## 5. Mapeamento requisito funcional → endpoint

| RF | Requisito | Endpoint(s) |
|---|---|---|
| **RF-001** | Cadastro de usuário | `POST /api/auth/cadastro` |
| **RF-002** | Autenticação (login) | `POST /api/auth/login` |
| **RF-003** | Consulta de arenas e quadras / avaliação | `GET /api/arenas`, `GET /api/arenas/:id`, `GET /api/arenas/:id/quadras`, `POST /api/avaliacoes` |
| **RF-004** | Realizar agendamento | `POST /api/reservas` |
| **RF-005** | Criar turma esportiva | `POST /api/turmas`, `GET /api/turmas/minhas` |
| **RF-006** | Encontrar e participar de turma | `GET /api/turmas`, `POST /api/turmas/:id/participar` |
| **RF-007** | Histórico e gestão da agenda | `GET /api/reservas/minhas`, `PATCH /api/reservas/:id/cancelar` |

---

## 6. Endpoints

Prefixo de todas as rotas: `/api`. Rotas autenticadas exigem o header
`Authorization: Bearer <token>`.

| Método | Rota | Auth | RF |
|---|---|---|---|
| GET | `/api/health` | não | — |
| POST | `/api/auth/cadastro` | não | RF-001 |
| POST | `/api/auth/login` | não | RF-002 |
| GET | `/api/arenas` | não | RF-003 |
| GET | `/api/arenas/:id` | não | RF-003 |
| GET | `/api/arenas/:id/quadras` | não | RF-003 |
| POST | `/api/reservas` | **sim** | RF-004 |
| GET | `/api/reservas/minhas` | **sim** | RF-007 |
| PATCH | `/api/reservas/:id/cancelar` | **sim** | RF-007 |
| POST | `/api/turmas` | **sim** | RF-005 |
| GET | `/api/turmas` | não | RF-006 |
| GET | `/api/turmas/minhas` | **sim** | RF-005 |
| POST | `/api/turmas/:id/participar` | **sim** | RF-006 |
| POST | `/api/avaliacoes` | **sim** | — |

### Padrão de erro

Toda resposta de erro tem o mesmo formato, produzido por `error.middleware.js`.
O campo `regra` aparece quando o erro nasce de uma violação de regra de negócio:

```json
{ "erro": true, "mensagem": "Turma lotada.", "regra": "RNE-004" }
```

---

### `GET /api/health`

```bash
curl http://localhost:3000/api/health
```

```json
{ "status": "ok" }
```

---

### `POST /api/auth/cadastro` — RF-001

```bash
curl -X POST http://localhost:3000/api/auth/cadastro \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ana Souza","email":"ana@teste.com","celular":"(62) 99444-4444","senha":"senha123"}'
```

`201 Created` — `senha_hash` nunca é retornado:

```json
{
  "id": "8b19a9d9-913f-4669-b0fc-a098df886e42",
  "nome": "Ana Souza",
  "email": "ana@teste.com"
}
```

E-mail já cadastrado → `409`:

```json
{ "erro": true, "mensagem": "Ja existe um usuario cadastrado com este e-mail." }
```

---

### `POST /api/auth/login` — RF-002

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@teste.com","senha":"senha123"}'
```

`200 OK`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "b9ac5955-6b08-499f-9448-a56cd10344b0",
    "nome": "Joao Pereira",
    "email": "joao@teste.com"
  }
}
```

Credencial inválida → `401` com mensagem genérica (não revela se o e-mail existe):

```json
{ "erro": true, "mensagem": "E-mail ou senha invalidos." }
```

---

### `GET /api/arenas` — RF-003

Filtros opcionais: `?regiao=` e `?cidade=`.

```bash
curl "http://localhost:3000/api/arenas?cidade=Anapolis"
```

`200 OK`:

```json
[
  {
    "id": "ea07e3bd-2256-4961-8ac4-ee295d668177",
    "nome": "FUTBAR",
    "regiao": "JUNDIAI",
    "cidade": "Anapolis",
    "avaliacao_media": 2.5
  },
  {
    "id": "3be9e0b8-a87f-4083-959d-9e17413694b3",
    "nome": "SIX SPORTS",
    "regiao": "CENTRO",
    "cidade": "Anapolis",
    "avaliacao_media": 3.67
  }
]
```

---

### `GET /api/arenas/:id` — RF-003

```bash
curl http://localhost:3000/api/arenas/3be9e0b8-a87f-4083-959d-9e17413694b3
```

`200 OK`:

```json
{
  "id": "3be9e0b8-a87f-4083-959d-9e17413694b3",
  "nome": "SIX SPORTS",
  "regiao": "CENTRO",
  "cidade": "Anapolis",
  "avaliacao_media": 3.67,
  "total_quadras": 3
}
```

Arena inexistente → `404`.

---

### `GET /api/arenas/:id/quadras` — RF-003

```bash
curl http://localhost:3000/api/arenas/ea07e3bd-2256-4961-8ac4-ee295d668177/quadras
```

`200 OK` — `horarios_disponiveis` volta como array já desserializado:

```json
[
  {
    "id": "74a2c4fc-bbd0-4996-b24a-1ee3459d6415",
    "arena_id": "ea07e3bd-2256-4961-8ac4-ee295d668177",
    "tipo_esporte": "FUTSAL",
    "horarios_disponiveis": ["18:00", "19:00", "20:00", "21:00"]
  }
]
```

---

### `POST /api/reservas` — RF-004 · RNE-001 · RNE-002

O `usuario_id` vem do token, **nunca** do corpo da requisição.
`dia_semana`: `SEGUNDA`, `TERCA`, `QUARTA`, `QUINTA`, `SEXTA`, `SABADO`, `DOMINGO`.

```bash
curl -X POST http://localhost:3000/api/reservas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"quadra_id":"74a2c4fc-bbd0-4996-b24a-1ee3459d6415","dia_semana":"SABADO","horario":"19:00"}'
```

`201 Created`:

```json
{
  "id": "012ece33-0e24-4e37-b86b-9237ce5f48dc",
  "usuario_id": "b9ac5955-6b08-499f-9448-a56cd10344b0",
  "quadra_id": "74a2c4fc-bbd0-4996-b24a-1ee3459d6415",
  "dia_semana": "SABADO",
  "horario": "19:00",
  "status": "AGENDADO",
  "criado_em": "2026-09-08T02:08:09.670Z"
}
```

Sem token → `401` (RNE-001):

```json
{
  "erro": true,
  "mensagem": "Token de autenticacao nao informado. Faca login para continuar.",
  "regra": "RNE-001"
}
```

Horário já reservado ou fora de `horarios_disponiveis` → `409` (RNE-002):

```json
{
  "erro": true,
  "mensagem": "Ja existe uma reserva para esta quadra em SABADO as 19:00.",
  "regra": "RNE-002"
}
```

---

### `GET /api/reservas/minhas` — RF-007

Filtro opcional `?status=` (`SOLICITADO`, `AGENDADO`, `CANCELADO`, `REALIZADO`),
os mesmos filtros da tela "Minha Agenda".

```bash
curl "http://localhost:3000/api/reservas/minhas?status=AGENDADO" \
  -H "Authorization: Bearer $TOKEN"
```

`200 OK` — traz também os dados da quadra e da arena:

```json
[
  {
    "id": "3072d49b-ab50-406d-aa2b-682db33ed459",
    "usuario_id": "b9ac5955-6b08-499f-9448-a56cd10344b0",
    "quadra_id": "b0761784-8587-4b95-bbff-2d699e57a076",
    "dia_semana": "SEGUNDA",
    "horario": "19:00",
    "status": "AGENDADO",
    "criado_em": "2026-09-08T02:07:13.693Z",
    "quadra_tipo_esporte": "FUTSAL",
    "arena_id": "3be9e0b8-a87f-4083-959d-9e17413694b3",
    "arena_nome": "SIX SPORTS",
    "arena_cidade": "Anapolis"
  }
]
```

---

### `PATCH /api/reservas/:id/cancelar` — RF-007

Só cancela reservas do próprio usuário autenticado.

```bash
curl -X PATCH http://localhost:3000/api/reservas/012ece33-0e24-4e37-b86b-9237ce5f48dc/cancelar \
  -H "Authorization: Bearer $TOKEN"
```

`200 OK`:

```json
{
  "id": "012ece33-0e24-4e37-b86b-9237ce5f48dc",
  "usuario_id": "b9ac5955-6b08-499f-9448-a56cd10344b0",
  "quadra_id": "74a2c4fc-bbd0-4996-b24a-1ee3459d6415",
  "dia_semana": "SABADO",
  "horario": "19:00",
  "status": "CANCELADO",
  "criado_em": "2026-09-08T02:08:09.670Z"
}
```

Reserva de outro usuário → `403`. Reserva inexistente → `404`.

---

### `POST /api/turmas` — RF-005 · RNE-003 · RNE-006

O criador entra automaticamente como primeiro participante, então
`vagas_preenchidas` começa em 1.

```bash
curl -X POST http://localhost:3000/api/turmas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nome":"Volei de sabado","esporte":"VOLEI","horario":"15:00","vagas_total":6}'
```

`201 Created`:

```json
{
  "id": "3fbd1f11-1200-43c0-9796-e145e5621815",
  "criador_id": "b9ac5955-6b08-499f-9448-a56cd10344b0",
  "nome": "Volei de sabado",
  "esporte": "VOLEI",
  "horario": "15:00",
  "vagas_total": 6,
  "vagas_preenchidas": 1,
  "criado_em": "2026-09-08T02:08:09.680Z",
  "participantes": [
    { "id": "b9ac5955-...", "nome": "Joao Pereira", "email": "joao@teste.com" }
  ]
}
```

`vagas_total: 1` → `400` (RNE-003):

```json
{
  "erro": true,
  "mensagem": "Uma turma deve ter no minimo dois participantes.",
  "regra": "RNE-003"
}
```

`esporte: ""` ou `horario: ""` → `400` (RNE-006):

```json
{
  "erro": true,
  "mensagem": "A turma precisa ter um esporte definido para ficar visivel.",
  "regra": "RNE-006"
}
```

---

### `GET /api/turmas` — RF-006 · RNE-006

Filtro opcional `?esporte=`. A consulta descarta turmas sem `esporte` ou sem
`horario` definidos (RNE-006).

```bash
curl "http://localhost:3000/api/turmas?esporte=FUTSAL"
```

`200 OK`:

```json
[
  {
    "id": "c1ccbabb-4395-4b63-b10a-5f2527ccc5dc",
    "criador_id": "b9ac5955-6b08-499f-9448-a56cd10344b0",
    "nome": "Pelada de quinta",
    "esporte": "FUTSAL",
    "horario": "20:00",
    "vagas_total": 10,
    "vagas_preenchidas": 2,
    "criado_em": "2026-09-08T02:07:13.694Z",
    "criador_nome": "Joao Pereira"
  }
]
```

---

### `GET /api/turmas/minhas` — RF-005

Turmas que o usuário criou **ou** das quais participa.

```bash
curl http://localhost:3000/api/turmas/minhas -H "Authorization: Bearer $TOKEN"
```

`200 OK`: lista no mesmo formato de `GET /api/turmas`.

---

### `POST /api/turmas/:id/participar` — RF-006 · RNE-004

```bash
curl -X POST http://localhost:3000/api/turmas/3fbd1f11-1200-43c0-9796-e145e5621815/participar \
  -H "Authorization: Bearer $TOKEN"
```

`200 OK`:

```json
{
  "id": "3fbd1f11-1200-43c0-9796-e145e5621815",
  "nome": "Volei de sabado",
  "esporte": "VOLEI",
  "horario": "15:00",
  "vagas_total": 6,
  "vagas_preenchidas": 2,
  "participantes": [
    { "id": "ded99a79-...", "nome": "Carlos Souza", "email": "carlos@teste.com" },
    { "id": "b9ac5955-...", "nome": "Joao Pereira", "email": "joao@teste.com" }
  ]
}
```

Turma lotada → `409` (RNE-004):

```json
{ "erro": true, "mensagem": "Turma lotada.", "regra": "RNE-004" }
```

Usuário já participante → `409` com `"Usuario ja participa desta turma."`

---

### `POST /api/avaliacoes` — RF-003 · RNE-005

Notas válidas: `MUITO_BOM`, `BOM`, `MEDIO`, `RUIM` — as quatro opções do
dropdown da tela de avaliação. Após inserir, o serviço recalcula a
`avaliacao_media` da arena (MUITO_BOM=4, BOM=3, MEDIO=2, RUIM=1).

```bash
curl -X POST http://localhost:3000/api/avaliacoes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"arena_id":"ea07e3bd-2256-4961-8ac4-ee295d668177","nota":"MUITO_BOM"}'
```

`201 Created` — devolve a avaliação e a arena com a média já atualizada:

```json
{
  "avaliacao": {
    "id": "157fb740-9973-4124-b92b-b7efdbdc431e",
    "usuario_id": "b9ac5955-6b08-499f-9448-a56cd10344b0",
    "arena_id": "ea07e3bd-2256-4961-8ac4-ee295d668177",
    "nota": "MUITO_BOM",
    "criado_em": "2026-09-08T02:08:09.691Z"
  },
  "arena": {
    "id": "ea07e3bd-2256-4961-8ac4-ee295d668177",
    "nome": "FUTBAR",
    "regiao": "JUNDIAI",
    "cidade": "Anapolis",
    "avaliacao_media": 3
  }
}
```

Sem token → `401` (RNE-005). Nota fora da lista → `400` (RNE-005).
Arena inexistente → `404` (RNE-005).

---

## 7. Modelo de dados

Espelha o diagrama ER da especificação. Todos os `id` são UUID em `TEXT`,
gerados com `crypto.randomUUID()`. `PRAGMA foreign_keys = ON` é ativado na
conexão.

| Tabela | Colunas |
|---|---|
| `usuario` | `id`, `nome`, `email` (único), `celular`, `senha_hash`, `criado_em` |
| `arena` | `id`, `nome`, `regiao`, `cidade`, `avaliacao_media` |
| `quadra` | `id`, `arena_id` → `arena`, `tipo_esporte`, `horarios_disponiveis` (JSON) |
| `reserva` | `id`, `usuario_id` → `usuario`, `quadra_id` → `quadra`, `dia_semana`, `horario`, `status`, `criado_em` |
| `turma` | `id`, `criador_id` → `usuario`, `nome`, `esporte`, `horario`, `vagas_total`, `vagas_preenchidas`, `criado_em` |
| `turma_participante` | `turma_id` + `usuario_id` (PK composta — impede entrada dupla) |
| `avaliacao` | `id`, `usuario_id` → `usuario`, `arena_id` → `arena`, `nota`, `criado_em` |

Domínios: `reserva.status` ∈ {`SOLICITADO`, `AGENDADO`, `CANCELADO`, `REALIZADO`};
`avaliacao.nota` ∈ {`MUITO_BOM`, `BOM`, `MEDIO`, `RUIM`}.

---

## 8. Credenciais dos usuários de seed

Todos com a mesma senha, para facilitar os testes:

| Nome | E-mail | Senha |
|---|---|---|
| Joao Pereira | `joao@teste.com` | `senha123` |
| Maria Clara | `maria@teste.com` | `senha123` |
| Carlos Souza | `carlos@teste.com` | `senha123` |

O seed também cria 4 arenas (Anápolis e Goiânia), 10 quadras, 6 reservas em
status variados, 8 avaliações e **duas turmas**: `Pelada de quinta` (2/10 vagas,
com vaga sobrando) e `Dupla de beach tennis` (2/2 vagas, **lotada** — serve para
demonstrar a RNE-004 retornando `409`).

Exemplo de login rápido:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@teste.com","senha":"senha123"}' | jq -r .token)
```
