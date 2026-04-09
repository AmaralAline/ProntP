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
    ];

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
});

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

    // Atualiza botão ativo no menu
    document.querySelectorAll('.sidebar button').forEach(b => b.classList.remove('active'));
    const btnAtivo = document.querySelector(`[aria-controls="${id}"]`);
    if (btnAtivo) btnAtivo.classList.add('active');
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
                            ${new Date(ev.data_hora).toLocaleDateString('pt-BR')}
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
}

// ============================================================
//  AGENDA
// ============================================================
const agendaForm = document.getElementById('agenda-form');
if (agendaForm) {
    agendaForm.addEventListener('submit', async e => {
        e.preventDefault();

        const paciente_id = document.getElementById('paciente-agenda')?.value;
        const data_hora_inicio = document.getElementById('start-datetime')?.value;
        const data_hora_fim = document.getElementById('end-datetime')?.value;
        const observacoes = document.getElementById('descricao')?.value.trim();

        if (!data_hora_inicio || !data_hora_fim) {
            document.getElementById('agenda-error').style.display = 'block';
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
                await carregarAgendaHoje();
            } else {
                mostrarFeedback('agenda-error', 'Erro ao agendar consulta.', 'erro');
            }
        } catch (err) {
            mostrarFeedback('agenda-error', 'Erro de conexão com o servidor.', 'erro');
        }
    });
}

async function carregarAgendaHoje() {
    const hoje = new Date();
    const inicio = hoje.toISOString().split('T')[0] + ' 00:00:00';
    const fim = hoje.toISOString().split('T')[0] + ' 23:59:59';

    try {
        const res = await fetch(`${API_URL}/api/agenda?inicio=${inicio}&fim=${fim}`, {
            headers: headersAuth()
        });

        if (res.ok) {
            const consultas = await res.json();
            const lista = document.getElementById('daily-agenda-list');
            if (!lista) return;

            if (!consultas.length) {
                lista.innerHTML = '<p style="color:#aaa;">Nenhuma consulta hoje.</p>';
                return;
            }

            lista.innerHTML = consultas.map(c => `
                <div style="padding:10px; border-bottom:1px solid #333;">
                    <strong>${c.paciente_nome || 'Sem paciente'}</strong><br>
                    🕐 ${new Date(c.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    — ${new Date(c.data_hora_fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    <span style="margin-left:10px; font-size:12px; color:#aaa;">${c.status}</span>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Erro ao carregar agenda:', err);
    }
}

// ============================================================
//  UTILITÁRIO — Feedback visual
// ============================================================
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

    // Formulários pendentes e respondidos
    await carregarEstatisticasFormularios();
}

async function carregarConsultasHojeDashboard() {
    const hoje = new Date();
    const inicio = hoje.toISOString().split('T')[0] + ' 00:00:00';
    const fim = hoje.toISOString().split('T')[0] + ' 23:59:59';

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

        container.innerHTML = consultas.map(c => `
            <div class="dash-consulta-item">
                <span class="dash-consulta-hora">
                    🕐 ${new Date(c.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    — ${new Date(c.data_hora_fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span class="dash-consulta-nome">${c.paciente_nome || 'Sem paciente'}</span>
                <span class="dash-consulta-status">${c.status || 'agendado'}</span>
            </div>
        `).join('');

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
    const mes = document.getElementById('rel-mes')?.value;
    const ano = document.getElementById('rel-ano')?.value;
    const convenio = document.getElementById('rel-convenio')?.value;

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