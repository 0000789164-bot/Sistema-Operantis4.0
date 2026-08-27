/* Sistema-Operantis 4.0 - Login de demonstração
 * Durante a apresentação, o acesso é simulado por perfil.
 * Em uma versão real, este arquivo pode ser substituído pela autenticação do Firebase.
 */
(function () {
  'use strict';

  const PERFIS = [
    {
      id: 'empresa',
      icone: '🏢',
      nome: 'Empresa',
      descricao: 'Acompanhar equipamentos, ordens de serviço e manutenção.',
      cor: '#0056b3'
    },
    {
      id: 'tecnico',
      icone: '👨‍🔧',
      nome: 'Aluno / Técnico',
      descricao: 'Executar serviços, consultar OS e registrar manutenção.',
      cor: '#198754'
    },
    {
      id: 'senai',
      icone: '🏫',
      nome: 'SENAI / Administrador',
      descricao: 'Visualizar indicadores, planejamento e gestão do sistema.',
      cor: '#003d82'
    }
  ];

  function criarTela() {
    if (document.getElementById('demo-login')) return;

    const style = document.createElement('style');
    style.id = 'demo-login-style';
    style.textContent = `
      #demo-login{position:fixed;inset:0;z-index:99999;background:linear-gradient(135deg,#003d82,#0056b3);display:flex;align-items:center;justify-content:center;padding:24px;overflow:auto}
      #demo-login .box{width:min(920px,100%);background:#fff;border-radius:18px;box-shadow:0 18px 60px #0005;padding:34px}
      #demo-login .logo{display:flex;justify-content:center;margin-bottom:10px}
      #demo-login .logo img{width:min(250px,70vw);height:110px;object-fit:contain}
      #demo-login h1{text-align:center;color:#003d82;font-size:1.65rem;margin:5px 0 8px}
      #demo-login .subtitle{text-align:center;color:#6c757d;margin:0 auto 26px;max-width:650px;line-height:1.5}
      #demo-login .demo-badge{display:block;width:max-content;margin:0 auto 22px;background:#fff3cd;color:#664d03;padding:7px 12px;border-radius:20px;font-size:.78rem;font-weight:700}
      #demo-login .profiles{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
      #demo-login .profile{border:2px solid #e4e8ed;background:#fff;border-radius:12px;padding:22px 16px;cursor:pointer;text-align:center;transition:.18s;min-height:205px}
      #demo-login .profile:hover{transform:translateY(-3px);border-color:#0056b3;box-shadow:0 8px 22px #0002}
      #demo-login .profile .icon{font-size:2.5rem;margin-bottom:10px}
      #demo-login .profile h2{font-size:1.05rem;color:#003d82;margin:4px 0 8px}
      #demo-login .profile p{font-size:.82rem;color:#6c757d;line-height:1.45;margin:0 0 16px}
      #demo-login .profile button{width:100%;border:0;border-radius:7px;padding:10px;color:#fff;font-weight:700;cursor:pointer;background:#0056b3}
      #demo-login .real-note{text-align:center;color:#8a9299;font-size:.72rem;margin:24px 0 0}
      #demo-login .loading{display:none;text-align:center;padding:28px;color:#003d82;font-weight:700}
      #demo-login .loading .spinner{width:28px;height:28px;border:3px solid #d9e4ec;border-top-color:#0056b3;border-radius:50%;margin:0 auto 12px;animation:operantis-spin .7s linear infinite}
      @keyframes operantis-spin{to{transform:rotate(360deg)}}
      #perfil-demo{display:inline-flex;align-items:center;gap:7px;background:#e9f2ff;color:#003d82;border-radius:20px;padding:7px 11px;font-size:.78rem;font-weight:700}
      #trocar-perfil{margin-left:8px;border:1px solid #ccd2d7;background:#fff;color:#003d82;border-radius:5px;padding:7px 10px;font-weight:700;cursor:pointer}
      @media(max-width:720px){#demo-login .box{padding:22px 16px}.profiles{grid-template-columns:1fr!important}.profile{min-height:auto}}
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'demo-login';
    overlay.innerHTML = `
      <div class="box">
        <div class="logo"><img src="Design%20sem%20nome.png" alt="Sistema-Operantis"></div>
        <span class="demo-badge">🎓 MODO APRESENTAÇÃO — LOGIN SIMULADO</span>
        <h1>Bem-vindo ao Sistema-Operantis</h1>
        <p class="subtitle">Para esta demonstração, não é necessário informar usuário ou senha. Selecione abaixo o perfil que deseja apresentar.</p>
        <div class="profiles" id="demo-profiles"></div>
        <div class="loading" id="demo-loading"><div class="spinner"></div>Entrando no sistema...</div>
        <p class="real-note">Em um projeto real, esta etapa poderá utilizar autenticação e controle de acesso pelo Firebase.</p>
      </div>`;
    document.body.appendChild(overlay);

    const container = document.getElementById('demo-profiles');
    PERFIS.forEach((perfil) => {
      const card = document.createElement('div');
      card.className = 'profile';
      card.innerHTML = `
        <div class="icon">${perfil.icone}</div>
        <h2>${perfil.nome}</h2>
        <p>${perfil.descricao}</p>
        <button type="button">Entrar como ${perfil.nome}</button>`;
      card.addEventListener('click', () => entrar(perfil));
      container.appendChild(card);
    });
  }

  function atualizarCabecalho(perfil) {
    const header = document.querySelector('main.main header');
    if (!header) return;

    let area = document.getElementById('area-perfil-demo');
    if (!area) {
      area = document.createElement('div');
      area.id = 'area-perfil-demo';
      header.appendChild(area);
    }
    area.innerHTML = `<span id="perfil-demo">${perfil.icone} ${perfil.nome}</span><button id="trocar-perfil" type="button">Trocar perfil</button>`;
    document.getElementById('trocar-perfil').onclick = mostrarLogin;
  }

  function entrar(perfil) {
    const cards = document.getElementById('demo-profiles');
    const loading = document.getElementById('demo-loading');
    if (cards) cards.style.display = 'none';
    if (loading) loading.style.display = 'block';

    window.operantisPerfil = perfil.id;
    window.operantisPerfilNome = perfil.nome;
    atualizarCabecalho(perfil);

    setTimeout(() => {
      const overlay = document.getElementById('demo-login');
      if (overlay) overlay.remove();
      document.body.dataset.perfil = perfil.id;
    }, 450);
  }

  function mostrarLogin() {
    if (document.getElementById('demo-login')) return;
    criarTela();
  }

  function iniciar() {
    criarTela();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }
})();
