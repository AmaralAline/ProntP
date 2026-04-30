// ============================================================
//  ProntPsi — Sistema de Notificações (sininho)
//  Adicione no final do <body> do PainelExclusivo.html:
//  <script src="notificacoes-prontpsi.js"></script>
// ============================================================

(function () {
  'use strict';

  const POLL_INTERVAL = 2 * 60 * 1000; // atualiza a cada 2 minutos
  let notificacoes = [];
  let vistas = JSON.parse(localStorage.getItem('prontpsi_notif_vistas') || '[]');

  // ── Estilos ──────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('prontpsi-notif-styles')) return;
    const s = document.createElement('style');
    s.id = 'prontpsi-notif-styles';
    s.textContent = `
      /* ── Botão sininho ── */
      #notif-btn {
        position: fixed;
        top: 18px;
        right: 24px;
        width: 40px;
        height: 40px;
        background: rgba(15, 22, 35, 0.95);
        border: 1px solid rgba(139,92,246,0.25);
        border-radius: 50%;
        color: #94a3b8;
        font-size: 17px;
        cursor: pointer;
        z-index: 8000;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        box-shadow: 0 2px 12px rgba(0,0,0,0.3);
      }
      #notif-btn:hover {
        border-color: rgba(139,92,246,0.6);
        color: #a78bfa;
        transform: scale(1.08);
      }
      #notif-btn.tem-novas {
        border-color: rgba(139,92,246,0.7);
        color: #a78bfa;
        animation: notif-pulse 2.5s ease-in-out infinite;
      }
      @keyframes notif-pulse {
        0%, 100% { box-shadow: 0 2px 12px rgba(0,0,0,0.3); }
        50% { box-shadow: 0 0 0 6px rgba(139,92,246,0.15), 0 2px 12px rgba(0,0,0,0.3); }
      }

      /* ── Badge de contagem ── */
      #notif-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 18px;
        height: 18px;
        background: #7c3aed;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        border-radius: 99px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        font-family: 'Roboto', sans-serif;
        border: 2px solid #0a0f1a;
        display: none;
      }

      /* ── Painel dropdown ── */
      #notif-panel {
        position: fixed;
        top: 66px;
        right: 20px;
        width: 340px;
        max-width: calc(100vw - 32px);
        background: #111827;
        border: 1px solid rgba(139,92,246,0.25);
        border-radius: 14px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        z-index: 7999;
        overflow: hidden;
        display: none;
        font-family: 'Roboto', sans-serif;
        animation: notif-drop 0.2s ease;
      }
      @keyframes notif-drop {
        from { opacity: 0; transform: translateY(-8px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      #notif-panel.aberto { display: block; }

      .notif-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px 10px;
        border-bottom: 1px solid rgba(139,92,246,0.12);
      }
      .notif-header h4 {
        font-size: 13px;
        font-weight: 700;
        color: #f1f5f9;
        margin: 0;
        letter-spacing: 0.3px;
      }
      .notif-marcar-todas {
        font-size: 11px;
        color: #8b5cf6;
        background: none;
        border: none;
        cursor: pointer;
        font-family: 'Roboto', sans-serif;
        padding: 0;
        transition: color 0.2s;
      }
      .notif-marcar-todas:hover { color: #a78bfa; }

      .notif-lista {
        max-height: 380px;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(139,92,246,0.2) transparent;
      }
      .notif-lista::-webkit-scrollbar { width: 4px; }
      .notif-lista::-webkit-scrollbar-thumb {
        background: rgba(139,92,246,0.2);
        border-radius: 4px;
      }

      .notif-item {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255,255,255,0.04);
        cursor: pointer;
        transition: background 0.15s;
        position: relative;
      }
      .notif-item:hover { background: rgba(139,92,246,0.06); }
      .notif-item.nova { background: rgba(139,92,246,0.05); }
      .notif-item.nova::before {
        content: '';
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: 3px;
        background: #7c3aed;
        border-radius: 0 3px 3px 0;
      }

      .notif-icone {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        flex-shrink: 0;
        margin-top: 1px;
      }

      .notif-corpo { flex: 1; min-width: 0; }
      .notif-titulo {
        font-size: 13px;
        font-weight: 600;
        color: #e2e8f0;
        margin: 0 0 2px;
        line-height: 1.3;
      }
      .notif-desc {
        font-size: 12px;
        color: #64748b;
        margin: 0;
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .notif-item.nova .notif-titulo { color: #f1f5f9; }
      .notif-item.nova .notif-desc { color: #94a3b8; }

      .notif-vazia {
        padding: 32px 16px;
        text-align: center;
        color: #475569;
        font-size: 13px;
      }
      .notif-vazia span { display: block; font-size: 28px; margin-bottom: 8px; }

      .notif-footer {
        padding: 10px 16px;
        border-top: 1px solid rgba(139,92,246,0.1);
        text-align: center;
      }
      .notif-footer-info {
        font-size: 11px;
        color: #334155;
      }

      /* ── Responsivo ── */
      @media (max-width: 480px) {
        #notif-btn { top: 14px; right: 16px; }
        #notif-panel { top: 60px; right: 12px; width: calc(100vw - 24px); }
      }
    `;
    document.head.appendChild(s);
  }

  // ── Criar elementos no DOM ───────────────────────────────────
  function criarUI() {
    // Botão sininho
    const btn = document.createElement('button');
    btn.id = 'notif-btn';
    btn.setAttribute('title', 'Notificações');
    btn.innerHTML = `
      <i class="fas fa-bell"></i>
      <span id="notif-badge"></span>
    `;
    btn.addEventListener('click', togglePanel);
    document.body.appendChild(btn);

    // Painel
    const panel = document.createElement('div');
    panel.id = 'notif-panel';
    panel.innerHTML = `
      <div class="notif-header">
        <h4>🔔 Notificações</h4>
        <button class="notif-marcar-todas" onclick="window._notifMarcarTodas()">Marcar todas como lidas</button>
      </div>
      <div class="notif-lista" id="notif-lista"></div>
      <div class="notif-footer">
        <span class="notif-footer-info" id="notif-ultima-atualizacao">Atualizando...</span>
      </div>
    `;
    document.body.appendChild(panel);

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !panel.contains(e.target)) {
        panel.classList.remove('aberto');
      }
    });
  }

  function togglePanel() {
    const panel = document.getElementById('notif-panel');
    const aberto = panel.classList.toggle('aberto');
    if (aberto) marcarTodasVistas();
  }

  // ── Buscar dados das APIs existentes ─────────────────────────
  async function buscarNotificacoes() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const API_URL = window.API_URL ||
      (location.hostname === 'localhost' ? 'http://localhost:5015'
        : 'https://prontpsiback-production.up.railway.app');

    const headers = { 'Authorization': `Bearer ${token}` };
    const novas = [];

    try {
      // 1. Consultas de hoje
      const hoje = new Date();
      const pad = n => String(n).padStart(2, '0');
      const diaStr = `${hoje.getFullYear()}-${pad(hoje.getMonth()+1)}-${pad(hoje.getDate())}`;
      const resAgenda = await fetch(
        `${API_URL}/api/agenda?inicio=${diaStr} 00:00:00&fim=${diaStr} 23:59:59`,
        { headers }
      );
      if (resAgenda.ok) {
        const consultas = await resAgenda.json();
        const agora = hoje.getHours() * 60 + hoje.getMinutes();

        consultas.forEach(c => {
          const dt = new Date(c.data_hora_inicio);
          const minConsulta = dt.getHours() * 60 + dt.getMinutes();
          const diff = minConsulta - agora;
          const horaFmt = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;

          if (diff > 0 && diff <= 60) {
            novas.push({
              id: `consulta-proxima-${c.id}`,
              tipo: 'alerta',
              icone: '⏰',
              cor: 'rgba(251,191,36,0.15)',
              titulo: `Consulta em ${diff} min`,
              desc: `${c.paciente_nome || 'Paciente'} às ${horaFmt}`,
              acao: () => document.getElementById('btn-agenda')?.click(),
            });
          } else if (diff <= 0 && diff > -60 && c.status !== 'realizado' && c.status !== 'cancelado') {
            novas.push({
              id: `consulta-agora-${c.id}`,
              tipo: 'info',
              icone: '🟢',
              cor: 'rgba(52,211,153,0.15)',
              titulo: 'Consulta em andamento',
              desc: `${c.paciente_nome || 'Paciente'} — iniciou às ${horaFmt}`,
              acao: () => document.getElementById('btn-agenda')?.click(),
            });
          }
        });

        if (consultas.length > 0) {
          novas.push({
            id: `agenda-hoje-${diaStr}`,
            tipo: 'info',
            icone: '📅',
            cor: 'rgba(96,165,250,0.15)',
            titulo: `${consultas.length} consulta${consultas.length > 1 ? 's' : ''} hoje`,
            desc: `Primeira às ${(() => { const d = new Date(consultas[0].data_hora_inicio); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; })()}`,
            acao: () => document.getElementById('btn-agenda')?.click(),
          });
        }
      }
    } catch (_) {}

    try {
      // 2. Formulários respondidos recentemente (últimas 24h)
      const resResp = await fetch(`${API_URL}/api/escalas/resultados`, { headers });
      if (resResp.ok) {
        const respondidos = await resResp.json();
        const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentes = respondidos.filter(r => new Date(r.respondido_em || r.created_at) > ontem);
        if (recentes.length > 0) {
          novas.push({
            id: `formularios-respondidos-${recentes.length}`,
            tipo: 'sucesso',
            icone: '📋',
            cor: 'rgba(52,211,153,0.15)',
            titulo: `${recentes.length} formulário${recentes.length > 1 ? 's' : ''} respondido${recentes.length > 1 ? 's' : ''}`,
            desc: 'Nas últimas 24 horas — clique para ver',
            acao: () => document.getElementById('btn-resultados')?.click(),
          });
        }
      }
    } catch (_) {}

    try {
      // 3. Formulários pendentes
      const resPend = await fetch(`${API_URL}/api/escalas/links-pendentes`, { headers });
      if (resPend.ok) {
        const pendentes = await resPend.json();
        if (pendentes.length > 0) {
          novas.push({
            id: `formularios-pendentes-${pendentes.length}`,
            tipo: 'aviso',
            icone: '⏳',
            cor: 'rgba(251,191,36,0.12)',
            titulo: `${pendentes.length} formulário${pendentes.length > 1 ? 's' : ''} sem resposta`,
            desc: 'Paciente(s) ainda não responderam',
            acao: () => document.getElementById('btn-form')?.click(),
          });
        }
      }
    } catch (_) {}

    try {
      // 4. Agendamentos online aguardando
      const resOnline = await fetch(`${API_URL}/api/agendamentos-online`, { headers });
      if (resOnline.ok) {
        const agendamentos = await resOnline.json();
        const aguardando = agendamentos.filter(a => a.status === 'pendente' || a.status === 'aguardando');
        if (aguardando.length > 0) {
          novas.push({
            id: `agendamentos-online-${aguardando.length}`,
            tipo: 'alerta',
            icone: '🔗',
            cor: 'rgba(139,92,246,0.15)',
            titulo: `${aguardando.length} agendamento${aguardando.length > 1 ? 's' : ''} online`,
            desc: 'Aguardando sua confirmação',
            acao: () => document.getElementById('btn-agenda-online')?.click(),
          });
        }
      }
    } catch (_) {}

    notificacoes = novas;
    renderNotificacoes();
    atualizarBadge();
    atualizarTimestamp();
  }

  // ── Renderizar lista ─────────────────────────────────────────
  function renderNotificacoes() {
    const lista = document.getElementById('notif-lista');
    if (!lista) return;

    if (!notificacoes.length) {
      lista.innerHTML = `
        <div class="notif-vazia">
          <span>🎉</span>
          Tudo em dia por aqui!
        </div>`;
      return;
    }

    lista.innerHTML = notificacoes.map(n => {
      const isNova = !vistas.includes(n.id);
      return `
        <div class="notif-item ${isNova ? 'nova' : ''}" onclick="window._notifAcao('${n.id}')">
          <div class="notif-icone" style="background:${n.cor}; font-size:16px;">
            ${n.icone}
          </div>
          <div class="notif-corpo">
            <p class="notif-titulo">${n.titulo}</p>
            <p class="notif-desc">${n.desc}</p>
          </div>
        </div>`;
    }).join('');
  }

  // ── Badge ────────────────────────────────────────────────────
  function atualizarBadge() {
    const badge = document.getElementById('notif-badge');
    const btn = document.getElementById('notif-btn');
    if (!badge || !btn) return;

    const novas = notificacoes.filter(n => !vistas.includes(n.id)).length;
    if (novas > 0) {
      badge.style.display = 'flex';
      badge.textContent = novas > 9 ? '9+' : novas;
      btn.classList.add('tem-novas');
    } else {
      badge.style.display = 'none';
      btn.classList.remove('tem-novas');
    }
  }

  function atualizarTimestamp() {
    const el = document.getElementById('notif-ultima-atualizacao');
    if (el) {
      const agora = new Date();
      const pad = n => String(n).padStart(2, '0');
      el.textContent = `Atualizado às ${pad(agora.getHours())}:${pad(agora.getMinutes())}`;
    }
  }

  // ── Marcar como vistas ───────────────────────────────────────
  function marcarTodasVistas() {
    vistas = notificacoes.map(n => n.id);
    localStorage.setItem('prontpsi_notif_vistas', JSON.stringify(vistas));
    atualizarBadge();
    renderNotificacoes();
  }

  // ── Expor funções pro HTML inline ────────────────────────────
  window._notifMarcarTodas = marcarTodasVistas;
  window._notifAcao = (id) => {
    const n = notificacoes.find(x => x.id === id);
    if (n?.acao) {
      document.getElementById('notif-panel')?.classList.remove('aberto');
      n.acao();
    }
    // Marcar essa como vista
    if (!vistas.includes(id)) {
      vistas.push(id);
      localStorage.setItem('prontpsi_notif_vistas', JSON.stringify(vistas));
      atualizarBadge();
      renderNotificacoes();
    }
  };

  // ── Init ─────────────────────────────────────────────────────
  function init() {
    injectStyles();
    criarUI();
    // Aguarda o login/token estar disponível
    const esperar = setInterval(() => {
      if (localStorage.getItem('token')) {
        clearInterval(esperar);
        buscarNotificacoes();
        setInterval(buscarNotificacoes, POLL_INTERVAL);
      }
    }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
