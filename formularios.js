// ============================================================
//  ProntPsi - formularios.js
//  Adicione após o PainelExclusivo.js no HTML
// ============================================================

// ============================================================
//  CARREGAR ESCALAS DO BANCO
// ============================================================
let escalasDisponiveis = [];

async function carregarEscalas() {
    try {
        const res = await fetch(`${API_URL}/api/escalas`, {
            headers: headersAuth()
        });

        if (res.ok) {
            escalasDisponiveis = await res.json();
            popularSelectEscalas();
        }
    } catch (err) {
        console.error('Erro ao carregar escalas:', err);
    }
}

function popularSelectEscalas() {
    const select = document.getElementById('tipo-formulario');
    if (!select) return;

    // Limpa opções antigas
    select.innerHTML = '<option value="">Selecione...</option>';

    // Agrupa por tipo
    const inventarios = escalasDisponiveis.filter(e => e.nome.includes('Inventari') || e.nome.includes('Inventário'));
    const escalas = escalasDisponiveis.filter(e => e.nome.includes('Escala') || e.nome.includes('Pittsburgh'));
    const questionarios = escalasDisponiveis.filter(e => e.nome.includes('Question') || e.nome.includes('Teste'));
    const tcc = escalasDisponiveis.filter(e => e.nome.includes('TCC'));

    const grupos = [
        { label: 'Inventários', itens: inventarios },
        { label: 'Escalas', itens: escalas },
        { label: 'Questionários e Testes', itens: questionarios },
        { label: 'Ferramentas TCC', itens: tcc }
    ];

    grupos.forEach(({ label, itens }) => {
        if (!itens.length) return;
        const group = document.createElement('optgroup');
        group.label = label;
        itens.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.id;
            opt.textContent = e.nome;
            group.appendChild(opt);
        });
        select.appendChild(group);
    });
}

// ============================================================
//  CARREGAR ESCALAS AO ABRIR A SEÇÃO DE FORMULÁRIOS
// ============================================================
const btnForm = document.getElementById('btn-form');
if (btnForm) {
    btnForm.addEventListener('click', () => {
        carregarEscalas();
    });
}

// ============================================================
//  GERAR LINK E ENVIAR POR EMAIL
// ============================================================
const btnGerarLink = document.getElementById('gerar-link-form');
if (btnGerarLink) {
    btnGerarLink.addEventListener('click', async () => {
        const pacienteId = document.getElementById('paciente-form')?.value;
        const escalaId = document.getElementById('tipo-formulario')?.value;
        const diasValidade = 7;

        // Validação
        if (!pacienteId || !escalaId) {
            const err = document.getElementById('form-error');
            if (err) {
                err.textContent = 'Por favor, selecione o paciente e o formulário.';
                err.style.display = 'block';
            }
            return;
        }

        // Esconde erro
        const errEl = document.getElementById('form-error');
        if (errEl) errEl.style.display = 'none';

        // Busca email do paciente
        const paciente = pacientes.find(p => p.id == pacienteId);
        if (!paciente?.email) {
            alert('Este paciente não tem e-mail cadastrado. Cadastre o e-mail do paciente primeiro.');
            return;
        }

        btnGerarLink.disabled = true;
        btnGerarLink.textContent = 'Gerando link...';

        try {
            const res = await fetch(`${API_URL}/api/escalas/${escalaId}/gerar-link`, {
                method: 'POST',
                headers: headersAuth(),
                body: JSON.stringify({
                    paciente_id: pacienteId,
                    dias_validade: diasValidade
                })
            });

            const data = await res.json();

            if (res.ok) {
                // Mostra o link gerado
                const linkGerado = document.getElementById('link-gerado');
                const urlGerada = document.getElementById('url-link-gerado');
                const linkInfo = document.getElementById('link-info');

                if (linkGerado) linkGerado.style.display = 'block';
                if (urlGerada) urlGerada.value = data.link;
                if (linkInfo) linkInfo.textContent = `✅ Link enviado para: ${paciente.email} | Válido por ${diasValidade} dias`;

                // Envia por email automaticamente
                await enviarLinkPorEmail(paciente, data.link, escalaId);

            } else {
                alert(data.erro || 'Erro ao gerar link.');
            }

        } catch (err) {
            alert('Erro de conexão com o servidor.');
            console.error(err);
        } finally {
            btnGerarLink.disabled = false;
            btnGerarLink.textContent = 'Gerar Link para o Paciente';
        }
    });
}

// ============================================================
//  ENVIAR LINK POR EMAIL
// ============================================================
async function enviarLinkPorEmail(paciente, link, escalaId) {
    const escala = escalasDisponiveis.find(e => e.id == escalaId);
    try {
        const res = await fetch(`${API_URL}/api/escalas/enviar-email`, {
            method: 'POST',
            headers: headersAuth(),
            body: JSON.stringify({
                email_paciente: paciente.email,
                nome_paciente: paciente.nome,
                nome_escala: escala?.nome || 'Formulário',
                link
            })
        });

        if (res.ok) {
            console.log('Email enviado com sucesso!');
        } else {
            console.error('Erro ao enviar email');
        }
    } catch (err) {
        console.error('Erro ao enviar email:', err);
    }
}

// ============================================================
//  COPIAR LINK
// ============================================================
const btnCopiarLink = document.getElementById('copiar-link');
if (btnCopiarLink) {
    btnCopiarLink.addEventListener('click', () => {
        const url = document.getElementById('url-link-gerado');
        if (url) {
            url.select();
            document.execCommand('copy');
            btnCopiarLink.textContent = '✅ Copiado!';
            setTimeout(() => { btnCopiarLink.textContent = 'Copiar Link'; }, 2000);
        }
    });
}

// ============================================================
//  CARREGAR RESULTADOS DOS QUESTIONÁRIOS
// ============================================================
async function carregarResultados(pacienteId) {
    try {
        const res = await fetch(`${API_URL}/api/escalas/resultados${pacienteId ? `?paciente_id=${pacienteId}` : ''}`, {
            headers: headersAuth()
        });

        if (res.ok) {
            const resultados = await res.json();
            renderizarResultados(resultados);
        }
    } catch (err) {
        console.error('Erro ao carregar resultados:', err);
    }
}

function renderizarResultados(resultados) {
    const tabela = document.getElementById('resultados-tabela');
    const vazio = document.getElementById('resultados-vazio');
    const tbody = tabela?.querySelector('tbody');

    if (!resultados.length) {
        if (tabela) tabela.style.display = 'none';
        if (vazio) vazio.style.display = 'block';
        return;
    }

    if (tbody) {
        tbody.innerHTML = resultados.map(r => `
            <tr>
                <td style="padding:10px;">${r.paciente_nome || '-'}</td>
                <td style="padding:10px;">${r.escala_nome || '-'}</td>
                <td style="padding:10px;">${new Date(r.respondido_em).toLocaleDateString('pt-BR')}</td>
                <td style="padding:10px;">
                    <button onclick="verRespostas(${r.link_id})" style="
                        background:#4a90a4; color:#fff; border:none;
                        border-radius:6px; padding:6px 12px; cursor:pointer; font-size:12px;
                    ">Ver Respostas</button>
                </td>
            </tr>
        `).join('');
    }

    if (tabela) tabela.style.display = 'table';
    if (vazio) vazio.style.display = 'none';
}

// Carrega resultados ao abrir a seção
const btnResultados = document.getElementById('btn-resultados');
if (btnResultados) {
    btnResultados.addEventListener('click', () => carregarResultados());
}

// Filtra por paciente
const selectResultados = document.getElementById('paciente-resultados');
if (selectResultados) {
    selectResultados.addEventListener('change', () => {
        carregarResultados(selectResultados.value || null);
    });
}

// ============================================================
//  VER RESPOSTAS DE UM LINK
// ============================================================
async function verRespostas(linkId) {
    try {
        const res = await fetch(`${API_URL}/api/escalas/respostas/${linkId}`, {
            headers: headersAuth()
        });

        if (res.ok) {
            const respostas = await res.json();
            mostrarModalRespostas(respostas);
        }
    } catch (err) {
        console.error('Erro ao carregar respostas:', err);
    }
}

function mostrarModalRespostas(respostas) {
    // Cria modal se não existir
    let modal = document.getElementById('modal-respostas');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-respostas';
        modal.style.cssText = `
            position:fixed; top:0; left:0; width:100%; height:100%;
            background:rgba(0,0,0,0.7); z-index:2000;
            display:flex; justify-content:center; align-items:center;
        `;
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="
            background:#1e1e2e; border-radius:16px; padding:32px;
            width:90%; max-width:600px; max-height:80vh; overflow-y:auto;
        ">
            <h2 style="color:#fff; margin-bottom:20px;">📋 Respostas do Paciente</h2>
            ${respostas.map(r => `
                <div style="margin-bottom:16px; padding:12px; background:#12121e; border-radius:8px;">
                    <p style="color:#7c9fff; font-size:13px; margin:0 0 6px 0;">${r.pergunta}</p>
                    <p style="color:#fff; margin:0;">
                        ${r.opcao_texto || r.resposta_texto || '-'}
                        ${r.valor !== null && r.valor !== undefined ? `<span style="color:#aaa; font-size:12px;">(valor: ${r.valor})</span>` : ''}
                    </p>
                </div>
            `).join('')}
            <button onclick="document.getElementById('modal-respostas').remove()" style="
                background:#e53935; color:#fff; border:none; border-radius:8px;
                padding:10px 20px; cursor:pointer; margin-top:16px;
            ">Fechar</button>
        </div>
    `;

    modal.style.display = 'flex';
}