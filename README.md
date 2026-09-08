# Esportes Brasil

Plataforma de agendamento de quadras esportivas e organização de partidas ("turmas") entre jogadores.

Projeto Integrador do curso de Engenharia de Software — UniEVANGÉLICA, Campus Anápolis.

---

## Estrutura do repositório

```
esportes-brasil/
├── index.html          redireciona para a tela de login
├── css/global.css      estilos globais das telas
├── js/app.js           componentes e dados de demonstração do protótipo
├── pages/              18 telas do aplicativo
└── backend/            API REST (Node.js + Express + SQLite)
```

O repositório reúne duas entregas independentes:

| Parte | O que é | Estado |
|---|---|---|
| **Frontend** (`index.html`, `css/`, `js/`, `pages/`) | Protótipo navegável das 18 telas | Dados de demonstração no próprio código |
| **Backend** (`backend/`) | API REST com banco, autenticação e regras de negócio | Implementado e validado |

As duas partes ainda **não estão integradas**: as telas não consomem a API. A integração é escopo de uma fase seguinte do projeto.

---

## Frontend — protótipo das telas

Abra `index.html` no navegador, ou sirva a pasta com qualquer servidor estático:

```bash
npx serve .
```

Na tela de login, use qualquer e-mail e senha — o protótipo não valida credenciais, porque ainda não conversa com a API. Os dados exibidos (arenas, turmas, avaliações) vêm do objeto `DB` em `js/app.js`.

---

## Backend — API REST

A API roda de forma independente do protótipo:

```bash
cd backend
npm install
npm run db:reset
npm run dev
```

Servidor em `http://localhost:3000`. Verificação rápida:

```bash
curl http://localhost:3000/api/health
# {"status":"ok"}
```

**Arquitetura monolítica em camadas**, conforme a especificação do projeto:

```
routes/ → controllers/ → rules/ → services/ → repositories/ → SQLite
```

Implementa as seis regras de negócio do sistema (RNE-001 a RNE-006) e os requisitos funcionais RF-001 a RF-007, com autenticação JWT, senhas em hash bcrypt (RNF-001) e SQL escrito à mão na camada de persistência.

Usuários de teste criados pelo seed — todos com a senha `senha123`:

| E-mail | Nome |
|---|---|
| `joao@teste.com` | Joao Pereira |
| `maria@teste.com` | Maria Clara |
| `carlos@teste.com` | Carlos Souza |

📖 **Documentação completa da API em [`backend/README.md`](backend/README.md)**: diagrama das camadas, mapeamento regra → arquivo, mapeamento requisito → endpoint e exemplos de request/response de todos os 14 endpoints.
