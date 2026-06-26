// Captura a área onde os dados do usuário serão exibidos.
const dadosUsuario = document.getElementById("dados-usuario");

// Captura o botão de sair.
const btnSair = document.getElementById("btn-sair");

/*
  Busca o usuário salvo no localStorage.

  O localStorage guarda dados no navegador.
  Nesta etapa, estamos usando uma sessão simples para estudo.
*/
const usuarioSalvo = localStorage.getItem("usuarioLogado");

// Se não existir usuário logado, redireciona para login.
if (!usuarioSalvo) {
  window.location.href = "./login.html";
} else {
  // Converte o texto salvo no localStorage de volta para objeto JavaScript.
  const usuario = JSON.parse(usuarioSalvo);

  // Mostra os dados do usuário na tela.
  dadosUsuario.innerHTML = `
    <div class="usuario-card">
      <div class="usuario-topo">
        <div>
          <h3>${usuario.apelido}</h3>
          <span class="badge-tipo">${usuario.tipo_usuario}</span>
        </div>

        <span class="usuario-id">ID #${usuario.id_usuario}</span>
      </div>

      <p><strong>Nome completo:</strong> ${usuario.nome_completo}</p>
      <p><strong>E-mail:</strong> ${usuario.email}</p>
      <p><strong>Celular:</strong> ${usuario.celular || "Não informado"}</p>
      <p><strong>Cadastro:</strong> ${formatarData(usuario.data_cadastro)}</p>
    </div>
  `;
}

/*
  Evento do botão sair.

  Remove o usuário salvo no localStorage
  e volta para a tela de login.
*/
btnSair.addEventListener("click", () => {
  localStorage.removeItem("usuarioLogado");

  window.location.href = "./login.html";
});

/*
  Função para formatar a data no padrão brasileiro.
*/
function formatarData(dataRecebida) {
  if (!dataRecebida) {
    return "Data não informada";
  }

  const data = new Date(dataRecebida);

  return data.toLocaleString("pt-BR");
}
