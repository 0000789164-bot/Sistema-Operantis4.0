/* Falhas automáticas isoladas por empresa */
(function(){
  'use strict';
  const session=JSON.parse(sessionStorage.getItem('operantisSession')||'null');
  if(!session) return;
  let iniciado=false;
  const agora=()=>new Date().toLocaleString('pt-BR');
  function empresa(){ return session.role==='admin' ? (sessionStorage.getItem('operantisEmpresaSelecionada')||'SENAI') : session.empresa; }
  async function esperar(){ for(let i=0;i<50;i++){ if(typeof firebaseReady!=='undefined'&&firebaseReady&&typeof db!=='undefined'&&db&&typeof eq!=='undefined') return true; await new Promise(r=>setTimeout(r,200)); } return false; }
  function painel(){
    const area=document.getElementById('historico'); if(!area||document.getElementById('falhas-auto-card')) return;
    const c=document.createElement('div'); c.id='falhas-auto-card'; c.className='card';
    c.innerHTML='<div class="head"><h3>Falhas Automáticas</h3><span id="kpi-falhas-auto" class="badge b-danger">0</span></div><p style="color:var(--muted)">Falhas detectadas automaticamente por limite de manutenção.</p><table><thead><tr><th>Data/Hora</th><th>TAG</th><th>Equipamento</th><th>Severidade</th><th>Status</th></tr></thead><tbody id="falhas-auto-body"></tbody></table>';
    area.appendChild(c);
  }
  function render(){
    painel(); const body=document.getElementById('falhas-auto-body'); if(!body) return;
    const abertas=(Array.isArray(hist)?hist:[]).filter(x=>x.tipo==='Falha automática'&&x.status!=='Resolvida');
    body.innerHTML=abertas.length?abertas.map(x=>'<tr><td>'+x.data+'</td><td><strong>'+x.tag+'</strong></td><td>'+x.equipamento+'</td><td><span class="badge b-danger">Crítica</span></td><td><span class="badge b-danger">Aberta</span></td></tr>').join(''):'<tr><td colspan="5">Nenhuma falha automática registrada.</td></tr>';
    const k=document.getElementById('kpi-falhas-auto'); if(k) k.textContent=abertas.length;
  }
  async function verificar(){
    if(!(await esperar())||iniciado) return; iniciado=true;
    for(const e of (Array.isArray(eq)?eq:[])){
      const h=Number(e.hora), l=Number(e.limite); if(!e.tag||!Number.isFinite(h)||!Number.isFinite(l)||h<l) continue;
      const existe=(Array.isArray(hist)?hist:[]).some(x=>x.tipo==='Falha automática'&&x.tag===e.tag&&Number(x.hora)===h);
      if(existe) continue;
      hist.unshift({data:agora(),tag:e.tag,equipamento:e.nome,tipo:'Falha automática',desc:'Limite de manutenção atingido: '+h+' h / '+l+' h',peca:'-',custo:0,hora:h,status:'Aberta'});
      const osExiste=(Array.isArray(os)?os:[]).some(x=>x.tag===e.tag&&x.tipo==='Corretiva'&&x.status==='Aberta'&&String(x.desc||'').includes('Falha automática'));
      if(!osExiste) os.unshift({id:Date.now(),tag:e.tag,tipo:'Corretiva',desc:'Falha automática: limite de manutenção atingido',tec:'A definir',status:'Aberta'});
    }
    try{ if(typeof saveCloudData==='function') await saveCloudData(); }catch(e){ console.warn(e); }
    if(typeof render==='function') render(); else render();
    iniciado=false;
  }
  async function iniciar(){
    await esperar(); render(); await verificar(); setInterval(()=>{ iniciado=false; verificar(); },10000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',iniciar,{once:true}); else iniciar();
})();
