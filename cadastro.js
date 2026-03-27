// ============================================================
//  ProntPsi - cadastro.js
//  Cadastro de profissional conectado ao backend Node.js
// ============================================================

const API_URL = 'https://mainline.proxy.rlwy.net:31456';
document.getElementById('cadastroForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const crp_crm = document.getElementById('crp_crm').value.trim();
    const especialidade = document.getElementById('especialidade').value;
    const senha = document.getElementById('senha').value.trim();
    const confirmaSenha = document.getElementById('confirmaSenha').value.trim();
    const btnCadastrar = document.getElementById('btnCadastrar');

    // --- Validações ---
    if (!nome || !email || !crp_crm || !especialidade || !senha || !confirmaSenha) {
        exibirMensagem('Por favor, preencha todos os campos obrigatórios.', 'erro');
        return;
    }

    if (senha !== confirmaSenha) {
        exibirMensagem('As senhas não coincidem. Tente novamente.', 'erro');
        return;
    }

    if (senha.length < 6) {
        exibirMensagem('A senha deve ter no mínimo 6 caracteres.', 'erro');
        return;
    }

    // --- Chama a API ---
    btnCadastrar.disabled = true;
    btnCadastrar.innerText = 'Cadastrando...';

    try {
        const response = await fetch(`${API_URL}/api/auth/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, telefone, crp_crm, especialidade, senha })
        });

        const resultado = await response.json();

        if (response.ok) {
            exibirMensagem(`Cadastro realizado com sucesso! Bem-vindo(a), ${nome}!`, 'sucesso');
            document.getElementById('cadastroForm').reset();
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            // Erro retornado pela API (e-mail duplicado, CRP já cadastrado etc.)
            exibirMensagem(resultado.erro || 'Erro ao realizar cadastro.', 'erro');
        }

    } catch (error) {
        exibirMensagem('Não foi possível conectar ao servidor. Verifique se o backend está rodando.', 'erro');
        console.error('Erro de conexão:', error);
    } finally {
        btnCadastrar.disabled = false;
        btnCadastrar.innerText = 'Cadastrar';
    }
});

// ------------------------------------------------------------
//  Exibe mensagem de erro ou sucesso na tela
// ------------------------------------------------------------
function exibirMensagem(mensagem, tipo) {
    const spnErro = document.getElementById('spnErro');
    spnErro.innerText = mensagem;
    spnErro.style.display = 'block';
    spnErro.style.padding = '10px';
    spnErro.style.borderRadius = '6px';
    spnErro.style.marginTop = '10px';
    spnErro.style.fontSize = '14px';
    spnErro.style.textAlign = 'center';
    spnErro.style.backgroundColor = tipo === 'sucesso' ? '#d4edda' : '#f8d7da';
    spnErro.style.color = tipo === 'sucesso' ? '#155724' : '#721c24';

    if (tipo === 'erro') {
        setTimeout(() => { spnErro.style.display = 'none'; }, 5000);
    }
}