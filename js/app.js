// Dados simulados
const DB = {
  arenas:[
    {id:1,nome:'SIX SPORTS',sigla:'SIX',cor:'#e63946',rating:5.0,avals:27},
    {id:2,nome:'FUTBAR',sigla:'FB',cor:'#2b9348',rating:4.0,avals:32},
    {id:3,nome:'SHARK',sigla:'SK',cor:'#023e8a',rating:3.0,avals:14},
    {id:4,nome:'TROPIKALLA',sigla:'TK',cor:'#e76f51',rating:2.0,avals:31},
  ],
  esportes:['VÔLEI DE PRAIA','FUTEVÔLEI','BEACH TÊNIS','FUTSAL','VÔLEI DE QUADRA'],
  turmas:{
    'VÔLEI DE PRAIA':[
      {lider:'LUCAS SILVA',rating:4.6,atletas:3,max:4},
      {lider:'MARIA CLARA',rating:5.0,atletas:2,max:4},
      {lider:'ANA LORRANE',rating:2.6,atletas:5,max:6},
      {lider:'GABRIEL SARA',rating:2.2,atletas:7,max:8},
      {lider:'IGOR MARTINS',rating:3.4,atletas:2,max:4},
    ],
    'FUTEVÔLEI':[
      {lider:'LUCAS ALVES',rating:4.6,atletas:4,max:4},
      {lider:'ANA CLARA',rating:5.0,atletas:3,max:4},
      {lider:'ALLANA LUISA',rating:2.6,atletas:3,max:4},
      {lider:'GABRIEL LIMA',rating:2.2,atletas:2,max:4},
      {lider:'IGOR RAFAEL',rating:3.4,atletas:2,max:4},
    ],
    'BEACH TÊNIS':[
      {lider:'RAFAEL COSTA',rating:4.8,atletas:1,max:2},
      {lider:'JULIA MENDES',rating:3.9,atletas:1,max:2},
    ],
    'FUTSAL':[
      {lider:'PEDRO SANTOS',rating:4.2,atletas:4,max:5},
      {lider:'MARCOS LIMA',rating:3.7,atletas:3,max:5},
    ],
    'VÔLEI DE QUADRA':[
      {lider:'CARLA SILVA',rating:4.5,atletas:5,max:6},
      {lider:'TIAGO MELO',rating:3.1,atletas:4,max:6},
    ],
  },
};

// Ícones SVG reutilizáveis
const ICO = {
  home:`<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
  agenda:`<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
  bell:`<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>`,
  chat:`<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
  back:`<polyline points="15 18 9 12 15 6"/>`,
  gear:`<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
  menu:`<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>`,
  user:`<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  pin:`<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>`,
  question:`<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
  logout:`<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>`,
  people:`<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  doc:`<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>`,
};

function svg(d){return`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`}

function bnav(active){
  const pages=['home','agendamentos','notificacoes','chat'];
  const labels=['Início','Agenda','Notificações','Chat'];
  const icons=[ICO.home,ICO.agenda,ICO.bell,ICO.chat];
  const links=['../pages/home.html','../pages/minha-agenda.html','../pages/notificacoes.html','#'];
  return`<nav class="bnav">${pages.map((p,i)=>`
    <a class="bitem${active===p?' active':''}" href="${links[i]}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[i]}</svg>
      <span>${labels[i]}</span>
    </a>`).join('')}</nav>`;
}

function hdr(title,back='../pages/home.html',cfg=true){
  return`<div class="hdr">
    <a href="${back}" class="ibtn"><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICO.back}</svg></a>
    <span class="hdr-title">${title}</span>
    <a href="../pages/configuracoes.html" class="ibtn"${!cfg?' style="visibility:hidden"':''}><svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICO.gear}</svg></a>
  </div>`;
}
