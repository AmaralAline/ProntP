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
        container.innerHTML = '<p style="color:#aaa;">Nenhum paciente cadastrado ainda.</p>';
        return;
    }

    container.innerHTML = `
        <table style="width:100%; border-collapse:collapse; margin-top:20px;">
            <thead>
                <tr style="background:#2a2a2a; color:#fff;">
                    <th style="padding:10px; text-align:left;">Nome</th>
                    <th style="padding:10px; text-align:left;">Telefone</th>
                    <th style="padding:10px; text-align:left;">E-mail</th>
                    <th style="padding:10px; text-align:left;">Pagamento</th>
                </tr>
            </thead>
            <tbody>
                ${pacientes.map(p => `
                    <tr style="border-bottom:1px solid #333;">
                        <td style="padding:10px;">${p.nome}</td>
                        <td style="padding:10px;">${p.telefone || '-'}</td>
                        <td style="padding:10px;">${p.email || '-'}</td>
                        <td style="padding:10px;">${p.modo_pagamento || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
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

        if (!pacienteId || !data_hora || !texto_evolucao) {
            document.getElementById('evolucao-error').style.display = 'block';
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/pacientes/${pacienteId}/evolucoes`, {
                method: 'POST',
                headers: headersAuth(),
                body: JSON.stringify({ texto_evolucao, data_hora })
            });

            if (res.ok) {
                mostrarFeedback('evolucao-error', '✅ Evolução salva com sucesso!', 'sucesso');
                evolucaoForm.reset();
                // Atualiza histórico se o paciente estiver selecionado
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
                        <td style="padding:8px;">${new Date(ev.data_hora).toLocaleDateString('pt-BR')}</td>
                        <td style="padding:8px;">${ev.texto_evolucao}</td>
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
//
//  AGENDA — inicializa ao abrir a seção
// ============================================================

// Detecta quando o botão da agenda é clicado e carrega os dados
const btnAgenda = document.getElementById('btn-agenda');
if (btnAgenda) {
    btnAgenda.addEventListener('click', () => {
        carregarAgendaHoje();
    });
}

// ============================================================
//  CRIAR AGENDAMENTO
// ============================================================
const agendaForm = document.getElementById('agenda-form');
if (agendaForm) {
    // Remove listener antigo se existir (evita duplicação)
    agendaForm.replaceWith(agendaForm.cloneNode(true));
    const agendaFormNovo = document.getElementById('agenda-form');

    agendaFormNovo.addEventListener('submit', async e => {
        e.preventDefault();

        const paciente_id = document.getElementById('paciente-agenda')?.value || null;
        const data_hora_inicio = document.getElementById('start-datetime')?.value;
        const data_hora_fim = document.getElementById('end-datetime')?.value;
        const observacoes = document.getElementById('descricao')?.value.trim();

        if (!data_hora_inicio || !data_hora_fim) {
            mostrarFeedback('agenda-error', 'Preencha data/hora de início e fim.', 'erro');
            return;
        }

        if (new Date(data_hora_fim) <= new Date(data_hora_inicio)) {
            mostrarFeedback('agenda-error', 'O horário de fim deve ser depois do início.', 'erro');
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
                agendaFormNovo.reset();
                await carregarAgendaHoje();
                await carregarAgendaPorData(); // atualiza data selecionada também
            } else {
                const err = await res.json();
                mostrarFeedback('agenda-error', err.erro || 'Erro ao agendar consulta.', 'erro');
            }
        } catch (err) {
            mostrarFeedback('agenda-error', 'Erro de conexão com o servidor.', 'erro');
        }
    });
}

// ============================================================
//  VER AGENDA DO DIA (hoje)
// ============================================================
async function carregarAgendaHoje() {
    const hoje = new Date().toISOString().split('T')[0];
    const inicio = `${hoje} 00:00:00`;
    const fim = `${hoje} 23:59:59`;

    try {
        const res = await fetch(`${API_URL}/api/agenda?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`, {
            headers: headersAuth()
        });

        if (res.ok) {
            const consultas = await res.json();
            renderizarAgenda('daily-agenda-list', consultas, 'Nenhuma consulta hoje.');
        }
    } catch (err) {
        console.error('Erro ao carregar agenda de hoje:', err);
    }
}

// ============================================================
//  VER AGENDA POR DATA SELECIONADA
// ============================================================
const btnVerDia = document.getElementById('btn-ver-dia');
if (btnVerDia) {
    btnVerDia.addEventListener('click', () => carregarAgendaPorData());
}

async function carregarAgendaPorData() {
    const inputData = document.getElementById('data-selecionada');
    if (!inputData || !inputData.value) return;

    const data = inputData.value;
    const inicio = `${data} 00:00:00`;
    const fim = `${data} 23:59:59`;

    const tituloEl = document.getElementById('titulo-agenda-dia');
    if (tituloEl) {
        tituloEl.textContent = `Agendamentos de ${new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}`;
    }

    try {
        const res = await fetch(`${API_URL}/api/agenda?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`, {
            headers: headersAuth()
        });

        if (res.ok) {
            const consultas = await res.json();
            renderizarAgenda('lista-agenda-dia', consultas, 'Nenhuma consulta neste dia.');
        }
    } catch (err) {
        console.error('Erro ao carregar agenda por data:', err);
    }
}

// ============================================================
//  RENDERIZAR LISTA DE CONSULTAS
// ============================================================
function renderizarAgenda(containerId, consultas, msgVazio) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!consultas.length) {
        container.innerHTML = `<p style="color:#aaa; padding:10px;">${msgVazio}</p>`;
        return;
    }

    container.innerHTML = consultas.map(c => `
        <div class="consulta-item" style="
            padding: 12px;
            border-bottom: 1px solid #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
        ">
            <div>
                <strong style="color:#fff;">${c.paciente_nome || '(Sem paciente)'}</strong><br>
                <span style="color:#aaa; font-size:13px;">
                    🕐 ${formatarHora(c.data_hora_inicio)} — ${formatarHora(c.data_hora_fim)}
                </span>
                ${c.observacoes ? `<br><span style="color:#888; font-size:12px;">📝 ${c.observacoes}</span>` : ''}
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
                <span class="badge-status" style="
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: bold;
                    background: ${corStatus(c.status)};
                    color: #fff;
                ">${c.status}</span>
                <select onchange="atualizarStatusConsulta(${c.id}, this.value)" style="
                    background:#2a2a2a; color:#fff; border:1px solid #555;
                    border-radius:6px; padding:4px 8px; font-size:12px; cursor:pointer;
                ">
                    <option value="">Alterar...</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="realizado">Realizado</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="falta">Falta</option>
                </select>
            </div>
        </div>
    `).join('');
}

// ============================================================
//  CANCELAR / ATUALIZAR STATUS DA CONSULTA
// ============================================================
async function atualizarStatusConsulta(consultaId, novoStatus) {
    if (!novoStatus) return;

    const confirmar = confirm(`Alterar status para "${novoStatus}"?`);
    if (!confirmar) return;

    try {
        const res = await fetch(`${API_URL}/api/agenda/${consultaId}`, {
            method: 'PUT',
            headers: headersAuth(),
            body: JSON.stringify({ status: novoStatus })
        });

        if (res.ok) {
            // Recarrega a agenda para refletir a mudança
            await carregarAgendaHoje();
            await carregarAgendaPorData();
        } else {
            alert('Erro ao atualizar status da consulta.');
        }
    } catch (err) {
        alert('Erro de conexão com o servidor.');
    }
}

// ============================================================
//  UTILITÁRIOS
// ============================================================
function formatarHora(dataHora) {
    if (!dataHora) return '--:--';
    return new Date(dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function corStatus(status) {
    const cores = {
        agendado: '#2196F3',
        confirmado: '#4CAF50',
        realizado: '#9C27B0',
        cancelado: '#f44336',
        falta: '#FF9800'
    };
    return cores[status] || '#555';
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