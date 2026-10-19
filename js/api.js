// Cliente da API REST do Esportes Brasil.
//
// Todas as telas falam com o backend por aqui: este arquivo monta a URL,
// envia o token JWT no cabeçalho Authorization e converte as respostas de
// erro da API ({ erro, mensagem, regra }) em exceções com a mensagem pronta
// para exibir ao usuário.

// Quando as telas são servidas pelo próprio backend (npm start), a API está
// na mesma origem. Abrindo os arquivos direto (file://) ou pelo GitHub Pages,
// aponta para o backend local — ou para window.ESPORTES_API, se definido.
const API_URL = window.ESPORTES_API || (
  location.protocol === 'file:' || location.hostname.endsWith('github.io')
    ? 'http://localhost:3000/api'
    : '/api'
);

const SESSAO = {
  token: () => localStorage.getItem('eb_token'),
  usuario: () => JSON.parse(localStorage.getItem('eb_usuario') || 'null'),
  salvar(token, usuario) {
    localStorage.setItem('eb_token', token);
    localStorage.setItem('eb_usuario', JSON.stringify(usuario));
  },
  limpar() {
    localStorage.removeItem('eb_token');
    localStorage.removeItem('eb_usuario');
  },
};

class ErroApi extends Error {
  constructor(status, corpo) {
    super(corpo && corpo.mensagem ? corpo.mensagem : 'Não foi possível concluir a operação.');
    this.status = status;
    this.regra = corpo && corpo.regra;
  }
}

async function api(metodo, caminho, corpo) {
  const headers = { 'Content-Type': 'application/json' };
  const token = SESSAO.token();
  if (token) headers.Authorization = `Bearer ${token}`;

  let resp;
  try {
    resp = await fetch(API_URL + caminho, {
      method: metodo,
      headers,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch (e) {
    throw new ErroApi(0, { mensagem: 'Servidor indisponível. Verifique se o backend está rodando (npm start).' });
  }

  const dados = resp.status === 204 ? null : await resp.json().catch(() => null);
  if (!resp.ok) {
    // Token ausente, inválido ou expirado: volta para o login.
    if (resp.status === 401 && token) {
      SESSAO.limpar();
      location.href = 'login.html';
    }
    throw new ErroApi(resp.status, dados);
  }
  return dados;
}

const API = {
  login: (email, senha) => api('POST', '/auth/login', { email, senha }),
  cadastrar: (dados) => api('POST', '/auth/cadastro', dados),

  arenas: (filtros = {}) => api('GET', '/arenas' + query(filtros)),
  arena: (id) => api('GET', `/arenas/${id}`),
  quadras: (arenaId) => api('GET', `/arenas/${arenaId}/quadras`),

  reservar: (dados) => api('POST', '/reservas', dados),
  minhasReservas: (status) => api('GET', '/reservas/minhas' + query({ status })),
  cancelarReserva: (id) => api('PATCH', `/reservas/${id}/cancelar`),

  turmas: (esporte) => api('GET', '/turmas' + query({ esporte })),
  minhasTurmas: () => api('GET', '/turmas/minhas'),
  turma: (id) => api('GET', `/turmas/${id}`),
  criarTurma: (dados) => api('POST', '/turmas', dados),
  participar: (id) => api('POST', `/turmas/${id}/participar`),

  avaliar: (arenaId, nota) => api('POST', '/avaliacoes', { arena_id: arenaId, nota }),
  notificacoes: () => api('GET', '/notificacoes'),
};

function query(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v); });
  const s = q.toString();
  return s ? `?${s}` : '';
}

// Telas internas chamam exigirLogin() no carregamento: sem token, vai para o login.
function exigirLogin() {
  if (!SESSAO.token()) {
    location.replace('login.html');
    return false;
  }
  return true;
}

// Mostra o erro da API; quando ele vem de uma regra de negócio, inclui o código (ex.: RNE-004).
function mostrarErro(e) {
  alert(e.regra ? `${e.message}\n(${e.regra})` : e.message);
}

// Valores usados pela API ↔ rótulos exibidos nas telas.
const ESPORTES = [
  { valor: 'FUTSAL', rotulo: 'FUTSAL' },
  { valor: 'SOCIETY', rotulo: 'SOCIETY' },
  { valor: 'VOLEI', rotulo: 'VÔLEI DE QUADRA' },
  { valor: 'VOLEI_PRAIA', rotulo: 'VÔLEI DE PRAIA' },
  { valor: 'FUTEVOLEI', rotulo: 'FUTEVÔLEI' },
  { valor: 'BEACH_TENNIS', rotulo: 'BEACH TÊNIS' },
  { valor: 'BASQUETE', rotulo: 'BASQUETE' },
];
const DIAS = [
  { valor: 'SEGUNDA', rotulo: 'Segunda-feira' },
  { valor: 'TERCA', rotulo: 'Terça-feira' },
  { valor: 'QUARTA', rotulo: 'Quarta-feira' },
  { valor: 'QUINTA', rotulo: 'Quinta-feira' },
  { valor: 'SEXTA', rotulo: 'Sexta-feira' },
  { valor: 'SABADO', rotulo: 'Sábado' },
  { valor: 'DOMINGO', rotulo: 'Domingo' },
];
const STATUS = {
  SOLICITADO: 'Solicitado',
  AGENDADO: 'Agendado',
  CANCELADO: 'Cancelado',
  REALIZADO: 'Realizado',
};

function rotuloEsporte(valor) {
  const e = ESPORTES.find((x) => x.valor === valor);
  return e ? e.rotulo : String(valor || '').replace(/_/g, ' ');
}
function rotuloDia(valor) {
  const d = DIAS.find((x) => x.valor === valor);
  return d ? d.rotulo : valor;
}

// Escapa texto vindo da API antes de inserir no HTML.
function esc(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Sigla e cor do "logo" de cada arena, derivadas do nome.
const CORES_ARENA = ['#e63946', '#2b9348', '#023e8a', '#e76f51', '#7b2cbf', '#0096c7'];
function siglaArena(nome) {
  const partes = String(nome).trim().split(/\s+/);
  if (partes.length > 1) return (partes[0].length <= 3 ? partes[0] : partes[0][0] + partes[1][0]).toUpperCase();
  return partes[0].slice(0, 2).toUpperCase();
}
function corArena(i) {
  return CORES_ARENA[i % CORES_ARENA.length];
}
