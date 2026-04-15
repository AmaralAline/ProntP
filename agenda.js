// ============================================================
//  ProntPsi - agenda.js
//  Funcionalidades de agenda e sessão
// ============================================================

// ============================================================
//  RENDERIZAR CONSULTA (com origem colorida)
// ============================================================
function renderizarConsulta(c) {
    const origemCor = c.origem === 'recorrente' ? '#a78bfa' : c.origem === 'online' ? '#60a5fa' : '#34d399';
    const origemLabel = c.origem === 'recorrente' ? '🔁' : c.origem === 'online' ? '🌐' : '📅';
    return `
        <div class="consulta-item">
            <strong style="color:#e2e8f0;">${c.paciente_nome || 'Sem paciente'}</strong>
            <span style="margin-left:6px; font-size:11px; color:${origemCor};">${origemLabel} ${c.origem || 'manual'}</span><br>
            <span style="color:#a78bfa; font-size:13px;">
                🕐 ${new Date(c.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                — ${new Date(c.data_hora_fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span style="margin-left:8px; font-size:11px; color:#64748b;">${c.status || 'agendado'}</span>
        </div>
    `;
}

// ============================================================
//  CARREGAR AGENDA DE HOJE
// ============================================================
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
                lista.innerHTML = '<p style="color:#64748b; font-size:13px;">Nenhuma consulta hoje.</p>';
                return;
            }

            lista.innerHTML = consultas.map(renderizarConsulta).join('');
        }
    } catch (err) {
        console.error('Erro ao carregar agenda:', err);
    }
}

// ============================================================
//  VER AGENDA DE UM DIA ESPECÍFICO
// ============================================================
const btnVerDia = document.getElementById('btn-ver-dia');
if (btnVerDia) {
    btnVerDia.addEventListener('click', async () => {
        const data = document.getElementById('data-selecionada')?.value;
        if (!data) return;

        const inicio = data + ' 00:00:00';
        const fim = data + ' 23:59:59';

        try {
            const res = await fetch(`${API_URL}/api/agenda?inicio=${inicio}&fim=${fim}`, {
                headers: headersAuth()
            });

            if (res.ok) {
                const consultas = await res.json();
                const lista = document.getElementById('lista-agenda-dia');
                const titulo = document.getElementById('titulo-agenda-dia');

                if (titulo) {
                    titulo.textContent = `Agenda de ${new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}`;
                }

                if (!lista) return;

                if (!consultas.length) {
                    lista.innerHTML = '<p style="color:#64748b; font-size:13px;">Nenhuma consulta neste dia.</p>';
                    return;
                }

                lista.innerHTML = consultas.map(renderizarConsulta).join('');
            }
        } catch (err) {
            console.error('Erro ao carregar agenda do dia:', err);
        }
    });
}

// ============================================================
//  CARREGAR AGENDA AO ABRIR A SEÇÃO
// ============================================================
const btnAgenda = document.getElementById('btn-agenda');
if (btnAgenda) {
    btnAgenda.addEventListener('click', () => {
        carregarAgendaHoje();
    });
}

// Carrega agenda hoje ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => carregarAgendaHoje(), 800);
});