// ============================================================
//  ProntPsi - PainelExclusivo.js
//  Versão corrigida — com JWT, rotas corretas e listagem
// ============================================================

const API_URL = 'https://prontpsiback-production.up.railway.app';

// ------------------------------------------------------------
//  AUTENTICAÇÃO — pega token e dados do profissional logado
// ------------------------------------------------------------
const token = localStorage.getItem('token');
const profissional = JSON.parse(localStorage.getItem('profissional') || '{}');

// Se não estiver logado, manda para o login
if (!token) {
    alert('Sessão expirada. Faça login novamente.');
    window.location.href = 'login.html';
}

// Cabeçalho padrão com JWT para todas as requisições protegidas
function headersAuth() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// ------------------------------------------------------------
//  NAVEGAÇÃO DO PAINEL (mantém seu comportamento original)
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    // Exibe nome do profissional logado se tiver elemento para isso
    const nomeEl = document.getElementById('nome-profissional');
    if (nomeEl) nomeEl.textContent = profissional.nome || 'Profissional';

    // Botões do menu lateral
    const botoes = [
        { btn: 'btn-clock', section: 'clock-section' },
        { btn: 'btn-agenda', section: 'agenda-section' },
        { btn: 'btn-evolucao', section: 'evolucao-section' },
        { btn: 'btn-form', section: 'form-section' },
        { btn: 'btn-cadastro', section: 'cadastro-section' },
        { btn: 'btn-inventarios', section: 'inventarios-section' },
        { btn: 'btn-escalas', section: 'escalas-section' },
        { btn: 'btn-questionarios', section: 'questionarios-section' },
        { btn: 'btn-ferramentas-tcc', section: 'ferramentas-tcc-section' },
        { btn: 'btn-resultados', section: 'resultados-section' },
        { btn: 'btn-termos', section: 'termos-section' },
        { btn: 'btn-agenda-online', section: 'agenda-online-section' },
        { btn: 'btn-recibos', section: 'recibos-section' },
        { btn: 'btn-vitrine', section: 'vitrine-section' },
        { btn: 'btn-perfil', section: 'perfil-section' },
        { btn: 'btn-relatorio-convenio', section: 'relatorio-convenio-section' },
        { btn: 'btn-financeiro', section: 'financeiro-section' },
        { btn: 'btn-recursos-terapeuticos', section: 'recursos-terapeuticos-section' },
    ];
    function mostrarSecao(id) {
        document.querySelectorAll('.active-section, .hidden-section').forEach(s => {
            s.classList.remove('active-section');
            s.classList.add('hidden-section');
        });
        const alvo = document.getElementById(id);
        if (alvo) {
            alvo.classList.remove('hidden-section');
            alvo.classList.add('active-section');
        }

        document.querySelectorAll('.sidebar button').forEach(b => b.classList.remove('active'));
        const btnAtivo = document.querySelector(`[aria-controls="${id}"]`);
        if (btnAtivo) btnAtivo.classList.add('active');

        if (id === 'agenda-section') {
            setTimeout(() => {
                inicializarAgenda();
                carregarRecorrentes();
            }, 100);
        }
        if (id === 'agenda-online-section') {
            carregarLinkAgendamento();
            const grid = document.getElementById('dias-grid');
            if (!grid || grid.children.length === 0) renderizarDiasConfig();
            carregarDisponibilidade();
            carregarAgendamentosOnline();
        }
        if (id === 'termos-section') {
            popularSelectTermos();
            carregarTermos();
        }
        if (id === 'form-section') {
            carregarEscalas();
        }
        if (id === 'resultados-section') {
            carregarResultados();
            popularSelectGrafico();
        }
        if (id === 'evolucao-section') {
            carregarConvenios();
        }
        if (id === 'recibos-section') {
            popularSelectRecibos();
            carregarRecibos();
        }
        if (id === 'relatorio-convenio-section') {
            carregarConvenios();
        }
        if (id === 'financeiro-section') {
            carregarFinanceiro();
        }
        if (id === 'vitrine-section') {
            carregarVitrine();
        }
        if (id === 'perfil-section') {
            inicializarCanvas();
            carregarAssinaturaSalva();
            carregarDadosProfissionais();
            carregarStatusStripe();
            carregarLinkVideo();
        }
    }
    botoes.forEach(({ btn, section }) => {
        const el = document.getElementById(btn);
        if (el) {
            el.addEventListener('click', () => mostrarSecao(section));
        }
    });

    // Botões "Voltar ao Início"
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => mostrarSecao('clock-section'));
    });

    // Hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', sidebar.classList.contains('open'));
        });
    }

    // Carrega dados iniciais
    await carregarPacientes();
    iniciarRelogio();

    // Verifica política de privacidade
    await verificarPolitica();
});

// ============================================================
//  POLÍTICA DE PRIVACIDADE
// ============================================================
async function verificarPolitica() {
    // Versão atual da política — altere aqui quando atualizar os termos
    const POLITICA_VERSAO_ATUAL = '2.0';

    const profId = profissional?.id || 'desconhecido';
    const chaveLocal = `politica_aceita_${profId}`;

    // Se já aceitou a versão atual localmente — nada a fazer
    if (localStorage.getItem(chaveLocal) === POLITICA_VERSAO_ATUAL) return;

    try {
        const res = await fetch(`${API_URL}/api/perfil`, { headers: headersAuth() });
        if (!res.ok) return;
        const data = await res.json();

        const versaoOk = data.politica_aceita && data.politica_versao === POLITICA_VERSAO_ATUAL;

        if (versaoOk) {
            // Já aceitou a versão atual no banco — salva localmente
            localStorage.setItem(chaveLocal, POLITICA_VERSAO_ATUAL);
            return;
        }

        // Aceito versão antiga ou não aceito ainda — mostra faixa
        const faixa = document.getElementById('faixa-politica');
        if (data.politica_aceita && data.politica_versao !== POLITICA_VERSAO_ATUAL) {
            // Já tinha aceito antes: avisa sobre atualização dos termos
            const subtitulo = faixa?.querySelector('.faixa-subtitulo');
            if (subtitulo) {
                subtitulo.innerHTML += ' <strong style="color:#fbbf24;">Atualizamos nossos termos — incluímos agora a Vitrine de Profissionais. Por favor, releia e confirme.</strong>';
            }
        }

        document.body.classList.add('politica-pendente');
        faixa.style.display = 'flex';
        document.querySelector('.main-content').style.paddingBottom = '100px';
    } catch (err) {
        console.log('Verificação de política ignorada:', err.message);
    }
}

function toggleBtnAceitar() {
    const check = document.getElementById('check-politica');
    const btn = document.getElementById('btn-aceitar-politica');
    if (check.checked) {
        btn.classList.add('ativo');
    } else {
        btn.classList.remove('ativo');
    }
}

async function aceitarPolitica() {
    const POLITICA_VERSAO_ATUAL = '2.0';
    const btn = document.getElementById('btn-aceitar-politica');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>Salvando...';

    const profId = profissional?.id || 'desconhecido';
    const chaveLocal = `politica_aceita_${profId}`;

    try {
        const res = await fetch(`${API_URL}/api/perfil/aceitar-politica`, {
            method: 'POST',
            headers: headersAuth()
        });

        if (res.ok) {
            // Salva no localStorage para não perguntar de novo
            localStorage.setItem(chaveLocal, POLITICA_VERSAO_ATUAL);
            liberarSistema();

            // Envia email de confirmação para o profissional
            enviarEmailConfirmacaoPolitica();
        } else {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check" style="margin-right:6px;"></i>Confirmar e continuar';
        }
    } catch (err) {
        // Mesmo com erro na API, salva localmente e libera
        localStorage.setItem(chaveLocal, POLITICA_VERSAO_ATUAL);
        liberarSistema();
        console.log('Política aceita localmente');
    }
}

function liberarSistema() {
    document.body.classList.remove('politica-pendente');
    document.getElementById('faixa-politica').style.display = 'none';
    document.querySelector('.main-content').style.paddingBottom = '';
    document.getElementById('overlay-bloqueio').style.display = 'none';
}

async function enviarEmailConfirmacaoPolitica() {
    try {
        await fetch(`${API_URL}/api/perfil/email-confirmacao-politica`, {
            method: 'POST',
            headers: headersAuth()
        });
    } catch (err) {
        // Silencioso — não é crítico
    }
}

function abrirModalPolitica() {
    document.getElementById('modal-politica').classList.add('aberto');
}

function fecharModalPolitica() {
    document.getElementById('modal-politica').classList.remove('aberto');
}

// ------------------------------------------------------------
//  RELÓGIO
// ------------------------------------------------------------
function iniciarRelogio() {
    function atualizar() {
        const now = new Date();
        const horas = now.getHours() % 12;
        const minutos = now.getMinutes();
        const segundos = now.getSeconds();

        const hourHand = document.getElementById('hour-hand');
        const minuteHand = document.getElementById('minute-hand');
        const secondHand = document.getElementById('second-hand');

        if (hourHand) hourHand.style.transform = `rotate(${(horas * 30) + (minutos * 0.5)}deg)`;
        if (minuteHand) minuteHand.style.transform = `rotate(${minutos * 6}deg)`;
        if (secondHand) secondHand.style.transform = `rotate(${segundos * 6}deg)`;
    }
    atualizar();
    setInterval(atualizar, 1000);
}

// ============================================================
//  PACIENTES
// ============================================================
let pacientes = [];

async function carregarPacientes() {
    try {
        const res = await fetch(`${API_URL}/api/pacientes`, {
            headers: headersAuth()
        });

        if (res.status === 401 || res.status === 403) {
            alert('Sessão expirada. Faça login novamente.');
            window.location.href = 'login.html';
            return;
        }

        if (res.ok) {
            pacientes = await res.json();
            popularSelectsPacientes();
            renderizarListaPacientes();
        } else {
            console.error('Erro ao carregar pacientes:', res.status);
        }
        // Popular select de recorrentes
        const selectRecorrente = document.getElementById('recorrente-paciente');
        if (selectRecorrente) {
            selectRecorrente.innerHTML = '<option value="">Selecione...</option>' +
                pacientes.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
        }
    } catch (err) {
        console.error('Erro de conexão:', err);
    }
}

function popularSelectsPacientes() {
    const selectIds = [
        'paciente-agenda', 'paciente', 'paciente-historico',
        'paciente-resultados', 'paciente-link', 'paciente-form'
    ];

    selectIds.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        while (select.options.length > 1) select.remove(1);
        pacientes.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.nome;
            select.appendChild(opt);
        });
    });
}

// Renderiza tabela/lista de pacientes na seção de cadastro
function renderizarListaPacientes() {
    const container = document.getElementById('lista-pacientes');
    if (!container) return;

    if (pacientes.length === 0) {
        container.innerHTML = '<p style="color:#64748b; font-size:14px;">Nenhum paciente cadastrado ainda.</p>';
        return;
    }

    container.innerHTML = `
        <table style="width:100%; border-collapse:collapse; margin-top:20px;">
            <thead>
                <tr style="background:#141d2b;">
                    <th style="padding:12px 16px; text-align:left; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Nome</th>
                    <th style="padding:12px 16px; text-align:left; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Telefone</th>
                    <th style="padding:12px 16px; text-align:left; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">E-mail</th>
                    <th style="padding:12px 16px; text-align:left; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Pagamento</th>
                    <th style="padding:12px 16px; text-align:left; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">Relatório</th>
                </tr>
            </thead>
            <tbody>
                ${pacientes.map(p => `
                    <tr style="border-top:1px solid rgba(139,92,246,0.08);">
                        <td style="padding:12px 16px; color:#e2e8f0; font-size:14px;">${p.nome}</td>
                        <td style="padding:12px 16px; color:#94a3b8; font-size:14px;">${p.telefone || '-'}</td>
                        <td style="padding:12px 16px; color:#94a3b8; font-size:14px;">${p.email || '-'}</td>
                        <td style="padding:12px 16px; color:#94a3b8; font-size:14px;">${p.modo_pagamento || '-'}</td>
                        <td style="padding:12px 16px;">
                            <button onclick="gerarRelatorioPDF(${p.id}, '${p.nome.replace(/'/g, "\\'")}')" style="
                                background:#7c3aed; color:#fff; border:none;
                                border-radius:6px; padding:6px 14px; cursor:pointer;
                                font-size:12px; font-family:'Roboto',sans-serif;
                                transition:background 0.2s;
                            ">
                                <i class="fas fa-file-pdf"></i> PDF
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

async function gerarRelatorioPDF(pacienteId, nomePaciente) {
    const btn = event.target.closest('button');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
    }

    try {
        const res = await fetch(`${API_URL}/api/pacientes/${pacienteId}/relatorio-pdf`, {
            headers: headersAuth()
        });

        if (!res.ok) {
            alert('Erro ao gerar relatório.');
            return;
        }

        // Faz o download do PDF
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_${nomePaciente.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (err) {
        alert('Erro de conexão ao gerar relatório.');
        console.error(err);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-file-pdf"></i> PDF';
        }
    }
}
// ========== CADASTRO DE PACIENTE ==========
const cadastroForm = document.getElementById('cadastro-form');
if (cadastroForm) {
    cadastroForm.addEventListener('submit', async e => {
        e.preventDefault();

        const nome = document.getElementById('nome')?.value.trim();
        const telefone = document.getElementById('telefone')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const modo_pagamento = document.getElementById('pagamento')?.value;
        const data_nascimento = document.getElementById('data-inicio')?.value;
        const queixa_inicial = document.getElementById('queixa')?.value.trim();

        if (!nome || !telefone || !email || !modo_pagamento || !data_nascimento || !queixa_inicial) {
            document.getElementById('cadastro-error').style.display = 'block';
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/pacientes`, {
                method: 'POST',
                headers: headersAuth(),
                body: JSON.stringify({ nome, telefone, email, modo_pagamento, data_nascimento, queixa_inicial })
            });

            if (res.ok) {
                mostrarFeedback('cadastro-error', '✅ Paciente cadastrado com sucesso!', 'sucesso');
                cadastroForm.reset();
                await carregarPacientes();
            } else {
                const err = await res.json();
                mostrarFeedback('cadastro-error', err.erro || 'Erro ao cadastrar paciente.', 'erro');
            }
        } catch (err) {
            mostrarFeedback('cadastro-error', 'Erro de conexão com o servidor.', 'erro');
        }
    });
}

// ============================================================
//  EVOLUÇÃO DO PACIENTE
// ============================================================
const evolucaoForm = document.getElementById('evolucao-form');
if (evolucaoForm) {
    evolucaoForm.addEventListener('submit', async e => {
        e.preventDefault();

        const pacienteId = document.getElementById('paciente')?.value;
        const data_hora = document.getElementById('data-evolucao')?.value;
        const texto_evolucao = document.getElementById('evolucao')?.value.trim();
        const duracao_minutos = document.getElementById('duracao-minutos')?.value;
        const valor_sessao = document.getElementById('valor-sessao')?.value;
        const cid10 = document.getElementById('cid10')?.value.trim();
        const codigo_procedimento = document.getElementById('codigo-procedimento')?.value.trim();
        const convenio = document.getElementById('convenio')?.value.trim();

        if (!pacienteId || !data_hora || !texto_evolucao) {
            document.getElementById('evolucao-error').style.display = 'block';
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/pacientes/${pacienteId}/evolucoes`, {
                method: 'POST',
                headers: headersAuth(),
                body: JSON.stringify({
                    texto_evolucao,
                    data_hora,
                    duracao_minutos: duracao_minutos || 50,
                    valor_sessao: valor_sessao || null,
                    cid10: cid10 || null,
                    codigo_procedimento: codigo_procedimento || null,
                    convenio: convenio || null
                })
            });

            if (res.ok) {
                mostrarFeedback('evolucao-error', '✅ Evolução salva com sucesso!', 'sucesso');
                evolucaoForm.reset();
                document.getElementById('duracao-minutos').value = 50;
                const pacHist = document.getElementById('paciente-historico');
                if (pacHist && pacHist.value === pacienteId) {
                    await carregarHistoricoEvolucao(pacienteId);
                }
            } else {
                mostrarFeedback('evolucao-error', 'Erro ao salvar evolução.', 'erro');
            }
        } catch (err) {
            mostrarFeedback('evolucao-error', 'Erro de conexão com o servidor.', 'erro');
        }
    });
}
// Histórico de evolução
const selectHistorico = document.getElementById('paciente-historico');
if (selectHistorico) {
    selectHistorico.addEventListener('change', async () => {
        const pacienteId = selectHistorico.value;
        if (pacienteId) await carregarHistoricoEvolucao(pacienteId);
    });
}

async function carregarHistoricoEvolucao(pacienteId) {
    try {
        const res = await fetch(`${API_URL}/api/pacientes/${pacienteId}/evolucoes`, {
            headers: headersAuth()
        });

        if (res.ok) {
            const evolucoes = await res.json();
            const tabela = document.getElementById('evolucao-tabela');
            const vazio = document.getElementById('evolucao-vazio');
            const tbody = tabela?.querySelector('tbody');

            if (!evolucoes.length) {
                if (tabela) tabela.style.display = 'none';
                if (vazio) vazio.style.display = 'block';
                return;
            }

            if (tbody) {
                tbody.innerHTML = evolucoes.map(ev => `
                    <tr>
                        <td style="padding:10px; white-space:nowrap;">
                            ${parseDateLocal(ev.data_hora).toLocaleDateString('pt-BR')}
                        </td>
                        <td style="padding:10px;">${ev.convenio || '-'}</td>
                        <td style="padding:10px;">${ev.cid10 || '-'}</td>
                        <td style="padding:10px;">${ev.duracao_minutos || 50} min</td>
                        <td style="padding:10px;">
                            ${ev.valor_sessao ? `R$ ${parseFloat(ev.valor_sessao).toFixed(2)}` : '-'}
                        </td>
                        <td style="padding:10px; max-width:300px;">
                            ${ev.texto_evolucao.substring(0, 80)}${ev.texto_evolucao.length > 80 ? '...' : ''}
                        </td>
                    </tr>
                `).join('');
            }

            if (tabela) tabela.style.display = 'table';
            if (vazio) vazio.style.display = 'none';
        }
    } catch (err) {
        console.error('Erro ao carregar histórico:', err);
    }
};

// ============================================================
//  AGENDA
// ============================================================
const agendaForm = document.getElementById('agenda-form');
if (agendaForm) {
    agendaForm.addEventListener('submit', async e => {
        e.preventDefault();

        const paciente_id = document.getElementById('paciente-agenda')?.value;
        const data_hora_inicio = document.getElementById('start-datetime')?.value;
        const duracao = document.getElementById('agenda-duracao')?.value || '50';
        const observacoes = document.getElementById('descricao')?.value.trim();

        if (!data_hora_inicio) {
            document.getElementById('agenda-error').style.display = 'block';
            return;
        }

        // Calcula fim automaticamente — usa horário LOCAL (não UTC)
        const inicio = new Date(data_hora_inicio);
        const fim = new Date(inicio.getTime() + parseInt(duracao) * 60000);
        // toISOString() retorna UTC — usamos formatação local para preservar fuso do usuário
        const pad = n => String(n).padStart(2, '0');
        const data_hora_fim = `${fim.getFullYear()}-${pad(fim.getMonth() + 1)}-${pad(fim.getDate())}T${pad(fim.getHours())}:${pad(fim.getMinutes())}`;

        // Verifica conflito de horário
        const temConflito = await verificarConflito(data_hora_inicio, data_hora_fim);
        if (temConflito) {
            mostrarFeedback('agenda-error', '⚠️ Já existe uma consulta neste horário. Escolha outro horário.', 'erro');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/agenda`, {
                method: 'POST',
                headers: headersAuth(),
                body: JSON.stringify({ paciente_id, data_hora_inicio, data_hora_fim, observacoes })
            });

            if (res.ok) {
                mostrarFeedback('agenda-error', '✅ Consulta agendada com sucesso!', 'sucesso');
                agendaForm.reset();
                await renderizarAgenda();
                await carregarRecorrentes();
            } else {
                mostrarFeedback('agenda-error', 'Erro ao agendar consulta.', 'erro');
            }
        } catch (err) {
            mostrarFeedback('agenda-error', 'Erro de conexão com o servidor.', 'erro');
        }
    });
}

// Retorna "YYYY-MM-DD" no fuso LOCAL do browser (evita bug de UTC-3 virar dia anterior)
function dataLocalStr(d) {
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Converte string do banco ("YYYY-MM-DD HH:MM:SS" ou "YYYY-MM-DDTHH:MM:SS")
// para Date sem deslocar o fuso: trata sempre como horário local.
function parseDateLocal(str) {
    if (!str) return new Date(NaN);
    // Substitui o separador T por espaço, remove frações de segundo e Z
    const normalizada = str.replace('T', ' ').replace(/\.\d+/, '').replace('Z', '');
    const [datePart, timePart = '00:00:00'] = normalizada.split(' ');
    const [ano, mes, dia] = datePart.split('-').map(Number);
    const [hora, min, seg] = timePart.split(':').map(Number);
    return new Date(ano, mes - 1, dia, hora, min, seg);
}

// ============================================================
//  AGENDA — ESTADO GLOBAL
// ============================================================
let agendaVista = 'dia';          // 'dia' | 'semana'
let agendaDataAtual = new Date(); // data de referência
let consultaSelecionada = null;   // consulta no modal

// ============================================================
//  AGENDA — INICIALIZAÇÃO E NAVEGAÇÃO
// ============================================================
function inicializarAgenda() {
    agendaDataAtual = new Date();
    agendaVista = 'dia';

    // Usa onclick para evitar listeners duplicados ao navegar de volta
    const btnDia = document.getElementById('agenda-btn-dia');
    const btnSemana = document.getElementById('agenda-btn-semana');
    const btnHoje = document.getElementById('agenda-btn-hoje');
    const btnPrev = document.getElementById('agenda-nav-prev');
    const btnNext = document.getElementById('agenda-nav-next');

    if (btnDia) btnDia.onclick = () => { agendaVista = 'dia'; atualizarBotoesVista(); renderizarAgenda(); };
    if (btnSemana) btnSemana.onclick = () => { agendaVista = 'semana'; atualizarBotoesVista(); renderizarAgenda(); };
    if (btnHoje) btnHoje.onclick = () => { agendaDataAtual = new Date(); renderizarAgenda(); };
    if (btnPrev) btnPrev.onclick = () => {
        if (agendaVista === 'dia') agendaDataAtual.setDate(agendaDataAtual.getDate() - 1);
        else agendaDataAtual.setDate(agendaDataAtual.getDate() - 7);
        agendaDataAtual = new Date(agendaDataAtual);
        renderizarAgenda();
    };
    if (btnNext) btnNext.onclick = () => {
        if (agendaVista === 'dia') agendaDataAtual.setDate(agendaDataAtual.getDate() + 1);
        else agendaDataAtual.setDate(agendaDataAtual.getDate() + 7);
        agendaDataAtual = new Date(agendaDataAtual);
        renderizarAgenda();
    };

    atualizarBotoesVista();
    renderizarAgenda();
}

function bindBotoesAgenda() { /* descontinuado — lógica movida para inicializarAgenda */ }

function atualizarBotoesVista() {
    const btnDia = document.getElementById('agenda-btn-dia');
    const btnSemana = document.getElementById('agenda-btn-semana');
    if (!btnDia || !btnSemana) return;
    if (agendaVista === 'dia') {
        btnDia.style.background = '#7c3aed'; btnDia.style.color = '#fff'; btnDia.style.border = '1px solid #7c3aed';
        btnSemana.style.background = '#1a2332'; btnSemana.style.color = '#64748b'; btnSemana.style.border = '1px solid rgba(139,92,246,0.2)';
    } else {
        btnSemana.style.background = '#7c3aed'; btnSemana.style.color = '#fff'; btnSemana.style.border = '1px solid #7c3aed';
        btnDia.style.background = '#1a2332'; btnDia.style.color = '#64748b'; btnDia.style.border = '1px solid rgba(139,92,246,0.2)';
    }
}

async function renderizarAgenda() {
    const container = document.getElementById('agenda-vista-container');
    if (!container) return;
    container.innerHTML = '<p style="color:#64748b; font-size:13px; padding:12px 0;">Carregando...</p>';

    const hoje = new Date();
    const hojeStr = dataLocalStr(hoje);
    const navLabel = document.getElementById('agenda-nav-label');

    try {
        if (agendaVista === 'dia') {
            const diaStr = dataLocalStr(agendaDataAtual);
            const ehHoje = diaStr === hojeStr;
            const label = ehHoje
                ? 'Hoje — ' + agendaDataAtual.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })
                : agendaDataAtual.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
            if (navLabel) navLabel.textContent = label.charAt(0).toUpperCase() + label.slice(1);

            const consultas = await buscarConsultasDia(diaStr);
            container.innerHTML = renderizarListaDia(consultas, diaStr, ehHoje);

        } else {
            const seg = new Date(agendaDataAtual);
            seg.setDate(seg.getDate() - (seg.getDay() === 0 ? 6 : seg.getDay() - 1));
            const dom = new Date(seg); dom.setDate(dom.getDate() + 6);
            if (navLabel) navLabel.textContent =
                seg.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' – ' +
                dom.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

            const inicio = dataLocalStr(seg) + ' 00:00:00';
            const fim = dataLocalStr(dom) + ' 23:59:59';
            const consultas = await buscarConsultasPeriodo(inicio, fim);
            container.innerHTML = renderizarSemana(seg, consultas, hojeStr);
        }
    } catch (e) {
        console.error('Erro renderizarAgenda:', e);
        container.innerHTML = '<p style="color:#f87171; font-size:13px;">Erro ao carregar agenda.</p>';
    }
}

async function buscarConsultasDia(diaStr) {
    try {
        const res = await fetch(`${API_URL}/api/agenda?inicio=${diaStr} 00:00:00&fim=${diaStr} 23:59:59`, { headers: headersAuth() });
        return res.ok ? await res.json() : [];
    } catch { return []; }
}

async function buscarConsultasPeriodo(inicio, fim) {
    try {
        const res = await fetch(`${API_URL}/api/agenda?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`, { headers: headersAuth() });
        return res.ok ? await res.json() : [];
    } catch { return []; }
}

// ============================================================
//  RENDERIZAÇÃO — VISTA DIA
// ============================================================
function renderizarListaDia(consultas, diaStr, ehHoje) {
    if (!consultas.length) return '<p style="color:#64748b; font-size:13px; padding:12px 0;">Nenhuma consulta neste dia.</p>';

    return consultas.map(c => {
        const dtI = parseDateLocal(c.data_hora_inicio);
        const dtF = parseDateLocal(c.data_hora_fim);
        const hora = `${dtI.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — ${dtF.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        const statusInfo = getStatusInfo(c.status);
        const origemLabel = c.origem === 'recorrente' ? '🔁' : c.origem === 'online' ? '🌐' : '📅';

        return `<div onclick="abrirModalConsulta(${JSON.stringify(c).replace(/"/g, '&quot;')})"
            style="padding:12px; border-radius:8px; margin-bottom:8px; cursor:pointer;
                   background:#0f1621; border:1px solid rgba(139,92,246,0.15);
                   border-left:3px solid ${statusInfo.cor};
                   transition:border-color 0.15s;"
            onmouseover="this.style.borderColor='rgba(139,92,246,0.4)'"
            onmouseout="this.style.borderLeft='3px solid ${statusInfo.cor}'; this.style.borderColor='rgba(139,92,246,0.15)'">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <strong style="color:#e2e8f0; font-size:14px;">${c.paciente_nome || 'Sem paciente'}</strong>
                    <span style="margin-left:6px; font-size:11px; color:#64748b;">${origemLabel}</span>
                </div>
                <span style="font-size:11px; padding:2px 8px; border-radius:10px; background:${statusInfo.bg}; color:${statusInfo.cor}; white-space:nowrap;">${statusInfo.label}</span>
            </div>
            <div style="color:#a78bfa; font-size:13px; margin-top:4px;">🕐 ${hora}</div>
        </div>`;
    }).join('');
}

// ============================================================
//  RENDERIZAÇÃO — VISTA SEMANA
// ============================================================
function renderizarSemana(seg, consultas, hojeStr) {
    const diasNomes = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    let html = '<div style="display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); gap:4px;">';

    for (let i = 0; i < 7; i++) {
        const dia = new Date(seg); dia.setDate(dia.getDate() + i);
        const diaStr = dataLocalStr(dia);
        const ehHoje = diaStr === hojeStr;
        const consultasDia = consultas.filter(c => {
            const d = parseDateLocal(c.data_hora_inicio);
            return dataLocalStr(d) === diaStr;
        }).sort((a, b) => parseDateLocal(a.data_hora_inicio) - parseDateLocal(b.data_hora_inicio));

        html += `<div>
            <div style="text-align:center; padding:6px 2px; border-radius:6px; margin-bottom:4px;
                        background:${ehHoje ? 'rgba(139,92,246,0.2)' : '#0f1621'};
                        border:1px solid ${ehHoje ? 'rgba(139,92,246,0.5)' : 'rgba(139,92,246,0.1)'};">
                <div style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">${diasNomes[i]}</div>
                <div style="font-size:14px; font-weight:600; color:${ehHoje ? '#a78bfa' : '#e2e8f0'};">${dia.getDate()}</div>
            </div>`;

        if (!consultasDia.length) {
            html += `<div style="font-size:11px; color:#334155; text-align:center; padding:8px 0;">—</div>`;
        } else {
            consultasDia.forEach(c => {
                const dtI = parseDateLocal(c.data_hora_inicio);
                const hora = dtI.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const statusInfo = getStatusInfo(c.status);
                const nome = (c.paciente_nome || 'Paciente').split(' ')[0];
                html += `<div onclick="abrirModalConsulta(${JSON.stringify(c).replace(/"/g, '&quot;')})"
                    style="padding:6px; border-radius:6px; margin-bottom:3px; cursor:pointer;
                           background:rgba(139,92,246,0.1); border-left:2px solid ${statusInfo.cor};"
                    onmouseover="this.style.background='rgba(139,92,246,0.2)'"
                    onmouseout="this.style.background='rgba(139,92,246,0.1)'">
                    <div style="font-size:11px; color:#a78bfa; font-weight:500;">${hora}</div>
                    <div style="font-size:11px; color:#e2e8f0; margin-top:1px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${nome}</div>
                    <div style="font-size:10px; color:${statusInfo.cor}; margin-top:1px;">${statusInfo.label}</div>
                </div>`;
            });
        }
        html += '</div>';
    }
    html += '</div>';
    return html;
}

function getStatusInfo(status) {
    const map = {
        'confirmado': { cor: '#34d399', bg: 'rgba(52,211,153,0.1)', label: 'confirmado' },
        'pendente': { cor: '#fbbf24', bg: 'rgba(251,191,36,0.1)', label: 'pendente' },
        'agendado': { cor: '#34d399', bg: 'rgba(52,211,153,0.1)', label: 'agendado' },
        'realizado': { cor: '#7c3aed', bg: 'rgba(139,92,246,0.1)', label: 'realizado' },
        'cancelado': { cor: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'cancelado' },
        'falta_remunerada': { cor: '#34d399', bg: 'rgba(52,211,153,0.08)', label: 'falta rem.' },
        'falta_nao_remunerada': { cor: '#fbbf24', bg: 'rgba(251,191,36,0.08)', label: 'falta n/rem.' },
        'remarcado': { cor: '#60a5fa', bg: 'rgba(96,165,250,0.1)', label: 'remarcado' },
    };
    return map[status] || { cor: '#64748b', bg: 'rgba(100,116,139,0.1)', label: status || 'agendado' };
}

// ============================================================
//  MODAL DE AÇÕES DA CONSULTA
// ============================================================
function abrirModalConsulta(c) {
    consultaSelecionada = c;
    const dtI = parseDateLocal(c.data_hora_inicio);
    const dtF = parseDateLocal(c.data_hora_fim);
    document.getElementById('modal-consulta-nome').textContent = c.paciente_nome || 'Sem paciente';
    document.getElementById('modal-consulta-hora').textContent =
        `🕐 ${dtI.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — ${dtF.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}  •  ${dtI.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
    document.getElementById('modal-consulta-status-atual').textContent = `Status: ${getStatusInfo(c.status).label}`;
    document.getElementById('modal-consulta-feedback').style.display = 'none';
    document.getElementById('modal-consulta').style.display = 'flex';
}

function fecharModalConsulta() {
    document.getElementById('modal-consulta').style.display = 'none';
    consultaSelecionada = null;
}

async function acaoConsultaStatus(novoStatus) {
    if (!consultaSelecionada) return;
    const fb = document.getElementById('modal-consulta-feedback');
    fb.style.display = 'block';
    fb.style.color = '#64748b';
    fb.textContent = 'Salvando...';

    const c = consultaSelecionada;
    const dtI = parseDateLocal(c.data_hora_inicio);
    const dataStr = dataLocalStr(dtI);
    const horaStr = dtI.toTimeString().substring(0, 8);

    try {
        const res = await fetch(`${API_URL}/api/consulta/status`, {
            method: 'PATCH',
            headers: headersAuth(),
            body: JSON.stringify({
                origem: c.origem,
                id: c.id || null,
                data_consulta: dataStr,
                hora_inicio: horaStr,
                novo_status: novoStatus,
                recorrente_id: c.recorrente_id || null,
                paciente_id: c.paciente_id || null
            })
        });
        const data = await res.json();
        if (res.ok) {
            fb.style.color = '#34d399';
            fb.textContent = '✅ ' + getStatusInfo(novoStatus).label.charAt(0).toUpperCase() + getStatusInfo(novoStatus).label.slice(1);
            setTimeout(() => { fecharModalConsulta(); renderizarAgenda(); carregarConsultasHojeDashboard(); }, 1000);
        } else {
            fb.style.color = '#f87171';
            fb.textContent = data.erro || 'Erro ao atualizar.';
        }
    } catch {
        fb.style.color = '#f87171';
        fb.textContent = 'Erro de conexão.';
    }
}

async function acaoConsultaCancelar() {
    if (!consultaSelecionada) return;
    const c = consultaSelecionada;
    const ehRecorrente = c.origem === 'recorrente';

    let cancelarFuturas = false;
    if (ehRecorrente) {
        cancelarFuturas = confirm('Esta consulta é recorrente.\n\nClicar em OK cancela TODAS as consultas futuras desta recorrência.\nClicar em Cancelar cancela apenas esta sessão.');
    } else {
        if (!confirm('Cancelar esta consulta?')) return;
    }

    const dtI = parseDateLocal(c.data_hora_inicio);
    const dataStr = dataLocalStr(dtI);
    const horaStr = dtI.toTimeString().substring(0, 8);
    const fb = document.getElementById('modal-consulta-feedback');
    fb.style.display = 'block'; fb.style.color = '#64748b'; fb.textContent = 'Cancelando...';

    try {
        const res = await fetch(`${API_URL}/api/consulta/status`, {
            method: 'PATCH',
            headers: headersAuth(),
            body: JSON.stringify({
                origem: c.origem,
                id: c.id || null,
                data_consulta: dataStr,
                hora_inicio: horaStr,
                novo_status: 'cancelado',
                cancelar_futuras: cancelarFuturas,
                recorrente_id: c.recorrente_id || null
            })
        });
        const data = await res.json();
        if (res.ok) {
            fb.style.color = '#f87171'; fb.textContent = '✅ Cancelado';
            setTimeout(() => { fecharModalConsulta(); renderizarAgenda(); carregarConsultasHojeDashboard(); }, 1000);
        } else {
            fb.style.color = '#f87171'; fb.textContent = data.erro || 'Erro ao cancelar.';
        }
    } catch {
        fb.style.color = '#f87171'; fb.textContent = 'Erro de conexão.';
    }
}

function acaoConsultaRemarcar() {
    if (!consultaSelecionada) return;
    const dtI = parseDateLocal(consultaSelecionada.data_hora_inicio);
    const dtF = parseDateLocal(consultaSelecionada.data_hora_fim);
    const pad = n => String(n).padStart(2, '0');
    document.getElementById('remarcar-data').value = dataLocalStr(dtI);
    document.getElementById('remarcar-hora-inicio').value = `${pad(dtI.getHours())}:${pad(dtI.getMinutes())}`;
    document.getElementById('remarcar-hora-fim').value = `${pad(dtF.getHours())}:${pad(dtF.getMinutes())}`;
    document.getElementById('remarcar-feedback').style.display = 'none';
    document.getElementById('modal-remarcar').style.display = 'flex';
}

async function confirmarRemarcar() {
    const novaData = document.getElementById('remarcar-data').value;
    const novaHoraInicio = document.getElementById('remarcar-hora-inicio').value;
    const novaHoraFim = document.getElementById('remarcar-hora-fim').value;
    const fb = document.getElementById('remarcar-feedback');

    if (!novaData || !novaHoraInicio) {
        fb.style.display = 'block'; fb.style.color = '#f87171'; fb.textContent = 'Preencha data e horário.';
        return;
    }

    fb.style.display = 'block'; fb.style.color = '#64748b'; fb.textContent = 'Salvando...';
    const c = consultaSelecionada;
    const dtI = parseDateLocal(c.data_hora_inicio);

    try {
        const res = await fetch(`${API_URL}/api/consulta/status`, {
            method: 'PATCH',
            headers: headersAuth(),
            body: JSON.stringify({
                origem: c.origem,
                id: c.id || null,
                data_consulta: dataLocalStr(dtI),
                hora_inicio: dtI.toTimeString().substring(0, 8),
                novo_status: 'remarcado',
                nova_data: novaData,
                nova_hora_inicio: novaHoraInicio,
                nova_hora_fim: novaHoraFim,
                recorrente_id: c.recorrente_id || null
            })
        });
        const data = await res.json();
        if (res.ok) {
            fb.style.color = '#34d399'; fb.textContent = '✅ Remarcado com sucesso!';
            setTimeout(() => {
                document.getElementById('modal-remarcar').style.display = 'none';
                fecharModalConsulta();
                renderizarAgenda();
                carregarConsultasHojeDashboard();
            }, 1000);
        } else {
            fb.style.color = '#f87171'; fb.textContent = data.erro || 'Erro ao remarcar.';
        }
    } catch {
        fb.style.color = '#f87171'; fb.textContent = 'Erro de conexão.';
    }
}

function acaoConsultaProntuario() {
    if (!consultaSelecionada) return;
    fecharModalConsulta();
    // Navega para prontuário e pré-seleciona o paciente
    const nomePaciente = consultaSelecionada.paciente_nome;
    // Abre seção evolução
    document.querySelector('[aria-controls="evolucao-section"]')?.click();
    // Tenta selecionar o paciente pelo nome no select
    setTimeout(() => {
        const sel = document.getElementById('paciente');
        if (sel && nomePaciente) {
            for (const opt of sel.options) {
                if (opt.text.trim().toLowerCase() === nomePaciente.trim().toLowerCase()) {
                    sel.value = opt.value;
                    sel.dispatchEvent(new Event('change'));
                    break;
                }
            }
        }
    }, 400);
}

// Fecha modais ao clicar fora
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('modal-consulta')?.addEventListener('click', e => {
        if (e.target.id === 'modal-consulta') fecharModalConsulta();
    });
    document.getElementById('modal-remarcar')?.addEventListener('click', e => {
        if (e.target.id === 'modal-remarcar') document.getElementById('modal-remarcar').style.display = 'none';
    });
});

// ============================================================
//  AGENDA — VERIFICAÇÃO DE CONFLITO AO AGENDAR
// ============================================================
async function verificarConflito(data_hora_inicio, data_hora_fim) {
    try {
        const res = await fetch(
            `${API_URL}/api/agenda/conflito?data_hora_inicio=${encodeURIComponent(data_hora_inicio)}&data_hora_fim=${encodeURIComponent(data_hora_fim)}`,
            { headers: headersAuth() }
        );
        if (res.ok) { const d = await res.json(); return d.conflito; }
    } catch { }
    return false;
}

// Mantém compatibilidade com funções antigas usadas no dashboard
async function carregarAgendaHoje() {
    agendaDataAtual = new Date();
    agendaVista = 'dia';
    await renderizarAgenda();
}

async function carregarAgendaDia(dataStr) {
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    agendaDataAtual = new Date(ano, mes - 1, dia);
    agendaVista = 'dia';
    await renderizarAgenda();
}
function mostrarFeedback(elementId, mensagem, tipo) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = mensagem;
    el.style.display = 'block';
    el.style.color = tipo === 'sucesso' ? '#4caf80' : '#e57373';
    if (tipo === 'erro') {
        setTimeout(() => { el.style.display = 'none'; }, 5000);
    }
}

// Toast flutuante (usado no bug-report)
function mostrarToast(mensagem, tipo = 'info') {
    let toast = document.getElementById('prontpsi-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'prontpsi-toast';
        toast.style.cssText = `
            position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
            padding:12px 24px; border-radius:10px; font-size:14px;
            font-family:'Roboto',sans-serif; z-index:9999;
            box-shadow:0 4px 20px rgba(0,0,0,0.4); transition:opacity .3s;
        `;
        document.body.appendChild(toast);
    }
    const cores = { sucesso: '#34d399', erro: '#f87171', aviso: '#fbbf24', info: '#60a5fa' };
    toast.style.background = tipo === 'sucesso' ? 'rgba(52,211,153,0.15)' :
        tipo === 'erro' ? 'rgba(248,113,113,0.15)' :
            tipo === 'aviso' ? 'rgba(251,191,36,0.15)' :
                'rgba(96,165,250,0.15)';
    toast.style.color = cores[tipo] || cores.info;
    toast.style.border = `1px solid ${cores[tipo] || cores.info}44`;
    toast.textContent = mensagem;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 3500);
}

// Preenche o painel lateral "Agenda de Hoje" (card aside do dashboard)
async function carregarAgendaLateral() {
    const container = document.getElementById('dash-lateral-agenda');
    if (!container) return;

    const hoje = new Date();
    const diaStr = dataLocalStr(hoje);

    try {
        const res = await fetch(
            `${API_URL}/api/agenda?inicio=${diaStr} 00:00:00&fim=${diaStr} 23:59:59`,
            { headers: headersAuth() }
        );
        if (!res.ok) return;

        const consultas = await res.json();

        if (!consultas.length) {
            container.innerHTML = '<p style="color:#64748b; font-size:13px; text-align:center; padding:12px 0;">Nenhuma consulta hoje.</p>';
            return;
        }

        container.innerHTML = consultas.map(c => {
            const dtI = parseDateLocal(c.data_hora_inicio);
            const dtF = parseDateLocal(c.data_hora_fim);
            const hora = `${dtI.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — ${dtF.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
            return `
            <div style="padding:8px 0; border-bottom:1px solid rgba(139,92,246,0.08);">
                <div style="font-size:12px; color:#a78bfa; font-weight:500;">🕐 ${hora}</div>
                <div style="font-size:13px; color:#e2e8f0; margin-top:2px;">${c.paciente_nome || 'Sem paciente'}</div>
                <div style="font-size:11px; color:#64748b;">${c.status || 'agendado'}</div>
            </div>`;
        }).join('');
    } catch (err) {
        console.error('Erro ao carregar agenda lateral:', err);
    }
}
// ============================================================
//  DASHBOARD
// ============================================================
async function carregarDashboard() {
    // Data de hoje formatada
    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString('pt-BR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const dataEl = document.getElementById('dashboard-data');
    if (dataEl) dataEl.textContent = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);

    // Saudação por horário
    const hora = agora.getHours();
    const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
    const tituloEl = document.querySelector('.dashboard-titulo');
    if (tituloEl) {
        const nomeSpan = document.getElementById('nome-profissional');
        const nome = nomeSpan?.textContent || profissional.nome || 'Profissional';
        tituloEl.innerHTML = `${saudacao}, <span id="nome-profissional">${nome}</span> 👋`;
    }

    // Total de pacientes
    const totalEl = document.getElementById('dash-total-pacientes');
    if (totalEl) totalEl.textContent = pacientes.length;

    // Consultas de hoje
    await carregarConsultasHojeDashboard();
    await carregarAgendaLateral();

    // Formulários pendentes e respondidos
    await carregarEstatisticasFormularios();
}

async function carregarConsultasHojeDashboard() {
    const hoje = new Date();
    const diaStr = dataLocalStr(hoje);
    const inicio = diaStr + ' 00:00:00';
    const fim = diaStr + ' 23:59:59';

    try {
        const res = await fetch(`${API_URL}/api/agenda?inicio=${inicio}&fim=${fim}`, {
            headers: headersAuth()
        });

        if (!res.ok) return;

        const consultas = await res.json();
        const container = document.getElementById('dashboard-agenda-hoje');
        const countEl = document.getElementById('dash-consultas-hoje');

        if (countEl) countEl.textContent = consultas.length;

        if (!container) return;

        if (!consultas.length) {
            container.innerHTML = '<p class="dash-vazio">Nenhuma consulta agendada para hoje.</p>';
            return;
        }

        container.innerHTML = consultas.map(c => {
            const dtInicio = parseDateLocal(c.data_hora_inicio);
            const dtFim = parseDateLocal(c.data_hora_fim);
            return `
            <div class="dash-consulta-item">
                <span class="dash-consulta-hora">
                    🕐 ${dtInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    — ${dtFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span class="dash-consulta-nome">${c.paciente_nome || 'Sem paciente'}</span>
                <span class="dash-consulta-status">${c.status || 'agendado'}</span>
            </div>
        `}).join('');

    } catch (err) {
        console.error('Erro ao carregar agenda dashboard:', err);
    }
}

async function carregarEstatisticasFormularios() {
    try {
        const res = await fetch(`${API_URL}/api/escalas/resultados`, {
            headers: headersAuth()
        });

        if (!res.ok) return;

        const respondidos = await res.json();
        const respondidosEl = document.getElementById('dash-respondidos');
        if (respondidosEl) respondidosEl.textContent = respondidos.length;

        // Busca links pendentes
        const resPendentes = await fetch(`${API_URL}/api/escalas/links-pendentes`, {
            headers: headersAuth()
        });

        if (resPendentes.ok) {
            const pendentes = await resPendentes.json();
            const pendentesEl = document.getElementById('dash-pendentes');
            if (pendentesEl) pendentesEl.textContent = pendentes.length;
        }

    } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
    }
}

// Carrega dashboard ao clicar em Início
const btnClock = document.getElementById('btn-clock');
if (btnClock) {
    btnClock.addEventListener('click', () => carregarDashboard());
}

// Carrega dashboard na inicialização
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => carregarDashboard(), 500);
});
// ============================================================
//  RELATÓRIO DE PRODUÇÃO MENSAL
// ============================================================
// ============================================================
//  RELATÓRIO DE PRODUÇÃO MENSAL
// ============================================================
async function carregarConvenios() {
    try {
        const res = await fetch(`${API_URL}/api/convenios`, {
            headers: headersAuth()
        });
        if (!res.ok) return;
        const convenios = await res.json();
        const select = document.getElementById('rel-convenio');
        if (!select) return;

        // Mantém a opção "Todos"
        select.innerHTML = '<option value="">Todos (Relatório Geral)</option>';
        convenios.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.convenio;
            opt.textContent = c.convenio;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error('Erro ao carregar convênios:', err);
    }
}

async function gerarRelatorioProducao() {
    const mesEl = document.querySelector('[id="rel-mes"]');
    const anoEl = document.querySelector('[id="rel-ano"]');
    const convenioEl = document.querySelector('[id="rel-convenio"]');

    const mes = mesEl?.value;
    const ano = anoEl?.value;
    const convenio = convenioEl?.value;

    const params = new URLSearchParams({ mes, ano });
    if (convenio) params.append('convenio', convenio);

    const nomeArquivo = convenio
        ? `producao_${convenio.replace(/\s+/g, '_')}_${mes}_${ano}.pdf`
        : `producao_geral_${mes}_${ano}.pdf`;

    try {
        const res = await fetch(`${API_URL}/api/relatorio-producao?${params}`, {
            headers: headersAuth()
        });

        if (!res.ok) {
            alert('Erro ao gerar relatório.');
            return;
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomeArquivo;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (err) {
        alert('Erro de conexão ao gerar relatório.');
        console.error(err);
    }
}

// Carrega convênios ao abrir prontuário
const btnEvolucao = document.getElementById('btn-evolucao');
if (btnEvolucao) {
    btnEvolucao.addEventListener('click', () => carregarConvenios());
}
// ============================================================
//  TERMOS DE CONSENTIMENTO
// ============================================================
// Carrega termos ao clicar no menu
document.getElementById('btn-termos')?.addEventListener('click', () => {
    popularSelectTermos();
    carregarTermos();
});

function popularSelectTermos() {
    const select = document.getElementById('paciente-termo');
    if (!select) return;
    select.innerHTML = '<option value="">Escolha um paciente</option>';
    pacientes.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.nome;
        select.appendChild(opt);
    });
}

async function gerarTermo() {
    const pacienteId = document.getElementById('paciente-termo')?.value;
    const feedback = document.getElementById('termo-feedback');
    const btn = document.getElementById('btn-gerar-termo');

    if (!pacienteId) {
        feedback.textContent = 'Selecione um paciente.';
        feedback.style.color = '#f87171';
        feedback.style.display = 'block';
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
        const res = await fetch(`${API_URL}/api/termos/gerar`, {
            method: 'POST',
            headers: headersAuth(),
            body: JSON.stringify({ paciente_id: pacienteId })
        });
        const data = await res.json();

        if (res.ok) {
            feedback.textContent = '✅ Termo enviado por email com sucesso!';
            feedback.style.color = '#34d399';
            feedback.style.display = 'block';
            await carregarTermos();
        } else {
            feedback.textContent = data.erro || 'Erro ao gerar termo.';
            feedback.style.color = '#f87171';
            feedback.style.display = 'block';
        }
    } catch (err) {
        feedback.textContent = 'Erro de conexão.';
        feedback.style.color = '#f87171';
        feedback.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane" style="margin-right:6px;"></i>Enviar Termo por Email';
    }
}

async function carregarTermos() {
    try {
        const res = await fetch(`${API_URL}/api/termos`, { headers: headersAuth() });
        if (!res.ok) return;
        const termos = await res.json();
        const tbody = document.getElementById('termos-tbody');
        if (!tbody) return;

        if (!termos.length) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#64748b; padding:20px;">Nenhum termo enviado ainda.</td></tr>';
            return;
        }

        tbody.innerHTML = termos.map(t => `
            <tr>
                <td style="padding:12px 16px; color:#e2e8f0;">${t.paciente_nome}</td>
                <td style="padding:12px 16px; color:#94a3b8;">${parseDateLocal(t.criado_em).toLocaleDateString('pt-BR')}</td>
                <td style="padding:12px 16px;">
                    <span style="
                        padding:3px 10px; border-radius:20px; font-size:11px; font-weight:500;
                        background:${t.assinado ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)'};
                        color:${t.assinado ? '#34d399' : '#fbbf24'};
                    ">
                        ${t.assinado ? '✓ Assinado' : '⏳ Pendente'}
                    </span>
                </td>
                <td style="padding:12px 16px; color:#94a3b8;">
                    ${t.assinado_em ? parseDateLocal(t.assinado_em).toLocaleString('pt-BR') : '-'}
                </td>
                <td style="padding:12px 16px;">
                    <button onclick="baixarTermoPDF('${t.token}', '${t.paciente_nome}')" style="
                        background:#1a2332; color:#a78bfa; border:1px solid rgba(139,92,246,0.3);
                        border-radius:6px; padding:5px 12px; cursor:pointer; font-size:12px;
                        font-family:'Roboto',sans-serif;
                    ">
                        <i class="fas fa-download"></i> PDF
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Erro ao carregar termos:', err);
    }
}

async function baixarTermoPDF(token, nomePaciente) {
    try {
        const res = await fetch(`${API_URL}/api/termos/${token}/pdf`, {
            headers: headersAuth()
        });
        if (!res.ok) { alert('Erro ao baixar PDF.'); return; }
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `termo_${nomePaciente.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        alert('Erro de conexão.');
    }
}
// ============================================================
//  GRÁFICO DE EVOLUÇÃO DO PACIENTE
// ============================================================
function popularSelectGrafico() {
    const select = document.getElementById('paciente-grafico');
    if (!select) return;
    select.innerHTML = '<option value="">Escolha um paciente</option>';
    pacientes.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.nome;
        select.appendChild(opt);
    });
}

async function carregarGraficos() {
    const pacienteId = document.getElementById('paciente-grafico')?.value;
    const container = document.getElementById('graficos-container');

    if (!pacienteId) {
        container.innerHTML = '<p style="color:#f87171; font-size:14px; text-align:center;">Selecione um paciente.</p>';
        return;
    }

    container.innerHTML = '<p style="color:#64748b; font-size:14px; text-align:center; padding:20px;">⏳ Carregando...</p>';

    try {
        const res = await fetch(`${API_URL}/api/pacientes/${pacienteId}/evolucao-graficos`, {
            headers: headersAuth()
        });
        const data = await res.json();

        if (!Object.keys(data).length) {
            container.innerHTML = '<p style="color:#64748b; font-size:14px; text-align:center; padding:20px;">Nenhum questionário respondido ainda para este paciente.</p>';
            return;
        }

        // Renderiza um gráfico para cada escala
        container.innerHTML = '';
        Object.entries(data).forEach(([escalaNome, pontuacoes]) => {
            if (pontuacoes.length < 1) return;

            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'margin-bottom:24px;';

            const titulo = document.createElement('p');
            titulo.style.cssText = 'font-size:13px; font-weight:600; color:#a78bfa; margin-bottom:12px;';
            titulo.textContent = escalaNome;
            wrapper.appendChild(titulo);

            const canvasWrapper = document.createElement('div');
            canvasWrapper.style.cssText = 'background:#0f1621; border-radius:8px; padding:16px; position:relative; height:200px;';

            const canvas = document.createElement('canvas');
            canvas.id = `chart-${escalaNome.replace(/\s+/g, '-')}`;
            canvasWrapper.appendChild(canvas);
            wrapper.appendChild(canvasWrapper);
            container.appendChild(wrapper);

            // Renderiza com Chart.js
            renderizarGrafico(canvas.id, escalaNome, pontuacoes);
        });

    } catch (err) {
        container.innerHTML = '<p style="color:#f87171; font-size:14px; text-align:center;">Erro ao carregar dados.</p>';
        console.error(err);
    }
}

function renderizarGrafico(canvasId, escalaNome, pontuacoes) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const labels = pontuacoes.map(p => p.data);
    const valores = pontuacoes.map(p => p.pontuacao);

    new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Pontuação',
                data: valores,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139,92,246,0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#a78bfa',
                pointRadius: 5,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => `Pontuação: ${ctx.parsed.y}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#64748b', font: { size: 11 } },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                y: {
                    ticks: { color: '#64748b', font: { size: 11 } },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    beginAtZero: true
                }
            }
        }
    });
}
// ============================================================
//  AGENDA ONLINE
// ============================================================
// ============================================================
//  AGENDA ONLINE
// ============================================================
const diasNomes = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

async function carregarLinkAgendamento() {
    try {
        const res = await fetch(`${API_URL}/api/meu-link-agendamento`, { headers: headersAuth() });
        const data = await res.json();
        const input = document.getElementById('link-agendamento');
        if (input) input.value = data.link;
    } catch (err) { console.error(err); }
}

function copiarLinkAgendamento() {
    const input = document.getElementById('link-agendamento');
    if (!input) return;
    input.select();
    document.execCommand('copy');
    alert('Link copiado!');
}

function renderizarDiasConfig() {
    const grid = document.getElementById('dias-grid');
    if (!grid) return;
    grid.innerHTML = '';

    [0, 1, 2, 3, 4, 5, 6].forEach(dia => {
        const div = document.createElement('div');
        div.style.cssText = 'background:#0f1621; border-radius:8px; padding:16px; margin-bottom:12px; border:1px solid rgba(139,92,246,0.1);';
        div.id = `dia-container-${dia}`;
        div.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                <span style="font-size:14px; font-weight:600; color:#e2e8f0;">${diasNomes[dia]}</span>
                <button onclick="adicionarBloco(${dia})" style="background:rgba(139,92,246,0.15); color:#a78bfa; border:1px solid rgba(139,92,246,0.3); border-radius:6px; padding:5px 12px; cursor:pointer; font-size:12px; font-family:'Roboto',sans-serif;">
                    + Adicionar horário
                </button>
            </div>
            <div id="blocos-${dia}"></div>
        `;
        grid.appendChild(div);
    });
}

function adicionarBloco(dia, inicio = '09:00', fim = '18:00', duracao = null, valor = null) {
    const container = document.getElementById(`blocos-${dia}`);
    if (!container) return;

    const duracaoPadrao = document.getElementById('duracao-padrao')?.value || '50';
    const valorPadrao = document.getElementById('valor-padrao')?.value || '';
    const duracaoEfetiva = duracao || duracaoPadrao;
    const id = crypto.randomUUID();

    const bloco = document.createElement('div');
    bloco.id = `bloco-${id}`;
    bloco.style.cssText = 'display:grid; grid-template-columns:1fr 1fr 1fr 1fr auto; gap:8px; align-items:center; margin-bottom:8px; background:#1a2332; padding:10px; border-radius:8px;';

    bloco.innerHTML = `
        <div>
            <label style="font-size:11px; color:#64748b; display:block; margin-bottom:3px;">Início</label>
            <input type="time" value="${inicio}" style="width:100%; padding:6px 8px; background:#0f1621; border:1px solid rgba(139,92,246,0.2); border-radius:6px; color:#e2e8f0; font-size:13px; font-family:'Roboto',sans-serif;" class="bloco-inicio">
        </div>
        <div>
            <label style="font-size:11px; color:#64748b; display:block; margin-bottom:3px;">Fim</label>
            <input type="time" value="${fim}" style="width:100%; padding:6px 8px; background:#0f1621; border:1px solid rgba(139,92,246,0.2); border-radius:6px; color:#e2e8f0; font-size:13px; font-family:'Roboto',sans-serif;" class="bloco-fim">
        </div>
        <div>
            <label style="font-size:11px; color:#64748b; display:block; margin-bottom:3px;">Duração (min)</label>
            <select style="width:100%; padding:6px 8px; background:#0f1621; border:1px solid rgba(139,92,246,0.2); border-radius:6px; color:#e2e8f0; font-size:13px; font-family:'Roboto',sans-serif;" class="bloco-duracao">
                <option value="30"  ${duracaoEfetiva === '30' ? 'selected' : ''}>30 min</option>
                <option value="45"  ${duracaoEfetiva === '45' ? 'selected' : ''}>45 min</option>
                <option value="50"  ${duracaoEfetiva === '50' ? 'selected' : ''}>50 min</option>
                <option value="60"  ${duracaoEfetiva === '60' ? 'selected' : ''}>60 min</option>
                <option value="90"  ${duracaoEfetiva === '90' ? 'selected' : ''}>90 min</option>
                <option value="120" ${duracaoEfetiva === '120' ? 'selected' : ''}>120 min</option>
            </select>
        </div>
        <div>
            <label style="font-size:11px; color:#64748b; display:block; margin-bottom:3px;">Valor (R$)</label>
            <input type="number" value="${valor || valorPadrao}" placeholder="150.00" step="0.01" style="width:100%; padding:6px 8px; background:#0f1621; border:1px solid rgba(139,92,246,0.2); border-radius:6px; color:#e2e8f0; font-size:13px; font-family:'Roboto',sans-serif;" class="bloco-valor">
        </div>
        <button onclick="document.getElementById('bloco-${id}').remove()" style="background:rgba(248,113,113,0.15); color:#f87171; border:1px solid rgba(248,113,113,0.3); border-radius:6px; padding:6px 10px; cursor:pointer; font-size:13px; margin-top:16px;">✕</button>
    `;

    container.appendChild(bloco);
}

async function carregarDisponibilidade() {
    try {
        const res = await fetch(`${API_URL}/api/disponibilidade`, { headers: headersAuth() });
        const data = await res.json();

        if (!data.length) return;

        // Agrupa por dia
        const porDia = {};
        data.forEach(d => {
            if (!porDia[d.dia_semana]) porDia[d.dia_semana] = [];
            porDia[d.dia_semana].push(d);
        });

        // Preenche os blocos
        Object.entries(porDia).forEach(([dia, blocos]) => {
            blocos.forEach(b => {
                adicionarBloco(parseInt(dia), b.hora_inicio.substring(0, 5), b.hora_fim.substring(0, 5), String(b.duracao_minutos), String(b.valor));
            });
        });

        // Preenche valor padrão com o primeiro encontrado
        const primeiro = data[0];
        if (primeiro) {
            const valorInput = document.getElementById('valor-padrao');
            const duracaoInput = document.getElementById('duracao-padrao');
            if (valorInput) valorInput.value = primeiro.valor;
            if (duracaoInput) duracaoInput.value = String(primeiro.duracao_minutos);
        }
    } catch (err) { console.error(err); }
}

async function salvarDisponibilidade() {
    const horarios = [];

    [0, 1, 2, 3, 4, 5, 6].forEach(dia => {
        const container = document.getElementById(`blocos-${dia}`);
        if (!container) return;

        const blocos = container.querySelectorAll('[id^="bloco-"]');
        blocos.forEach(bloco => {
            const inicio = bloco.querySelector('.bloco-inicio')?.value;
            const fim = bloco.querySelector('.bloco-fim')?.value;
            const duracao = bloco.querySelector('.bloco-duracao')?.value;
            const valor = bloco.querySelector('.bloco-valor')?.value;

            if (inicio && fim) {
                horarios.push({
                    dia_semana: dia,
                    hora_inicio: inicio,
                    hora_fim: fim,
                    duracao_minutos: parseInt(duracao) || 50,
                    valor: parseFloat(valor) || 0
                });
            }
        });
    });

    const feedback = document.getElementById('disponibilidade-feedback');
    try {
        const res = await fetch(`${API_URL}/api/disponibilidade`, {
            method: 'POST',
            headers: headersAuth(),
            body: JSON.stringify({ horarios })
        });
        if (res.ok) {
            feedback.textContent = '✅ Disponibilidade salva com sucesso!';
            feedback.style.color = '#34d399';
            feedback.style.display = 'block';
        } else {
            feedback.textContent = 'Erro ao salvar.';
            feedback.style.color = '#f87171';
            feedback.style.display = 'block';
        }
    } catch (err) {
        feedback.textContent = 'Erro de conexão.';
        feedback.style.color = '#f87171';
        feedback.style.display = 'block';
    }
}

async function carregarAgendamentosOnline() {
    try {
        const res = await fetch(`${API_URL}/api/agendamentos-online`, { headers: headersAuth() });
        const data = await res.json();
        const tbody = document.getElementById('agendamentos-online-tbody');
        if (!tbody) return;

        if (!data.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#64748b; padding:20px;">Nenhum agendamento ainda.</td></tr>';
            return;
        }

        const cores = { confirmado: '#34d399', pendente: '#fbbf24', cancelado: '#f87171', reembolsado: '#94a3b8' };
        tbody.innerHTML = data.map(a => `
            <tr>
                <td style="padding:12px 16px;">
                    <div style="color:#e2e8f0; font-weight:500;">${a.paciente_nome}</div>
                    <div style="color:#64748b; font-size:12px;">${a.paciente_email}</div>
                </td>
                <td style="padding:12px 16px; color:#94a3b8;">${parseDateLocal(a.data_consulta + ' 00:00:00').toLocaleDateString('pt-BR')}</td>
                <td style="padding:12px 16px; color:#94a3b8;">${a.hora_inicio.substring(0, 5)}</td>
                <td style="padding:12px 16px; color:#34d399;">R$ ${parseFloat(a.valor).toFixed(2)}</td>
                <td style="padding:12px 16px;">
                    <span style="padding:3px 10px; border-radius:20px; font-size:11px; font-weight:500; background:${cores[a.status]}22; color:${cores[a.status]};">${a.status}</span>
                </td>
                <td style="padding:12px 16px;">
                    ${a.status === 'confirmado' ? `<button onclick="cancelarAgendamentoOnline(${a.id})" style="background:rgba(248,113,113,0.15); color:#f87171; border:1px solid rgba(248,113,113,0.3); border-radius:6px; padding:5px 12px; cursor:pointer; font-size:12px; font-family:'Roboto',sans-serif;">Cancelar</button>` : '—'}
                </td>
            </tr>
        `).join('');
    } catch (err) { console.error(err); }
}

async function cancelarAgendamentoOnline(id) {
    if (!confirm('Cancelar este agendamento? O reembolso será processado conforme a política.')) return;
    try {
        const res = await fetch(`${API_URL}/api/agendamentos-online/${id}/cancelar`, { method: 'POST', headers: headersAuth() });
        const data = await res.json();
        alert(data.mensagem || 'Cancelado.');
        carregarAgendamentosOnline();
    } catch (err) { alert('Erro ao cancelar.'); }
}
// ============================================================
//  RECIBOS
// ============================================================
function popularSelectRecibos() {
    const select = document.getElementById('recibo-paciente');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um paciente</option>';
    pacientes.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.nome;
        select.appendChild(opt);
    });
}

async function gerarRecibo() {
    const pacienteId = document.getElementById('recibo-paciente')?.value;
    const data = document.getElementById('recibo-data')?.value;
    const valor = document.getElementById('recibo-valor')?.value;
    const descricao = document.getElementById('recibo-descricao')?.value;
    const pagamento = document.getElementById('recibo-pagamento')?.value;
    const enviarEmail = document.getElementById('recibo-enviar-email')?.checked;
    const feedback = document.getElementById('recibo-feedback');

    if (!pacienteId || !data || !valor) {
        feedback.textContent = 'Preencha paciente, data e valor.';
        feedback.style.color = '#f87171';
        feedback.style.display = 'block';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/recibos`, {
            method: 'POST',
            headers: headersAuth(),
            body: JSON.stringify({
                paciente_id: pacienteId,
                data_consulta: data,
                valor: valor,
                descricao: descricao,
                forma_pagamento: pagamento,
                enviar_email: enviarEmail
            })
        });
        const data2 = await res.json();

        if (res.ok) {
            feedback.textContent = `✅ Recibo ${data2.numero} gerado com sucesso!${enviarEmail ? ' Email enviado!' : ''}`;
            feedback.style.color = '#34d399';
            feedback.style.display = 'block';
            document.getElementById('recibo-paciente').value = '';
            document.getElementById('recibo-data').value = '';
            document.getElementById('recibo-valor').value = '';
            document.getElementById('recibo-enviar-email').checked = false;
            await carregarRecibos();
        } else {
            feedback.textContent = data2.erro || 'Erro ao gerar recibo.';
            feedback.style.color = '#f87171';
            feedback.style.display = 'block';
        }
    } catch (err) {
        feedback.textContent = 'Erro de conexão.';
        feedback.style.color = '#f87171';
        feedback.style.display = 'block';
    }
}

async function carregarRecibos() {
    try {
        const res = await fetch(`${API_URL}/api/recibos`, { headers: headersAuth() });
        const data = await res.json();
        const tbody = document.getElementById('recibos-tbody');
        if (!tbody) return;

        if (!data.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#64748b; padding:20px;">Nenhum recibo emitido ainda.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(r => `
            <tr>
                <td style="padding:12px 16px; color:#a78bfa; font-weight:600;">${r.numero_recibo}</td>
                <td style="padding:12px 16px; color:#e2e8f0;">${r.paciente_nome}</td>
                <td style="padding:12px 16px; color:#94a3b8;">${parseDateLocal(r.data_consulta + ' 00:00:00').toLocaleDateString('pt-BR')}</td>
                <td style="padding:12px 16px; color:#34d399;">R$ ${parseFloat(r.valor).toFixed(2)}</td>
                <td style="padding:12px 16px; color:#94a3b8;">${r.forma_pagamento}</td>
                <td style="padding:12px 16px;">
                    <span style="padding:3px 10px; border-radius:20px; font-size:11px; font-weight:500;
                        background:${r.enviado_email ? 'rgba(52,211,153,0.15)' : 'rgba(100,116,139,0.15)'};
                        color:${r.enviado_email ? '#34d399' : '#64748b'};">
                        ${r.enviado_email ? '✓ Enviado' : 'Não enviado'}
                    </span>
                </td>
                <td style="padding:12px 16px; display:flex; gap:8px;">
                    <button onclick="baixarReciboPDF(${r.id}, '${r.numero_recibo}')" style="background:#1a2332; color:#a78bfa; border:1px solid rgba(139,92,246,0.3); border-radius:6px; padding:5px 12px; cursor:pointer; font-size:12px; font-family:'Roboto',sans-serif;">
                        <i class="fas fa-download"></i> PDF
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Erro ao carregar recibos:', err);
    }
}

async function baixarReciboPDF(id, numero) {
    try {
        const res = await fetch(`${API_URL}/api/recibos/${id}/pdf`, { headers: headersAuth() });
        if (!res.ok) { alert('Erro ao baixar PDF.'); return; }
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo_${numero}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        alert('Erro de conexão.');
    }
}
// ============================================================
//  ASSINATURA DIGITAL
// ============================================================
let canvasAssinatura, ctxAssinatura, desenhando = false;

function inicializarCanvas() {
    canvasAssinatura = document.getElementById('canvas-assinatura');
    if (!canvasAssinatura) return;
    ctxAssinatura = canvasAssinatura.getContext('2d');
    ctxAssinatura.strokeStyle = '#a78bfa';
    ctxAssinatura.lineWidth = 2.5;
    ctxAssinatura.lineCap = 'round';
    ctxAssinatura.lineJoin = 'round';

    // Mouse
    canvasAssinatura.addEventListener('mousedown', e => { desenhando = true; ctxAssinatura.beginPath(); ctxAssinatura.moveTo(e.offsetX, e.offsetY); });
    canvasAssinatura.addEventListener('mousemove', e => { if (!desenhando) return; ctxAssinatura.lineTo(e.offsetX, e.offsetY); ctxAssinatura.stroke(); });
    canvasAssinatura.addEventListener('mouseup', () => desenhando = false);
    canvasAssinatura.addEventListener('mouseleave', () => desenhando = false);

    // Touch (celular)
    canvasAssinatura.addEventListener('touchstart', e => {
        e.preventDefault();
        desenhando = true;
        const t = e.touches[0];
        const r = canvasAssinatura.getBoundingClientRect();
        ctxAssinatura.beginPath();
        ctxAssinatura.moveTo(t.clientX - r.left, t.clientY - r.top);
    });
    canvasAssinatura.addEventListener('touchmove', e => {
        e.preventDefault();
        if (!desenhando) return;
        const t = e.touches[0];
        const r = canvasAssinatura.getBoundingClientRect();
        ctxAssinatura.lineTo(t.clientX - r.left, t.clientY - r.top);
        ctxAssinatura.stroke();
    });
    canvasAssinatura.addEventListener('touchend', () => desenhando = false);
}

function limparAssinatura() {
    if (!ctxAssinatura) return;
    ctxAssinatura.clearRect(0, 0, canvasAssinatura.width, canvasAssinatura.height);
}

async function salvarAssinatura() {
    if (!canvasAssinatura) return;
    const base64 = canvasAssinatura.toDataURL('image/png');
    const feedback = document.getElementById('assinatura-feedback');

    try {
        const res = await fetch(`${API_URL}/api/perfil/assinatura`, {
            method: 'POST',
            headers: headersAuth(),
            body: JSON.stringify({ assinatura_base64: base64 })
        });

        if (res.ok) {
            feedback.textContent = '✅ Assinatura salva com sucesso!';
            feedback.style.color = '#34d399';
            feedback.style.display = 'block';
            document.getElementById('assinatura-preview').src = base64;
            document.getElementById('assinatura-salva-box').style.display = 'block';
        } else {
            feedback.textContent = 'Erro ao salvar assinatura.';
            feedback.style.color = '#f87171';
            feedback.style.display = 'block';
        }
    } catch (err) {
        feedback.textContent = 'Erro de conexão.';
        feedback.style.color = '#f87171';
        feedback.style.display = 'block';
    }
}

async function carregarAssinaturaSalva() {
    try {
        const res = await fetch(`${API_URL}/api/perfil/assinatura`, { headers: headersAuth() });
        const data = await res.json();
        if (data.assinatura) {
            document.getElementById('assinatura-preview').src = data.assinatura;
            document.getElementById('assinatura-salva-box').style.display = 'block';
        }

        // Preenche carimbo com dados do profissional
        const prof = JSON.parse(localStorage.getItem('profissional') || '{}');
        if (prof.nome) document.getElementById('carimbo-nome').textContent = prof.nome;
        if (prof.crp_crm) document.getElementById('carimbo-crp').textContent = prof.crp_crm;
        if (prof.especialidade) document.getElementById('carimbo-especialidade').textContent = prof.especialidade;

    } catch (err) { console.error(err); }
}

// ============================================================
//  DADOS PROFISSIONAIS
// ============================================================
async function carregarDadosProfissionais() {
    const prof = JSON.parse(localStorage.getItem('profissional') || '{}');
    if (prof.nome) document.getElementById('perfil-nome').value = prof.nome || '';
    if (prof.crp_crm) document.getElementById('perfil-crp').value = prof.crp_crm || '';
    if (prof.especialidade) document.getElementById('perfil-especialidade').value = prof.especialidade || '';
    if (prof.email) document.getElementById('perfil-email').value = prof.email || '';
    if (prof.telefone) document.getElementById('perfil-telefone').value = prof.telefone || '';
    if (prof.endereco) document.getElementById('perfil-endereco').value = prof.endereco || '';
    if (prof.cpf) document.getElementById('perfil-cpf').value = prof.cpf || '';

    // Preenche campos de verificação com os mesmos dados
    if (prof.crp_crm) document.getElementById('verif-crp').value = prof.crp_crm || '';
    if (prof.cpf) document.getElementById('verif-cpf').value = prof.cpf || '';

    // Tenta buscar dados atualizados da API
    try {
        const res = await fetch(`${API_URL}/api/perfil`, { headers: headersAuth() });
        if (!res.ok) return;
        const data = await res.json();
        if (data.nome) document.getElementById('perfil-nome').value = data.nome || '';
        if (data.crp_crm) document.getElementById('perfil-crp').value = data.crp_crm || '';
        if (data.especialidade) document.getElementById('perfil-especialidade').value = data.especialidade || '';
        if (data.email) document.getElementById('perfil-email').value = data.email || '';
        if (data.telefone) document.getElementById('perfil-telefone').value = data.telefone || '';
        if (data.endereco) document.getElementById('perfil-endereco').value = data.endereco || '';
        if (data.cpf) document.getElementById('perfil-cpf').value = data.cpf || '';
        if (data.crp_crm) document.getElementById('verif-crp').value = data.crp_crm || '';
        if (data.cpf) document.getElementById('verif-cpf').value = data.cpf || '';

        // Verifica status de verificação
        atualizarStatusVerificacao(data.verificado, data.verificado_em, data.verificacao_status);
    } catch (err) { }
}

async function salvarDadosProfissionais() {
    const nome = document.getElementById('perfil-nome')?.value.trim();
    const crp_crm = document.getElementById('perfil-crp')?.value.trim();
    const especialidade = document.getElementById('perfil-especialidade')?.value.trim();
    const email = document.getElementById('perfil-email')?.value.trim();
    const telefone = document.getElementById('perfil-telefone')?.value.trim();
    const endereco = document.getElementById('perfil-endereco')?.value.trim();
    const cpf = document.getElementById('perfil-cpf')?.value.trim();
    const feedback = document.getElementById('perfil-dados-feedback');

    try {
        const res = await fetch(`${API_URL}/api/perfil`, {
            method: 'PUT',
            headers: headersAuth(),
            body: JSON.stringify({ nome, crp_crm, especialidade, email, telefone, endereco, cpf })
        });

        if (res.ok) {
            const prof = JSON.parse(localStorage.getItem('profissional') || '{}');
            const atualizado = { ...prof, nome, crp_crm, especialidade, email, telefone, endereco, cpf };
            localStorage.setItem('profissional', JSON.stringify(atualizado));

            // Atualiza carimbo e nome no painel
            if (document.getElementById('carimbo-nome')) document.getElementById('carimbo-nome').textContent = nome;
            if (document.getElementById('carimbo-crp')) document.getElementById('carimbo-crp').textContent = crp_crm;
            if (document.getElementById('carimbo-especialidade')) document.getElementById('carimbo-especialidade').textContent = especialidade;
            const nomeEl = document.getElementById('nome-profissional');
            if (nomeEl) nomeEl.textContent = nome;

            feedback.textContent = '✅ Dados salvos com sucesso!';
            feedback.style.color = '#34d399';
        } else {
            feedback.textContent = '⚠️ Erro ao salvar. Verifique os dados.';
            feedback.style.color = '#f87171';
        }
    } catch (err) {
        const prof = JSON.parse(localStorage.getItem('profissional') || '{}');
        const atualizado = { ...prof, nome, crp_crm, especialidade, email, telefone, endereco, cpf };
        localStorage.setItem('profissional', JSON.stringify(atualizado));

        if (document.getElementById('carimbo-nome')) document.getElementById('carimbo-nome').textContent = nome;
        if (document.getElementById('carimbo-crp')) document.getElementById('carimbo-crp').textContent = crp_crm;
        if (document.getElementById('carimbo-especialidade')) document.getElementById('carimbo-especialidade').textContent = especialidade;
        const nomeEl = document.getElementById('nome-profissional');
        if (nomeEl) nomeEl.textContent = nome;

        feedback.textContent = '✅ Dados salvos localmente!';
        feedback.style.color = '#34d399';
    }

    feedback.style.display = 'block';
    setTimeout(() => { feedback.style.display = 'none'; }, 4000);
}

// ============================================================
//  VERIFICAÇÃO PROFISSIONAL
// ============================================================
function atualizarStatusVerificacao(verificado, verificadoEm, status) {
    const badge = document.getElementById('badge-verificado');
    const blocoSolicitar = document.getElementById('bloco-solicitar-verificacao');
    const statusBox = document.getElementById('status-verificacao');

    if (verificado) {
        // Mostra badge verde, oculta formulário
        if (badge) {
            badge.style.display = 'flex';
            const dataEl = document.getElementById('badge-verificado-data');
            if (dataEl && verificadoEm) {
                dataEl.textContent = 'Verificado em ' + parseDateLocal(verificadoEm).toLocaleDateString('pt-BR');
            }
        }
        if (blocoSolicitar) blocoSolicitar.style.display = 'none';
        return;
    }

    // Não verificado — mostra status da solicitação se houver
    if (status === 'pendente') {
        if (statusBox) {
            statusBox.style.display = 'flex';
            statusBox.style.background = 'rgba(251,191,36,0.08)';
            statusBox.style.border = '1px solid rgba(251,191,36,0.2)';
            statusBox.innerHTML = `
                <i class="fas fa-clock" style="color:#fbbf24; font-size:16px; flex-shrink:0;"></i>
                <div>
                    <p style="font-size:13px; font-weight:600; color:#fbbf24; margin:0;">Verificação em andamento</p>
                    <p style="font-size:12px; color:#64748b; margin:2px 0 0;">Nossa equipe está analisando seus dados. Em até 48h você receberá o selo.</p>
                </div>`;
            const btn = document.getElementById('btn-solicitar-verif');
            if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed'; }
        }
    }
}

// Máscara CPF
function mascaraCPF(input) {
    let v = input.value.replace(/\D/g, '').substring(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    input.value = v;
}

// Atualiza preview do registro montado
function atualizarPreviewRegistro() {
    const conselho = document.getElementById('verif-conselho')?.value || '';
    const regiao = document.getElementById('verif-regiao')?.value || '';
    const numero = document.getElementById('verif-numero')?.value || '';
    const preview = document.getElementById('verif-preview');
    if (!preview) return;
    if (conselho && regiao && numero) {
        preview.textContent = `Registro: ${conselho} ${regiao}/${numero}`;
    } else {
        preview.textContent = '';
    }
}

// Listeners para preview (adicionados após DOM carregado)
document.addEventListener('DOMContentLoaded', () => {
    ['verif-conselho', 'verif-regiao', 'verif-numero'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', atualizarPreviewRegistro);
        if (el) el.addEventListener('change', atualizarPreviewRegistro);
    });
});

async function solicitarVerificacao() {
    const conselho = document.getElementById('verif-conselho')?.value.trim();
    const regiao = document.getElementById('verif-regiao')?.value.trim();
    const numero = document.getElementById('verif-numero')?.value.trim();
    const cpf = document.getElementById('verif-cpf')?.value.trim();
    const feedback = document.getElementById('verif-feedback');
    const btn = document.getElementById('btn-solicitar-verif');

    if (!conselho || !regiao || !numero || !cpf) {
        feedback.textContent = 'Preencha todos os campos para solicitar a verificação.';
        feedback.style.color = '#f87171';
        feedback.style.display = 'block';
        return;
    }

    // Monta o registro completo ex: "CRP 06/123456"
    const crp_crm = `${conselho} ${regiao}/${numero}`;

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>Verificando...';
    feedback.style.display = 'none';

    try {
        const res = await fetch(`${API_URL}/api/perfil/solicitar-verificacao`, {
            method: 'POST',
            headers: headersAuth(),
            body: JSON.stringify({ crp_crm, cpf })
        });
        const data = await res.json();

        if (res.ok && data.verificado) {
            atualizarStatusVerificacao(true, new Date().toISOString(), null);
            feedback.textContent = '✅ Verificado automaticamente!';
            feedback.style.color = '#34d399';
            feedback.style.display = 'block';
        } else {
            atualizarStatusVerificacao(false, null, 'pendente');
            feedback.textContent = '⏳ Solicitação enviada! Nossa equipe verificará em até 48h.';
            feedback.style.color = '#fbbf24';
            feedback.style.display = 'block';
        }
    } catch (err) {
        atualizarStatusVerificacao(false, null, 'pendente');
        feedback.textContent = '⏳ Solicitação registrada! Nossa equipe verificará em até 48h.';
        feedback.style.color = '#fbbf24';
        feedback.style.display = 'block';
    }
}

function toggleRecorrente() {
    const campos = document.getElementById('campos-recorrente');
    const checked = document.getElementById('toggle-recorrente').checked;
    campos.style.display = checked ? 'block' : 'none';

    const startDiv = document.getElementById('start-datetime')?.closest('div');
    const endDiv = document.getElementById('end-datetime')?.closest('div');
    if (startDiv) startDiv.style.display = checked ? 'none' : 'block';
    if (endDiv) endDiv.style.display = checked ? 'none' : 'block';
}

async function carregarRecorrentes() {
    const lista = document.getElementById('recorrentes-lista');
    if (!lista) return;
    try {
        const res = await fetch(`${API_URL}/api/recorrentes`, { headers: headersAuth() });
        const data = await res.json();
        const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        if (!data.length) {
            lista.innerHTML = '<span style="color:#64748b;">Nenhuma recorrência ativa.</span>';
            return;
        }
        lista.innerHTML = data.map(r => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:#0f1621; border-radius:6px; margin-bottom:6px;">
                <div>
                    <span style="color:#e2e8f0; font-weight:500;">${r.paciente_nome}</span>
                    <span style="color:#64748b; margin:0 6px;">—</span>
                    <span style="color:#a78bfa;">${diasNomes[r.dia_semana]}</span>
                    <span style="color:#64748b; margin:0 4px;">${r.hora_inicio.substring(0, 5)}</span>
                    <span style="color:#34d399;">R$ ${parseFloat(r.valor).toFixed(2)}</span>
                </div>
                <button onclick="encerrarRecorrente(${r.id})" style="background:rgba(248,113,113,0.15); color:#f87171; border:1px solid rgba(248,113,113,0.3); border-radius:6px; padding:4px 10px; cursor:pointer; font-size:11px; font-family:'Roboto',sans-serif;">
                    Encerrar
                </button>
            </div>
        `).join('');
    } catch (err) { if (lista) lista.innerHTML = '<span style="color:#f87171;">Erro ao carregar.</span>'; }
}

async function salvarRecorrente() {
    const pacienteId = document.getElementById('paciente-agenda')?.value;
    const diaSemana = document.getElementById('recorrente-dia')?.value;
    const horaInicio = document.getElementById('recorrente-inicio')?.value;
    const duracao = document.getElementById('recorrente-duracao')?.value;
    const valor = document.getElementById('recorrente-valor')?.value;
    const dataInicio = document.getElementById('recorrente-data-inicio')?.value;
    const feedback = document.getElementById('recorrente-feedback');

    const [h, m] = horaInicio.split(':').map(Number);
    const totalMin = h * 60 + m + (parseInt(duracao) || 50);
    const horaFimCalc = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;

    if (!pacienteId || diaSemana === '' || !horaInicio || !dataInicio) {
        feedback.textContent = 'Preencha paciente, dia, horários e data de início.';
        feedback.style.color = '#f87171';
        feedback.style.display = 'block';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/recorrentes`, {
            method: 'POST',
            headers: headersAuth(),
            body: JSON.stringify({
                paciente_id: pacienteId,
                dia_semana: parseInt(diaSemana),
                hora_inicio: horaInicio,
                hora_fim: horaFimCalc,
                duracao_minutos: parseInt(duracao) || 50,
                valor: parseFloat(valor) || 0,
                data_inicio: dataInicio
            })
        });
        const data = await res.json();

        if (res.ok) {
            feedback.textContent = '✅ Recorrência criada com sucesso!';
            feedback.style.color = '#34d399';
            feedback.style.display = 'block';
            document.getElementById('toggle-recorrente').checked = false;
            document.getElementById('campos-recorrente').style.display = 'none';
            await carregarRecorrentes();
        } else {
            feedback.textContent = data.erro || 'Erro ao criar recorrência.';
            feedback.style.color = '#f87171';
            feedback.style.display = 'block';
        }
    } catch (err) {
        feedback.textContent = 'Erro de conexão.';
        feedback.style.color = '#f87171';
        feedback.style.display = 'block';
    }
}

async function encerrarRecorrente(id) {
    if (!confirm('Encerrar esta recorrência? As consultas futuras serão canceladas.')) return;
    try {
        const res = await fetch(`${API_URL}/api/recorrentes/${id}/encerrar`, {
            method: 'POST',
            headers: headersAuth()
        });
        const data = await res.json();
        alert(data.mensagem || 'Encerrado.');
        carregarRecorrentes();
    } catch (err) { alert('Erro ao encerrar.'); }
}
// ---- JOGOS ---- //
// Mapa de jogos disponíveis
const JOGOS = {
    'memoria-emocoes': {
        titulo: '🎴 Memória das Emoções',
        arquivo: 'jogo-memoria-emocoes.html'
    },
    'quem-sou-eu': {
        titulo: '🪞 Quem Sou Eu?',
        arquivo: 'jogo-quem-sou-eu.html'
    },
    'termometro': {
        titulo: '🌡️ Termômetro das Emoções',
        arquivo: 'jogo-termometro.html'
    },
    'memoria-comidas': {
        titulo: '🥦 Memória Saudável',
        arquivo: 'jogo-memoria-comidas.html'
    },
    'sete-erros': {
        titulo: '🔍 Jogo dos 7 Erros',
        arquivo: 'jogo-sete-erros.html'
    },
    'respiracao': {
        titulo: '🫧 Bolha da Respiração',
        arquivo: 'jogo-respiracao.html'
    }
};

function abrirJogo(id) {
    const jogo = JOGOS[id];
    if (!jogo) return;
    const modal = document.getElementById('jogo-modal');
    const iframe = document.getElementById('jogo-iframe');
    const titulo = document.getElementById('jogo-titulo-modal');
    if (!modal || !iframe || !titulo) return;
    titulo.textContent = jogo.titulo;
    iframe.src = jogo.arquivo;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function fecharJogo() {
    const modal = document.getElementById('jogo-modal');
    const iframe = document.getElementById('jogo-iframe');
    if (modal) modal.style.display = 'none';
    if (iframe) iframe.src = '';
    document.body.style.overflow = '';
}

// Fecha com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharJogo();
});
/* ============================================================
   PATCH: Bug Report / Suporte
   Adicione este bloco no final do PainelExclusivo.js
   OU inclua como <script defer src="bug-report.js"></script>
   ============================================================ */

// --- Estado do modal ---
let bugTipoSelecionado = 'erro';

function abrirModalBug() {
    const modal = document.getElementById('modal-bug-report');
    if (!modal) return;

    // Reset
    document.getElementById('bug-titulo').value = '';
    document.getElementById('bug-descricao').value = '';
    document.getElementById('bug-contato').value = '';
    document.getElementById('bug-sucesso').style.display = 'none';
    document.querySelector('.modal-bug-body').style.display = 'flex';
    document.querySelector('.modal-bug-footer').style.display = 'flex';

    // Preenche info técnica
    preencherInfoTecnica();

    // Reseta tipo selecionado
    bugTipoSelecionado = 'erro';
    document.querySelectorAll('.bug-tipo-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tipo === 'erro');
    });

    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('bug-titulo')?.focus(), 100);
}

function fecharModalBug() {
    const modal = document.getElementById('modal-bug-report');
    if (modal) modal.style.display = 'none';
}

function preencherInfoTecnica() {
    const preview = document.getElementById('bug-info-preview');
    if (!preview) return;

    const info = coletarInfoTecnica();
    preview.textContent = [
        `Página:      ${info.pagina}`,
        `Seção ativa: ${info.secao}`,
        `Navegador:   ${info.navegador}`,
        `Tela:        ${info.tela}`,
        `Data/Hora:   ${info.dataHora}`,
        `Profissional:${info.profissional}`,
    ].join('\n');
}

function coletarInfoTecnica() {
    // Descobre qual seção está ativa pelo botão com class "active" na sidebar
    const btnAtivo = document.querySelector('.sidebar button.active');
    const secaoAtiva = btnAtivo ? btnAtivo.textContent.trim() : 'Desconhecida';

    // Tenta pegar nome do profissional logado
    let nomeProfissional = 'Não identificado';
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            nomeProfissional = payload.nome || payload.email || 'Não identificado';
        }
    } catch (_) { }

    return {
        pagina: window.location.href,
        secao: secaoAtiva,
        navegador: navigator.userAgent,
        tela: `${window.innerWidth}x${window.innerHeight}`,
        dataHora: new Date().toLocaleString('pt-BR'),
        profissional: nomeProfissional,
    };
}

// Seleção de tipo de problema
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.bug-tipo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.bug-tipo-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            bugTipoSelecionado = btn.dataset.tipo;
        });
    });

    // Fechar ao clicar fora
    document.getElementById('modal-bug-report')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal-bug-report') fecharModalBug();
    });

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharModalBug();
    });
});

async function enviarBugReport() {
    const titulo = document.getElementById('bug-titulo').value.trim();
    const descricao = document.getElementById('bug-descricao').value.trim();
    const contato = document.getElementById('bug-contato').value.trim();

    if (!titulo) {
        document.getElementById('bug-titulo').focus();
        mostrarToast('Por favor, adicione um título para o problema.', 'aviso');
        return;
    }
    if (!descricao) {
        document.getElementById('bug-descricao').focus();
        mostrarToast('Por favor, descreva o problema antes de enviar.', 'aviso');
        return;
    }

    const btnEnviar = document.getElementById('btn-enviar-bug-submit');
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Enviando...';

    const infoTecnica = coletarInfoTecnica();
    const token = localStorage.getItem('token');

    try {
        const resp = await fetch(`${API_URL}/api/suporte/bug`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                tipo: bugTipoSelecionado,
                titulo,
                descricao,
                contato: contato || null,
                info: infoTecnica
            })
        });

        const data = await resp.json();

        if (!resp.ok) throw new Error(data.erro || 'Erro ao enviar.');

        // Mostra sucesso
        document.querySelector('.modal-bug-body').style.display = 'none';
        document.querySelector('.modal-bug-footer').style.display = 'none';
        document.getElementById('bug-sucesso').style.display = 'flex';

    } catch (err) {
        mostrarToast('Não foi possível enviar o relatório. Tente novamente.', 'erro');
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar relatório';
    }
}

// ============================================================
//  STRIPE — Pagamentos online do profissional
// ============================================================

async function carregarStatusStripe() {
    try {
        const res = await fetch(`${API_URL}/api/perfil/stripe`, { headers: headersAuth() });
        if (!res.ok) return;
        const data = await res.json();

        if (data.configurado) {
            document.getElementById('stripe-sem-chave').style.display = 'none';
            document.getElementById('stripe-com-chave').style.display = 'block';
            document.getElementById('stripe-chave-preview').textContent = data.chave_preview;
        } else {
            document.getElementById('stripe-sem-chave').style.display = 'block';
            document.getElementById('stripe-com-chave').style.display = 'none';
        }
    } catch (err) {
        console.error('Erro ao carregar status Stripe:', err);
    }
}

async function salvarChavesStripe() {
    const secretKey = document.getElementById('stripe-secret-key').value.trim();
    const publishKey = document.getElementById('stripe-publishable-key').value.trim();
    const feedback = document.getElementById('stripe-feedback');
    const btn = document.getElementById('btn-salvar-stripe');

    if (!secretKey) {
        feedback.textContent = '❌ A Secret Key é obrigatória.';
        feedback.style.color = '#f87171';
        feedback.style.display = 'block';
        return;
    }

    if (!secretKey.startsWith('sk_')) {
        feedback.textContent = '❌ A Secret Key deve começar com sk_live_ ou sk_test_';
        feedback.style.color = '#f87171';
        feedback.style.display = 'block';
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i>Verificando...';
    feedback.style.display = 'none';

    try {
        const res = await fetch(`${API_URL}/api/perfil/stripe`, {
            method: 'POST',
            headers: headersAuth(),
            body: JSON.stringify({
                stripe_secret_key: secretKey,
                stripe_publishable_key: publishKey || null
            })
        });

        const data = await res.json();

        if (res.ok) {
            feedback.textContent = '✅ ' + data.mensagem;
            feedback.style.color = '#34d399';
            feedback.style.display = 'block';
            setTimeout(() => carregarStatusStripe(), 800);
        } else {
            feedback.textContent = '❌ ' + data.erro;
            feedback.style.color = '#f87171';
            feedback.style.display = 'block';
        }
    } catch (err) {
        feedback.textContent = '❌ Erro de conexão. Tente novamente.';
        feedback.style.color = '#f87171';
        feedback.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-plug" style="margin-right:6px;"></i>Conectar Stripe';
    }
}

async function removerChavesStripe() {
    if (!confirm('Tem certeza? Seus pacientes não poderão mais pagar online até você reconectar o Stripe.')) return;

    try {
        const res = await fetch(`${API_URL}/api/perfil/stripe`, {
            method: 'DELETE',
            headers: headersAuth()
        });
        if (res.ok) carregarStatusStripe();
    } catch (err) {
        alert('Erro ao desconectar. Tente novamente.');
    }
}

function toggleVerStripe(inputId, btn) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.innerHTML = isPassword
        ? '<i class="fas fa-eye-slash"></i>'
        : '<i class="fas fa-eye"></i>';
}
// ============================================================
//  FINANCEIRO — relatório de pagamentos recebidos via agenda online
// ============================================================

// Inicializa o mês/ano atual ao carregar
document.addEventListener('DOMContentLoaded', () => {
    const agora = new Date();
    const selMes = document.getElementById('fin-mes');
    const inpAno = document.getElementById('fin-ano');
    if (selMes) selMes.value = agora.getMonth() + 1;
    if (inpAno) inpAno.value = agora.getFullYear();
});

async function carregarFinanceiro() {
    const selMes = document.getElementById('fin-mes');
    const inpAno = document.getElementById('fin-ano');
    const tbody = document.getElementById('fin-tabela-body');
    if (!tbody || !selMes || !inpAno) return;

    const mes = parseInt(selMes.value);
    const ano = parseInt(inpAno.value);

    tbody.innerHTML = '<tr><td colspan="5" style="padding:40px; text-align:center; color:#64748b;"><i class="fas fa-spinner fa-spin"></i> Carregando...</td></tr>';

    try {
        const res = await fetch(`${API_URL}/api/agendamentos-online`, {
            headers: headersAuth()
        });
        if (!res.ok) throw new Error('Erro ao buscar pagamentos');
        const todos = await res.json();

        // Filtra pelo mês/ano selecionado
        const filtrados = todos.filter(ag => {
            const d = parseDateLocal(ag.data_consulta + ' 00:00:00');
            return d.getMonth() + 1 === mes && d.getFullYear() === ano;
        });

        // Totais
        const confirmados = filtrados.filter(a => a.status === 'confirmado');
        const pendentes = filtrados.filter(a => a.status === 'pendente');
        const cancelados = filtrados.filter(a => a.status === 'cancelado');
        const totalValor = confirmados.reduce((s, a) => s + parseFloat(a.valor || 0), 0);

        document.getElementById('fin-total-confirmados').textContent = confirmados.length;
        document.getElementById('fin-total-pendentes').textContent = pendentes.length;
        document.getElementById('fin-total-cancelados').textContent = cancelados.length;
        document.getElementById('fin-total-valor').textContent = `R$ ${totalValor.toFixed(2)}`;

        if (!filtrados.length) {
            tbody.innerHTML = '<tr><td colspan="5" style="padding:40px; text-align:center; color:#64748b;">Nenhum pagamento neste período.</td></tr>';
            return;
        }

        const statusCor = { confirmado: '#34d399', pendente: '#fbbf24', cancelado: '#f87171' };
        const statusLabel = { confirmado: '✓ Confirmado', pendente: '⏳ Pendente', cancelado: '✗ Cancelado' };

        tbody.innerHTML = filtrados.map(ag => {
            const data = parseDateLocal(ag.data_consulta + ' 00:00:00').toLocaleDateString('pt-BR');
            const hora = ag.hora_inicio ? ag.hora_inicio.substring(0, 5) : '';
            const cor = statusCor[ag.status] || '#64748b';
            const label = statusLabel[ag.status] || ag.status;
            const stripeId = ag.stripe_payment_intent || ag.stripe_session_id || null;
            const stripeCell = stripeId
                ? `<span title="${stripeId}" style="font-family:monospace; font-size:11px; color:#8b5cf6; cursor:help;">${stripeId.substring(0, 24)}...</span>`
                : '<span style="color:#475569;">—</span>';

            return `<tr>
                <td style="padding:12px 16px; border-top:1px solid rgba(139,92,246,0.08); color:#e2e8f0;">
                    <strong>${ag.paciente_nome}</strong><br>
                    <span style="font-size:11px; color:#64748b;">${ag.paciente_email || ''}</span>
                </td>
                <td style="padding:12px 16px; border-top:1px solid rgba(139,92,246,0.08); color:#94a3b8;">
                    ${data}<br><span style="font-size:11px; color:#64748b;">${hora}</span>
                </td>
                <td style="padding:12px 16px; border-top:1px solid rgba(139,92,246,0.08); font-weight:600; color:#a78bfa;">
                    R$ ${parseFloat(ag.valor || 0).toFixed(2)}
                    ${ag.reembolso_valor ? `<br><span style="font-size:11px; color:#f87171; font-weight:400;">Reembolso: R$ ${parseFloat(ag.reembolso_valor).toFixed(2)}</span>` : ''}
                </td>
                <td style="padding:12px 16px; border-top:1px solid rgba(139,92,246,0.08);">
                    <span style="font-size:12px; font-weight:500; color:${cor};">${label}</span>
                </td>
                <td style="padding:12px 16px; border-top:1px solid rgba(139,92,246,0.08);">${stripeCell}</td>
            </tr>`;
        }).join('');

    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding:40px; text-align:center; color:#f87171;">Erro ao carregar. Tente novamente.</td></tr>';
        console.error(err);
    }
}
// ============================================================
//  SAIR — limpa sessão e redireciona para login
// ============================================================
function sair() {
    if (!confirm('Deseja sair do sistema?')) return;
    localStorage.removeItem('token');
    localStorage.removeItem('profissional');
    window.location.href = 'login.html';
}
// ============================================================
//  LINK DE ATENDIMENTO ONLINE
// ============================================================
async function carregarLinkVideo() {
    try {
        const res = await fetch(`${API_URL}/api/perfil/link-video`, { headers: headersAuth() });
        if (!res.ok) return;
        const data = await res.json();
        const input = document.getElementById('link-video');
        if (input && data.link_video) input.value = data.link_video;
    } catch (err) {
        console.error('Erro ao carregar link de vídeo:', err);
    }
}

async function salvarLinkVideo() {
    const link = document.getElementById('link-video').value.trim();
    const feedback = document.getElementById('link-video-feedback');

    feedback.style.display = 'none';

    try {
        const res = await fetch(`${API_URL}/api/perfil/link-video`, {
            method: 'POST',
            headers: headersAuth(),
            body: JSON.stringify({ link_video: link })
        });
        const data = await res.json();

        if (res.ok) {
            feedback.textContent = '✅ Link salvo com sucesso!';
            feedback.style.color = '#34d399';
        } else {
            feedback.textContent = '❌ ' + data.erro;
            feedback.style.color = '#f87171';
        }
        feedback.style.display = 'block';
        setTimeout(() => { feedback.style.display = 'none'; }, 3000);
    } catch (err) {
        feedback.textContent = '❌ Erro de conexão.';
        feedback.style.color = '#f87171';
        feedback.style.display = 'block';
    }
}

// ============================================================
//  VITRINE DE PROFISSIONAIS
// ============================================================
const ESPECIALIDADES_VITRINE = [
    'Ansiedade', 'Depressão', 'TCC', 'Psicanálise', 'Infância',
    'Adolescência', 'Casal', 'Família', 'Trauma', 'Luto',
    'TDAH', 'Autismo', 'Bipolaridade', 'TOC', 'Online',
    'Transtorno Alimentar', 'Dependência Química', 'Neuropsicologia',
    'Orientação Profissional', 'Psiquiatria'
];

let vitrineEspecialidadesSelecionadas = [];
let vitrineProfVerificado = false;
let vitrineFotoUrl = null;
let vitrineAtivo = false;

async function carregarVitrine() {
    try {
        const resPerf = await fetch(`${API_URL}/api/perfil`, { headers: headersAuth() });
        const perf = await resPerf.json();
        vitrineProfVerificado = !!perf.verificado;

        const aviso = document.getElementById('vitrine-aviso-verif');
        const wrapper = document.getElementById('vitrine-form-wrapper');

        if (!vitrineProfVerificado) {
            if (aviso) aviso.style.display = 'block';
            if (wrapper) { wrapper.style.opacity = '0.4'; wrapper.style.pointerEvents = 'none'; wrapper.style.userSelect = 'none'; }
        } else {
            if (aviso) aviso.style.display = 'none';
            if (wrapper) { wrapper.style.opacity = '1'; wrapper.style.pointerEvents = 'auto'; wrapper.style.userSelect = 'auto'; }
        }

        const iniciais = perf.nome ? perf.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?';
        const fotoInitEl = document.getElementById('vitrine-foto-initials');
        const prevInitEl = document.getElementById('prev-foto-initials');
        if (fotoInitEl) fotoInitEl.textContent = iniciais;
        if (prevInitEl) prevInitEl.textContent = iniciais;

        const prevNome = document.getElementById('prev-nome');
        const prevSpec = document.getElementById('prev-spec');
        const prevCrp = document.getElementById('prev-crp');
        if (prevNome) prevNome.textContent = perf.nome || 'Seu nome';
        if (prevSpec) prevSpec.textContent = `${perf.especialidade || 'Especialidade'} · Cidade, Estado`;
        if (prevCrp) prevCrp.textContent = perf.crp_crm || 'CRP/CRM';

        const resV = await fetch(`${API_URL}/api/vitrine/perfil`, { headers: headersAuth() });
        const d = await resV.json();

        vitrineAtivo = !!d.vitrine_ativo;
        const toggle = document.getElementById('vitrine-toggle');
        if (toggle) toggle.checked = vitrineAtivo;
        atualizarToggleVisual(vitrineAtivo);

        const bioEl = document.getElementById('vitrine-bio');
        if (bioEl) bioEl.value = d.vitrine_bio || '';
        atualizarBioCount();

        const wppEl = document.getElementById('vitrine-wpp');
        if (wppEl) wppEl.value = d.vitrine_whatsapp || '';

        const emailEl = document.getElementById('vitrine-email-pub');
        if (emailEl) emailEl.value = d.vitrine_email_publico || '';

        const acWppEl = document.getElementById('vitrine-aceita-wpp');
        if (acWppEl) acWppEl.checked = d.vitrine_aceita_wpp !== 0;

        const acEmailEl = document.getElementById('vitrine-aceita-email');
        if (acEmailEl) acEmailEl.checked = !!d.vitrine_aceita_email;

        const cidadeEl = document.getElementById('vitrine-cidade');
        if (cidadeEl) cidadeEl.value = d.vitrine_cidade || '';

        const estadoEl = document.getElementById('vitrine-estado');
        if (estadoEl) estadoEl.value = d.vitrine_estado || '';

        if (d.vitrine_foto_url) {
            vitrineFotoUrl = d.vitrine_foto_url;
            exibirFotoVitrine(d.vitrine_foto_url);
        }

        vitrineEspecialidadesSelecionadas = Array.isArray(d.vitrine_especialidades) ? d.vitrine_especialidades : [];
        renderizarTagsVitrine();
        atualizarBadgeMenuVitrine(!!d.vitrine_ativo && vitrineProfVerificado);
        atualizarPreviewVitrine();

        // Listeners de preview em tempo real
        ['vitrine-cidade', 'vitrine-estado', 'vitrine-email-pub'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', atualizarPreviewVitrine);
        });
        ['vitrine-aceita-wpp', 'vitrine-aceita-email'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('change', atualizarPreviewVitrine);
        });

    } catch (err) {
        console.error('Erro ao carregar vitrine:', err);
    }
}

function atualizarToggleVisual(ativo) {
    const track = document.getElementById('vitrine-toggle-track');
    const thumb = document.getElementById('vitrine-toggle-thumb');
    if (!track || !thumb) return;
    track.style.background = ativo ? '#34d399' : 'rgba(100,116,139,0.4)';
    thumb.style.transform = ativo ? 'translateX(22px)' : 'translateX(0)';
}

function aoMudarToggleVitrine(novoEstado) {
    if (novoEstado && !vitrineProfVerificado) {
        vitrineAtivo = false;
        const toggle = document.getElementById('vitrine-toggle');
        if (toggle) toggle.checked = false;
        atualizarToggleVisual(false);
        mostrarFeedbackVitrine('Você precisa ter a verificação aprovada para ativar a vitrine.', false);
        return;
    }
    vitrineAtivo = novoEstado;
    atualizarToggleVisual(novoEstado);
}

function renderizarTagsVitrine() {
    const wrapper = document.getElementById('vitrine-tags-wrapper');
    if (!wrapper) return;
    wrapper.innerHTML = ESPECIALIDADES_VITRINE.map(tag => {
        const ativa = vitrineEspecialidadesSelecionadas.includes(tag);
        return `<button type="button" onclick="toggleTagVitrine('${tag}')" style="
            padding:5px 14px; border-radius:16px; font-size:12px; cursor:pointer;
            font-family:'Roboto',sans-serif; transition:all .15s;
            border:1px solid ${ativa ? 'rgba(52,211,153,0.5)' : 'rgba(139,92,246,0.2)'};
            background:${ativa ? 'rgba(52,211,153,0.1)' : 'transparent'};
            color:${ativa ? '#34d399' : '#64748b'};">${tag}</button>`;
    }).join('');
}

function toggleTagVitrine(tag) {
    const idx = vitrineEspecialidadesSelecionadas.indexOf(tag);
    if (idx >= 0) vitrineEspecialidadesSelecionadas.splice(idx, 1);
    else vitrineEspecialidadesSelecionadas.push(tag);
    renderizarTagsVitrine();
    atualizarPreviewVitrine();
}

function atualizarBioCount() {
    const bio = document.getElementById('vitrine-bio');
    const cnt = document.getElementById('vitrine-bio-count');
    if (!bio || !cnt) return;
    const len = bio.value.length;
    cnt.textContent = `${len} / 300`;
    cnt.style.color = len > 270 ? '#f87171' : '#64748b';
    atualizarPreviewVitrine();
}

function mascaraTelefoneVitrine(input) {
    let v = input.value.replace(/\D/g, '').substring(0, 11);
    if (v.length > 6) v = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
    else if (v.length > 2) v = `(${v.substring(0, 2)}) ${v.substring(2)}`;
    else if (v.length > 0) v = `(${v}`;
    input.value = v;
}

function atualizarPreviewVitrine() {
    const bio = document.getElementById('vitrine-bio')?.value || '';
    const cidade = document.getElementById('vitrine-cidade')?.value || '';
    const estado = document.getElementById('vitrine-estado')?.value || '';
    const acWpp = document.getElementById('vitrine-aceita-wpp')?.checked;
    const acEmail = document.getElementById('vitrine-aceita-email')?.checked;
    const emailP = document.getElementById('vitrine-email-pub')?.value || '';

    const prevSpec = document.getElementById('prev-spec');
    if (prevSpec) {
        const esp = prevSpec.textContent.split('·')[0].trim();
        const loc = cidade && estado ? `${cidade}, ${estado}` : cidade || estado || 'Cidade, Estado';
        prevSpec.textContent = `${esp} · ${loc}`;
    }

    const prevBio = document.getElementById('prev-bio');
    if (prevBio) prevBio.textContent = bio;

    const prevTags = document.getElementById('prev-tags');
    if (prevTags) {
        prevTags.innerHTML = vitrineEspecialidadesSelecionadas.slice(0, 3).map(t =>
            `<span style="font-size:10px;padding:2px 8px;border-radius:10px;background:#1a2332;border:1px solid rgba(139,92,246,0.2);color:#64748b;">${t}</span>`
        ).join('');
    }

    const prevWpp = document.getElementById('prev-btn-wpp');
    const prevEmail = document.getElementById('prev-btn-email');
    if (prevWpp) prevWpp.style.display = acWpp ? 'inline-flex' : 'none';
    if (prevEmail) prevEmail.style.display = (acEmail && emailP) ? 'inline-flex' : 'none';
}

async function uploadFotoVitrine(input) {
    const file = input.files[0];
    if (!file) return;
    const fb = document.getElementById('vitrine-foto-feedback');
    if (fb) { fb.textContent = 'Enviando...'; fb.style.color = '#94a3b8'; }
    const form = new FormData();
    form.append('foto', file);
    try {
        const res = await fetch(`${API_URL}/api/vitrine/foto`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: form
        });
        const d = await res.json();
        if (res.ok && d.url) {
            vitrineFotoUrl = d.url;
            exibirFotoVitrine(d.url);
            if (fb) { fb.textContent = '✓ Foto salva!'; fb.style.color = '#34d399'; }
        } else {
            if (fb) { fb.textContent = d.erro || 'Erro ao enviar foto.'; fb.style.color = '#f87171'; }
        }
    } catch (err) {
        if (fb) { fb.textContent = 'Erro de conexão.'; fb.style.color = '#f87171'; }
    }
}

function exibirFotoVitrine(url) {
    const preview = document.getElementById('vitrine-foto-preview');
    const initials = document.getElementById('vitrine-foto-initials');
    const prevImg = document.getElementById('prev-foto-img');
    const prevInit = document.getElementById('prev-foto-initials');
    if (preview) { preview.src = url; preview.style.display = 'block'; }
    if (initials) initials.style.display = 'none';
    if (prevImg) { prevImg.src = url; prevImg.style.display = 'block'; }
    if (prevInit) prevInit.style.display = 'none';
}

async function salvarVitrine() {
    const ativo = vitrineAtivo;

    if (ativo && !vitrineProfVerificado) {
        mostrarFeedbackVitrine('Verificação profissional necessária para ativar a vitrine.', false);
        if (toggle) toggle.checked = false;
        atualizarToggleVisual(false);
        return;
    }

    mostrarFeedbackVitrine('Salvando...', null);

    const payload = {
        vitrine_ativo: ativo,
        vitrine_bio: document.getElementById('vitrine-bio')?.value || null,
        vitrine_whatsapp: document.getElementById('vitrine-wpp')?.value || null,
        vitrine_email_publico: document.getElementById('vitrine-email-pub')?.value || null,
        vitrine_aceita_wpp: document.getElementById('vitrine-aceita-wpp')?.checked ?? true,
        vitrine_aceita_email: document.getElementById('vitrine-aceita-email')?.checked ?? false,
        vitrine_cidade: document.getElementById('vitrine-cidade')?.value || null,
        vitrine_estado: document.getElementById('vitrine-estado')?.value || null,
        vitrine_especialidades: vitrineEspecialidadesSelecionadas,
    };

    try {
        const res = await fetch(`${API_URL}/api/vitrine/perfil`, {
            method: 'PUT',
            headers: headersAuth(),
            body: JSON.stringify(payload)
        });
        const d = await res.json();
        if (res.ok) {
            vitrineAtivo = ativo;
            mostrarFeedbackVitrine('✓ ' + d.mensagem, true);
            atualizarBadgeMenuVitrine(ativo && vitrineProfVerificado);
            atualizarToggleVisual(ativo);
        } else {
            mostrarFeedbackVitrine(d.erro || 'Erro ao salvar.', false);
            if (d.codigo === 'VERIFICACAO_PENDENTE' && toggle) {
                toggle.checked = false;
                atualizarToggleVisual(false);
            }
        }
    } catch (err) {
        mostrarFeedbackVitrine('Erro de conexão.', false);
    }
}

function mostrarFeedbackVitrine(msg, sucesso) {
    const fb = document.getElementById('vitrine-feedback');
    if (!fb) return;
    fb.style.display = 'block';
    if (sucesso === true) fb.style.color = '#34d399';
    else if (sucesso === false) fb.style.color = '#f87171';
    else fb.style.color = '#94a3b8';
    fb.textContent = msg;
    if (sucesso === true) setTimeout(() => { fb.style.display = 'none'; }, 4000);
}

function atualizarBadgeMenuVitrine(ativo) {
    const badge = document.getElementById('vitrine-badge-ativo');
    if (badge) badge.style.display = ativo ? 'inline' : 'none';
}