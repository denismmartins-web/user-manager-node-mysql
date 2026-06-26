// Captura o formulário de login.
const formLogin = document.getElementById("form-login");

// Captura o elemento onde vamos mostrar mensagens.
const mensagem = document.getElementById("mensagem");

/*
  Evento de envio do formulário de login.

  Quando o usuário clicar em "Entrar",
  vamos enviar e-mail e senha para o backend.
*/
formLogin.addEventListener("submit", async (evento) => {
  // Impede a página de recarregar.
  evento.preventDefault();

  // Pega os valores digitados no formulário.
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  // Monta o objeto que será enviado ao backend.
  const dadosLogin = {
    email,
    senha,
  };

  try {
    // Envia os dados para a rota POST /api/auth/login.
    const resposta = await fetch("/api/auth/login", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(dadosLogin),
    });

    // Converte a resposta do backend em JSON.
    const dados = await resposta.json();

    // Se o login falhar, mostra a mensagem de erro.
    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem;
      mensagem.className = "mensagem erro";
      return;
    }

    // Salva os dados do usuário no localStorage.
    // Isso cria uma sessão simples no navegador.
    localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));

    // Mostra mensagem de sucesso.
    mensagem.textContent = dados.mensagem;
    mensagem.className = "mensagem sucesso";

    // Redireciona para o painel do usuário.
    window.location.href = "./painel.html";
  } catch (erro) {
    // Mostra erro técnico no console.
    console.error("Erro ao fazer login:", erro);

    // Mostra mensagem amigável.
    mensagem.textContent = "Erro ao conectar com o servidor.";
    mensagem.className = "mensagem erro";
  }
});
