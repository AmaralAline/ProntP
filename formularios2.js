// ============================================================
//  ProntPsi - formularios.js (com pontuacao e interpretacao)
// ============================================================

const interpretacoes = {
    'Inventario de Depressao de Beck (BDI)': (t) => t < 10 ? { nivel: 'Minimo', cor: '#4CAF50' } : t < 19 ? { nivel: 'Leve', cor: '#8BC34A' } : t < 30 ? { nivel: 'Moderado', cor: '#FF9800' } : { nivel: 'Grave', cor: '#f44336' },
    'Escala de Ansiedade de Hamilton (HAMA)': (t) => t <= 17 ? { nivel: 'Ansiedade leve', cor: '#8BC34A' } : t <= 24 ? { nivel: 'Ansiedade leve a moderada', cor: '#FF9800' } : t <= 30 ? { nivel: 'Ansiedade moderada a grave', cor: '#FF5722' } : { nivel: 'Ansiedade grave', cor: '#f44336' },
    'Escala MADRS': (t) => t <= 6 ? { nivel: 'Sem depressao', cor: '#4CAF50' } : t <= 19 ? { nivel: 'Depressao leve', cor: '#8BC34A' } : t <= 34 ? { nivel: 'Depressao moderada', cor: '#FF9800' } : { nivel: 'Depressao grave', cor: '#f44336' },
    'Escala BES - Compulsao Alimentar': (t) => t < 8 ? { nivel: 'Sem compulsao', cor: '#4CAF50' } : t < 12 ? { nivel: 'Compulsao leve', cor: '#8BC34A' } : t < 17 ? { nivel: 'Compulsao moderada', cor: '#FF9800' } : { nivel: 'Compulsao grave', cor: '#f44336' },
    'Escala de Sonolencia de Epworth (ESE)': (t) => t <= 10 ? { nivel: 'Normal', cor: '#4CAF50' } : t <= 14 ? { nivel: 'Sonolencia leve', cor: '#8BC34A' } : t <= 17 ? { nivel: 'Sonolencia moderada', cor: '#FF9800' } : { nivel: 'Sonolencia severa', cor: '#f44336' },
    'Pittsburgh - Qualidade do Sono (PSQI)': (t) => t <= 5 ? { nivel: 'Boa qualidade do sono', cor: '#4CAF50' } : { nivel: 'Ma qualidade do sono', cor: '#f44336' },
    'Inventario EDI-3 - Transtornos Alimentares': (t) => t < 15 ? { nivel: 'Baixo risco', cor: '#4CAF50' } : t < 30 ? { nivel: 'Risco moderado', cor: '#FF9800' } : { nivel: 'Alto risco', cor: '#f44336' },
    'Questionario BSQ - Formato Corporal': (t) => t < 15 ? { nivel: 'Baixa insatisfacao corporal', cor: '#4CAF50' } : t < 25 ? { nivel: 'Insatisfacao leve', cor: '#8BC34A' } : t < 38 ? { nivel: 'Insatisfacao moderada', cor: '#FF9800' } : { nivel: 'Alta insatisfacao corporal', cor: '#f44336' },
    'Questionario SCOFF': (t) => t < 2 ? { nivel: 'Baixo risco de transtorno alimentar', cor: '#4CAF50' } : { nivel: 'Possivel risco de transtorno alimentar', cor: '#f44336' },
    'Teste EAT-26 - Atitudes Alimentares': (t) => t < 20 ? { nivel: 'Baixo risco', cor: '#4CAF50' } : { nivel: 'Possivel risco de transtorno alimentar', cor: '#f44336' },
    'Teste BULIT-R - Bulimia': (t) => t < 12 ? { nivel: 'Baixo risco', cor: '#4CAF50' } : t < 20 ? { nivel: 'Risco leve', cor: '#8BC34A' } : t < 28 ? { nivel: 'Risco moderado', cor: '#FF9800' } : { nivel: 'Alto risco de bulimia', cor: '#f44336' },
    'Escala de Estresse no Trabalho (EET)': (t) => t <= 10 ? { nivel: 'Estresse baixo', cor: '#4CAF50' } : t <= 15 ? { nivel: 'Estresse moderado', cor: '#FF9800' } : { nivel: 'Estresse alto', cor: '#f44336' }
};

let escalasDisponiveis = [];

async function carregarEscalas() {
    try {
        const res = await fetch(`${API_URL}/api/escalas`, { headers: headersAuth() });
        if (res.ok) { escalasDisponiveis = await res.json(); popularSelectEscalas(); }
    } catch (err) { console.error('Erro ao carregar escalas:', err); }
}

function popularSelectEscalas() {
    const select = document.getElementById('tipo-formulario');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione...</option>';
    const grupos = [
        { label: 'Inventarios', itens: escalasDisponiveis.filter(e => e.nome.includes('Inventari')) },
        { label: 'Escalas', itens: escalasDisponiveis.filter(e => e.nome.includes('Escala') || e.nome.includes('Pittsburgh')) },
        { label: 'Questionarios e Testes', itens: escalasDisponiveis.filter(e => e.nome.includes('Question') || e.nome.includes('Teste')) },
        { label: 'Ferramentas TCC', itens: escalasDisponiveis.filter(e => e.nome.includes('TCC')) }
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

const btnForm = document.getElementById('btn-form');
if (btnForm) btnForm.addEventListener('click', () => carregarEscalas());

const btnGerarLink = document.getElementById('gerar-link-form');
if (btnGerarLink) {
    btnGerarLink.addEventListener('click', async () => {
        const pacienteId = document.getElementById('paciente-form')?.value;
        const escalaId = document.getElementById('tipo-formulario')?.value;
        if (!pacienteId || !escalaId) {
            const err = document.getElementById('form-error');
            if (err) { err.textContent = 'Selecione o paciente e o formulario.'; err.style.display = 'block'; }
            return;
        }
        const paciente = pacientes.find(p => p.id == pacienteId);
        if (!paciente?.email) { alert('Este paciente nao tem e-mail cadastrado.'); return; }
        btnGerarLink.disabled = true;
        btnGerarLink.textContent = 'Gerando link...';
        try {
            const res = await fetch(`${API_URL}/api/escalas/${escalaId}/gerar-link`, {
                method: 'POST', headers: headersAuth(),
                body: JSON.stringify({ paciente_id: pacienteId, dias_validade: 7 })
            });
            const data = await res.json();
            if (res.ok) {
                const linkGerado = document.getElementById('link-gerado');
                const urlGerada = document.getElementById('url-link-gerado');
                const linkInfo = document.getElementById('link-info');
                if (linkGerado) linkGerado.style.display = 'block';
                if (urlGerada) urlGerada.value = data.link;
                if (linkInfo) linkInfo.textContent = `Link enviado para: ${paciente.email} | Valido por 7 dias`;
                await enviarLinkPorEmail(paciente, data.link, escalaId);
            } else { alert(data.erro || 'Erro ao gerar link.'); }
        } catch (err) { alert('Erro de conexao com o servidor.'); }
        finally { btnGerarLink.disabled = false; btnGerarLink.textContent = 'Gerar Link para o Paciente'; }
    });
}

async function enviarLinkPorEmail(paciente, link, escalaId) {
    const escala = escalasDisponiveis.find(e => e.id == escalaId);
    try {
        await fetch(`${API_URL}/api/escalas/enviar-email`, {
            method: 'POST', headers: headersAuth(),
            body: JSON.stringify({ email_paciente: paciente.email, nome_paciente: paciente.nome, nome_escala: escala?.nome || 'Formulario', link })
        });
    } catch (err) { console.error('Erro ao enviar email:', err); }
}

const btnCopiarLink = document.getElementById('copiar-link');
if (btnCopiarLink) {
    btnCopiarLink.addEventListener('click', () => {
        const url = document.getElementById('url-link-gerado');
        if (url) { url.select(); document.execCommand('copy'); btnCopiarLink.textContent = 'Copiado!'; setTimeout(() => { btnCopiarLink.textContent = 'Copiar Link'; }, 2000); }
    });
}

async function carregarResultados(pacienteId) {
    try {
        const url = `${API_URL}/api/escalas/resultados${pacienteId ? `?paciente_id=${pacienteId}` : ''}`;
        const res = await fetch(url, { headers: headersAuth() });
        if (res.ok) renderizarResultados(await res.json());
    } catch (err) { console.error('Erro ao carregar resultados:', err); }
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
                <td style="padding:10px;">${r.respondido_em ? new Date(r.respondido_em).toLocaleDateString('pt-BR') : '-'}</td>
                <td style="padding:10px;">
                    <button onclick="verRespostas(${r.link_id}, '${(r.escala_nome || '').replace(/'/g, "\\'")}')" style="background:#4a90a4;color:#fff;border:none;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:12px;">Ver Respostas</button>
                </td>
            </tr>
        `).join('');
    }
    if (tabela) tabela.style.display = 'table';
    if (vazio) vazio.style.display = 'none';
}

const btnResultados = document.getElementById('btn-resultados');
if (btnResultados) btnResultados.addEventListener('click', () => carregarResultados());

const selectResultados = document.getElementById('paciente-resultados');
if (selectResultados) selectResultados.addEventListener('change', () => carregarResultados(selectResultados.value || null));

async function verRespostas(linkId, escalaNome) {
    try {
        const res = await fetch(`${API_URL}/api/escalas/respostas/${linkId}`, { headers: headersAuth() });
        if (res.ok) mostrarModalRespostas(await res.json(), escalaNome);
    } catch (err) { console.error('Erro ao carregar respostas:', err); }
}

function mostrarModalRespostas(respostas, escalaNome) {
    const totalPontos = respostas.reduce((soma, r) => soma + (r.valor !== null && r.valor !== undefined ? parseInt(r.valor) : 0), 0);
    const interpFn = interpretacoes[escalaNome];
    const interp = interpFn ? interpFn(totalPontos) : null;

    let modal = document.getElementById('modal-respostas');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-respostas';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:2000;display:flex;justify-content:center;align-items:center;';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:#1e1e2e;border-radius:16px;padding:32px;width:90%;max-width:650px;max-height:85vh;overflow-y:auto;">
            <h2 style="color:#fff;margin-bottom:16px;">Resultados: ${escalaNome}</h2>
            ${interp ? `
                <div style="background:#12121e;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center;">
                    <p style="color:#aaa;font-size:13px;margin-bottom:6px;">PONTUACAO TOTAL</p>
                    <p style="font-size:40px;font-weight:bold;color:#fff;margin:0;">${totalPontos}</p>
                    <p style="font-size:16px;font-weight:600;margin-top:8px;color:${interp.cor};">? ${interp.nivel}</p>
                </div>
            ` : `<div style="background:#12121e;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center;"><p style="color:#fff;font-size:18px;">Pontuacao Total: ${totalPontos}</p></div>`}

            ${(function () {
            var nome = escalaNome || '';
            var normalizado = nome.toLowerCase().replace(/\u00e3/g, 'a').replace(/\u00e2/g, 'a').replace(/\u00e1/g, 'a').replace(/\u00e0/g, 'a').replace(/\u00e9/g, 'e').replace(/\u00ea/g, 'e').replace(/\u00ed/g, 'i').replace(/\u00f3/g, 'o').replace(/\u00f4/g, 'o').replace(/\u00fa/g, 'u').replace(/\u00e7/g, 'c').replace(/\u00f5/g, 'o');
            if (!normalizado.includes('burnout')) return '';
            var ex = 0, de = 0, re = 0;
            respostas.forEach(function (r) {
                var v = parseInt(r.valor) || 0, o = parseInt(r.ordem) || 0;
                if (o >= 1 && o <= 8) ex += v;
                else if (o >= 9 && o <= 13) de += v;
                else if (o >= 14 && o <= 20) re += v;
            });
            var nEL = ex <= 16 ? 'Baixa' : ex <= 27 ? 'Moderada' : 'Grave';
            var nEC = ex <= 16 ? '#4CAF50' : ex <= 27 ? '#FF9800' : '#f44336';
            var nEDesc = ex <= 16 ? 'Nivel saudavel de energia. Sem sinais de esgotamento.' : ex <= 27 ? 'Sinais de cansaco acumulado. Atencao ao autocuidado.' : 'Esgotamento intenso. Intervencao recomendada.';
            var nDL = de <= 6 ? 'Baixa' : de <= 12 ? 'Moderada' : 'Grave';
            var nDC = de <= 6 ? '#4CAF50' : de <= 12 ? '#FF9800' : '#f44336';
            var nDDesc = de <= 6 ? 'Vinculos preservados. Relacoes saudaveis.' : de <= 12 ? 'Inicio de distanciamento emocional.' : 'Distanciamento severo. Risco nas relacoes.';
            var nRL = re >= 28 ? 'Alta' : re >= 14 ? 'Moderada' : 'Baixa';
            var nRC = re >= 28 ? '#4CAF50' : re >= 14 ? '#FF9800' : '#f44336';
            var nRDesc = re >= 28 ? 'Senso elevado de proposito e competencia.' : re >= 14 ? 'Satisfacao parcial. Explorar motivacao.' : 'Baixo senso de realizacao. Pode indicar desmotivacao.';
            var pE = Math.round(ex / 40 * 100), pD = Math.round(de / 25 * 100), pR = Math.round(re / 35 * 100);
            return '<div style="margin-bottom:16px;">'
                + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px;">'
                + '<div style="background:#12121e;border-radius:10px;padding:14px;text-align:center;border-top:3px solid ' + nEC + ';">'
                + '<p style="color:#aaa;font-size:10px;margin:0 0 4px;">EXAUSTAO</p>'
                + '<p style="color:#fff;font-size:24px;font-weight:bold;margin:0;">' + ex + '<span style="font-size:11px;color:#555;">/40</span></p>'
                + '<p style="color:' + nEC + ';font-size:11px;font-weight:600;margin-top:4px;">' + nEL + '</p></div>'
                + '<div style="background:#12121e;border-radius:10px;padding:14px;text-align:center;border-top:3px solid ' + nDC + ';">'
                + '<p style="color:#aaa;font-size:10px;margin:0 0 4px;">DESPERSONALIZACAO</p>'
                + '<p style="color:#fff;font-size:24px;font-weight:bold;margin:0;">' + de + '<span style="font-size:11px;color:#555;">/25</span></p>'
                + '<p style="color:' + nDC + ';font-size:11px;font-weight:600;margin-top:4px;">' + nDL + '</p></div>'
                + '<div style="background:#12121e;border-radius:10px;padding:14px;text-align:center;border-top:3px solid ' + nRC + ';">'
                + '<p style="color:#aaa;font-size:10px;margin:0 0 4px;">REALIZACAO (maior = melhor)</p>'
                + '<p style="color:#fff;font-size:24px;font-weight:bold;margin:0;">' + re + '<span style="font-size:11px;color:#555;">/35</span></p>'
                + '<p style="color:' + nRC + ';font-size:11px;font-weight:600;margin-top:4px;">' + nRL + '</p></div>'
                + '</div>'
                + '<div style="background:#12121e;border-radius:10px;padding:14px;margin-bottom:12px;">'
                + '<p style="color:#aaa;font-size:10px;margin:0 0 10px;letter-spacing:.1em;">GRAFICO POR DIMENSAO</p>'
                + '<div style="display:flex;flex-direction:column;gap:8px;">'
                + '<div><div style="display:flex;justify-content:space-between;margin-bottom:3px;"><span style="color:#ccc;font-size:12px;">Exaustao</span><span style="color:' + nEC + ';font-size:12px;font-weight:600;">' + pE + '%</span></div><div style="background:#0d0d1a;border-radius:4px;height:10px;"><div style="width:' + pE + '%;height:100%;background:' + nEC + ';border-radius:4px;"></div></div></div>'
                + '<div><div style="display:flex;justify-content:space-between;margin-bottom:3px;"><span style="color:#ccc;font-size:12px;">Despersonalizacao</span><span style="color:' + nDC + ';font-size:12px;font-weight:600;">' + pD + '%</span></div><div style="background:#0d0d1a;border-radius:4px;height:10px;"><div style="width:' + pD + '%;height:100%;background:' + nDC + ';border-radius:4px;"></div></div></div>'
                + '<div><div style="display:flex;justify-content:space-between;margin-bottom:3px;"><span style="color:#ccc;font-size:12px;">Realizacao</span><span style="color:' + nRC + ';font-size:12px;font-weight:600;">' + pR + '%</span></div><div style="background:#0d0d1a;border-radius:4px;height:10px;"><div style="width:' + pR + '%;height:100%;background:' + nRC + ';border-radius:4px;"></div></div></div>'
                + '</div></div>'
                + '<div style="display:flex;flex-direction:column;gap:6px;">'
                + '<div style="background:#12121e;border-radius:8px;padding:12px;border-left:3px solid ' + nEC + ';">'
                + '<p style="color:#aaa;font-size:10px;margin:0 0 3px;">EXAUSTAO - ' + nEL + '</p>'
                + '<p style="color:#ccc;font-size:13px;margin:0;">' + nEDesc + '</p></div>'
                + '<div style="background:#12121e;border-radius:8px;padding:12px;border-left:3px solid ' + nDC + ';">'
                + '<p style="color:#aaa;font-size:10px;margin:0 0 3px;">DESPERSONALIZACAO - ' + nDL + '</p>'
                + '<p style="color:#ccc;font-size:13px;margin:0;">' + nDDesc + '</p></div>'
                + '<div style="background:#12121e;border-radius:8px;padding:12px;border-left:3px solid ' + nRC + ';">'
                + '<p style="color:#aaa;font-size:10px;margin:0 0 3px;">REALIZACAO - ' + nRL + '</p>'
                + '<p style="color:#ccc;font-size:13px;margin:0;">' + nRDesc + '</p></div>'
                + '</div></div>';
        })()}
            <h3 style="color:#ccc;font-size:14px;margin-bottom:12px;">Respostas detalhadas:</h3>
            ${respostas.map(r => `
                <div style="margin-bottom:12px;padding:12px;background:#12121e;border-radius:8px;">
                    <p style="color:#7c9fff;font-size:13px;margin:0 0 6px 0;">${r.pergunta}</p>
                    <p style="color:#fff;margin:0;font-size:14px;">
                        ${r.opcao_texto || r.resposta_texto || '-'}
                        ${r.valor !== null && r.valor !== undefined && r.opcao_texto ? `<span style="color:#aaa;font-size:12px;margin-left:8px;">(${r.valor} pts)</span>` : ''}
                    </p>
                </div>
            `).join('')}
            <button onclick="document.getElementById('modal-respostas').remove()" style="background:#e53935;color:#fff;border:none;border-radius:8px;padding:10px 20px;cursor:pointer;margin-top:16px;font-size:14px;">Fechar</button>
        </div>
    `;
    modal.style.display = 'flex';
}

// ========== ENVIAR ESCALA VIA WHATSAPP ==========
function enviarEscalaWhatsApp() {
    const link = document.getElementById('url-link-gerado')?.value;
    if (!link) return;

    const selectPaciente = document.getElementById('paciente-form');
    const selectEscala = document.getElementById('tipo-formulario');
    const nomePaciente = selectPaciente?.options[selectPaciente.selectedIndex]?.text || 'paciente';
    const nomeEscala = selectEscala?.options[selectEscala.selectedIndex]?.text || 'questionario';

    const msg = 'Ola, ' + nomePaciente + '!\n\nSua psicologa enviou um questionario para voce responder: *' + nomeEscala + '*\n\nClique no link abaixo para responder:\n' + link + '\n\n_Este link e pessoal e expira em 7 dias._';

    const url = 'https://wa.me/?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
}