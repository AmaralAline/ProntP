// ============================================================
//  ProntPsi - formularios.js (com pontuacao e interpretacao)
// ============================================================

const interpretacoes = {
    // Escalas mantidas
    'Escala de Sonolencia de Epworth (ESE)': (t) => t <= 10 ? { nivel: 'Normal', cor: '#4CAF50' } : t <= 14 ? { nivel: 'Sonolencia leve', cor: '#8BC34A' } : t <= 17 ? { nivel: 'Sonolencia moderada', cor: '#FF9800' } : { nivel: 'Sonolencia severa', cor: '#f44336' },
    'Questionario SCOFF': (t) => t < 2 ? { nivel: 'Baixo risco de transtorno alimentar', cor: '#4CAF50' } : { nivel: 'Possivel risco de transtorno alimentar', cor: '#f44336' },
    'Teste EAT-26 - Atitudes Alimentares': (t) => t < 20 ? { nivel: 'Baixo risco', cor: '#4CAF50' } : { nivel: 'Possivel risco de transtorno alimentar', cor: '#f44336' },
    'Escala de Estresse no Trabalho (EET)': (t) => t <= 10 ? { nivel: 'Estresse baixo', cor: '#4CAF50' } : t <= 15 ? { nivel: 'Estresse moderado', cor: '#FF9800' } : { nivel: 'Estresse alto', cor: '#f44336' },
    'Escala de Avaliacao de Burnout': (t) => t <= 33 ? { nivel: 'Sem indicativo de Burnout', cor: '#4CAF50' } : t <= 66 ? { nivel: 'Burnout moderado', cor: '#FF9800' } : { nivel: 'Burnout grave', cor: '#f44336' },

    // Novas escalas — uso livre confirmado
    'PHQ-9 - Rastreamento de Depressao': (t) => t <= 4 ? { nivel: 'Minimo ou sem depressao', cor: '#4CAF50' } : t <= 9 ? { nivel: 'Depressao leve', cor: '#8BC34A' } : t <= 14 ? { nivel: 'Depressao moderada', cor: '#FF9800' } : t <= 19 ? { nivel: 'Depressao moderadamente grave', cor: '#FF5722' } : { nivel: 'Depressao grave', cor: '#f44336' },
    'GAD-7 - Rastreamento de Ansiedade': (t) => t <= 4 ? { nivel: 'Minima ou sem ansiedade', cor: '#4CAF50' } : t <= 9 ? { nivel: 'Ansiedade leve', cor: '#8BC34A' } : t <= 14 ? { nivel: 'Ansiedade moderada', cor: '#FF9800' } : { nivel: 'Ansiedade grave', cor: '#f44336' },
    'PSS-10 - Escala de Estresse Percebido': (t) => t <= 13 ? { nivel: 'Estresse baixo', cor: '#4CAF50' } : t <= 26 ? { nivel: 'Estresse moderado', cor: '#FF9800' } : { nivel: 'Estresse alto', cor: '#f44336' },
    'ISI - Indice de Gravidade de Insonia': (t) => t <= 7 ? { nivel: 'Sem insonia clinicamente significativa', cor: '#4CAF50' } : t <= 14 ? { nivel: 'Insonia subclinica', cor: '#8BC34A' } : t <= 21 ? { nivel: 'Insonia moderada', cor: '#FF9800' } : { nivel: 'Insonia grave', cor: '#f44336' },
    'PCL-5 - Rastreamento de Trauma e TEPT': (t) => t <= 32 ? { nivel: 'Sem indicativo de TEPT', cor: '#4CAF50' } : t <= 49 ? { nivel: 'Indicativo moderado de TEPT', cor: '#FF9800' } : { nivel: 'Indicativo grave de TEPT - encaminhamento recomendado', cor: '#f44336' },
    'EPDS - Escala de Depressao Pos-Parto': (t) => t <= 9 ? { nivel: 'Sem indicativo de depressao pos-parto', cor: '#4CAF50' } : t <= 12 ? { nivel: 'Possivel depressao pos-parto leve', cor: '#FF9800' } : { nivel: 'Provavel depressao pos-parto - avaliacao clinica urgente', cor: '#f44336' },
    'AUDIT - Uso de Alcool (OMS)': (t) => t <= 7 ? { nivel: 'Uso de baixo risco', cor: '#4CAF50' } : t <= 15 ? { nivel: 'Uso de risco - intervencao breve recomendada', cor: '#FF9800' } : t <= 19 ? { nivel: 'Uso nocivo - avaliacao especializada', cor: '#FF5722' } : { nivel: 'Provavel dependencia - encaminhamento especializado', cor: '#f44336' },
    'SRQ-20 - Saude Mental Geral (OMS)': (t) => t <= 5 ? { nivel: 'Sem indicativo de transtorno mental comum', cor: '#4CAF50' } : t <= 7 ? { nivel: 'Indicativo leve', cor: '#8BC34A' } : t <= 11 ? { nivel: 'Indicativo moderado - acompanhamento recomendado', cor: '#FF9800' } : { nivel: 'Indicativo grave - avaliacao clinica necessaria', cor: '#f44336' }
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
    const escalaKey = Object.keys(interpretacoes).find(k => k.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() === escalaNome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase());
    const interpFn = escalaKey ? interpretacoes[escalaKey] : null;
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
                ${escalaNome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes('burnout') ? (() => {
                const ex = respostas.filter(r => r.ordem >= 1 && r.ordem <= 8).reduce((s, r) => s + (parseInt(r.valor) || 0), 0);
                const de = respostas.filter(r => r.ordem >= 9 && r.ordem <= 13).reduce((s, r) => s + (parseInt(r.valor) || 0), 0);
                const re = respostas.filter(r => r.ordem >= 14 && r.ordem <= 20).reduce((s, r) => s + (parseInt(r.valor) || 0), 0);
                const nE = ex <= 16 ? { l: 'Baixa', c: '#4CAF50', desc: 'Nível saudável de energia. Sem sinais de esgotamento.' } : ex <= 27 ? { l: 'Moderada', c: '#FF9800', desc: 'Sinais de cansaço acumulado. Atenção ao autocuidado e limites pessoais.' } : { l: 'Grave', c: '#f44336', desc: 'Esgotamento emocional e físico intenso. Intervenção recomendada.' };
                const nD = de <= 6 ? { l: 'Baixa', c: '#4CAF50', desc: 'Vínculos preservados. Relações profissionais saudáveis.' } : de <= 12 ? { l: 'Moderada', c: '#FF9800', desc: 'Início de distanciamento emocional. Trabalhar empatia e vínculos.' } : { l: 'Grave', c: '#f44336', desc: 'Distanciamento severo das pessoas. Risco de prejuízo nas relações.' };
                const nR = re >= 28 ? { l: 'Alta', c: '#4CAF50', desc: 'Senso elevado de propósito e competência no trabalho.' } : re >= 14 ? { l: 'Moderada', c: '#FF9800', desc: 'Satisfação profissional parcial. Explorar fontes de motivação.' } : { l: 'Baixa', c: '#f44336', desc: 'Baixo senso de realização. Pode indicar desmotivação e impotência.' };
                const pctEx = Math.round((ex / 40) * 100);
                const pctDe = Math.round((de / 25) * 100);
                const pctRe = Math.round((re / 35) * 100);
                return ''
                    // Cards dimensão
                    + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">'
                    + '<div style="background:#1a1a2e;border-radius:10px;padding:14px;text-align:center;border-top:3px solid ' + nE.c + ';">'
                    + '<p style="color:#aaa;font-size:10px;margin:0 0 6px;letter-spacing:.1em;">EXAUSTÃO</p>'
                    + '<p style="color:#fff;font-size:24px;font-weight:bold;margin:0;">' + ex + '<span style="font-size:11px;color:#555;font-weight:normal;">/40</span></p>'
                    + '<p style="color:' + nE.c + ';font-size:11px;font-weight:600;margin-top:6px;">' + nE.l + '</p></div>'
                    + '<div style="background:#1a1a2e;border-radius:10px;padding:14px;text-align:center;border-top:3px solid ' + nD.c + ';">'
                    + '<p style="color:#aaa;font-size:10px;margin:0 0 6px;letter-spacing:.1em;">DESPERSONALIZAÇÃO</p>'
                    + '<p style="color:#fff;font-size:24px;font-weight:bold;margin:0;">' + de + '<span style="font-size:11px;color:#555;font-weight:normal;">/25</span></p>'
                    + '<p style="color:' + nD.c + ';font-size:11px;font-weight:600;margin-top:6px;">' + nD.l + '</p></div>'
                    + '<div style="background:#1a1a2e;border-radius:10px;padding:14px;text-align:center;border-top:3px solid ' + nR.c + ';">'
                    + '<p style="color:#aaa;font-size:10px;margin:0 0 6px;letter-spacing:.1em;">REALIZAÇÃO ?</p>'
                    + '<p style="color:#fff;font-size:24px;font-weight:bold;margin:0;">' + re + '<span style="font-size:11px;color:#555;font-weight:normal;">/35</span></p>'
                    + '<p style="color:' + nR.c + ';font-size:11px;font-weight:600;margin-top:6px;">' + nR.l + '</p></div>'
                    + '</div>'
                    // Gráfico de barras SVG
                    + '<div style="background:#1a1a2e;border-radius:10px;padding:16px;margin-bottom:16px;">'
                    + '<p style="color:#aaa;font-size:10px;letter-spacing:.1em;margin-bottom:14px;">GRÁFICO POR DIMENSÃO</p>'
                    + '<div style="display:flex;flex-direction:column;gap:10px;">'
                    + '<div><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#ccc;font-size:12px;">Exaustão</span><span style="color:' + nE.c + ';font-size:12px;font-weight:600;">' + pctEx + '%</span></div><div style="background:#0d0d1a;border-radius:4px;height:10px;overflow:hidden;"><div style="width:' + pctEx + '%;height:100%;background:' + nE.c + ';border-radius:4px;transition:width .5s;"></div></div></div>'
                    + '<div><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#ccc;font-size:12px;">Despersonalização</span><span style="color:' + nD.c + ';font-size:12px;font-weight:600;">' + pctDe + '%</span></div><div style="background:#0d0d1a;border-radius:4px;height:10px;overflow:hidden;"><div style="width:' + pctDe + '%;height:100%;background:' + nD.c + ';border-radius:4px;transition:width .5s;"></div></div></div>'
                    + '<div><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#ccc;font-size:12px;">Realização (quanto maior melhor)</span><span style="color:' + nR.c + ';font-size:12px;font-weight:600;">' + pctRe + '%</span></div><div style="background:#0d0d1a;border-radius:4px;height:10px;overflow:hidden;"><div style="width:' + pctRe + '%;height:100%;background:' + nR.c + ';border-radius:4px;transition:width .5s;"></div></div></div>'
                    + '</div></div>'
                    // Descrições clínicas
                    + '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">'
                    + '<div style="background:#1a1a2e;border-radius:8px;padding:12px;border-left:3px solid ' + nE.c + ';">'
                    + '<p style="color:#aaa;font-size:10px;letter-spacing:.1em;margin:0 0 4px;">EXAUSTÃO · ' + nE.l + '</p>'
                    + '<p style="color:#ccc;font-size:13px;margin:0;">' + nE.desc + '</p></div>'
                    + '<div style="background:#1a1a2e;border-radius:8px;padding:12px;border-left:3px solid ' + nD.c + ';">'
                    + '<p style="color:#aaa;font-size:10px;letter-spacing:.1em;margin:0 0 4px;">DESPERSONALIZAÇÃO · ' + nD.l + '</p>'
                    + '<p style="color:#ccc;font-size:13px;margin:0;">' + nD.desc + '</p></div>'
                    + '<div style="background:#1a1a2e;border-radius:8px;padding:12px;border-left:3px solid ' + nR.c + ';">'
                    + '<p style="color:#aaa;font-size:10px;letter-spacing:.1em;margin:0 0 4px;">REALIZAÇÃO · ' + nR.l + '</p>'
                    + '<p style="color:#ccc;font-size:13px;margin:0;">' + nR.desc + '</p></div>'
                    + '</div>';
            })() : ''}
            ` : `<div style="background:#12121e;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center;"><p style="color:#fff;font-size:18px;">Pontuacao Total: ${totalPontos}</p></div>`}
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