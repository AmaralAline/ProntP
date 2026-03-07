// PainelExclusivo.js

const apiUrl = 'http://localhost:5015'; // Porta do seu backend

// ========== PACIENTES ==========
let pacientes = []; // Vamos carregar do backend

async function carregarPacientes() {
    try {
        const res = await fetch(`${apiUrl}/api/pacientes`);
        if (res.ok) {
            pacientes = await res.json();
            popularSelectsPacientes();
        } else {
            console.error('Erro ao carregar pacientes:', res.status);
        }
    } catch (err) {
        console.error('Erro de conexão com backend:', err);
        alert('Não foi possível conectar ao backend. Verifique se o servidor está rodando na porta 5015.');
    }
}

function popularSelectsPacientes() {
    const selectIds = [
        'paciente-agenda', 'paciente', 'paciente-historico',
        'paciente-resultados', 'paciente-link', 'paciente-form'
    ];

    selectIds.forEach(id => {
        const select = document.getElementById(id);
        if (!select) {
            console.log(`Select ${id} não encontrado`);
            return;
        }
        while (select.options.length > 1) select.remove(1);
        pacientes.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.nome;
            select.appendChild(opt);
        });
        console.log(`Select ${id} populado com ${pacientes.length} pacientes`);
    });
}

// ========== CADASTRO DE PACIENTE ==========
const cadastroForm = document.getElementById('cadastro-form');
if (cadastroForm) {
    cadastroForm.addEventListener('submit', async e => {
        e.preventDefault();
        const nome = document.getElementById('nome')?.value.trim();
        const telefone = document.getElementById('telefone')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const pagamento = document.getElementById('pagamento')?.value;
        const dataInicio = document.getElementById('data-inicio')?.value;
        const queixa = document.getElementById('queixa')?.value.trim();

        if (!nome || !telefone || !email || !pagamento || !dataInicio || !queixa) {
            document.getElementById('cadastro-error').style.display = 'block';
            return;
        }

        const novoPaciente = { nome, telefone, email, pagamento, dataInicio, queixa };

        try {
            const res = await fetch(`${apiUrl}/api/pacientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoPaciente)
            });
            if (res.ok) {
                alert('Paciente cadastrado no backend!');
                cadastroForm.reset();
                document.getElementById('cadastro-error').style.display = 'none';
                await carregarPacientes(); // Atualiza lista
            } else {
                alert('Erro ao cadastrar no backend: ' + res.statusText);
            }
        } catch (err) {
            alert('Erro de conexão: ' + err.message);
        }
    });
}

// ========== EVOLUÇÃO DO PACIENTE ==========
let evolucoes = [];

async function carregarEvolucoes() {
    // Se quiser carregar evoluções do backend, adicione rota /api/evolucoes
    // Por enquanto mantém localStorage ou adapte
    evolucoes = JSON.parse(localStorage.getItem('evolucoes')) || [];
}

const evolucaoForm = document.getElementById('evolucao-form');
if (evolucaoForm) {
    evolucaoForm.addEventListener('submit', async e => {
        e.preventDefault();
        const pacienteId = document.getElementById('paciente').value;
        const data = document.getElementById('data-evolucao').value;
        const texto = document.getElementById('evolucao').value.trim();

        if (!pacienteId || !data || !texto) {
            document.getElementById('evolucao-error').style.display = 'block';
            return;
        }

        const nomePaciente = pacientes.find(p => p.id === pacienteId)?.nome || 'Desconhecido';
        const novaEvolucao = { pacienteId, nomePaciente, data, texto };

        try {
            const res = await fetch(`${apiUrl}/api/evolucoes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novaEvolucao)
            });
            if (res.ok) {
                alert('Evolução salva no backend!');
                evolucaoForm.reset();
                document.getElementById('evolucao-error').style.display = 'none';
                // Atualiza histórico se quiser
            } else {
                alert('Erro ao salvar evolução');
            }
        } catch (err) {
            alert('Erro de conexão: ' + err.message);
        }
    });
}

// ========== FORMULÁRIOS ==========
// Gerar link (agora apontando para backend)
const btnGerarLink = document.getElementById('gerar-link-form');
if (btnGerarLink) {
    btnGerarLink.addEventListener('click', async () => {
        const pacienteId = document.getElementById('paciente-form').value;
        const tipoForm = document.getElementById('tipo-formulario').value;
        const senha = document.getElementById('senha-form').value.trim();

        if (!pacienteId || !tipoForm) {
            document.getElementById('form-error').style.display = 'block';
            return;
        }
        document.getElementById('form-error').style.display = 'none';

        try {
            const res = await fetch(`${apiUrl}/api/links/gerar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pacienteId, tipoForm, senha })
            });
            if (res.ok) {
                const data = await res.json();
                const urlGerada = data.url; // backend retorna a URL completa
                document.getElementById('url-link-gerado').value = urlGerada;
                document.getElementById('link-info').textContent = senha ? 'Com senha' : 'Sem senha';
                document.getElementById('link-gerado').style.display = 'block';
            } else {
                alert('Erro ao gerar link no backend');
            }
        } catch (err) {
            alert('Erro de conexão: ' + err.message);
        }
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    await carregarPacientes();
    // carregarEvolucoes(); // se tiver rota no backend
    // ... resto do seu código de navegação, agenda, etc. ...
});