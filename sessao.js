// ============================================================
//  ProntPsi - sessao.js
//  Clique no paciente da agenda → inicia sessão com cronômetro
//  Adicione após o agenda.js no PainelExclusivo.html
// ============================================================

// ============================================================
//  VARIÁVEIS DO CRONÔMETRO
// ============================================================
let cronometroInterval = null;
let segundosTotais = 0;
let sessaoAtiva = false;
let consultaAtualId = null;
let pacienteAtualId = null;
let pacienteAtualNome = null;
const API_URL = 'https://prontpsiback-production.up.railway.app';
// ============================================================
//  INJETA O MODAL DE SESSÃO NO HTML
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.createElement('div');
    modal.id = 'modal-sessao';
    modal.innerHTML = `
        <div id="modal-sessao-overlay" style="
            display:none; position:fixed; top:0; left:0; width:100%; height:100%;
            background:rgba(0,0,0,0.7); z-index:1000; justify-content:center; align-items:center;
        ">
            <div style="
                background:#1e1e2e; border-radius:16px; padding:32px;
                width:90%; max-width:700px; max-height:90vh; overflow-y:auto;
                box-shadow: 0 8px 32px rgba(0,0,0,0.5); position:relative;
            ">
                <!-- Cabeçalho com cronômetro -->
                <div id="sessao-header" style="
                    display:flex; justify-content:space-between; align-items:center;
                    margin-bottom:24px; flex-wrap:wrap; gap:12px;
                ">
                    <div>
                        <h2 id="sessao-titulo" style="color:#fff; margin:0; font-size:20px;"></h2>
                        <p id="sessao-subtitulo" style="color:#aaa; margin:4px 0 0 0; font-size:14px;"></p>
                    </div>

                    <!-- Cronômetro -->
                    <div id="cronometro-container" style="display:none; text-align:center;">
                        <div id="cronometro-display" style="
                            font-size:36px; font-weight:bold; color:#4CAF50;
                            font-family:monospace; letter-spacing:2px;
                        ">00:00:00</div>
                        <div style="font-size:11px; color:#888; margin-top:2px;">SESSÃO EM ANDAMENTO</div>
                        <button onclick="encerrarSessao()" style="
                            margin-top:8px; background:#e53935; color:#fff; border:none;
                            border-radius:8px; padding:6px 16px; cursor:pointer; font-size:13px;
                        ">⏹ Encerrar Sessão</button>
                    </div>
                </div>

                <!-- Prontuário -->
                <div id="prontuario-container">
                    <!-- Histórico de evoluções -->
                    <div style="margin-bottom:20px;">
                        <h3 style="color:#ccc; font-size:15px; margin-bottom:10px;">📋 Histórico do Paciente</h3>
                        <div id="historico-sessao" style="
                            background:#12121e; border-radius:8px; padding:12px;
                            max-height:180px; overflow-y:auto; font-size:13px; color:#aaa;
                        ">
                            <p>Carregando histórico...</p>
                        </div>
                    </div>

                    <!-- Nova evolução -->
                    <div>
                        <h3 style="color:#ccc; font-size:15px; margin-bottom:10px;">✏️ Registro da Sessão</h3>
                        <textarea id="prontuario-texto" placeholder="Descreva a evolução do paciente nesta sessão..." style="
                            width:100%; min-height:160px; background:#12121e; color:#fff;
                            border:1px solid #333; border-radius:8px; padding:12px;
                            font-size:14px; resize:vertical; box-sizing:border-box;
                        "></textarea>

                        <div style="display:flex; gap:12px; margin-top:12px; flex-wrap:wrap;">
                            <input type="text" id="prontuario-cid" placeholder="CID-10 (opcional)" style="
                                background:#12121e; color:#fff; border:1px solid #333;
                                border-radius:8px; padding:10px; font-size:13px; flex:1;
                            ">
                            <input type="text" id="prontuario-plano" placeholder="Plano terapêutico (opcional)" style="
                                background:#12121e; color:#fff; border:1px solid #333;
                                border-radius:8px; padding:10px; font-size:13px; flex:2;
                            ">
                        </div>

                        <div style="display:flex; gap:12px; margin-top:16px; justify-content:flex-end;">
                            <button onclick="fecharModalSessao()" style="
                                background:#333; color:#fff; border:none; border-radius:8px;
                                padding:10px 20px; cursor:pointer; font-size:14px;
                            ">Fechar</button>
                            <button onclick="salvarEvolucao()" style="
                                background:#4CAF50; color:#fff; border:none; border-radius:8px;
                                padding:10px 24px; cursor:pointer; font-size:14px; font-weight:bold;
                            ">💾 Salvar Prontuário</button>
                        </div>
                        <p id="prontuario-feedback" style="display:none; margin-top:10px; text-align:center;"></p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
});

// ============================================================
//  RENDERIZAR AGENDA COM CLIQUE NO PACIENTE
//  (substitui a função renderizarAgenda do agenda.js)
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
            padding:12px; border-bottom:1px solid #333;
            display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;
        ">
            <div style="flex:1;">
                <!-- Nome clicável -->
                <strong
                    onclick="abrirModalSessao(${c.id}, ${c.paciente_id || 'null'}, '${(c.paciente_nome || 'Sem paciente').replace(/'/g, "\\'")}')"
                    style="color:#7c9fff; cursor:pointer; font-size:15px; text-decoration:underline dotted;"
                    title="Clique para abrir prontuário"
                >${c.paciente_nome || '(Sem paciente)'}</strong>
                <br>
                <span style="color:#aaa; font-size:13px;">
                    🕐 ${formatarHora(c.data_hora_inicio)} — ${formatarHora(c.data_hora_fim)}
                </span>
                ${c.observacoes ? `<br><span style="color:#888; font-size:12px;">📝 ${c.observacoes}</span>` : ''}
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
                <span style="
                    padding:4px 10px; border-radius:12px; font-size:12px; font-weight:bold;
                    background:${corStatus(c.status)}; color:#fff;
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
//  ABRIR MODAL — pergunta se inicia sessão
// ============================================================
function abrirModalSessao(consultaId, pacienteId, pacienteNome) {
    consultaAtualId = consultaId;
    pacienteAtualId = pacienteId;
    pacienteAtualNome = pacienteNome;

    const iniciar = confirm(`Paciente: ${pacienteNome}\n\nDeseja INICIAR a sessão agora?\n\n✅ OK → Abre prontuário + inicia cronômetro\n❌ Cancelar → Abre apenas o prontuário`);

    // Abre o modal
    const overlay = document.getElementById('modal-sessao-overlay');
    if (overlay) overlay.style.display = 'flex';

    // Configura o cabeçalho
    document.getElementById('sessao-titulo').textContent = pacienteNome;
    document.getElementById('sessao-subtitulo').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    // Limpa campos
    document.getElementById('prontuario-texto').value = '';
    document.getElementById('prontuario-cid').value = '';
    document.getElementById('prontuario-plano').value = '';
    document.getElementById('prontuario-feedback').style.display = 'none';

    // Carrega histórico
    if (pacienteId) carregarHistoricoSessao(pacienteId);

    if (iniciar) {
        iniciarCronometro();
    } else {
        // Garante que cronômetro não aparece
        document.getElementById('cronometro-container').style.display = 'none';
    }
}

// ============================================================
//  CRONÔMETRO
// ============================================================
function iniciarCronometro() {
    segundosTotais = 0;
    sessaoAtiva = true;

    document.getElementById('cronometro-container').style.display = 'block';
    document.getElementById('cronometro-display').textContent = '00:00:00';

    cronometroInterval = setInterval(() => {
        segundosTotais++;
        document.getElementById('cronometro-display').textContent = formatarTempo(segundosTotais);
    }, 1000);
}

function encerrarSessao() {
    if (!sessaoAtiva) return;

    clearInterval(cronometroInterval);
    sessaoAtiva = false;

    const tempoFinal = formatarTempo(segundosTotais);
    document.getElementById('cronometro-display').textContent = tempoFinal;
    document.getElementById('cronometro-display').style.color = '#FF9800';
    document.querySelector('#cronometro-container button').style.display = 'none';

    // Adiciona tempo ao campo de texto do prontuário
    const textarea = document.getElementById('prontuario-texto');
    if (textarea && !textarea.value.includes('Duração da sessão')) {
        textarea.value += `\n\n⏱ Duração da sessão: ${tempoFinal}`;
    }

    alert(`Sessão encerrada!\nDuração: ${tempoFinal}\n\nNão esqueça de salvar o prontuário.`);
}

function formatarTempo(segundos) {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

// ============================================================
//  CARREGAR HISTÓRICO DE EVOLUÇÕES NO MODAL
// ============================================================
async function carregarHistoricoSessao(pacienteId) {
    const container = document.getElementById('historico-sessao');
    if (!container) return;

    try {
        const res = await fetch(`${API_URL}/api/pacientes/${pacienteId}/evolucoes`, {
            headers: headersAuth()
        });

        if (res.ok) {
            const evolucoes = await res.json();

            if (!evolucoes.length) {
                container.innerHTML = '<p style="color:#666;">Nenhuma evolução registrada ainda.</p>';
                return;
            }

            container.innerHTML = evolucoes.map(ev => `
                <div style="margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid #222;">
                    <span style="color:#7c9fff; font-size:12px; font-weight:bold;">
                        📅 ${new Date(ev.data_hora).toLocaleDateString('pt-BR')}
                        ${new Date(ev.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p style="margin:6px 0 0 0; color:#ccc; white-space:pre-wrap;">${ev.texto_evolucao}</p>
                    ${ev.cid10 ? `<span style="font-size:11px; color:#888;">CID: ${ev.cid10}</span>` : ''}
                </div>
            `).join('');
        }
    } catch (err) {
        container.innerHTML = '<p style="color:#888;">Erro ao carregar histórico.</p>';
    }
}

// ============================================================
//  SALVAR EVOLUÇÃO / PRONTUÁRIO
// ============================================================
async function salvarEvolucao() {
    const texto_evolucao = document.getElementById('prontuario-texto')?.value.trim();
    const cid10 = document.getElementById('prontuario-cid')?.value.trim();
    const plano = document.getElementById('prontuario-plano')?.value.trim();
    const feedback = document.getElementById('prontuario-feedback');

    if (!texto_evolucao) {
        feedback.textContent = '⚠️ Escreva algo no prontuário antes de salvar.';
        feedback.style.color = '#e57373';
        feedback.style.display = 'block';
        return;
    }

    if (!pacienteAtualId) {
        feedback.textContent = '⚠️ Paciente não identificado.';
        feedback.style.color = '#e57373';
        feedback.style.display = 'block';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/pacientes/${pacienteAtualId}/evolucoes`, {
            method: 'POST',
            headers: headersAuth(),
            body: JSON.stringify({
                texto_evolucao,
                cid10: cid10 || null,
                plano: plano || null,
                data_hora: new Date().toISOString()
            })
        });

        if (res.ok) {
            feedback.textContent = '✅ Prontuário salvo com sucesso!';
            feedback.style.color = '#4CAF50';
            feedback.style.display = 'block';

            // Atualiza o histórico dentro do modal
            await carregarHistoricoSessao(pacienteAtualId);

            // Limpa os campos
            document.getElementById('prontuario-texto').value = '';
            document.getElementById('prontuario-cid').value = '';
            document.getElementById('prontuario-plano').value = '';

            // Marca consulta como realizada automaticamente se sessão foi iniciada
            if (!sessaoAtiva && segundosTotais > 0 && consultaAtualId) {
                await atualizarStatusConsulta(consultaAtualId, 'realizado');
                await carregarAgendaHoje();
            }
        } else {
            feedback.textContent = '❌ Erro ao salvar prontuário.';
            feedback.style.color = '#e57373';
            feedback.style.display = 'block';
        }
    } catch (err) {
        feedback.textContent = '❌ Erro de conexão com o servidor.';
        feedback.style.color = '#e57373';
        feedback.style.display = 'block';
    }
}

// ============================================================
//  FECHAR MODAL
// ============================================================
function fecharModalSessao() {
    if (sessaoAtiva) {
        const confirmar = confirm('A sessão ainda está em andamento!\nDeseja encerrar o cronômetro e fechar?');
        if (!confirmar) return;
        encerrarSessao();
    }

    const overlay = document.getElementById('modal-sessao-overlay');
    if (overlay) overlay.style.display = 'none';

    // Reset
    clearInterval(cronometroInterval);
    sessaoAtiva = false;
    segundosTotais = 0;
    consultaAtualId = null;
    pacienteAtualId = null;
    pacienteAtualNome = null;

    const display = document.getElementById('cronometro-display');
    if (display) {
        display.textContent = '00:00:00';
        display.style.color = '#4CAF50';
    }

    const btnEncerrar = document.querySelector('#cronometro-container button');
    if (btnEncerrar) btnEncerrar.style.display = 'inline-block';

    document.getElementById('cronometro-container').style.display = 'none';
}

// Fecha modal clicando fora
document.addEventListener('click', e => {
    const overlay = document.getElementById('modal-sessao-overlay');
    if (e.target === overlay) fecharModalSessao();
});