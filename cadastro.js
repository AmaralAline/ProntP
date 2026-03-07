ddocument.getElementById('cadastroForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const confirmaSenha = document.getElementById('confirmaSenha').value.trim();

    if (!nome || !email || !senha || !confirmaSenha) {
        alert('Por favor, preencha todos os campos.');
        return false;
    }

    if (senha !== confirmaSenha) {
        alert('As senhas não coincidem. Tente novamente.');
        return false;
    }

    if (senha.length < 6) {
        alert('A senha deve ter no mínimo 6 caracteres.');
        return false;
    }

    // Aqui você pode integrar a API para cadastro ou outras ações
    alert(`Cadastro realizado com sucesso! Bem-vindo(a), ${nome}!`);
    this.reset();

    // Exemplo de redirecionamento para login após cadastro
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);

    return true;
});
