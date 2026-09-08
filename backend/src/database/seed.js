/**
 * Popula o banco com dados coerentes com o produto.
 * Uso: npm run db:seed
 *
 * Idempotente: limpa todas as tabelas antes de inserir, entao rodar duas vezes
 * nao duplica nada.
 */
const bcrypt = require('bcrypt');

const env = require('../config/env');
const { uuid, agoraISO } = require('../utils/uuid');

const usuarioRepository = require('../repositories/usuario.repository');
const arenaRepository = require('../repositories/arena.repository');
const quadraRepository = require('../repositories/quadra.repository');
const reservaRepository = require('../repositories/reserva.repository');
const turmaRepository = require('../repositories/turma.repository');
const avaliacaoRepository = require('../repositories/avaliacao.repository');

const SENHA_PADRAO = 'senha123';

async function seed() {
  // ---------------------------------------------------------------- limpeza
  // Ordem inversa das dependencias de chave estrangeira.
  avaliacaoRepository.limpar();
  turmaRepository.limpar();
  reservaRepository.limpar();
  quadraRepository.limpar();
  arenaRepository.limpar();
  usuarioRepository.limpar();

  // --------------------------------------------------------------- usuarios
  const senha_hash = await bcrypt.hash(SENHA_PADRAO, env.BCRYPT_ROUNDS);

  const usuarios = [
    { nome: 'Joao Pereira', email: 'joao@teste.com', celular: '(62) 99111-1111' },
    { nome: 'Maria Clara', email: 'maria@teste.com', celular: '(62) 99222-2222' },
    { nome: 'Carlos Souza', email: 'carlos@teste.com', celular: '(62) 99333-3333' },
  ].map((u) =>
    usuarioRepository.criar({
      id: uuid(),
      nome: u.nome,
      email: u.email,
      celular: u.celular,
      senha_hash,
      criado_em: agoraISO(),
    })
  );

  const [joao, maria, carlos] = usuarios;

  // ----------------------------------------------------------------- arenas
  const arenas = [
    { nome: 'SIX SPORTS', regiao: 'CENTRO', cidade: 'Anapolis' },
    { nome: 'FUTBAR', regiao: 'JUNDIAI', cidade: 'Anapolis' },
    { nome: 'SHARK', regiao: 'SETOR BUENO', cidade: 'Goiania' },
    { nome: 'TROPIKALLA', regiao: 'SETOR OESTE', cidade: 'Goiania' },
  ].map((a) =>
    arenaRepository.criar({
      id: uuid(),
      nome: a.nome,
      regiao: a.regiao,
      cidade: a.cidade,
      avaliacao_media: 0,
    })
  );

  const [six, futbar, shark, tropikalla] = arenas;

  // ---------------------------------------------------------------- quadras
  const MANHA = ['08:00', '09:00', '10:00', '11:00'];
  const TARDE = ['14:00', '15:00', '16:00', '17:00'];
  const NOITE = ['18:00', '19:00', '20:00', '21:00'];

  const quadrasSeed = [
    { arena: six, tipo_esporte: 'FUTSAL', horarios: [...MANHA, ...NOITE] },
    { arena: six, tipo_esporte: 'SOCIETY', horarios: [...TARDE, ...NOITE] },
    { arena: six, tipo_esporte: 'BEACH_TENNIS', horarios: [...MANHA, ...TARDE] },
    { arena: futbar, tipo_esporte: 'FUTSAL', horarios: [...NOITE] },
    { arena: futbar, tipo_esporte: 'VOLEI', horarios: [...TARDE, ...NOITE] },
    { arena: shark, tipo_esporte: 'BASQUETE', horarios: [...MANHA, ...NOITE] },
    { arena: shark, tipo_esporte: 'SOCIETY', horarios: [...NOITE] },
    { arena: shark, tipo_esporte: 'VOLEI', horarios: [...MANHA, ...TARDE] },
    { arena: tropikalla, tipo_esporte: 'BEACH_TENNIS', horarios: [...MANHA, ...TARDE, ...NOITE] },
    { arena: tropikalla, tipo_esporte: 'VOLEI', horarios: [...TARDE, ...NOITE] },
  ];

  const quadras = quadrasSeed.map((q) =>
    quadraRepository.criar({
      id: uuid(),
      arena_id: q.arena.id,
      tipo_esporte: q.tipo_esporte,
      horarios_disponiveis: q.horarios,
    })
  );

  // ---------------------------------------------------------------- reservas
  // Status variados, para a tela de historico (RF-007) ter o que mostrar.
  const reservasSeed = [
    { usuario: joao, quadra: quadras[0], dia_semana: 'SEGUNDA', horario: '19:00', status: 'AGENDADO' },
    { usuario: joao, quadra: quadras[2], dia_semana: 'QUARTA', horario: '09:00', status: 'REALIZADO' },
    { usuario: joao, quadra: quadras[4], dia_semana: 'SEXTA', horario: '20:00', status: 'CANCELADO' },
    { usuario: maria, quadra: quadras[5], dia_semana: 'TERCA', horario: '08:00', status: 'SOLICITADO' },
    { usuario: maria, quadra: quadras[8], dia_semana: 'SABADO', horario: '15:00', status: 'AGENDADO' },
    { usuario: carlos, quadra: quadras[9], dia_semana: 'DOMINGO', horario: '18:00', status: 'REALIZADO' },
  ];

  reservasSeed.forEach((r) =>
    reservaRepository.criar({
      id: uuid(),
      usuario_id: r.usuario.id,
      quadra_id: r.quadra.id,
      dia_semana: r.dia_semana,
      horario: r.horario,
      status: r.status,
      criado_em: agoraISO(),
    })
  );

  // ----------------------------------------------------------------- turmas
  // Turma 1: com vaga sobrando. Turma 2: lotada, para demonstrar a RNE-004.
  const turmaComVaga = turmaRepository.criar({
    id: uuid(),
    criador_id: joao.id,
    nome: 'Pelada de quinta',
    esporte: 'FUTSAL',
    horario: '20:00',
    vagas_total: 10,
    vagas_preenchidas: 2,
    criado_em: agoraISO(),
  });
  turmaRepository.adicionarParticipante(turmaComVaga.id, joao.id);
  turmaRepository.adicionarParticipante(turmaComVaga.id, maria.id);

  const turmaLotada = turmaRepository.criar({
    id: uuid(),
    criador_id: maria.id,
    nome: 'Dupla de beach tennis',
    esporte: 'BEACH_TENNIS',
    horario: '16:00',
    vagas_total: 2,
    vagas_preenchidas: 2,
    criado_em: agoraISO(),
  });
  turmaRepository.adicionarParticipante(turmaLotada.id, maria.id);
  turmaRepository.adicionarParticipante(turmaLotada.id, carlos.id);

  // ------------------------------------------------------------- avaliacoes
  const avaliacoesSeed = [
    { usuario: joao, arena: six, nota: 'MUITO_BOM' },
    { usuario: maria, arena: six, nota: 'MUITO_BOM' },
    { usuario: carlos, arena: six, nota: 'BOM' },
    { usuario: joao, arena: futbar, nota: 'BOM' },
    { usuario: maria, arena: futbar, nota: 'MEDIO' },
    { usuario: carlos, arena: shark, nota: 'MEDIO' },
    { usuario: joao, arena: tropikalla, nota: 'RUIM' },
    { usuario: maria, arena: tropikalla, nota: 'MEDIO' },
  ];

  avaliacoesSeed.forEach((a) =>
    avaliacaoRepository.criar({
      id: uuid(),
      usuario_id: a.usuario.id,
      arena_id: a.arena.id,
      nota: a.nota,
      criado_em: agoraISO(),
    })
  );

  // `avaliacao_media` das arenas ja calculada (MUITO_BOM=4 ... RUIM=1).
  arenas.forEach((arena) => {
    const media = avaliacaoRepository.calcularMediaPorArena(arena.id);
    arenaRepository.atualizarMedia(arena.id, Number(media.toFixed(2)));
  });

  // ---------------------------------------------------------------- resumo
  console.log('[seed] Banco populado com sucesso.');
  console.log(`[seed] usuarios: ${usuarios.length} (senha de todos: ${SENHA_PADRAO})`);
  console.log(`[seed] arenas: ${arenas.length} | quadras: ${quadras.length}`);
  console.log(`[seed] reservas: ${reservasSeed.length} | avaliacoes: ${avaliacoesSeed.length}`);
  console.log(`[seed] turma com vaga: "${turmaComVaga.nome}" (${turmaComVaga.vagas_preenchidas}/${turmaComVaga.vagas_total})`);
  console.log(`[seed] turma lotada:   "${turmaLotada.nome}" (${turmaLotada.vagas_preenchidas}/${turmaLotada.vagas_total}) -> demonstra a RNE-004`);
}

seed().catch((erro) => {
  console.error('[seed] Falhou:', erro);
  process.exit(1);
});
