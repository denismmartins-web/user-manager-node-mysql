// Captura o formulário de cadastro pelo ID.
const formCadastro = document.getElementById("form-cadastro");

// Captura o elemento onde vamos mostrar mensagens para o usuário.
const mensagem = document.getElementById("mensagem");

/*
  Escuta o envio do formulário.

  Quando o usuário clicar em "Cadastrar", essa função será executada.
*/
formCadastro.addEventListener("submit", async (evento) => {
  // Impede que a página recarregue automaticamente.
  evento.preventDefault();

  // Pega os valores digitados nos campos do formulário.
  const nome_completo = document.getElementById("nome_completo").value;
  const apelido = document.getElementById("apelido").value;
  const email = document.getElementById("email").value;
  const celular = document.getElementById("celular").value;
  const senha = document.getElementById("senha").value;

  // Monta um objeto com os dados do usuário.
  const novoUsuario = {
    nome_completo,
    apelido,
    email,
    celular,
    senha,
  };

  try {
    // Envia os dados para a API do backend.
    const resposta = await fetch("/api/usuarios", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(novoUsuario),
    });

    // Converte a resposta do backend em JSON.
    const dados = await resposta.json();

    // Se a resposta não for OK, mostra a mensagem de erro.
    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem;
      mensagem.className = "mensagem erro";
      return;
    }

    // Mostra mensagem de sucesso.
    mensagem.textContent = dados.mensagem;
    mensagem.className = "mensagem sucesso";

    // Limpa o formulário depois do cadastro.
    formCadastro.reset();
  } catch (erro) {
    console.error("Erro ao cadastrar:", erro);

    mensagem.textContent = "Erro ao conectar com o servidor.";
    mensagem.className = "mensagem erro";
  }
});
