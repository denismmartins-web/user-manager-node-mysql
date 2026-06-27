/*
  auth.js

  Este arquivo concentra funções de autenticação simples do frontend.

  Nesta etapa, estamos usando localStorage para estudo.
  Em projetos profissionais, o mais comum é usar token JWT, cookies seguros
  ou sessões controladas pelo backend.
*/

/*
  Busca o usuário salvo no localStorage.

  O login salva os dados usando a chave "usuarioLogado".
*/
function obterUsuarioLogado() {
  const usuarioSalvo = localStorage.getItem("usuarioLogado");

  // Se não houver nada salvo, retorna null.
  if (!usuarioSalvo) {
    return null;
  }

  try {
    // Tenta converter o texto salvo em objeto JavaScript.
    return JSON.parse(usuarioSalvo);
  } catch (erro) {
    // Se o dado estiver quebrado/corrompido, remove do navegador.
    localStorage.removeItem("usuarioLogado");

    return null;
  }
}

/*
  Verifica se existe usuário logado.
*/
function usuarioEstaLogado() {
  return obterUsuarioLogado() !== null;
}

/*
  Verifica se o usuário logado é admin.
*/
function usuarioEhAdmin() {
  const usuario = obterUsuarioLogado();

  return usuario && usuario.tipo_usuario === "admin";
}

/*
  Protege páginas que exigem qualquer usuário logado.

  Exemplo:
  painel.html
*/
function protegerPaginaLogada() {
  if (!usuarioEstaLogado()) {
    window.location.href = "./login.html";
  }
}

/*
  Protege páginas que exigem usuário admin.

  Exemplo:
  admin.html
*/
function protegerPaginaAdmin() {
  const usuario = obterUsuarioLogado();

  // Se não estiver logado, manda para login.
  if (!usuario) {
    window.location.href = "./login.html";
    return;
  }

  // Se estiver logado, mas não for admin, manda para o painel.
  if (usuario.tipo_usuario !== "admin") {
    alert("Acesso restrito. Apenas administradores podem acessar esta página.");

    window.location.href = "./painel.html";
  }
}

/*
  Remove a sessão do usuário e envia para login.
*/
function sairDoSistema() {
  localStorage.removeItem("usuarioLogado");

  window.location.href = "./login.html";
}
