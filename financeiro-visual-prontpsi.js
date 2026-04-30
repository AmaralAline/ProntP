// ============================================================
//  ProntPsi — Dashboard Financeiro Visual
//  Adicione no final do <body> do PainelExclusivo.html:
//  <script src="financeiro-visual-prontpsi.js"></script>
// ============================================================

(function () {
  'use strict';

  const API_URL = window.API_URL ||
    (location.hostname === 'localhost' ? 'http://localhost:5015'
      : 'https://prontpsiback-production.up.railway.app');

  const headersAuth = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const MESES_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  // ── Estilos ──────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('prontpsi-fin-styles')) return;
    const s = document.createElement('style');
    s.id = 'prontpsi-fin-styles';
    s.textContent = `
      #fin-dashboard-visual {
        font-family: 'Roboto', sans-serif;
        margin-bottom: 28px;
      }

      /* ── Header do dashboard visual ── */
      .fin-dash-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 12px;
      }
      .fin-dash-titulo {
        font-size: 15px;
        font-weight: 700;
        color: #e2e8f0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .fin-ano-selector {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .fin-ano-btn {
        background: rgba(139,92,246,0.1);
        border: 1px solid rgba(139,92,246,0.2);
        color: #a78bfa;
        border-radius: 8px;
        width: 28px; height: 28px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; font-size: 14px;
        transition: all 0.2s;
        font-family: 'Roboto', sans-serif;
      }
      .fin-ano-btn:hover { background: rgba(139,92,246,0.2); }
      .fin-ano-label {
        font-size: 13px;
        font-weight: 600;
        color: #e2e8f0;
        min-width: 40px;
        text-align: center;
      }

      /* ── Cards de KPI ── */
      .fin-kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 20px;
      }
      @media (max-width: 800px) { .fin-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 480px) { .fin-kpi-grid { grid-template-columns: 1fr 1fr; } }

      .fin-kpi {
        background: rgba(15,22,35,0.7);
        border: 1px solid rgba(139,92,246,0.15);
        border-radius: 12px;
        padding: 16px;
        position: relative;
        overflow: hidden;
        transition: border-color 0.2s;
      }
      .fin-kpi:hover { border-color: rgba(139,92,246,0.3); }
      .fin-kpi-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #475569;
        margin-bottom: 6px;
      }
      .fin-kpi-valor {
        font-size: 22px;
        font-weight: 700;
        color: #f1f5f9;
        line-height: 1;
        margin-bottom: 4px;
      }
      .fin-kpi-comp {
        font-size: 11px;
        color: #475569;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .fin-kpi-comp.positivo { color: #34d399; }
      .fin-kpi-comp.negativo { color: #f87171; }
      .fin-kpi-comp.neutro   { color: #64748b; }
      .fin-kpi-accent {
        position: absolute;
        top: 0; right: 0;
        width: 3px; height: 100%;
        border-radius: 0 12px 12px 0;
      }

      /* ── Gráfico de barras anual ── */
      .fin-grafico-card {
        background: rgba(15,22,35,0.7);
        border: 1px solid rgba(139,92,246,0.15);
        border-radius: 14px;
        padding: 20px;
        margin-bottom: 20px;
      }
      .fin-grafico-titulo {
        font-size: 13px;
        font-weight: 600;
        color: #94a3b8;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .fin-grafico-titulo span {
        font-size: 11px;
        color: #334155;
      }

      .fin-barras {
        display: flex;
        align-items: flex-end;
        gap: 6px;
        height: 140px;
        padding-bottom: 28px;
        position: relative;
      }
      /* Linhas de grade */
      .fin-barras::before {
        content: '';
        position: absolute;
        left: 0; right: 0;
        top: 0; bottom: 28px;
        background: repeating-linear-gradient(
          to bottom,
          rgba(139,92,246,0.05) 0px,
          rgba(139,92,246,0.05) 1px,
          transparent 1px,
          transparent 25%
        );
        pointer-events: none;
      }

      .fin-barra-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        height: 100%;
        justify-content: flex-end;
        cursor: pointer;
        position: relative;
      }

      .fin-barra-wrap {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        height: calc(100% - 20px);
        position: relative;
      }

      .fin-barra {
        width: 70%;
        min-height: 3px;
        border-radius: 4px 4px 0 0;
        background: rgba(139,92,246,0.3);
        transition: all 0.4s cubic-bezier(.4,0,.2,1);
        position: relative;
      }
      .fin-barra.tem-valor {
        background: linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%);
      }
      .fin-barra.mes-atual {
        background: linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%);
        box-shadow: 0 0 12px rgba(139,92,246,0.4);
      }
      .fin-barra-col:hover .fin-barra {
        filter: brightness(1.2);
      }

      .fin-barra-tooltip {
        position: absolute;
        bottom: calc(100% + 6px);
        left: 50%;
        transform: translateX(-50%);
        background: #1e2a3b;
        border: 1px solid rgba(139,92,246,0.3);
        color: #e2e8f0;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 6px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s;
        z-index: 10;
        font-family: 'Roboto', sans-serif;
      }
      .fin-barra-col:hover .fin-barra-tooltip { opacity: 1; }

      .fin-barra-mes {
        font-size: 10px;
        color: #475569;
        font-weight: 500;
        position: absolute;
        bottom: 0;
        text-align: center;
        width: 100%;
        transition: color 0.2s;
      }
      .fin-barra-col.mes-atual .fin-barra-mes {
        color: #a78bfa;
        font-weight: 700;
      }

      /* ── Linha de tendência (últimos 6 meses) ── */
      .fin-tendencia-card {
        background: rgba(15,22,35,0.7);
        border: 1px solid rgba(139,92,246,0.15);
        border-radius: 14px;
        padding: 20px;
        margin-bottom: 20px;
      }
      .fin-tendencia-titulo {
        font-size: 13px;
        font-weight: 600;
        color: #94a3b8;
        margin-bottom: 16px;
      }
      .fin-svg-wrap { width: 100%; overflow: hidden; }
      .fin-svg-wrap svg { width: 100%; display: block; }

      /* ── Top pacientes ── */
      .fin-top-card {
        background: rgba(15,22,35,0.7);
        border: 1px solid rgba(139,92,246,0.15);
        border-radius: 14px;
        padding: 20px;
        margin-bottom: 20px;
      }
      .fin-top-titulo {
        font-size: 13px;
        font-weight: 600;
        color: #94a3b8;
        margin-bottom: 14px;
      }
      .fin-top-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
        border-bottom: 1px solid rgba(139,92,246,0.06);
      }
      .fin-top-item:last-child { border-bottom: none; }
      .fin-top-rank {
        font-size: 12px;
        font-weight: 700;
        color: #334155;
        width: 20px;
        text-align: center;
        flex-shrink: 0;
      }
      .fin-top-nome {
        flex: 1;
        font-size: 13px;
        color: #cbd5e1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .fin-top-valor {
        font-size: 13px;
        font-weight: 700;
        color: #a78bfa;
        flex-shrink: 0;
      }
      .fin-top-barra-bg {
        height: 3px;
        background: rgba(139,92,246,0.1);
        border-radius: 99px;
        flex: 1;
        max-width: 80px;
      }
      .fin-top-barra-fill {
        height: 100%;
        background: linear-gradient(90deg, #7c3aed, #a78bfa);
        border-radius: 99px;
        transition: width 0.5s ease;
      }

      /* ── Grid 2 col para grafico + top ── */
      .fin-row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 4px;
      }
      @media (max-width: 700px) { .fin-row-2 { grid-template-columns: 1fr; } }

      /* ── Divisor ── */
      .fin-divisor {
        height: 1px;
        background: rgba(139,92,246,0.1);
        margin: 24px 0;
      }
      .fin-divisor-label {
        text-align: center;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: #334155;
        margin-top: -18px;
        position: relative;
      }
      .fin-divisor-label span {
        background: #0c1320;
        padding: 0 12px;
      }

      /* loading */
      .fin-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 120px;
        color: #475569;
        font-size: 13px;
        gap: 10px;
      }
    `;
    document.head.appendChild(s);
  }

  // ── Criar estrutura HTML do dashboard ────────────────────────
  function criarDashboard() {
    if (document.getElementById('fin-dashboard-visual')) return;

    const section = document.getElementById('financeiro-section');
    if (!section) return;

    // Insere antes dos filtros existentes
    const filtros = section.querySelector('.form-card');
    if (!filtros) return;

    const div = document.createElement('div');
    div.id = 'fin-dashboard-visual';
    div.innerHTML = `
      <div class="fin-dash-header">
        <div class="fin-dash-titulo">
          <i class="fas fa-chart-line" style="color:#8b5cf6;"></i>
          Visão Geral Financeira
        </div>
        <div class="fin-ano-selector">
          <button class="fin-ano-btn" id="fin-vis-prev">‹</button>
          <span class="fin-ano-label" id="fin-vis-ano">${new Date().getFullYear()}</span>
          <button class="fin-ano-btn" id="fin-vis-next">›</button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="fin-kpi-grid" id="fin-kpis">
        <div class="fin-loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
      </div>

      <!-- Gráfico anual + Top pacientes -->
      <div class="fin-row-2">
        <div class="fin-grafico-card">
          <div class="fin-grafico-titulo">
            Receita mensal
            <span id="fin-grafico-subtitulo"></span>
          </div>
          <div class="fin-barras" id="fin-barras"></div>
        </div>
        <div class="fin-top-card">
          <div class="fin-top-titulo">🏆 Top pacientes do ano</div>
          <div id="fin-top-lista"></div>
        </div>
      </div>

      <!-- Tendência -->
      <div class="fin-tendencia-card">
        <div class="fin-tendencia-titulo">📈 Tendência — últimos 6 meses</div>
        <div class="fin-svg-wrap" id="fin-tendencia-wrap"></div>
      </div>

      <div class="fin-divisor"></div>
      <div class="fin-divisor-label"><span>Detalhamento por período</span></div>
    `;

    section.insertBefore(div, filtros);

    // Controles de ano
    let anoVis = new Date().getFullYear();
    document.getElementById('fin-vis-prev').onclick = () => { anoVis--; atualizarAno(anoVis); };
    document.getElementById('fin-vis-next').onclick = () => { anoVis++; atualizarAno(anoVis); };

    function atualizarAno(ano) {
      document.getElementById('fin-vis-ano').textContent = ano;
      renderDashboard(ano);
    }

    renderDashboard(anoVis);
  }

  // ── Buscar e processar dados ──────────────────────────────────
  async function buscarTodos() {
    const res = await fetch(`${API_URL}/api/agendamentos-online`, { headers: headersAuth() });
    if (!res.ok) throw new Error('Erro ao buscar dados');
    return res.json();
  }

  async function renderDashboard(ano) {
    const kpis = document.getElementById('fin-kpis');
    if (kpis) kpis.innerHTML = `<div class="fin-loading" style="grid-column:1/-1"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>`;

    try {
      const todos = await buscarTodos();
      const confirmados = todos.filter(a => a.status === 'confirmado');

      const agora = new Date();
      const mesAtual = agora.getMonth(); // 0-11
      const anoAtual = agora.getFullYear();

      // ── Dados por mês do ano selecionado ──
      const porMes = Array(12).fill(0);
      confirmados.forEach(a => {
        const d = new Date(a.data_consulta + 'T00:00:00');
        if (d.getFullYear() === ano) {
          porMes[d.getMonth()] += parseFloat(a.valor || 0);
        }
      });

      // ── Mês atual e anterior ──
      const valorMesAtual = ano === anoAtual ? porMes[mesAtual] : 0;
      const valorMesAnterior = (() => {
        const m = mesAtual === 0 ? 11 : mesAtual - 1;
        const a2 = mesAtual === 0 ? anoAtual - 1 : anoAtual;
        if (ano !== anoAtual && ano !== a2) return 0;
        return confirmados.filter(ag => {
          const d = new Date(ag.data_consulta + 'T00:00:00');
          return d.getMonth() === m && d.getFullYear() === a2;
        }).reduce((s, a) => s + parseFloat(a.valor || 0), 0);
      })();

      // ── Total do ano ──
      const totalAno = porMes.reduce((s, v) => s + v, 0);

      // ── Consultas do mês atual ──
      const consultasMes = todos.filter(a => {
        const d = new Date(a.data_consulta + 'T00:00:00');
        return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
      });
      const confirmMes = consultasMes.filter(a => a.status === 'confirmado').length;
      const ticketMedio = confirmMes > 0 ? valorMesAtual / confirmMes : 0;

      // ── Variação mês a mês ──
      const variacaoPerc = valorMesAnterior > 0
        ? ((valorMesAtual - valorMesAnterior) / valorMesAnterior * 100)
        : null;

      // ── Top pacientes do ano ──
      const porPaciente = {};
      confirmados.filter(a => new Date(a.data_consulta + 'T00:00:00').getFullYear() === ano)
        .forEach(a => {
          const nome = a.paciente_nome || 'Desconhecido';
          porPaciente[nome] = (porPaciente[nome] || 0) + parseFloat(a.valor || 0);
        });
      const topPacientes = Object.entries(porPaciente)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // ── Últimos 6 meses (tendência) ──
      const ultimos6 = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(anoAtual, mesAtual - i, 1);
        const m = d.getMonth();
        const a = d.getFullYear();
        const total = confirmados
          .filter(ag => {
            const dd = new Date(ag.data_consulta + 'T00:00:00');
            return dd.getMonth() === m && dd.getFullYear() === a;
          })
          .reduce((s, ag) => s + parseFloat(ag.valor || 0), 0);
        ultimos6.push({ label: MESES[m], valor: total });
      }

      // ── Renderizar KPIs ──
      renderKPIs(valorMesAtual, valorMesAnterior, variacaoPerc, totalAno, confirmMes, ticketMedio, ano, anoAtual, mesAtual);

      // ── Renderizar barras ──
      renderBarras(porMes, ano, anoAtual, mesAtual);

      // ── Renderizar top pacientes ──
      renderTop(topPacientes);

      // ── Renderizar tendência ──
      renderTendencia(ultimos6);

    } catch (err) {
      if (kpis) kpis.innerHTML = `<div class="fin-loading" style="grid-column:1/-1;color:#f87171;">Erro ao carregar dados.</div>`;
      console.error(err);
    }
  }

  // ── KPIs ─────────────────────────────────────────────────────
  function renderKPIs(valorMes, valorAnt, variacao, totalAno, qtdMes, ticket, ano, anoAtual, mesAtual) {
    const fmt = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const nomeMes = MESES_FULL[mesAtual];

    let varHtml = `<span class="fin-kpi-comp neutro">— sem dados anteriores</span>`;
    if (variacao !== null) {
      const cls = variacao >= 0 ? 'positivo' : 'negativo';
      const seta = variacao >= 0 ? '▲' : '▼';
      varHtml = `<span class="fin-kpi-comp ${cls}">${seta} ${Math.abs(variacao).toFixed(1)}% vs mês anterior</span>`;
    }

    const kpis = [
      {
        label: ano === anoAtual ? `Receita em ${nomeMes}` : `Total ${ano}`,
        valor: ano === anoAtual ? fmt(valorMes) : fmt(totalAno),
        comp: ano === anoAtual ? varHtml : `<span class="fin-kpi-comp neutro">${Object.keys({}).length} meses com receita</span>`,
        cor: '#8b5cf6',
      },
      {
        label: `Total em ${ano}`,
        valor: fmt(totalAno),
        comp: `<span class="fin-kpi-comp neutro">acumulado no ano</span>`,
        cor: '#60a5fa',
      },
      {
        label: ano === anoAtual ? `Consultas em ${nomeMes}` : 'Consultas no ano',
        valor: ano === anoAtual ? qtdMes : '—',
        comp: `<span class="fin-kpi-comp neutro">confirmadas</span>`,
        cor: '#34d399',
      },
      {
        label: 'Ticket médio',
        valor: ticket > 0 ? fmt(ticket) : '—',
        comp: `<span class="fin-kpi-comp neutro">por consulta</span>`,
        cor: '#fbbf24',
      },
    ];

    const el = document.getElementById('fin-kpis');
    if (!el) return;
    el.innerHTML = kpis.map(k => `
      <div class="fin-kpi">
        <div class="fin-kpi-accent" style="background:${k.cor};"></div>
        <div class="fin-kpi-label">${k.label}</div>
        <div class="fin-kpi-valor">${k.valor}</div>
        ${k.comp}
      </div>
    `).join('');
  }

  // ── Barras ───────────────────────────────────────────────────
  function renderBarras(porMes, ano, anoAtual, mesAtual) {
    const el = document.getElementById('fin-barras');
    if (!el) return;

    const maxVal = Math.max(...porMes, 1);
    const fmt = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const sub = document.getElementById('fin-grafico-subtitulo');
    if (sub) sub.textContent = `Total: ${fmt(porMes.reduce((s,v)=>s+v,0))}`;

    el.innerHTML = porMes.map((val, i) => {
      const pct = Math.max((val / maxVal) * 100, val > 0 ? 4 : 2);
      const isAtual = ano === anoAtual && i === mesAtual;
      const temValor = val > 0;
      return `
        <div class="fin-barra-col ${isAtual ? 'mes-atual' : ''}">
          <div class="fin-barra-wrap">
            <div class="fin-barra-tooltip">${fmt(val)}</div>
            <div class="fin-barra ${temValor ? 'tem-valor' : ''} ${isAtual ? 'mes-atual' : ''}"
                 style="height:${pct}%;"></div>
          </div>
          <div class="fin-barra-mes">${MESES[i]}</div>
        </div>`;
    }).join('');
  }

  // ── Top pacientes ─────────────────────────────────────────────
  function renderTop(top) {
    const el = document.getElementById('fin-top-lista');
    if (!el) return;
    if (!top.length) {
      el.innerHTML = `<p style="font-size:13px;color:#334155;text-align:center;padding:20px 0;">Nenhum dado disponível.</p>`;
      return;
    }
    const maxVal = top[0][1];
    const fmt = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    el.innerHTML = top.map(([nome, val], i) => `
      <div class="fin-top-item">
        <span class="fin-top-rank">${i + 1}</span>
        <span class="fin-top-nome">${nome}</span>
        <div class="fin-top-barra-bg">
          <div class="fin-top-barra-fill" style="width:${(val/maxVal*100).toFixed(0)}%"></div>
        </div>
        <span class="fin-top-valor">${fmt(val)}</span>
      </div>`).join('');
  }

  // ── Tendência (linha SVG) ─────────────────────────────────────
  function renderTendencia(dados) {
    const el = document.getElementById('fin-tendencia-wrap');
    if (!el) return;

    const W = 600, H = 100;
    const pad = { top: 10, right: 20, bottom: 24, left: 50 };
    const maxVal = Math.max(...dados.map(d => d.valor), 1);
    const fmt = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const xs = dados.map((_, i) =>
      pad.left + i * ((W - pad.left - pad.right) / (dados.length - 1))
    );
    const ys = dados.map(d =>
      pad.top + (1 - d.valor / maxVal) * (H - pad.top - pad.bottom)
    );

    // Path da linha
    const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');

    // Path da área preenchida
    const area = `${path} L ${xs[xs.length-1].toFixed(1)} ${(H - pad.bottom).toFixed(1)} L ${xs[0].toFixed(1)} ${(H - pad.bottom).toFixed(1)} Z`;

    // Eixo Y (3 linhas)
    const grades = [0, 0.5, 1].map(p => {
      const y = pad.top + (1 - p) * (H - pad.top - pad.bottom);
      const v = maxVal * p;
      return `
        <line x1="${pad.left}" y1="${y.toFixed(1)}" x2="${W - pad.right}" y2="${y.toFixed(1)}"
              stroke="rgba(139,92,246,0.08)" stroke-width="1"/>
        <text x="${(pad.left - 6).toFixed(1)}" y="${(y + 4).toFixed(1)}"
              fill="#334155" font-size="9" text-anchor="end" font-family="Roboto,sans-serif">
          ${v >= 1000 ? 'R$' + (v/1000).toFixed(0) + 'k' : 'R$' + v.toFixed(0)}
        </text>`;
    }).join('');

    // Labels do eixo X
    const labels = dados.map((d, i) => `
      <text x="${xs[i].toFixed(1)}" y="${H.toFixed(1)}"
            fill="${i === dados.length - 1 ? '#a78bfa' : '#475569'}"
            font-size="9" text-anchor="middle" font-family="Roboto,sans-serif">
        ${d.label}
      </text>`).join('');

    // Pontos
    const pontos = dados.map((d, i) => `
      <circle cx="${xs[i].toFixed(1)}" cy="${ys[i].toFixed(1)}" r="${i === dados.length - 1 ? 4 : 3}"
              fill="${i === dados.length - 1 ? '#a78bfa' : '#7c3aed'}"
              stroke="#0f1623" stroke-width="2">
        <title>${d.label}: ${fmt(d.valor)}</title>
      </circle>`).join('');

    el.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fin-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        ${grades}
        <path d="${area}" fill="url(#fin-grad)"/>
        <path d="${path}" fill="none" stroke="#8b5cf6" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
        ${labels}
        ${pontos}
      </svg>`;
  }

  // ── Interceptar carregarFinanceiro para sincronizar ───────────
  function hookFinanceiro() {
    const original = window.carregarFinanceiro;
    if (typeof original !== 'function') return;
    window.carregarFinanceiro = async function() {
      await original.apply(this, arguments);
      // Atualiza o ano visual baseado no filtro selecionado
      const ano = parseInt(document.getElementById('fin-ano')?.value) || new Date().getFullYear();
      document.getElementById('fin-vis-ano').textContent = ano;
      renderDashboard(ano);
    };
  }

  // ── Init ─────────────────────────────────────────────────────
  function init() {
    injectStyles();

    // Aguarda a seção financeiro existir
    const esperar = setInterval(() => {
      if (document.getElementById('financeiro-section')) {
        clearInterval(esperar);
        criarDashboard();
        hookFinanceiro();
      }
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
