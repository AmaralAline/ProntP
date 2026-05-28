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

            // Verifica papel na clínica e redireciona para o painel correto
            setTimeout(async () => {
                try {
                    const resClinica = await fetch(`${API_URL}/api/minhas-clinicas`, {
                        headers: { 'Authorization': `Bearer ${resultado.token}` }
                    });
                    if (resClinica.ok) {
                        const clinicas = await resClinica.json();
                        if (clinicas.length) {
                            const clinica = clinicas[0];
                            localStorage.setItem('clinica_id', clinica.id);
                            localStorage.setItem('token_clinica', resultado.token);
                            localStorage.setItem('profissional_clinica', JSON.stringify(resultado.profissional));

                            if (clinica.papel === 'admin_clinica') {
                                window.location.href = 'PainelClinica.html';
                                return;
                            } else if (clinica.papel === 'secretaria') {
                                window.location.href = 'PainelSecretaria.html';
                                return;
                            } else if (clinica.papel === 'profissional') {
                                window.location.href = 'PainelProfissionalClinica.html';
                                return;
                            }
                            // super-admin segue para o PainelExclusivo
                        }
                    }
                } catch (_) { /* sem clínica vinculada — painel normal */ }

                window.location.href = 'PainelExclusivo.html';
            }, 1000);

        } else {
            exibirMensagem(resultado.erro || 'E-mail ou senha incorretos.', 'erro');
        }

    } catch (error) {
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
    let spnErro = document.getElementById('spnErro');

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
}