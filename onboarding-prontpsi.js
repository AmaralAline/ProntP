// ============================================================
//  ProntPsi — Onboarding System
//  Aparece nos 3 primeiros acessos + acessível pelo menu
// ============================================================

(function () {
  'use strict';

  // ── Constantes ──────────────────────────────────────────────
  const STORAGE_KEY = 'prontpsi_onboarding_count';
  const MAX_AUTO_SHOWS = 3;

  // ── Dados dos passos do tour ─────────────────────────────────
  const steps = [
    {
      id: 'welcome',
      icon: '🏠',
      title: 'Bem-vindo ao ProntPsi!',
      desc: 'Seu sistema clínico completo para psicólogos e profissionais da saúde mental. Vamos fazer um tour rápido pelas principais funcionalidades.',
      highlight: null,
      position: 'center',
    },
    {
      id: 'inicio',
      icon: '📊',
      title: 'Painel Inicial',
      desc: 'Aqui você tem uma visão geral do seu dia: total de pacientes, consultas de hoje, formulários pendentes e receita do período. O relógio analógico mantém você orientado no tempo.',
      highlight: '#btn-clock',
      position: 'right',
    },
    {
      id: 'agenda',
      icon: '📅',
      title: 'Agenda',
      desc: 'Gerencie seus horários com visão diária ou semanal. Agende, edite e cancele consultas com facilidade. Cores identificam o status de cada agendamento.',
      highlight: '#btn-agenda',
      position: 'right',
    },
    {
      id: 'agenda-online',
      icon: '🔗',
      title: 'Agenda Online',
      desc: 'Ative o agendamento online para que pacientes marquem consultas diretamente pelo seu link público, sem precisar de contato manual.',
      highlight: '#btn-agenda-online',
      position: 'right',
    },
    {
      id: 'pacientes',
      icon: '👥',
      title: 'Pacientes',
      desc: 'Cadastre e gerencie todos os seus pacientes. Armazene dados pessoais, contato, convênio e histórico clínico em um só lugar.',
      highlight: '#btn-cadastro',
      position: 'right',
    },
    {
      id: 'prontuario',
      icon: '📋',
      title: 'Prontuário Eletrônico',
      desc: 'Registre evoluções clínicas com CID-10 integrado e autocomplete. Cada sessão fica documentada de forma segura e organizada.',
      highlight: '#btn-evolucao',
      position: 'right',
    },
    {
      id: 'prescricao',
      icon: '💊',
      title: 'Prescrição',
      desc: 'Emita prescrições médicas digitalmente com todos os campos necessários. Integrado com o banco de CIDs para agilizar o preenchimento.',
      highlight: '#btn-prescricao',
      position: 'right',
    },
    {
      id: 'atend-online',
      icon: '🎮',
      title: 'Atendimento Online',
      desc: 'Recursos terapêuticos integrados para sessões online: ferramentas interativas e jogos para uso durante o atendimento em tempo real.',
      highlight: '#btn-recursos-terapeuticos',
      position: 'right',
    },
    {
      id: 'formularios',
      icon: '📨',
      title: 'Formulários',
      desc: 'Crie e envie formulários de avaliação psicológica para seus pacientes. Acompanhe quem respondeu e visualize os resultados.',
      highlight: '#btn-form',
      position: 'right',
    },
    {
      id: 'resultados',
      icon: '📈',
      title: 'Resultados',
      desc: 'Visualize gráficos e análises das respostas dos formulários aplicados. Acompanhe a evolução dos pacientes ao longo do tempo.',
      highlight: '#btn-resultados',
      position: 'right',
    },
    {
      id: 'recibos',
      icon: '🧾',
      title: 'Recibos',
      desc: 'Gere recibos de consultas de forma rápida e profissional. Perfeito para pacientes particulares que precisam de comprovante de pagamento.',
      highlight: '#btn-recibos',
      position: 'right',
    },
    {
      id: 'termos',
      icon: '📝',
      title: 'Termos',
      desc: 'Crie e envie termos de consentimento informado para seus pacientes assinarem digitalmente, atendendo às exigências éticas e legais.',
      highlight: '#btn-termos',
      position: 'right',
    },
    {
      id: 'convenio',
      icon: '🗂️',
      title: 'Relatório de Convênio',
      desc: 'Gere relatórios detalhados de atendimentos por convênio para faturamento e controle financeiro.',
      highlight: '#btn-relatorio-convenio',
      position: 'right',
    },
    {
      id: 'financeiro',
      icon: '💰',
      title: 'Financeiro',
      desc: 'Controle suas receitas, despesas e fluxo de caixa. Visualize relatórios mensais e acompanhe a saúde financeira da sua clínica.',
      highlight: '#btn-financeiro',
      position: 'right',
    },
    {
      id: 'vitrine',
      icon: '🏪',
      title: 'Vitrine Pública',
      desc: 'Crie sua página pública profissional. Pacientes em busca de atendimento podem te encontrar e entrar em contato diretamente.',
      highlight: '#btn-vitrine',
      position: 'right',
    },
    {
      id: 'perfil',
      icon: '⚙️',
      title: 'Meu Perfil',
      desc: 'Configure seus dados profissionais, especialidades, valores de consulta, integração com Stripe para pagamentos e muito mais.',
      highlight: '#btn-perfil',
      position: 'right',
    },
    {
      id: 'finish',
      icon: '🎉',
      title: 'Tudo pronto!',
      desc: 'Você conheceu todas as funcionalidades do ProntPsi. Para rever este tour a qualquer momento, clique no ícone <strong>❓</strong> no canto inferior direito da tela.',
      highlight: null,
      position: 'center',
    },
  ];

  let currentStep = 0;
  let overlayEl = null;
  let highlightBox = null;

  // ── Injetar CSS ──────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('prontpsi-onboarding-styles')) return;
    const style = document.createElement('style');
    style.id = 'prontpsi-onboarding-styles';
    style.textContent = `
      /* ── Overlay ── */
      #ob-overlay {
        position: fixed; inset: 0;
        background: rgba(8, 12, 24, 0.75);
        backdrop-filter: blur(2px);
        z-index: 99990;
        transition: opacity 0.3s;
      }

      /* ── Highlight recorte ── */
      #ob-highlight {
        position: fixed;
        border-radius: 10px;
        box-shadow: 0 0 0 9999px rgba(8,12,24,0.75),
                    0 0 0 3px rgba(139,92,246,0.9),
                    0 0 24px 4px rgba(139,92,246,0.45);
        z-index: 99991;
        transition: all 0.4s cubic-bezier(.4,0,.2,1);
        pointer-events: none;
      }

      /* ── Card do passo ── */
      #ob-card {
        position: fixed;
        z-index: 99999;
        background: linear-gradient(145deg, #141b2d 0%, #0f1623 100%);
        border: 1px solid rgba(139,92,246,0.35);
        border-radius: 18px;
        padding: 28px 30px 22px;
        width: 360px;
        max-width: calc(100vw - 40px);
        box-shadow: 0 24px 60px rgba(0,0,0,0.6),
                    0 0 0 1px rgba(139,92,246,0.15),
                    inset 0 1px 0 rgba(255,255,255,0.05);
        transition: all 0.35s cubic-bezier(.4,0,.2,1);
        font-family: 'Roboto', sans-serif;
      }

      #ob-card .ob-step-badge {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 11px; font-weight: 600; letter-spacing: 1px;
        text-transform: uppercase; color: #8b5cf6;
        background: rgba(139,92,246,0.1);
        border: 1px solid rgba(139,92,246,0.25);
        border-radius: 20px; padding: 3px 10px;
        margin-bottom: 14px;
      }

      #ob-card .ob-icon {
        font-size: 32px; line-height: 1;
        margin-bottom: 10px; display: block;
      }

      #ob-card h3 {
        font-size: 19px; font-weight: 700;
        color: #f1f5f9; margin: 0 0 8px;
        line-height: 1.25;
      }

      #ob-card p {
        font-size: 14px; color: #94a3b8;
        line-height: 1.65; margin: 0 0 20px;
      }

      #ob-card p strong { color: #c4b5fd; }

      /* ── Progress bar ── */
      .ob-progress-bar {
        height: 3px; background: rgba(139,92,246,0.12);
        border-radius: 99px; margin-bottom: 20px; overflow: hidden;
      }
      .ob-progress-fill {
        height: 100%; background: linear-gradient(90deg, #7c3aed, #a78bfa);
        border-radius: 99px;
        transition: width 0.4s ease;
      }

      /* ── Botões ── */
      .ob-actions {
        display: flex; gap: 10px; align-items: center;
        justify-content: space-between;
      }
      .ob-btn-skip {
        background: transparent; border: none;
        color: #475569; font-size: 13px;
        cursor: pointer; padding: 0;
        font-family: 'Roboto', sans-serif;
        transition: color 0.2s;
      }
      .ob-btn-skip:hover { color: #94a3b8; }

      .ob-btn-prev {
        background: rgba(139,92,246,0.08);
        border: 1px solid rgba(139,92,246,0.25);
        color: #a78bfa; border-radius: 10px;
        padding: 9px 18px; font-size: 13px;
        cursor: pointer; font-family: 'Roboto', sans-serif;
        transition: all 0.2s;
      }
      .ob-btn-prev:hover {
        background: rgba(139,92,246,0.15);
      }

      .ob-btn-next {
        background: linear-gradient(135deg, #7c3aed, #6d28d9);
        border: none; color: #fff;
        border-radius: 10px; padding: 9px 22px;
        font-size: 14px; font-weight: 600;
        cursor: pointer; font-family: 'Roboto', sans-serif;
        transition: all 0.2s;
        box-shadow: 0 4px 14px rgba(124,58,237,0.4);
      }
      .ob-btn-next:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(124,58,237,0.55);
      }

      .ob-btn-finish {
        background: linear-gradient(135deg, #059669, #10b981);
        box-shadow: 0 4px 14px rgba(16,185,129,0.4);
      }
      .ob-btn-finish:hover {
        box-shadow: 0 6px 20px rgba(16,185,129,0.55);
      }

      /* ── Dots ── */
      .ob-dots {
        display: flex; gap: 5px; align-items: center;
      }
      .ob-dot {
        width: 6px; height: 6px; border-radius: 99px;
        background: rgba(139,92,246,0.25);
        transition: all 0.3s;
      }
      .ob-dot.active {
        background: #8b5cf6; width: 16px;
      }

      /* ── Botão flutuante de ajuda ── */
      #ob-help-btn {
        position: fixed; bottom: 24px; right: 24px;
        width: 46px; height: 46px;
        background: linear-gradient(135deg, #7c3aed, #6d28d9);
        border: none; border-radius: 50%;
        color: #fff; font-size: 20px;
        cursor: pointer; z-index: 9999;
        box-shadow: 0 4px 20px rgba(124,58,237,0.5);
        display: flex; align-items: center; justify-content: center;
        transition: all 0.25s;
        font-family: 'Roboto', sans-serif;
      }
      #ob-help-btn:hover {
        transform: scale(1.1) rotate(-8deg);
        box-shadow: 0 6px 26px rgba(124,58,237,0.7);
      }
      #ob-help-btn .ob-help-tooltip {
        position: absolute; right: 56px; bottom: 50%;
        transform: translateY(50%);
        background: #1e2a3b;
        border: 1px solid rgba(139,92,246,0.3);
        color: #94a3b8; font-size: 12px;
        padding: 5px 10px; border-radius: 8px;
        white-space: nowrap; pointer-events: none;
        opacity: 0; transition: opacity 0.2s;
      }
      #ob-help-btn:hover .ob-help-tooltip { opacity: 1; }

      /* ── Entrada animada ── */
      @keyframes ob-fade-in {
        from { opacity: 0; transform: translateY(10px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      .ob-enter { animation: ob-fade-in 0.3s ease forwards; }

      /* ── Menu item no sidebar ── */
      #btn-ajuda-tour {
        width: 100%; text-align: left;
        background: transparent;
        border: none; cursor: pointer;
        font-family: 'Roboto', sans-serif;
      }

      /* ── Responsivo ── */
      @media (max-width: 520px) {
        #ob-card { width: calc(100vw - 32px); left: 16px !important; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Posicionar card perto do elemento destacado ──────────────
  function positionCard(card, targetEl) {
    const margin = 18;
    card.style.top = '';
    card.style.left = '';
    card.style.right = '';
    card.style.bottom = '';
    card.style.transform = '';

    if (!targetEl) {
      // Centro da tela
      card.style.top = '50%';
      card.style.left = '50%';
      card.style.transform = 'translate(-50%, -50%)';
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    const cardW = 360;
    const cardH = card.offsetHeight || 320;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Tenta posicionar à direita do elemento
    let left = rect.right + margin;
    let top = rect.top + rect.height / 2 - cardH / 2;

    // Se não couber à direita → esquerda
    if (left + cardW > vw - 10) {
      left = rect.left - cardW - margin;
    }
    // Se não couber à esquerda → centraliza abaixo
    if (left < 10) {
      left = Math.max(10, vw / 2 - cardW / 2);
      top = rect.bottom + margin;
    }
    // Guardar nos limites verticais
    top = Math.min(Math.max(top, 10), vh - cardH - 10);

    card.style.left = left + 'px';
    card.style.top = top + 'px';
  }

  // ── Atualizar highlight em volta do elemento ─────────────────
  function updateHighlight(selector) {
    if (!highlightBox) return;
    if (!selector) {
      highlightBox.style.display = 'none';
      return;
    }
    const el = document.querySelector(selector);
    if (!el) { highlightBox.style.display = 'none'; return; }

    const rect = el.getBoundingClientRect();
    const pad = 6;
    highlightBox.style.display = 'block';
    highlightBox.style.left = (rect.left - pad) + 'px';
    highlightBox.style.top = (rect.top - pad) + 'px';
    highlightBox.style.width = (rect.width + pad * 2) + 'px';
    highlightBox.style.height = (rect.height + pad * 2) + 'px';
  }

  // ── Renderizar passo atual ───────────────────────────────────
  function renderStep() {
    const step = steps[currentStep];
    const card = document.getElementById('ob-card');
    if (!card) return;

    const isLast = currentStep === steps.length - 1;
    const progress = ((currentStep + 1) / steps.length * 100).toFixed(1);

    card.innerHTML = `
      <span class="ob-step-badge">
        ${currentStep + 1} de ${steps.length}
      </span>
      <div class="ob-progress-bar">
        <div class="ob-progress-fill" style="width:${progress}%"></div>
      </div>
      <span class="ob-icon">${step.icon}</span>
      <h3>${step.title}</h3>
      <p>${step.desc}</p>
      <div class="ob-actions">
        <button class="ob-btn-skip" id="ob-skip">Pular tour</button>
        <div style="display:flex;gap:8px;align-items:center;">
          ${currentStep > 0 ? '<button class="ob-btn-prev" id="ob-prev">← Voltar</button>' : ''}
          <button class="ob-btn-next ${isLast ? 'ob-btn-finish' : ''}" id="ob-next">
            ${isLast ? '✓ Concluir' : 'Próximo →'}
          </button>
        </div>
      </div>
    `;

    // Eventos
    document.getElementById('ob-skip').onclick = closeTour;
    document.getElementById('ob-next').onclick = () => {
      if (isLast) { closeTour(); return; }
      currentStep++;
      renderStep();
      animateCard();
    };
    const prevBtn = document.getElementById('ob-prev');
    if (prevBtn) prevBtn.onclick = () => { currentStep--; renderStep(); animateCard(); };

    // Highlight e posição
    updateHighlight(step.highlight);
    const targetEl = step.highlight ? document.querySelector(step.highlight) : null;
    positionCard(card, targetEl);
  }

  function animateCard() {
    const card = document.getElementById('ob-card');
    if (!card) return;
    card.classList.remove('ob-enter');
    void card.offsetWidth;
    card.classList.add('ob-enter');
  }

  // ── Abrir tour ───────────────────────────────────────────────
  function openTour(isManual) {
    if (document.getElementById('ob-overlay')) return; // já aberto

    currentStep = 0;

    // Contagem automática (só no auto-show)
    if (!isManual) {
      const count = parseInt(localStorage.getItem(STORAGE_KEY) || '0') + 1;
      localStorage.setItem(STORAGE_KEY, count);
    }

    // Overlay
    overlayEl = document.createElement('div');
    overlayEl.id = 'ob-overlay';
    document.body.appendChild(overlayEl);

    // Highlight box
    highlightBox = document.createElement('div');
    highlightBox.id = 'ob-highlight';
    highlightBox.style.display = 'none';
    document.body.appendChild(highlightBox);

    // Card
    const card = document.createElement('div');
    card.id = 'ob-card';
    card.classList.add('ob-enter');
    document.body.appendChild(card);

    renderStep();

    // Fechar ao clicar no overlay (fora do highlight e do card)
    overlayEl.addEventListener('click', closeTour);
  }

  // ── Fechar tour ──────────────────────────────────────────────
  function closeTour() {
    ['ob-overlay', 'ob-highlight', 'ob-card'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
    overlayEl = null;
    highlightBox = null;
  }

  // ── Botão flutuante de ajuda ─────────────────────────────────
  function addHelpButton() {
    if (document.getElementById('ob-help-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'ob-help-btn';
    btn.setAttribute('title', 'Ver tour de funcionalidades');
    btn.innerHTML = `❓<span class="ob-help-tooltip">Ver tour</span>`;
    btn.addEventListener('click', () => openTour(true));
    document.body.appendChild(btn);
  }

  // ── Inicialização ────────────────────────────────────────────
  function init() {
    injectStyles();
    addHelpButton();

    const count = parseInt(localStorage.getItem(STORAGE_KEY) || '0');
    if (count < MAX_AUTO_SHOWS) {
      // Pequeno delay para o painel terminar de carregar
      setTimeout(() => openTour(false), 800);
    }
  }

  // Expor globalmente para chamada manual
  window.prontpsiTour = { open: () => openTour(true), close: closeTour };

  // Iniciar assim que o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
