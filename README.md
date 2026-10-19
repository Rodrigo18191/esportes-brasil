# Esportes Brasil

Plataforma de agendamento de quadras esportivas e organização de partidas ("turmas") entre jogadores.

Projeto Integrador do curso de Engenharia de Software — UniEVANGÉLICA, Campus Anápolis.

---

## Como rodar

O backend entrega as telas e a API no mesmo endereço:

```bash
cd backend
npm install
npm run db:reset   # cria o banco SQLite e popula com dados de teste
npm start
```

Abra **http://localhost:3000** e entre com um dos usuários de teste abaixo (ou crie uma conta na tela de cadastro).

| E-mail | Nome | Senha |
|---|---|---|
| `joao@teste.com` | Joao Pereira | `senha123` |
| `maria@teste.com` | Maria Clara | `senha123` |
| `carlos@teste.com` | Carlos Souza | `senha123` |

---

## Estrutura do repositório

```
esportes-brasil/
├── index.html          redireciona para a tela de login
├── css/global.css      estilos globais das telas
├── js/api.js           cliente da API: requisições, token JWT e sessão
├── js/app.js           componentes visuais compartilhados
├── pages/              18 telas do aplicativo
└── backend/            API REST (Node.js + Express + SQLite) que também serve as telas
```

---

## Integração frontend ↔ backend

As telas consomem a API por meio de `js/api.js`, que usa `fetch`, envia o token JWT no cabeçalho `Authorization: Bearer <token>` e converte as respostas de erro da API em mensagens para o usuário — quando o erro vem de uma regra de negócio, a mensagem mostra o código da regra (ex.: `RNE-004`).

| Tela | Endpoint(s) | Requisito / regra |
|---|---|---|
| Cadastro | `POST /api/auth/cadastro` + `POST /api/auth/login` | RF-001 |
| Login | `POST /api/auth/login` (token salvo no navegador) | RF-002 |
| Localização de Quadras | filtro por cidade → `GET /api/arenas?cidade=` | RF-003 |
| Agendamentos / Avaliação de Quadras (listas de arenas) | `GET /api/arenas` | RF-003 |
| Realizar Agendamento | `GET /api/arenas/:id`, `GET /api/arenas/:id/quadras`, `POST /api/reservas` | RF-004 · RNE-001 · RNE-002 |
| Minha Agenda | `GET /api/reservas/minhas?status=`, `PATCH /api/reservas/:id/cancelar` | RF-007 |
| Criar Turma | `POST /api/turmas` | RF-005 · RNE-003 · RNE-006 |
| Encontrar Turma | `GET /api/turmas?esporte=`, `POST /api/turmas/:id/participar` | RF-006 · RNE-004 |
| Minha Turma | `GET /api/turmas/minhas`, `GET /api/turmas/:id` | RF-005 |
| Realizar Avaliação | `POST /api/avaliacoes` | RF-003 · RNE-005 |
| Notificações | `GET /api/notificacoes` | — |
| Configurações → Sair | apaga o token do navegador | — |

Telas internas sem token redirecionam para o login, e um token expirado ou inválido (`401`) encerra a sessão. Recuperação de senha, código OTP, pagamentos, ajuda e chat continuam apenas visuais.

Se o frontend for aberto fora do backend (GitHub Pages ou arquivo local), `js/api.js` aponta para `http://localhost:3000/api`; para outro endereço, defina `window.ESPORTES_API` antes de carregar o script.

---

## Backend — API REST

**Arquitetura monolítica em camadas**, conforme a especificação do projeto:

```
routes/ → controllers/ → rules/ → services/ → repositories/ → SQLite
```

Implementa as seis regras de negócio do sistema (RNE-001 a RNE-006) e os requisitos funcionais RF-001 a RF-007, com autenticação JWT, senhas em hash bcrypt (RNF-001) e SQL escrito à mão na camada de persistência.

📖 **Documentação completa da API em [`backend/README.md`](backend/README.md)**: diagrama das camadas, mapeamento regra → arquivo, mapeamento requisito → endpoint e exemplos de request/response de todos os 16 endpoints.
