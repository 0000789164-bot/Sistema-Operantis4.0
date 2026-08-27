/* Sistema-Operantis 4.0 - Exportação manual para Excel
 * Gera um arquivo .xlsx com os dados atuais do sistema.
 */
(function () {
  'use strict';

  const XLSX_URL = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
  let carregandoXlsx = null;

  function escapar(valor) {
    if (valor === null || valor === undefined) return '';
    if (Array.isArray(valor)) return valor.map(escapar).join(', ');
    if (typeof valor === 'object') return JSON.stringify(valor);
    return valor;
  }

  function carregarXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (carregandoXlsx) return carregandoXlsx;

    carregandoXlsx = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = XLSX_URL;
      script.async = true;
      script.onload = () => window.XLSX ? resolve(window.XLSX) : reject(new Error('Biblioteca XLSX não carregou.'));
      script.onerror = () => reject(new Error('Não foi possível carregar a biblioteca de exportação Excel.'));
      document.head.appendChild(script);
    });
    return carregandoXlsx;
  }

  function tabelaEquipamentos() {
    const dados = Array.isArray(window.eq) ? window.eq : [];
    return dados.map(e => ({
      TAG: escapar(e.tag),
      Equipamento: escapar(e.nome),
      Setor: escapar(e.setor),
      Horímetro: Number.isFinite(Number(e.hora)) ? Number(e.hora) : escapar(e.hora),
      'Limite Preventiva': Number.isFinite(Number(e.limite)) ? Number(e.limite) : escapar(e.limite)
    }));
  }

  function tabelaOS() {
    const dados = Array.isArray(window.os) ? window.os : [];
    return dados.map(o => ({
      OS: escapar(o.id),
      TAG: escapar(o.tag),
      Tipo: escapar(o.tipo),
      Descrição: escapar(o.desc),
      Técnico: escapar(o.tec),
      Status: escapar(o.status)
    }));
  }

  function tabelaPlanejamento() {
    const dados = Array.isArray(window.plans) ? window.plans : [];
    return dados.map(p => ({
      Data: escapar(p.data),
      Equipamento: escapar(p.eq || p.equipamento),
      Tipo: escapar(p.tipo),
      Serviço: escapar(p.serv || p.servico),
      Responsável: escapar(p.resp || p.responsavel),
      Prioridade: escapar(p.prioridade),
      Status: escapar(p.status),
      Progresso: escapar(p.progresso),
      Duração: escapar(p.duracao)
    }));
  }

  function tabelaEstoque() {
    const dados = Array.isArray(window.parts) ? window.parts : [];
    return dados.map(p => ({
      Código: escapar(p[0]),
      Item: escapar(p[1]),
      Quantidade: Number.isFinite(Number(p[2])) ? Number(p[2]) : escapar(p[2]),
      Mínimo: Number.isFinite(Number(p[3])) ? Number(p[3]) : escapar(p[3]),
      'Custo Unitário': Number.isFinite(Number(p[4])) ? Number(p[4]) : escapar(p[4]),
      Status: Number(p[2]) <= Number(p[3]) ? 'Crítico' : 'Normal'
    }));
  }

  function tabelaHistorico() {
    const dados = Array.isArray(window.hist) ? window.hist : [];
    return dados.map(h => ({
      'Data/Hora': escapar(h.data),
      TAG: escapar(h.tag),
      Tipo: escapar(h.tipo),
      Serviço: escapar(h.serv || h.servico),
      Peça: escapar(h.peca),
      Custo: escapar(h.custo)
    }));
  }

  function tabelaFalhas() {
    let dados = [];
    try {
      const local = JSON.parse(localStorage.getItem('operantis_falhas_v2') || '[]');
      if (Array.isArray(local)) dados = local;
    } catch (_) {}

    return dados.map(f => ({
      'Data/Hora': escapar(f.data),
      TAG: escapar(f.tag),
      Equipamento: escapar(f.equipamento),
      Setor: escapar(f.setor),
      Detecção: escapar(f.tipo),
      Descrição: escapar(f.descricao),
      Severidade: escapar(f.severidade),
      Status: escapar(f.status),
      'Resolvida em': escapar(f.resolvidaEm)
    }));
  }

  function adicionarAba(workbook, XLSX, nome, dados) {
    const linhas = dados.length ? dados : [{ Informação: 'Nenhum registro disponível.' }];
    const ws = XLSX.utils.json_to_sheet(linhas);
    const colunas = Object.keys(linhas[0]);
    ws['!cols'] = colunas.map(c => ({ wch: Math.min(45, Math.max(12, c.length + 4)) }));
    XLSX.utils.book_append_sheet(workbook, ws, nome.slice(0, 31));
  }

  async function exportarExcel() {
    const botao = document.getElementById('exportar-excel-btn');
    const textoOriginal = botao ? botao.textContent : '';
    try {
      if (botao) {
        botao.disabled = true;
        botao.textContent = '⏳ Preparando...';
      }

      const XLSX = await carregarXlsx();
      const wb = XLSX.utils.book_new();

      adicionarAba(wb, XLSX, 'Equipamentos', tabelaEquipamentos());
      adicionarAba(wb, XLSX, 'Ordens de Serviço', tabelaOS());
      adicionarAba(wb, XLSX, 'Planejamento', tabelaPlanejamento());
      adicionarAba(wb, XLSX, 'Estoque', tabelaEstoque());
      adicionarAba(wb, XLSX, 'Histórico', tabelaHistorico());
      adicionarAba(wb, XLSX, 'Falhas', tabelaFalhas());

      const resumo = [
        { Indicador: 'Equipamentos', Quantidade: Array.isArray(window.eq) ? window.eq.length : 0 },
        { Indicador: 'Ordens de Serviço', Quantidade: Array.isArray(window.os) ? window.os.length : 0 },
        { Indicador: 'Planejamentos', Quantidade: Array.isArray(window.plans) ? window.plans.length : 0 },
        { Indicador: 'Itens de estoque', Quantidade: Array.isArray(window.parts) ? window.parts.length : 0 },
        { Indicador: 'Histórico', Quantidade: Array.isArray(window.hist) ? window.hist.length : 0 },
        { Indicador: 'Falhas automáticas', Quantidade: tabelaFalhas().length },
        { Indicador: 'Gerado em', Quantidade: new Date().toLocaleString('pt-BR') }
      ];
      adicionarAba(wb, XLSX, 'Resumo', resumo);

      const data = new Date();
      const pad = n => String(n).padStart(2, '0');
      const nome = `Sistema-Operantis_${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}_${pad(data.getHours())}-${pad(data.getMinutes())}.xlsx`;
      XLSX.writeFile(wb, nome);

      if (botao) botao.textContent = '✓ Excel gerado';
      setTimeout(() => { if (botao) botao.textContent = textoOriginal || '📊 Exportar Excel'; }, 2500);
    } catch (erro) {
      console.error('Exportação Excel:', erro);
      alert('Não foi possível gerar o Excel. Verifique sua conexão com a internet e tente novamente.');
      if (botao) botao.textContent = textoOriginal || '📊 Exportar Excel';
    } finally {
      if (botao) botao.disabled = false;
    }
  }

  function criarBotao() {
    if (document.getElementById('exportar-excel-btn')) return;
    const header = document.querySelector('main .main > header, main header');
    if (!header) return;

    const botao = document.createElement('button');
    botao.id = 'exportar-excel-btn';
    botao.className = 'btn';
    botao.type = 'button';
    botao.textContent = '📊 Exportar Excel';
    botao.title = 'Baixar os dados atuais do sistema em formato Excel';
    botao.style.marginLeft = '12px';
    botao.addEventListener('click', exportarExcel);

    header.appendChild(botao);
  }

  window.exportarSistemaParaExcel = exportarExcel;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', criarBotao, { once: true });
  } else {
    criarBotao();
  }
})();
