/* Menu Hambúrguer */
const hamburgerButton = document.querySelector("#HamburgerButton");
const closeButton = document.querySelector("#closeButton");
const mobileMenu = document.querySelector("#MobileMenu");

/* Adicionando eventos de clique */
hamburgerButton.addEventListener("click", function () {
    mobileMenu.classList.add("flex"); /* Adiciona a classe flex */
});

closeButton.addEventListener("click", function () {
    mobileMenu.classList.remove("flex"); /* Remove a classe flex */
});


/* menu carrossel*/
/* menu carrossel */

document.addEventListener("DOMContentLoaded", function () {
    const circles = document.querySelectorAll(".circle1, .circle2, .circle3, .circle4, .circle5");
    const radius = 150; // Raio do círculo (metade da largura do contêiner)
    const centerX = 50; // Centro do carrossel no eixo X
    const centerY = 50; // Centro do carrossel no eixo Y
    const totalItems = circles.length;

    // Posiciona os elementos inicialmente
    circles.forEach((circle, index) => {
        const angle = (index / totalItems) * (2 * Math.PI); // Ângulo para cada item
        const x = centerX + radius * Math.cos(angle) - 15; // Calcula a posição X
        const y = centerY + radius * Math.sin(angle) - 15; // Calcula a posição Y

        circle.style.transform = `translate(${x}px, ${y}px)`;
    });

    /* Carrossel rotativo */
    let angleOffset = 0;

    function rotateCarrossel() {
        angleOffset += 0.01; // Velocidade de rotação
        circles.forEach((circle, index) => {
            const angle = (index / totalItems) * (2 * Math.PI) + angleOffset; // Ângulo ajustado
            const x = centerX + radius * Math.cos(angle) - 25; // Calcula a posição X
            const y = centerY + radius * Math.sin(angle) - 25; // Calcula a posição Y
            circle.style.transform = `translate(${x}px, ${y}px)`; // Aplica a transformação
        });
        requestAnimationFrame(rotateCarrossel); // Chama novamente para criar animação contínua
    }

    rotateCarrossel(); // Inicia a rotação



    //planer


});
