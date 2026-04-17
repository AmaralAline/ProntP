const hamburgerButton = document.querySelector("#HamburgerButton");
const closeButton = document.querySelector("#closeButton");
const mobileMenu = document.querySelector("#MobileMenu");
const API_URL = 'https://prontpsiback-production.up.railway.app';
hamburgerButton.addEventListener("click", function () {
    mobileMenu.classList.add("ativo");
});

closeButton.addEventListener("click", function () {
    mobileMenu.classList.remove("ativo");
});

function calcularPontuacao() {
    let score = 0;
    const form = document.getElementById('ecapForm');
    const resultDiv = document.getElementById('result');

    // Itera pelas perguntas (q1, q2, ..., q4)
    for (let i = 1; i <= 16 ; i++) {
        // Captura o input de rádio selecionado para cada pergunta
        const selectedOption = form.querySelector(`input[name="q${i}"]:checked`);

        // Verifica se uma opção foi selecionada
        if (selectedOption) {
            const value = parseInt(selectedOption.value); // Converte o valor para número
            score += value; // Soma o valor ao score
        } else {
            // Caso nenhuma opção esteja selecionada, exibe um alerta
            resultDiv.innerHTML = "Por favor, responda todas as perguntas.";
            return; // Interrompe a função
        }
    }

    // Interpretação da pontuação
    let interpretation = '';
    if (score <= 17) {
        interpretation = "Ausência ou baixo risco de compulsão alimentar.";
    } else if (score <= 26) {
        interpretation = "Risco moderado de compulsão alimentar. Considere buscar apoio.";
    } else {
        interpretation = "Risco alto de compulsão alimentar. Recomenda-se consultar um profissional.";
    }

    // Exibe o resultado
    resultDiv.innerHTML = `Sua pontuação: ${score} de 64<br>${interpretation}`;
}


/*chatbox*/
function toggleChat() {
    const chat = document.getElementById("chatBox");
    chat.style.display = chat.style.display === "flex" ? "none" : "flex";
}

function sendMessage() {
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if (text !== "") {
        const chatBody = document.getElementById("chatBody");
        const userMsg = document.createElement("div");
        userMsg.className = "message user";
        userMsg.textContent = text;
        chatBody.appendChild(userMsg);
        input.value = "";

        // Simula resposta do bot
        setTimeout(() => {
            const botMsg = document.createElement("div");
            botMsg.className = "message bot";
            botMsg.textContent = "Em breve entraremos em contato!";
            chatBody.appendChild(botMsg);
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 1000);
    }
}
function sendMessage() {
    const input = document.getElementById("chatInput");
    const text = encodeURIComponent(input.value.trim());
    if (text !== "") {
        window.open(`https://wa.me/5511947454936?text=${text}`, "_blank");
    }
}
