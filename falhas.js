/* Sistema-Operantis 4.0 - Registro automático de falhas
 * Integração com o modelo de dados real do index.html.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'operantis_falhas_v2';
  let falhas = [];
  let iniciado = false;

  const agora = () => new Date().toLocaleString('pt-BR');
  const esc = (s) => String(s ?? '').replace(/[&<>\"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;'
  }[m]));

  function lerLocal() {
    try {
      const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      falhas = Array.isArray(dados) ? dados : [];
    } catch (_) {
      falhas = [];
    }
  }

  function salvarLocal() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(falhas)); } catch (_) {}
  }

  function estadoEquipamentos() {
    try {
      return typeof eq !== 'undefined' && Array.isArray(eq) ? eq : [];
    } catch (_) { return []; }
  }

  function estadoOrdens() {
    try {
      return typeof os !== 'undefined' && Array.isArray(os) ? os : [];
    } catch (_) { return []; }
  }

  async function salvarNuvem() {
    try {
      if (typeof db === 'undefined' || !db) return;
      await db.collection('sistema_operantis').doc('dados').set({
        falhasAutomaticas: falhas,
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error('Falhas automáticas - gravação:', e);
    }
  }

  async function carregarNuvem() {
    try {
      if (typeof db === 'undefined' || !db) return;
      const snap = await db.collection('sistema_operantis').doc('dados').get();
      if (snap.exists && Array.isArray(snap.data().falhasAutomaticas)) {
        falhas = snap.data().falhasAutomaticas;
        salvarLocal();
      }
    } catch (e) {
      console.warn('Falhas automáticas - leitura:', e);
    }
  }

  async function persistir() {
    salvarLocal();
    await salvarNuvem();
  }

  function garantirPainel() {
    const historico = document.getElementById('historico');
    if (!historico || document.getElementById('falhas-auto-card')) return;

    const card = document.createElement('div');
    card.id = 'falhas-auto-card';
    card.className = 'card';
    card.innerHTML = `
      <div class="head">
        <h3>Falhas Automáticas</h3>
        <span id="kpi-falhas-auto" class="badge b-danger">0</span>
      </div>
      <p style="color:var(--muted);margin-bottom:14px">
        Alertas gerados automaticamente quando o horímetro atinge ou ultrapassa o limite de manutenção.
      </p>
      <table>
        <thead><tr>
          <th>Data/Hora</th><th>TAG</th><th>Equipamento</th><th>Detecção</th>
          <th>Severidade</th><th>Status</th><th>Ação</th>
        </tr></thead>
        <tbody id="falhas-auto-body"></tbody>
      </table>`;
    historico.appendChild(card);
  }

  function renderPainel() {
    garantirPainel();
    const body = document.getElementById('falhas-auto-body');
    if (!body) return;

    body.innerHTML = falhas.length
      ? falhas.map((f) => {
          const critica = f.severidade === 'Crítica';
          const aberta = f.status === 'Aberta';
          return `<tr>
            <td>${esc(f.data)}</td>
            <td><strong>${esc(f.tag)}</strong></td>
            <td>${esc(f.equipamento)}</td>
            <td>${esc(f.tipo)}</td>
            <td><span class="badge ${critica ? 'b-danger' : 'b-warn'}">${esc(f.severidade)}</span></td>
            <td><span class="badge ${aberta ? 'b-danger' : 'b-ok'}">${esc(f.status)}</span></td>
            <td>${aberta ? `<button class="btn" style="padding:5px 8px" onclick="resolverFalha('${esc(f.id)}')">Resolver</button>` : '-'}</td>
          </tr>`;
        }).join('')
      : '<tr><td colspan="7">Nenhuma falha automática registrada.</td></tr>';

    const kpi = document.getElementById('kpi-falhas-auto');
    if (kpi) kpi.textContent = falhas.filter((f) => f.status === 'Aberta').length;
  }

  async function criarOSAutomatica(e) {
    const ordens = estadoOrdens();
    if (!ordens) return false;

    const existe = ordens.some((o) =>
      o.tag === e.tag &&
      o.tipo === 'Corretiva' &&
      String(o.desc || '').includes('Falha automática') &&
      o.status === 'Aberta'
    );
    if (existe) return false;

    ordens.unshift({
      id: Date.now(),
      tag: e.tag,
      tipo: 'Corretiva',
      desc: 'Falha automática: limite de manutenção atingido',
      tec: 'A definir',
      status: 'Aberta'
    });

    try {
      if (typeof render === 'function') render();
      if (typeof saveCloudData === 'function') await saveCloudData();
    } catch (err) {
      console.error('Falhas automáticas - criação da OS:', err);
    }
    return true;
  }

  async function registrarFalhasAutomaticas() {
    const equipamentos = estadoEquipamentos();
    if (!equipamentos.length) {
      renderPainel();
      return;
    }

    let alterou = false;

    for (const e of equipamentos) {
      const hora = Number(e.hora);
      const limite = Number(e.limite);
      if (!e.tag || !Number.isFinite(hora) || !Number.isFinite(limite)) continue;
      if (hora < limite) continue;

      // Usa 'hora', que é o campo real do index.html. A chave impede duplicações.
      const chave = `${e.tag}|${hora}|${limite}`;
      const jaExiste = falhas.some((f) => f.chave === chave);
      if (jaExiste) continue;

      falhas.unshift({
        id: `FA-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        data: agora(),
        tag: e.tag,
        equipamento: e.nome,
        setor: e.setor,
        tipo: hora > limite ? 'Falha por excesso de horímetro' : 'Alerta de manutenção',
        descricao: `Equipamento atingiu o limite de manutenção (${hora} h / ${limite} h).`,
        severidade: hora > limite ? 'Crítica' : 'Alta',
        status: 'Aberta',
        chave
      });
      alterou = true;
      await criarOSAutomatica(e);
    }

    if (alterou) await persistir();
    renderPainel();
  }

  window.resolverFalha = async function (id) {
    const f = falhas.find((x) => x.id === id);
    if (!f || f.status !== 'Aberta') return;
    f.status = 'Resolvida';
    f.resolvidaEm = agora();
    await persistir();
    renderPainel();
  };

  async function iniciar() {
    if (iniciado) return;
    iniciado = true;
    lerLocal();
    garantirPainel();

    // O Firebase do index.html é inicializado de forma assíncrona.
    for (let i = 0; i < 40; i++) {
      try {
        if (typeof firebaseReady !== 'undefined' && firebaseReady && typeof db !== 'undefined' && db) break;
      } catch (_) {}
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    await carregarNuvem();
    await registrarFalhasAutomaticas();

    // Reavalia após alterações de equipamento/horímetro.
    setInterval(registrarFalhasAutomaticas, 5000);

    // Se o módulo principal renderizar, mantém o painel sincronizado.
    const originalRender = typeof render === 'function' ? render : null;
    if (originalRender && !window.__operantisRenderComFalhas) {
      window.__operantisRenderComFalhas = true;
      window.render = function () {
        originalRender();
        renderPainel();
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }
})();
