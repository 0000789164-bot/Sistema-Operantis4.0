/* Sistema Operantis 4.0 - autenticação e isolamento por empresa */
(function () {
  'use strict';
  const state = { user: null, profile: null, empresaId: null, company: null };
  let dbRef = null, authRef = null;

  function errorText(err) {
    const map = {
      'auth/invalid-credential': 'E-mail ou senha incorretos.',
      'auth/invalid-email': 'E-mail inválido.',
      'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
      'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
      'auth/network-request-failed': 'Falha de conexão. Verifique a internet.'
    };
    return map[err && err.code] || (err && err.message) || 'Não foi possível autenticar.';
  }
  function setMsg(text) {
    const el = document.getElementById('auth-msg');
    if (el) { el.textContent = text || ''; el.style.display = text ? 'block' : 'none'; }
  }
  function buildUI() {
    if (document.getElementById('auth-gate')) return;
    const style = document.createElement('style');
    style.textContent = '#auth-gate{position:fixed;inset:0;z-index:99999;background:#f4f6f9;display:flex;align-items:center;justify-content:center;padding:20px}.auth-box{width:min(440px,100%);background:#fff;border-radius:12px;box-shadow:0 10px 35px #0002;padding:28px}.auth-box h2{margin:0 0 8px;color:#003d82}.auth-box p{color:#6c757d;font-size:.9rem}.auth-tabs{display:flex;gap:8px;margin:18px 0}.auth-tabs button{flex:1;padding:10px;border:1px solid #ccd2d7;background:#fff;border-radius:6px;cursor:pointer;font-weight:700}.auth-tabs button.active{background:#0056b3;color:#fff}.auth-box .field{margin:10px 0}.auth-box label{display:block;font-size:.8rem;font-weight:700;color:#6c757d;margin-bottom:5px}.auth-box input{width:100%;padding:10px;border:1px solid #ccd2d7;border-radius:6px}.auth-box .primary{width:100%;margin-top:12px;background:#0056b3;color:#fff;border:0;border-radius:6px;padding:11px;font-weight:700;cursor:pointer}.auth-error{color:#842029;background:#f8d7da;padding:9px;border-radius:6px;margin-top:10px;font-size:.85rem}.auth-user{font-size:.8rem;color:#6c757d}.auth-logout{border:0;background:#dc3545;color:#fff;border-radius:5px;padding:7px 10px;cursor:pointer;font-weight:700}';
    document.head.appendChild(style);
    const gate = document.createElement('div');
    gate.id = 'auth-gate';
    gate.innerHTML = '<div class="auth-box"><h2>🔧 Sistema Operantis 4.0</h2><p id="auth-sub">Entre na sua empresa para acessar os dados de manutenção.</p><div class="auth-tabs"><button id="auth-login-tab" class="active">Entrar</button><button id="auth-register-tab">Criar empresa</button></div><form id="auth-form"><div class="field" id="company-field" style="display:none"><label>Nome da empresa</label><input id="auth-company" autocomplete="organization"></div><div class="field"><label>E-mail</label><input id="auth-email" type="email" required autocomplete="email"></div><div class="field"><label>Senha</label><input id="auth-password" type="password" required minlength="6" autocomplete="current-password"></div><button class="primary" id="auth-submit">Entrar</button><div id="auth-msg" class="auth-error" style="display:none"></div></form></div>';
    document.body.appendChild(gate);
    let registering = false;
    const companyField = document.getElementById('company-field');
    const submit = document.getElementById('auth-submit');
    function mode(v) {
      registering = v;
      document.getElementById('auth-login-tab').classList.toggle('active', !v);
      document.getElementById('auth-register-tab').classList.toggle('active', v);
      companyField.style.display = v ? 'block' : 'none';
      submit.textContent = v ? 'Criar empresa' : 'Entrar';
      document.getElementById('auth-sub').textContent = v ? 'Crie o ambiente da sua empresa e torne-se administrador.' : 'Entre na sua empresa para acessar os dados de manutenção.';
      setMsg('');
    }
    document.getElementById('auth-login-tab').onclick = () => mode(false);
    document.getElementById('auth-register-tab').onclick = () => mode(true);
    document.getElementById('auth-form').onsubmit = async (event) => {
      event.preventDefault();
      setMsg('');
      const email = document.getElementById('auth-email').value.trim();
      const password = document.getElementById('auth-password').value;
      const companyName = document.getElementById('auth-company').value.trim();
      try {
        submit.disabled = true; submit.textContent = 'Aguarde...';
        if (registering) {
          if (!companyName) throw new Error('Informe o nome da empresa.');
          const cred = await authRef.createUserWithEmailAndPassword(email, password);
          const uid = cred.user.uid;
          const empresaId = uid;
          await dbRef.collection('empresas').doc(empresaId).set({ nome: companyName, adminUid: uid, criadaEm: new Date().toISOString() });
          await dbRef.collection('usuarios').doc(uid).set({ uid, empresaId, role: 'admin', email, criadoEm: new Date().toISOString() });
          await finish(cred.user);
        } else {
          const cred = await authRef.signInWithEmailAndPassword(email, password);
          await finish(cred.user);
        }
      } catch (err) {
        console.error(err); setMsg(errorText(err));
      } finally { submit.disabled = false; submit.textContent = registering ? 'Criar empresa' : 'Entrar'; }
    };
  }

  async function finish(user) {
    state.user = user;
    const profileSnap = await dbRef.collection('usuarios').doc(user.uid).get();
    if (!profileSnap.exists) { await authRef.signOut(); throw new Error('Usuário autenticado, mas sem vínculo com uma empresa.'); }
    state.profile = profileSnap.data();
    state.empresaId = state.profile.empresaId;
    const companySnap = await dbRef.collection('empresas').doc(state.empresaId).get();
    if (!companySnap.exists) { await authRef.signOut(); throw new Error('A empresa vinculada ao usuário não existe.'); }
    state.company = companySnap.data();
    window.operantisAuth = state;
    window.empresaId = state.empresaId;
    const gate = document.getElementById('auth-gate'); if (gate) gate.style.display = 'none';
    addHeaderUser();
    await loadTenantData();
    if (typeof window.render === 'function') window.render();
    const ok = document.getElementById('firebase-ok');
    if (ok) { ok.textContent = '✓ Conectado: ' + state.company.nome + ' · ' + state.profile.role; ok.style.display = 'block'; }
  }

  function addHeaderUser() {
    if (document.getElementById('tenant-user')) return;
    const header = document.querySelector('header'); if (!header) return;
    const box = document.createElement('div'); box.id = 'tenant-user'; box.style.cssText = 'display:flex;align-items:center;gap:10px';
    box.innerHTML = '<span class="auth-user"></span><button class="auth-logout">Sair</button>';
    header.appendChild(box);
    box.querySelector('.auth-user').textContent = state.company.nome + ' · ' + state.user.email;
    box.querySelector('.auth-logout').onclick = () => authRef.signOut();
  }

  function tenantDoc() {
    if (!state.empresaId) throw new Error('Empresa não identificada.');
    return dbRef.collection('empresas').doc(state.empresaId).collection('dados').doc('operacional');
  }

  async function loadTenantData() {
    const snap = await tenantDoc().get();
    if (snap.exists) {
      const d = snap.data();
      window.eq = Array.isArray(d.equipamentos) ? d.equipamentos : [];
      window.os = Array.isArray(d.ordens) ? d.ordens : [];
      window.plans = Array.isArray(d.planejamento) ? d.planejamento : [];
      window.hist = Array.isArray(d.historico) ? d.historico : [];
    } else {
      window.eq = []; window.os = []; window.plans = []; window.hist = [];
      await saveTenantData();
    }
  }

  async function saveTenantData() {
    if (!state.empresaId) return;
    await tenantDoc().set({
      equipamentos: Array.isArray(window.eq) ? window.eq : [],
      ordens: Array.isArray(window.os) ? window.os : [],
      planejamento: Array.isArray(window.plans) ? window.plans : [],
      historico: Array.isArray(window.hist) ? window.hist : [],
      atualizadoEm: new Date().toISOString()
    }, { merge: true });
  }

  async function init() {
    buildUI();
    if (!window.firebase) { setMsg('Firebase não foi inicializado.'); return; }
    dbRef = window.firebase.firestore();
    authRef = window.firebase.auth();
    window.saveCloudData = saveTenantData;
    authRef.onAuthStateChanged(async (user) => {
      if (!user) { const gate = document.getElementById('auth-gate'); if (gate) gate.style.display = 'flex'; return; }
      if (user.isAnonymous) { await authRef.signOut(); return; }
      try { await finish(user); } catch (err) { console.error(err); setMsg(errorText(err)); }
    });
  }

  window.operantisMultiempresa = { init, loadTenantData, saveTenantData, getState: () => state };
  document.addEventListener('DOMContentLoaded', () => setTimeout(init, 0));
})();
