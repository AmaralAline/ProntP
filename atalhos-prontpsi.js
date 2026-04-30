// ============================================================
//  ProntPsi — Atalhos Rápidos no Dashboard
//  Adicione no final do <body> do PainelExclusivo.html:
//  <script src="atalhos-prontpsi.js"></script>
// ============================================================

(function () {
  'use strict';

  // ── Estilos ──────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('prontpsi-atalhos-styles')) return;
    const s = document.createElement('style');
    s.id = 'prontpsi-atalhos-styles';
    s.textContent = `
      /* ── Container dos atalhos ── */
      #atalhos-rapidos {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 28px;
        font-family: 'Roboto', sans-serif;
      }

      /* ── Card de atalho ── */
      .atalho-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        background: rgba(15, 22, 35, 0.6);
        border: 1px solid rgba(139,92,246,0.15);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(.4,0,.2,1);
        text-decoration: none;
        position: relative;
        overflow: hidden;
      }
      .atalho-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(139,92,246,0.08) 0%, transparent 60%);
        opacity: 0;
        transition: opacity 0.2s;
      }
      .atalho-card:hover {
        border-color: rgba(139,92,246,0.4);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      }
      .atalho-card:hover::before { opacity: 1; }
      .atalho-card:active { transform: translateY(0); }

      .atalho-icone {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
        transition: transform 0.2s;
      }
      .atalho-card:hover .atalho-icone { transform: scale(1.1); }

      .atalho-texto { min-width: 0; }
      .atalho-label {
        font-size: 13px;
        font-weight: 600;
        color: #e2e8f0;
        margin: 0 0 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .atalho-sub {
        font-size: 11px;
        color: #475569;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* ── Título da seção ── */
      .atalhos-titulo {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 1.2px;
        text-transform: uppercase;
        color: #334155;
        margin: 0 0 10px;
        font-family: 'Roboto', sans-serif;
      }

      /* ── Responsivo ── */
      @media (max-width: 900px) {
        #atalhos-rapidos { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 500px) {
        #atalhos-rapidos { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .atalho-card { padding: 10px 12px; gap: 8px; }
        .atalho-icone { width: 30px; height: 30px; font-size: 14px; }
        .atalho-label { font-size: 12px; }
        .atalho-sub { display: none; }
      }
    `;
    document.head.appendChild(s);
  }

  // ── Definição dos atalhos ────────────────────────────────────
  const atalhos = [
    {
      icone: 'fa-calendar-plus',
      cor: 'rgba(139,92,246,0.2)',
      corIcone: '#a78bfa',
      label: 'Nova Consulta',
      sub: 'Agendar atendimento',
      acao: () => {
        // Navega para Agenda
        document.getElementById('btn-agenda')?.click();
        // Foca no select de paciente após transição
        setTimeout(() => {
          const el = document.getElementById('paciente-agenda');
          if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        }, 300);
      }
    },
    {
      icone: 'fa-user-plus',
      cor: 'rgba(96,165,250,0.15)',
      corIcone: '#60a5fa',
      label: 'Novo Paciente',
      sub: 'Cadastrar paciente',
      acao: () => {
        document.getElementById('btn-cadastro')?.click();
        setTimeout(() => {
          const el = document.getElementById('nome');
          if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        }, 300);
      }
    },
    {
      icone: 'fa-notes-medical',
      cor: 'rgba(52,211,153,0.15)',
      corIcone: '#34d399',
      label: 'Novo Prontuário',
      sub: 'Registrar evolução',
      acao: () => {
        document.getElementById('btn-evolucao')?.click();
        setTimeout(() => {
          const el = document.getElementById('paciente') || document.getElementById('paciente-historico');
          if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        }, 300);
      }
    },
    {
      icone: 'fa-paper-plane',
      cor: 'rgba(251,191,36,0.12)',
      corIcone: '#fbbf24',
      label: 'Enviar Formulário',
      sub: 'Para um paciente',
      acao: () => {
        document.getElementById('btn-form')?.click();
        setTimeout(() => {
          const el = document.getElementById('paciente-form');
          if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        }, 300);
      }
    },
  ];

  // ── Criar bloco de atalhos no dashboard ──────────────────────
  function criarAtalhos() {
    // Encontra o container dos cards de resumo para inserir após ele
    const dashCards = document.querySelector('.dashboard-cards');
    if (!dashCards) return;

    const wrapper = document.createElement('div');

    const titulo = document.createElement('p');
    titulo.className = 'atalhos-titulo';
    titulo.textContent = 'Ações rápidas';

    const grid = document.createElement('div');
    grid.id = 'atalhos-rapidos';

    atalhos.forEach(a => {
      const card = document.createElement('div');
      card.className = 'atalho-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <div class="atalho-icone" style="background:${a.cor};">
          <i class="fas ${a.icone}" style="color:${a.corIcone};"></i>
        </div>
        <div class="atalho-texto">
          <p class="atalho-label">${a.label}</p>
          <p class="atalho-sub">${a.sub}</p>
        </div>
      `;
      card.addEventListener('click', a.acao);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') a.acao(); });
      grid.appendChild(card);
    });

    wrapper.appendChild(titulo);
    wrapper.appendChild(grid);

    // Insere depois dos cards de resumo
    dashCards.insertAdjacentElement('afterend', wrapper);
  }

  // ── Init ─────────────────────────────────────────────────────
  function init() {
    injectStyles();
    criarAtalhos();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Dashboard pode ser renderizado depois — aguarda os cards existirem
    const esperar = setInterval(() => {
      if (document.querySelector('.dashboard-cards')) {
        clearInterval(esperar);
        init();
      }
    }, 200);
  }
})();
