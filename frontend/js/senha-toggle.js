/*
  senha-toggle.js

  Este arquivo cria o comportamento do botão de "olho"
  para mostrar ou esconder campos de senha.

  Ele funciona procurando botões com o atributo:
  data-toggle-senha="id-do-input"
*/

function configurarToggleSenha() {
  // Busca todos os botões que possuem o atributo data-toggle-senha.
  const botoesToggle = document.querySelectorAll("[data-toggle-senha]");

  // Percorre cada botão encontrado.
  botoesToggle.forEach((botao) => {
    // Pega o ID do input que esse botão controla.
    const idInput = botao.getAttribute("data-toggle-senha");

    // Busca o input pelo ID.
    const inputSenha = document.getElementById(idInput);

    // Se não encontrar o input, não faz nada.
    if (!inputSenha) {
      return;
    }

    /*
      Quando o usuário clicar no botão,
      alternamos o tipo do input entre password e text.
    */
    botao.addEventListener("click", () => {
      const senhaEstaEscondida = inputSenha.type === "password";

      if (senhaEstaEscondida) {
        inputSenha.type = "text";
        botao.textContent = "🙈";
        botao.setAttribute("aria-label", "Esconder senha");
        botao.setAttribute("title", "Esconder senha");
      } else {
        inputSenha.type = "password";
        botao.textContent = "👁️";
        botao.setAttribute("aria-label", "Mostrar senha");
        botao.setAttribute("title", "Mostrar senha");
      }
    });
  });
}

/*
  Garante que a função rode depois que o HTML estiver carregado.

  Se o documento ainda estiver carregando, esperamos o DOMContentLoaded.
  Se já estiver carregado, executamos direto.
*/
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", configurarToggleSenha);
} else {
  configurarToggleSenha();
}
