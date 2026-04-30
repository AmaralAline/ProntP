// ============================================================
//  ProntPsi — Anamnese Estruturada
//  Adicione no final do <body> do PainelExclusivo.html:
//  <script src="anamnese-prontpsi.js"></script>
// ============================================================

(function () {
  'use strict';

  const API_URL = window.API_URL ||
    (location.hostname === 'localhost' ? 'http://localhost:5015'
      : 'https://prontpsiback-production.up.railway.app');

  const headersAuth = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  // ── Estilos ──────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('prontpsi-anamnese-styles')) return;
    const s = document.createElement('style');
    s.id = 'prontpsi-anamnese-styles';
    s.textContent = `
      /* ── Botão no prontuário ── */
      #btn-abrir-anamnese {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(52,211,153,0.08);
        border: 1px solid rgba(52,211,153,0.25);
        color: #34d399;
        border-radius: 10px;
        padding: 9px 16px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        font-family: 'Roboto', sans-serif;
        transition: all 0.2s;
        margin-bottom: 20px;
        width: 100%;
        justify-content: center;
      }
      #btn-abrir-anamnese:hover {
        background: rgba(52,211,153,0.15);
        border-color: rgba(52,211,153,0.45);
        transform: translateY(-1px);
      }

      /* ── Overlay ── */
      #anamnese-overlay {
        position: fixed; inset: 0;
        background: rgba(8,12,24,0.8);
        backdrop-filter: blur(3px);
        z-index: 98000;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 24px 16px;
        overflow-y: auto;
      }

      /* ── Modal ── */
      #anamnese-modal {
        background: #0f1623;
        border: 1px solid rgba(139,92,246,0.3);
        border-radius: 18px;
        width: 100%;
        max-width: 720px;
        box-shadow: 0 32px 80px rgba(0,0,0,0.6);
        font-family: 'Roboto', sans-serif;
        overflow: hidden;
        margin: auto;
      }

      /* ── Header do modal ── */
      .ana-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 24px;
        border-bottom: 1px solid rgba(139,92,246,0.15);
        background: rgba(139,92,246,0.05);
      }
      .ana-header h3 {
        font-size: 16px;
        font-weight: 700;
        color: #f1f5f9;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .ana-header h3 span { font-size: 20px; }
      .ana-fechar {
        background: none;
        border: none;
        color: #475569;
        font-size: 20px;
        cursor: pointer;
        transition: color 0.2s;
        padding: 4px;
        line-height: 1;
      }
      .ana-fechar:hover { color: #f87171; }

      /* ── Abas ── */
      .ana-tabs {
        display: flex;
        border-bottom: 1px solid rgba(139,92,246,0.1);
        padding: 0 24px;
        gap: 4px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .ana-tabs::-webkit-scrollbar { display: none; }
      .ana-tab {
        padding: 12px 14px;
        font-size: 12px;
        font-weight: 600;
        color: #475569;
        border: none;
        background: none;
        cursor: pointer;
        white-space: nowrap;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        transition: all 0.2s;
        font-family: 'Roboto', sans-serif;
      }
      .ana-tab:hover { color: #94a3b8; }
      .ana-tab.ativa {
        color: #a78bfa;
        border-bottom-color: #7c3aed;
      }

      /* ── Conteúdo ── */
      .ana-body {
        padding: 24px;
        max-height: 60vh;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(139,92,246,0.2) transparent;
      }
      .ana-body::-webkit-scrollbar { width: 4px; }
      .ana-body::-webkit-scrollbar-thumb {
        background: rgba(139,92,246,0.2);
        border-radius: 4px;
      }

      .ana-secao { display: none; }
      .ana-secao.ativa { display: block; }

      /* ── Campos ── */
      .ana-campo {
        margin-bottom: 16px;
      }
      .ana-campo label {
        display: block;
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
      }
      .ana-campo input,
      .ana-campo textarea,
      .ana-campo select {
        width: 100%;
        background: rgba(15,22,35,0.8);
        border: 1px solid rgba(139,92,246,0.2);
        border-radius: 8px;
        padding: 10px 12px;
        color: #e2e8f0;
        font-size: 13px;
        font-family: 'Roboto', sans-serif;
        box-sizing: border-box;
        transition: border-color 0.2s;
        resize: vertical;
      }
      .ana-campo input:focus,
      .ana-campo textarea:focus,
      .ana-campo select:focus {
        outline: none;
        border-color: rgba(139,92,246,0.5);
      }
      .ana-campo textarea { min-height: 80px; }

      .ana-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      @media (max-width: 520px) { .ana-grid-2 { grid-template-columns: 1fr; } }

      .ana-subtitulo {
        font-size: 13px;
        font-weight: 600;
        color: #7c3aed;
        margin: 0 0 14px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(139,92,246,0.1);
      }

      /* ── Checkboxes ── */
      .ana-checks {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .ana-check-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #94a3b8;
        cursor: pointer;
        background: rgba(139,92,246,0.06);
        border: 1px solid rgba(139,92,246,0.15);
        border-radius: 6px;
        padding: 5px 10px;
        transition: all 0.15s;
        user-select: none;
      }
      .ana-check-label:hover {
        border-color: rgba(139,92,246,0.35);
        color: #e2e8f0;
      }
      .ana-check-label input { display: none; }
      .ana-check-label.marcado {
        background: rgba(139,92,246,0.15);
        border-color: rgba(139,92,246,0.45);
        color: #c4b5fd;
      }

      /* ── Footer ── */
      .ana-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        border-top: 1px solid rgba(139,92,246,0.12);
        gap: 12px;
        flex-wrap: wrap;
      }
      .ana-info {
        font-size: 12px;
        color: #334155;
      }
      .ana-footer-btns { display: flex; gap: 10px; }
      .ana-btn-cancelar {
        background: transparent;
        border: 1px solid rgba(100,116,139,0.3);
        color: #64748b;
        border-radius: 10px;
        padding: 9px 20px;
        font-size: 13px;
        cursor: pointer;
        font-family: 'Roboto', sans-serif;
        transition: all 0.2s;
      }
      .ana-btn-cancelar:hover { border-color: rgba(248,113,113,0.4); color: #f87171; }
      .ana-btn-salvar {
        background: linear-gradient(135deg, #7c3aed, #6d28d9);
        border: none;
        color: #fff;
        border-radius: 10px;
        padding: 9px 24px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        font-family: 'Roboto', sans-serif;
        transition: all 0.2s;
        box-shadow: 0 4px 14px rgba(124,58,237,0.4);
      }
      .ana-btn-salvar:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.55); }
      .ana-btn-salvar:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

      /* ── Badge histórico ── */
      .ana-historico-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(52,211,153,0.1);
        border: 1px solid rgba(52,211,153,0.25);
        border-radius: 8px;
        padding: 6px 12px;
        font-size: 12px;
        color: #34d399;
        cursor: pointer;
        margin-bottom: 16px;
        font-family: 'Roboto', sans-serif;
        transition: all 0.2s;
      }
      .ana-historico-badge:hover { background: rgba(52,211,153,0.15); }
    `;
    document.head.appendChild(s);
  }

  // ── Estrutura das abas e campos ───────────────────────────────
  const abas = [
    { id: 'identificacao', label: '👤 Identificação' },
    { id: 'queixa',        label: '💬 Queixa Principal' },
    { id: 'historia',      label: '📖 História Clínica' },
    { id: 'saude',         label: '🏥 Saúde Geral' },
    { id: 'familia',       label: '👨‍👩‍👧 Família' },
    { id: 'social',        label: '🌍 Social / Trabalho' },
  ];

  const doencas = [
    'Hipertensão','Diabetes','Cardiopatia','Asma/DPOC',
    'Epilepsia','Hipotireoidismo','Depressão prévia',
    'Ansiedade prévia','Transtorno bipolar','Esquizofrenia',
    'Uso de álcool','Uso de substâncias','Cirurgias anteriores',
    'Alergias','Nenhuma relevante'
  ];

  const medicamentos_commons = [
    'Antidepressivo','Ansiolítico','Estabilizador de humor',
    'Antipsicótico','Anti-hipertensivo','Hormônio tireoidiano',
    'Anticonvulsivante','Hipnótico','Nenhum'
  ];

  // ── Criar modal ───────────────────────────────────────────────
  function criarModal() {
    if (document.getElementById('anamnese-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'anamnese-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div id="anamnese-modal">
        <div class="ana-header">
          <h3><span>📋</span> Anamnese — <span id="ana-nome-paciente" style="color:#a78bfa;font-size:14px;">Paciente</span></h3>
          <button class="ana-fechar" onclick="window._anaFechar()">✕</button>
        </div>

        <div class="ana-tabs" id="ana-tabs">
          ${abas.map((a, i) => `
            <button class="ana-tab ${i === 0 ? 'ativa' : ''}" onclick="window._anaAba('${a.id}')" data-aba="${a.id}">
              ${a.label}
            </button>`).join('')}
        </div>

        <div class="ana-body">

          <!-- IDENTIFICAÇÃO -->
          <div class="ana-secao ativa" id="ana-sec-identificacao">
            <div class="ana-grid-2">
              <div class="ana-campo">
                <label>Estado Civil</label>
                <select id="ana-estado-civil">
                  <option value="">Selecione</option>
                  <option>Solteiro(a)</option><option>Casado(a)</option>
                  <option>União estável</option><option>Divorciado(a)</option>
                  <option>Viúvo(a)</option>
                </select>
              </div>
              <div class="ana-campo">
                <label>Escolaridade</label>
                <select id="ana-escolaridade">
                  <option value="">Selecione</option>
                  <option>Ensino Fundamental</option><option>Ensino Médio</option>
                  <option>Ensino Superior</option><option>Pós-graduação</option>
                  <option>Não alfabetizado</option>
                </select>
              </div>
              <div class="ana-campo">
                <label>Profissão / Ocupação</label>
                <input type="text" id="ana-profissao" placeholder="Ex: Professor, Estudante...">
              </div>
              <div class="ana-campo">
                <label>Religião / Espiritualidade</label>
                <input type="text" id="ana-religiao" placeholder="Ex: Católico, Espírita...">
              </div>
            </div>
            <div class="ana-campo">
              <label>Com quem reside</label>
              <input type="text" id="ana-reside-com" placeholder="Ex: Sozinho, cônjuge e filhos...">
            </div>
            <div class="ana-campo">
              <label>Encaminhado por</label>
              <input type="text" id="ana-encaminhado-por" placeholder="Ex: Médico, familiar, indicação...">
            </div>
          </div>

          <!-- QUEIXA PRINCIPAL -->
          <div class="ana-secao" id="ana-sec-queixa">
            <div class="ana-campo">
              <label>Queixa principal (nas palavras do paciente)</label>
              <textarea id="ana-queixa-principal" placeholder="Descreva o motivo da consulta conforme relatado pelo paciente..."></textarea>
            </div>
            <div class="ana-campo">
              <label>Há quanto tempo apresenta esses sintomas?</label>
              <input type="text" id="ana-tempo-sintomas" placeholder="Ex: 6 meses, 2 anos...">
            </div>
            <div class="ana-campo">
              <label>O que levou a buscar ajuda agora?</label>
              <textarea id="ana-motivo-busca" placeholder="Fator precipitante ou situação atual..."></textarea>
            </div>
            <div class="ana-campo">
              <label>Tentativas anteriores de tratamento</label>
              <textarea id="ana-tratamentos-anteriores" placeholder="Psicoterapia, psiquiatria, medicamentos anteriores..."></textarea>
            </div>
          </div>

          <!-- HISTÓRIA CLÍNICA -->
          <div class="ana-secao" id="ana-sec-historia">
            <div class="ana-campo">
              <label>História do desenvolvimento (infância/adolescência)</label>
              <textarea id="ana-desenvolvimento" placeholder="Gestação, parto, marcos do desenvolvimento, infância relevante..."></textarea>
            </div>
            <div class="ana-campo">
              <label>Eventos de vida significativos</label>
              <textarea id="ana-eventos-vida" placeholder="Perdas, traumas, mudanças importantes, situações marcantes..."></textarea>
            </div>
            <div class="ana-campo">
              <label>Histórico de episódios anteriores (crises, internações)</label>
              <textarea id="ana-historico-episodios" placeholder="Crises anteriores, internações psiquiátricas, atendimentos de urgência..."></textarea>
            </div>
            <div class="ana-campo">
              <label>Ideação suicida ou autolesão (atual ou passada)</label>
              <textarea id="ana-ideacao" placeholder="Descreva com cuidado, respeitando o vínculo terapêutico..."></textarea>
            </div>
          </div>

          <!-- SAÚDE GERAL -->
          <div class="ana-secao" id="ana-sec-saude">
            <p class="ana-subtitulo">Condições de saúde relevantes</p>
            <div class="ana-campo">
              <div class="ana-checks" id="ana-doencas-checks">
                ${doencas.map(d => `
                  <label class="ana-check-label" onclick="this.classList.toggle('marcado')">
                    <input type="checkbox" value="${d}"> ${d}
                  </label>`).join('')}
              </div>
            </div>
            <div class="ana-campo" style="margin-top:14px;">
              <label>Outras condições / observações</label>
              <input type="text" id="ana-outras-doencas" placeholder="Outras condições não listadas...">
            </div>

            <p class="ana-subtitulo" style="margin-top:20px;">Medicamentos em uso</p>
            <div class="ana-campo">
              <div class="ana-checks" id="ana-medicamentos-checks">
                ${medicamentos_commons.map(m => `
                  <label class="ana-check-label" onclick="this.classList.toggle('marcado')">
                    <input type="checkbox" value="${m}"> ${m}
                  </label>`).join('')}
              </div>
            </div>
            <div class="ana-campo" style="margin-top:14px;">
              <label>Especificar medicamentos (nome e dose)</label>
              <textarea id="ana-medicamentos-detalhe" placeholder="Ex: Sertralina 50mg, Clonazepam 0,5mg..."></textarea>
            </div>

            <div class="ana-grid-2" style="margin-top:8px;">
              <div class="ana-campo">
                <label>Sono (qualidade e quantidade)</label>
                <input type="text" id="ana-sono" placeholder="Ex: 6h, dificuldade para dormir...">
              </div>
              <div class="ana-campo">
                <label>Alimentação</label>
                <input type="text" id="ana-alimentacao" placeholder="Ex: Regular, restrições, compulsão...">
              </div>
              <div class="ana-campo">
                <label>Atividade física</label>
                <input type="text" id="ana-atividade-fisica" placeholder="Ex: Sedentário, 3x semana...">
              </div>
              <div class="ana-campo">
                <label>Uso de álcool / substâncias</label>
                <input type="text" id="ana-substancias" placeholder="Ex: Nega, social, frequente...">
              </div>
            </div>
          </div>

          <!-- FAMÍLIA -->
          <div class="ana-secao" id="ana-sec-familia">
            <div class="ana-campo">
              <label>Composição familiar</label>
              <textarea id="ana-composicao-familiar" placeholder="Pai, mãe, irmãos, filhos — quem conviveu ou convive..."></textarea>
            </div>
            <div class="ana-campo">
              <label>Qualidade dos vínculos familiares</label>
              <textarea id="ana-vinculos-familiares" placeholder="Relação com pais, cônjuge, filhos — conflitos, suporte, distância..."></textarea>
            </div>
            <div class="ana-campo">
              <label>Histórico de transtornos mentais na família</label>
              <textarea id="ana-historico-familiar" placeholder="Depressão, ansiedade, psicose, uso de substâncias em familiares..."></textarea>
            </div>
            <div class="ana-campo">
              <label>Histórico de violência, abuso ou negligência</label>
              <textarea id="ana-violencia" placeholder="Registre com sensibilidade..."></textarea>
            </div>
          </div>

          <!-- SOCIAL / TRABALHO -->
          <div class="ana-secao" id="ana-sec-social">
            <div class="ana-campo">
              <label>Situação profissional / financeira</label>
              <textarea id="ana-situacao-prof" placeholder="Empregado, desempregado, estressores financeiros..."></textarea>
            </div>
            <div class="ana-campo">
              <label>Rede de apoio social</label>
              <textarea id="ana-rede-apoio" placeholder="Amigos, grupos, comunidade — suporte percebido..."></textarea>
            </div>
            <div class="ana-campo">
              <label>Lazer e atividades prazerosas</label>
              <input type="text" id="ana-lazer" placeholder="Ex: Leitura, música, esportes, séries...">
            </div>
            <div class="ana-campo">
              <label>Expectativas em relação ao tratamento</label>
              <textarea id="ana-expectativas" placeholder="O que o paciente espera alcançar com a terapia..."></textarea>
            </div>
            <div class="ana-campo">
              <label>Observações gerais do profissional</label>
              <textarea id="ana-obs-profissional" placeholder="Impressões clínicas, hipóteses diagnósticas iniciais, pontos de atenção..."></textarea>
            </div>
          </div>

        </div>

        <div class="ana-footer">
          <span class="ana-info">Os dados serão salvos no prontuário como evolução de anamnese.</span>
          <div class="ana-footer-btns">
            <button class="ana-btn-cancelar" onclick="window._anaFechar()">Cancelar</button>
            <button class="ana-btn-salvar" id="ana-btn-salvar" onclick="window._anaSalvar()">
              <i class="fas fa-save" style="margin-right:6px;"></i> Salvar Anamnese
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Fechar ao clicar fora do modal
    overlay.addEventListener('click', e => {
      if (e.target === overlay) window._anaFechar();
    });
  }

  // ── Injetar botão no formulário de evolução ──────────────────
  function injetarBotao() {
    const form = document.getElementById('evolucao-form');
    if (!form || document.getElementById('btn-abrir-anamnese')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'btn-abrir-anamnese';
    btn.innerHTML = `<i class="fas fa-clipboard-list"></i> Preencher Anamnese Inicial`;
    btn.addEventListener('click', () => {
      const pacienteSelect = document.getElementById('paciente');
      const pacienteId = pacienteSelect?.value;
      const pacienteNome = pacienteSelect?.options[pacienteSelect.selectedIndex]?.text;

      if (!pacienteId) {
        alert('Selecione um paciente antes de abrir a anamnese.');
        return;
      }
      window._anaAbrir(pacienteId, pacienteNome);
    });

    // Insere antes do botão de submit
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) form.insertBefore(btn, submitBtn);
    else form.appendChild(btn);
  }

  // ── Controles do modal ────────────────────────────────────────
  let pacienteAtual = null;

  window._anaAbrir = function(pacienteId, pacienteNome) {
    pacienteAtual = pacienteId;
    const overlay = document.getElementById('anamnese-overlay');
    const nomeEl = document.getElementById('ana-nome-paciente');
    if (nomeEl) nomeEl.textContent = pacienteNome || 'Paciente';
    if (overlay) overlay.style.display = 'flex';
  };

  window._anaFechar = function() {
    const overlay = document.getElementById('anamnese-overlay');
    if (overlay) overlay.style.display = 'none';
  };

  window._anaAba = function(abaId) {
    document.querySelectorAll('.ana-tab').forEach(t => t.classList.remove('ativa'));
    document.querySelectorAll('.ana-secao').forEach(s => s.classList.remove('ativa'));
    document.querySelector(`[data-aba="${abaId}"]`)?.classList.add('ativa');
    document.getElementById(`ana-sec-${abaId}`)?.classList.add('ativa');
  };

  // ── Coletar dados do formulário ───────────────────────────────
  function coletarDados() {
    const g = id => document.getElementById(id)?.value?.trim() || '';

    const doencasMarcadas = [...document.querySelectorAll('#ana-doencas-checks .marcado')]
      .map(el => el.querySelector('input')?.value).filter(Boolean);
    const medicsMarcados = [...document.querySelectorAll('#ana-medicamentos-checks .marcado')]
      .map(el => el.querySelector('input')?.value).filter(Boolean);

    return {
      estadoCivil:         g('ana-estado-civil'),
      escolaridade:        g('ana-escolaridade'),
      profissao:           g('ana-profissao'),
      religiao:            g('ana-religiao'),
      resideCom:           g('ana-reside-com'),
      encaminhadoPor:      g('ana-encaminhado-por'),
      queixaPrincipal:     g('ana-queixa-principal'),
      tempoSintomas:       g('ana-tempo-sintomas'),
      motivoBusca:         g('ana-motivo-busca'),
      tratamentosAnteriores: g('ana-tratamentos-anteriores'),
      desenvolvimento:     g('ana-desenvolvimento'),
      eventosVida:         g('ana-eventos-vida'),
      historicoEpisodios:  g('ana-historico-episodios'),
      ideacao:             g('ana-ideacao'),
      doencas:             doencasMarcadas,
      outrasDoencas:       g('ana-outras-doencas'),
      medicamentos:        medicsMarcados,
      medicamentosDetalhe: g('ana-medicamentos-detalhe'),
      sono:                g('ana-sono'),
      alimentacao:         g('ana-alimentacao'),
      atividadeFisica:     g('ana-atividade-fisica'),
      substancias:         g('ana-substancias'),
      composicaoFamiliar:  g('ana-composicao-familiar'),
      vinculosFamiliares:  g('ana-vinculos-familiares'),
      historicoFamiliar:   g('ana-historico-familiar'),
      violencia:           g('ana-violencia'),
      situacaoProf:        g('ana-situacao-prof'),
      redeApoio:           g('ana-rede-apoio'),
      lazer:               g('ana-lazer'),
      expectativas:        g('ana-expectativas'),
      obsProfissional:     g('ana-obs-profissional'),
    };
  }

  // ── Formatar anamnese como texto para o prontuário ───────────
  function formatarTexto(d) {
    const linha = (titulo, valor) =>
      valor ? `**${titulo}:** ${valor}\n` : '';
    const linhaArr = (titulo, arr) =>
      arr?.length ? `**${titulo}:** ${arr.join(', ')}\n` : '';

    return [
      '═══ ANAMNESE INICIAL ═══\n',
      '── IDENTIFICAÇÃO ──',
      linha('Estado civil', d.estadoCivil),
      linha('Escolaridade', d.escolaridade),
      linha('Profissão', d.profissao),
      linha('Religião', d.religiao),
      linha('Reside com', d.resideCom),
      linha('Encaminhado por', d.encaminhadoPor),
      '\n── QUEIXA PRINCIPAL ──',
      linha('Queixa', d.queixaPrincipal),
      linha('Tempo de sintomas', d.tempoSintomas),
      linha('Motivo da busca agora', d.motivoBusca),
      linha('Tratamentos anteriores', d.tratamentosAnteriores),
      '\n── HISTÓRIA CLÍNICA ──',
      linha('Desenvolvimento', d.desenvolvimento),
      linha('Eventos de vida', d.eventosVida),
      linha('Histórico de episódios', d.historicoEpisodios),
      linha('Ideação suicida/autolesão', d.ideacao),
      '\n── SAÚDE GERAL ──',
      linhaArr('Condições de saúde', d.doencas),
      linha('Outras condições', d.outrasDoencas),
      linhaArr('Medicamentos', d.medicamentos),
      linha('Detalhes medicamentos', d.medicamentosDetalhe),
      linha('Sono', d.sono),
      linha('Alimentação', d.alimentacao),
      linha('Atividade física', d.atividadeFisica),
      linha('Álcool/substâncias', d.substancias),
      '\n── FAMÍLIA ──',
      linha('Composição familiar', d.composicaoFamiliar),
      linha('Vínculos familiares', d.vinculosFamiliares),
      linha('Histórico familiar', d.historicoFamiliar),
      linha('Violência/abuso', d.violencia),
      '\n── SOCIAL / TRABALHO ──',
      linha('Situação profissional', d.situacaoProf),
      linha('Rede de apoio', d.redeApoio),
      linha('Lazer', d.lazer),
      linha('Expectativas', d.expectativas),
      '\n── OBSERVAÇÕES DO PROFISSIONAL ──',
      linha('Observações', d.obsProfissional),
    ].filter(Boolean).join('');
  }

  // ── Salvar como evolução no prontuário ───────────────────────
  window._anaSalvar = async function() {
    if (!pacienteAtual) return;

    const dados = coletarDados();
    const texto = formatarTexto(dados);

    const temConteudo = Object.values(dados).some(v =>
      Array.isArray(v) ? v.length > 0 : v !== ''
    );
    if (!temConteudo) {
      alert('Preencha pelo menos um campo antes de salvar.');
      return;
    }

    const btn = document.getElementById('ana-btn-salvar');
    if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }

    try {
      const hoje = new Date();
      const pad = n => String(n).padStart(2, '0');
      const dataHoje = `${hoje.getFullYear()}-${pad(hoje.getMonth()+1)}-${pad(hoje.getDate())}`;

      const res = await fetch(`${API_URL}/api/pacientes/${pacienteAtual}/evolucoes`, {
        method: 'POST',
        headers: headersAuth(),
        body: JSON.stringify({
          data: dataHoje,
          evolucao: texto,
          convenio: 'Anamnese',
          cid10: '',
          codigo_procedimento: '',
          duracao_minutos: 0,
          valor_sessao: 0,
        })
      });

      if (res.ok) {
        window._anaFechar();
        // Atualiza o histórico se o mesmo paciente estiver selecionado
        const histSelect = document.getElementById('paciente-historico');
        if (histSelect && histSelect.value === pacienteAtual) {
          if (typeof carregarEvolucoes === 'function') carregarEvolucoes(pacienteAtual);
        }
        // Feedback visual suave
        const feedback = document.createElement('div');
        feedback.style.cssText = `
          position:fixed; bottom:80px; left:50%; transform:translateX(-50%);
          background:#059669; color:#fff; padding:10px 20px; border-radius:10px;
          font-family:'Roboto',sans-serif; font-size:13px; font-weight:600;
          z-index:99999; box-shadow:0 4px 20px rgba(0,0,0,0.4);
          animation: ana-toast 0.3s ease;
        `;
        feedback.textContent = '✓ Anamnese salva no prontuário!';
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 3000);
      } else {
        throw new Error('Erro ao salvar');
      }
    } catch (err) {
      alert('Erro ao salvar anamnese. Tente novamente.');
      console.error(err);
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save" style="margin-right:6px;"></i> Salvar Anamnese'; }
    }
  };

  // ── Init ─────────────────────────────────────────────────────
  function init() {
    injectStyles();
    criarModal();

    // Botão pode precisar aguardar o prontuário ser exibido
    const tentarInjetar = () => {
      if (document.getElementById('evolucao-form')) {
        injetarBotao();
      }
    };

    tentarInjetar();

    // Observa mudanças no DOM para o caso da seção ser carregada dinamicamente
    const observer = new MutationObserver(tentarInjetar);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
