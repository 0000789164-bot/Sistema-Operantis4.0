/* Isolamento de dados por empresa - Sistema Operantis 4.0 */
(function(){
  'use strict';
  const session = JSON.parse(sessionStorage.getItem('operantisSession') || 'null');
  if(!session){ window.location.href='login.html'; return; }

  const EMPRESAS = ['SENAI','VALE'];
  const estoque = {
    SENAI:[['S-101','Filtro hidráulico',12,4,145],['S-102','Óleo 15W40 (L)',32,12,35],['S-103','Correia industrial',7,3,88],['S-104','Filtro de ar',10,4,92],['S-105','Rolamento 6205',14,5,42],['S-106','Graxa EP2 (kg)',18,6,38],['S-107','Sensor de temperatura',5,2,135],['S-108','Mangueira hidráulica',8,3,120]],
    VALE:[['V-201','Filtro hidráulico HD',6,3,185],['V-202','Óleo diesel 15W40 (L)',58,20,39],['V-203','Correia pesada',3,4,145],['V-204','Filtro de combustível',9,4,76],['V-205','Rolamento 6308',4,5,78],['V-206','Graxa EP2 alta carga (kg)',24,10,46],['V-207','Sensor de pressão',2,3,190],['V-208','Mangueira 3/4 pol.',3,4,165]]
  };
  const sementes = {
    SENAI:{
      equipamentos:[{tag:'SEN-EQ-001',nome:'Torno CNC SENAI',setor:'Usinagem',hora:820,limite:1000},{tag:'SEN-EQ-002',nome:'Compressor Schulz',setor:'Pneumática',hora:500,limite:500},{tag:'SEN-EQ-003',nome:'Prensa Hidráulica',setor:'Metalurgia',hora:1260,limite:1500}],
      ordens:[], planejamento:[], historico:[]
    },
    VALE:{
      equipamentos:[{tag:'VAL-EQ-001',nome:'Escavadeira Hidráulica',setor:'Mineração',hora:4850,limite:5000},{tag:'VAL-EQ-002',nome:'Caminhão Fora de Estrada',setor:'Mina',hora:7120,limite:7000},{tag:'VAL-EQ-003',nome:'Carregadeira de Rodas',setor:'Mineração',hora:3200,limite:3500}],
      ordens:[], planejamento:[], historico:[]
    }
  };
  let empresaAtual = session.role === 'admin' ? (sessionStorage.getItem('operantisEmpresaSelecionada') || 'SENAI') : session.empresa;
  if(!EMPRESAS.includes(empresaAtual)) empresaAtual='SENAI';

  function clone(x){ return JSON.parse(JSON.stringify(x)); }
  function docRef(){ return db.collection('sistema_operantis_empresas').doc(empresaAtual); }
  async function ensureFirebase(){
    for(let i=0;i<40;i++){
      if(typeof firebaseReady!=='undefined' && firebaseReady && typeof db!=='undefined' && db) return true;
      await new Promise(r=>setTimeout(r,250));
    }
    return false;
  }
  function addHeader(){
    const header=document.querySelector('header'); if(!header) return;
    let box=document.getElementById('empresa-contexto');
    if(box) return;
    box=document.createElement('div'); box.id='empresa-contexto'; box.style.display='flex'; box.style.gap='8px'; box.style.alignItems='center';
    box.innerHTML=session.role==='admin'
      ? '<label style="font-size:.8rem;font-weight:bold;color:#6c757d">EMPRESA</label><select id="empresaSelect" style="padding:8px;border:1px solid #ccd2d7;border-radius:5px"><option>SENAI</option><option>VALE</option></select>'
      : '<span class="badge b-ok">Empresa: '+empresaAtual+'</span>';
    header.appendChild(box);
    if(session.role==='admin'){
      const s=document.getElementById('empresaSelect'); s.value=empresaAtual;
      s.addEventListener('change',async()=>{ empresaAtual=s.value; sessionStorage.setItem('operantisEmpresaSelecionada',empresaAtual); await carregarEmpresa(); });
    }
  }
  function companyLabel(){
    const title=document.getElementById('title');
    if(title && !title.textContent.includes('—')) title.textContent += ' — '+empresaAtual;
  }
  async function carregarEmpresa(){
    if(!(await ensureFirebase())) return;
    try{
      const snap=await docRef().get();
      let d=snap.exists?snap.data():null;
      if(!d){ d=clone(sementes[empresaAtual]); d.empresa=empresaAtual; d.estoque=clone(estoque[empresaAtual]); await docRef().set(d); }
      eq=Array.isArray(d.equipamentos)?d.equipamentos:[];
      os=Array.isArray(d.ordens)?d.ordens:[];
      plans=Array.isArray(d.planejamento)?d.planejamento:[];
      hist=Array.isArray(d.historico)?d.historico:[];
      window.__estoqueEmpresa=Array.isArray(d.estoque)?d.estoque:clone(estoque[empresaAtual]);
      if(typeof render==='function') render();
      companyLabel();
    }catch(e){ showError('Não foi possível carregar os dados da empresa '+empresaAtual+': '+e.message); }
  }
  window.saveCloudData=async function(){
    if(!(await ensureFirebase())) throw new Error('Firebase ainda não está pronto.');
    const data={empresa:empresaAtual,equipamentos:eq,ordens:os,planejamento:plans,historico:hist,estoque:window.__estoqueEmpresa||clone(estoque[empresaAtual]),atualizadoEm:firebase.firestore.FieldValue.serverTimestamp()};
    await docRef().set(data,{merge:true});
  };
  const originalRender=window.render;
  window.render=function(){
    if(originalRender) originalRender();
    const data=window.__estoqueEmpresa||estoque[empresaAtual];
    const stock=document.getElementById('stock');
    if(stock) stock.innerHTML=data.map(p=>`<tr><td>${p[0]}</td><td>${p[1]}</td><td>${p[2]}</td><td>${p[3]}</td><td>R$ ${Number(p[4]).toFixed(2).replace('.',',')}</td><td><span class="badge ${p[2]<p[3]?'b-danger':p[2]===p[3]?'b-warn':'b-ok'}">${p[2]<p[3]?'Crítico':p[2]===p[3]?'Atenção':'Normal'}</span></td></tr>`).join('');
    const kc=document.getElementById('kc'); if(kc) kc.textContent=data.filter(p=>p[2]<p[3]).length;
    const h=document.getElementById('hist');
    if(h) h.innerHTML=(Array.isArray(hist)&&hist.length)?hist.map(x=>`<tr><td>${x.data||'-'}</td><td>${x.tag||'-'}</td><td>${x.tipo||'-'}</td><td>${x.desc||'-'}</td><td>${x.peca||'-'}</td><td>R$ ${Number(x.custo||0).toFixed(2).replace('.',',')}</td></tr>`).join(''):'<tr><td colspan="6">Nenhum registro de manutenção ou falha para esta empresa.</td></tr>';
  };
  addHeader();
  carregarEmpresa();
})();
