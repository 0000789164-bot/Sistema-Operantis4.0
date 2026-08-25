/* Sistema-Operantis 4.0 - Registro automático de falhas */
(function(){
  const STORAGE_KEY='operantis_falhas_v1';
  let falhas=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
  const save=()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(falhas));
  const agora=()=>new Date().toLocaleString('pt-BR');
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));

  function registrarFalhasAutomaticas(){
    if(!Array.isArray(window.equipamentos)) return;
    window.equipamentos.forEach(e=>{
      const chave=e.tag+'|'+e.horimetro+'|'+e.limite;
      const atingiu=Number(e.horimetro)>=Number(e.limite);
      const jaRegistrada=falhas.some(f=>f.chave===chave && f.status==='Aberta');
      if(atingiu && !jaRegistrada){
        const tipo=Number(e.horimetro)>Number(e.limite)?'Falha por excesso de horímetro':'Falha/alerta de manutenção';
        falhas.unshift({id:'FA-'+Date.now(),data:agora(),tag:e.tag,equipamento:e.nome,setor:e.setor,tipo,descricao:`Equipamento atingiu o limite de manutenção (${e.horimetro} h / ${e.limite} h).`,severidade:Number(e.horimetro)>Number(e.limite)?'Crítica':'Alta',status:'Aberta',chave});
        save();
        if(typeof window.abrirOSAutomaticamente==='function') window.abrirOSAutomaticamente(e);
      }
    });
    renderPainelFalhas();
  }

  function renderPainelFalhas(){
    const body=document.getElementById('falhas-auto-body'); if(!body)return;
    body.innerHTML=falhas.length?falhas.map(f=>`<tr><td>${esc(f.data)}</td><td><strong>${esc(f.tag)}</strong></td><td>${esc(f.equipamento)}</td><td>${esc(f.tipo)}</td><td><span class="badge ${f.severidade==='Crítica'?'bad':'warn'}">${esc(f.severidade)}</span></td><td><span class="badge ${f.status==='Aberta'?'bad':'ok'}">${esc(f.status)}</span></td><td><button class="btn" style="padding:5px 8px" onclick="resolverFalha('${f.id}')">Resolver</button></td></tr>`).join(''):'<tr><td colspan="7" class="empty">Nenhuma falha automática registrada.</td></tr>';
    const k=document.getElementById('kpi-falhas-auto'); if(k)k.textContent=falhas.filter(f=>f.status==='Aberta').length;
  }

  window.resolverFalha=function(id){const f=falhas.find(x=>x.id===id);if(!f)return;f.status='Resolvida';f.resolvidaEm=agora();save();renderPainelFalhas();};

  function criarAba(){
    const nav=document.querySelector('.nav');
    if(nav && !document.getElementById('btn-falhas-auto')){
      const b=document.createElement('button');b.id='btn-falhas-auto';b.innerHTML='🚨 Falhas Automáticas';b.onclick=function(){switchTab('falhas-auto',this)};nav.appendChild(b);
    }
    const main=document.querySelector('.main'); if(!main || document.getElementById('tab-falhas-auto'))return;
    const s=document.createElement('section');s.id='tab-falhas-auto';s.className='tab';
    s.innerHTML=`<div class="card"><div class="card-head"><h3>Registro Automático de Falhas dos Equipamentos</h3><span id="kpi-falhas-auto" class="badge bad">0</span></div><p style="color:var(--muted);margin-bottom:14px">O sistema monitora automaticamente o horímetro dos equipamentos cadastrados. Ao atingir ou ultrapassar o limite de manutenção, uma falha/alerta é registrada neste histórico.</p><table><thead><tr><th>Data/Hora</th><th>TAG</th><th>Equipamento</th><th>Falha detectada</th><th>Severidade</th><th>Status</th><th>Ação</th></tr></thead><tbody id="falhas-auto-body"></tbody></table></div>`;
    main.appendChild(s);
  }

  function integrar(){
    criarAba();
    const oldRenderAll=window.renderAll;
    if(typeof oldRenderAll==='function' && !window.__falhasIntegrado){
      window.__falhasIntegrado=true;
      window.renderAll=function(){oldRenderAll();registrarFalhasAutomaticas();};
    }
    window.abrirOSAutomaticamente=function(e){
      if(!Array.isArray(window.ordensServico))return;
      const existente=window.ordensServico.some(o=>o.tag===e.tag && o.tipo==='Corretiva' && o.desc.includes('Falha automática') && o.status==='Aberta');
      if(existente)return;
      const id=Math.floor(1000+Math.random()*9000);
      window.ordensServico.unshift({id,tag:e.tag,tipo:'Corretiva',desc:'Falha automática: limite de manutenção atingido',tecnico:'A definir',status:'Aberta'});
    };
    registrarFalhasAutomaticas();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(integrar,50));else setTimeout(integrar,50);
  setInterval(()=>{if(Array.isArray(window.equipamentos))registrarFalhasAutomaticas();},5000);
})();