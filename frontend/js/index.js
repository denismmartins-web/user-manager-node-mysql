// Captura a área onde vamos mostrar o status da sessão.
const statusSessao = document.getElementById("status-sessao");

// Captura os links da página inicial.
const linkCadastro = document.getElementById("link-cadastro");
const linkLogin = document.getElementById("link-login");
const linkPainel = document.getElementById("link-painel");
const linkAdmin = document.getElementById("link-admin");

// Captura o botão de sair da home.
const btnSairHome = document.getElementById("btn-sair-home");

// Busca o usuário logado usando a função do auth.js.
const usuario = obterUsuarioLogado();

/*
  Se não existir usuário logado, mostramos opções públicas.

  Neste caso faz sentido mostrar:
  - Cadastrar usuário
  - Fazer login
*/
if (!usuario) {
  statusSessao.textContent = "Você ainda não está logado.";

  linkCadastro.classList.remove("escondido");
  linkLogin.classList.remove("escondido");
  linkPainel.classList.add("escondido");
  linkAdmin.classList.add("escondido");
  btnSairHome.classList.add("escondido");
} else {
  /*
    Se existir usuário logado, escondemos cadastro e login.

    Neste caso faz sentido mostrar:
    - Meu painel
    - Área administrativa, somente se for admin
    - Sair
  */
  statusSessao.textContent = `Logado como ${usuario.apelido} (${usuario.tipo_usuario})`;

  linkCadastro.classList.add("escondido");
  linkLogin.classList.add("escondido");
  linkPainel.classList.remove("escondido");
  btnSairHome.classList.remove("escondido");

  /*
    Só mostra a área administrativa se o usuário for admin.
  */
  if (usuario.tipo_usuario === "admin") {
    linkAdmin.classList.remove("escondido");
  } else {
    linkAdmin.classList.add("escondido");
  }
}

/*
  Botão sair da página inicial.
*/
btnSairHome.addEventListener("click", () => {
  sairDoSistema();
});
