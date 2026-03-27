// ============================================================
//  ProntPsi - login.js
//  Conectado ao backend Node.js (porta 5015)
// ============================================================

const API_URL = 'https://prontpsiback-production.up.railway.app';
window.onload = function () {
    const btnLogin = document.getElementById('Login');
    const inputEmail = document.getElementById('email');

    if (inputEmail) inputEmail.focus();

    if (btnLogin) {
        btnLogin.onclick = function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('password').value.trim();

            if (email === '' || senha === '') {
                exibirMensagem('Preencha todos os campos.', 'erro');
                return;
            }

            realizarLogin(email, senha);
        };
    }
};

// ------------------------------------------------------------
//  Função principal de login
// ------------------------------------------------------------
async function realizarLogin(email, senha) {
    const btnLogin = document.getElementById('Login');
    btnLogin.disabled = true;
    btnLogin.innerText = 'Entrando...';

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const resultado = await response.json();

        if (response.ok) {
            // Salva o token e dados do profissional no localStorage
            localStorage.setItem('token', resultado.token);
            localStorage.setItem('profissional', JSON.stringify(resultado.profissional));

            exibirMensagem('Login realizado! Redirecionando...', 'sucesso');

            // Redireciona para a home do sistema
            setTimeout(() => {
                window.location.href = 'PainelExclusivo.html';            }, 1000);

        } else {
            // Erro retornado pela API (senha errada, usuário não encontrado etc.)
            exibirMensagem(resultado.erro || 'E-mail ou senha incorretos.', 'erro');
        }

    } catch (error) {
        // Erro de conexão (backend fora do ar, CORS etc.)
        exibirMensagem('Não foi possível conectar ao servidor. Verifique se o backend está rodando.', 'erro');
        console.error('Erro de conexão:', error);
    } finally {
        btnLogin.disabled = false;
        btnLogin.innerText = 'Entrar';
    }
}

// ------------------------------------------------------------
//  Exibe mensagem de erro ou sucesso na tela
// ------------------------------------------------------------
function exibirMensagem(mensagem, tipo) {
    // Tenta usar o elemento spnErro se existir
    let spnErro = document.getElementById('spnErro');

    // Se não existir, cria um dinamicamente
    if (!spnErro) {
        spnErro = document.createElement('p');
        spnErro.id = 'spnErro';
        spnErro.style.cssText = `
            padding: 10px;
            border-radius: 6px;
            margin-top: 10px;
            font-size: 14px;
            text-align: center;
            display: block;
        `;
        const form = document.querySelector('.login-form');
        if (form) form.appendChild(spnErro);
    }

    spnErro.innerText = mensagem;
    spnErro.style.display = 'block';
    spnErro.style.backgroundColor = tipo === 'sucesso' ? '#d4edda' : '#f8d7da';
    spnErro.style.color = tipo === 'sucesso' ? '#155724' : '#721c24';

    if (tipo === 'erro') {
        setTimeout(() => {
            spnErro.style.display = 'none';
        }, 5000);
    }
}N