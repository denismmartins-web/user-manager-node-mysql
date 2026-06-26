// Captura a área onde a lista de usuários será exibida.
const listaUsuarios = document.getElementById("lista-usuarios");

// Captura o elemento onde vamos mostrar mensagens para o usuário.
const mensagem = document.getElementById("mensagem");

// Captura o elemento onde será mostrado o total geral de usuários.
const totalUsuarios = document.getElementById("total-usuarios");

// Captura o elemento onde será mostrado o total de usuários visíveis após filtros.
const totalVisivel = document.getElementById("total-visivel");

// Captura o campo de busca por texto.
const buscaUsuario = document.getElementById("busca-usuario");

// Captura o filtro por tipo de usuário.
const filtroTipo = document.getElementById("filtro-tipo");

// Captura o botão usado para recarregar a lista manualmente.
const btnRecarregar = document.getElementById("btn-recarregar");

// Captura a área do formulário de edição.
const areaEdicao = document.getElementById("area-edicao");

// Captura o formulário de edição.
const formEdicao = document.getElementById("form-edicao");

// Captura o botão que cancela a edição.
const btnCancelarEdicao = document.getElementById("btn-cancelar-edicao");

// Guarda temporariamente todos os usuários carregados do banco.
// Essa lista original será usada para aplicar busca e filtros no frontend.
let usuariosCarregados = [];

/*
  Função principal da tela administrativa.

  Ela busca os usuários no backend através da rota GET /api/usuarios.
  Depois salva a lista e aplica os filtros atuais.
*/
async function carregarUsuarios() {
  try {
    // Mostra uma mensagem enquanto os usuários estão sendo buscados.
    listaUsuarios.innerHTML = "<p>Carregando usuários...</p>";

    // Limpa mensagens anteriores.
    mensagem.textContent = "";
    mensagem.className = "mensagem";

    // Faz a requisição para o backend.
    const resposta = await fetch("/api/usuarios");

    // Converte a resposta do backend para JSON.
    const usuarios = await resposta.json();

    // Se a resposta tiver erro, mostra a mensagem na tela.
    if (!resposta.ok) {
      mensagem.textContent = usuarios.mensagem || "Erro ao carregar usuários.";
      mensagem.className = "mensagem erro";
      return;
    }

    // Guarda todos os usuários carregados.
    usuariosCarregados = usuarios;

    // Atualiza o contador total.
    totalUsuarios.textContent = usuariosCarregados.length;

    // Aplica busca/filtro e renderiza os cards.
    aplicarFiltros();

    // Mostra uma mensagem simples de sucesso.
    mensagem.textContent = "Lista carregada com sucesso.";
    mensagem.className = "mensagem sucesso";
  } catch (erro) {
    // Mostra o erro técnico no console para ajudar no debug.
    console.error("Erro ao carregar usuários:", erro);

    // Mostra uma mensagem amigável na tela.
    mensagem.textContent = "Erro ao conectar com o servidor.";
    mensagem.className = "mensagem erro";

    listaUsuarios.innerHTML = "<p>Não foi possível carregar os usuários.</p>";
  }
}

/*
  Função que aplica busca e filtro na lista de usuários.

  Ela não consulta o banco novamente.
  Ela usa a lista que já foi carregada e filtra no próprio frontend.
*/
function aplicarFiltros() {
  // Pega o texto digitado na busca e transforma em minúsculo.
  const textoBusca = buscaUsuario.value.trim().toLowerCase();

  // Pega o tipo selecionado no filtro.
  const tipoSelecionado = filtroTipo.value;

  // Filtra os usuários com base na busca e no tipo.
  const usuariosFiltrados = usuariosCarregados.filter((usuario) => {
    // Junta os principais campos pesquisáveis em uma única string.
    const dadosPesquisaveis = `
      ${usuario.nome_completo}
      ${usuario.apelido}
      ${usuario.email}
    `.toLowerCase();

    // Verifica se o usuário combina com o texto da busca.
    const combinaComBusca = dadosPesquisaveis.includes(textoBusca);

    // Verifica se o usuário combina com o tipo selecionado.
    const combinaComTipo =
      tipoSelecionado === "todos" || usuario.tipo_usuario === tipoSelecionado;

    // O usuário só aparece se passar nas duas condições.
    return combinaComBusca && combinaComTipo;
  });

  // Atualiza o contador de usuários visíveis.
  totalVisivel.textContent = usuariosFiltrados.length;

  // Renderiza os usuários filtrados.
  renderizarUsuarios(usuariosFiltrados);
}

/*
  Função que recebe uma lista de usuários e cria os cards na tela.
*/
function renderizarUsuarios(usuarios) {
  // Caso não exista nenhum usuário para mostrar.
  if (usuarios.length === 0) {
    listaUsuarios.innerHTML = "<p>Nenhum usuário encontrado.</p>";
    return;
  }

  // Limpa a lista antes de renderizar novamente.
  listaUsuarios.innerHTML = "";

  // Percorre cada usuário retornado pelo filtro.
  usuarios.forEach((usuario) => {
    // Cria um card para o usuário.
    const cardUsuario = document.createElement("article");

    // Adiciona a classe visual do card.
    cardUsuario.classList.add("usuario-card");

    // Monta o conteúdo do card.
    cardUsuario.innerHTML = `
      <div class="usuario-topo">
        <div>
          <h3>${usuario.apelido}</h3>
          <span class="badge-tipo">${usuario.tipo_usuario}</span>
        </div>

        <span class="usuario-id">ID #${usuario.id_usuario}</span>
      </div>

      <p><strong>Nome:</strong> ${usuario.nome_completo}</p>
      <p><strong>E-mail:</strong> ${usuario.email}</p>
      <p><strong>Celular:</strong> ${usuario.celular || "Não informado"}</p>
      <p><strong>Cadastro:</strong> ${formatarData(usuario.data_cadastro)}</p>

      <div class="acoes">
        <button type="button" onclick="prepararEdicao(${usuario.id_usuario})">
          Editar
        </button>

        <button 
          type="button" 
          class="botao-perigo" 
          onclick="excluirUsuario(${usuario.id_usuario})"
        >
          Excluir
        </button>
      </div>
    `;

    // Adiciona o card na área de listagem.
    listaUsuarios.appendChild(cardUsuario);
  });
}

/*
  Função que prepara o formulário de edição.

  Quando o usuário clica em "Editar", essa função pega os dados
  do usuário selecionado e preenche o formulário.
*/
function prepararEdicao(idUsuario) {
  // Procura o usuário dentro da lista carregada.
  const usuario = usuariosCarregados.find(
    (item) => item.id_usuario === idUsuario
  );

  // Caso não encontre, mostra erro.
  if (!usuario) {
    mensagem.textContent = "Usuário não encontrado para edição.";
    mensagem.className = "mensagem erro";
    return;
  }

  // Preenche o formulário com os dados atuais do usuário.
  document.getElementById("editar_id").value = usuario.id_usuario;
  document.getElementById("editar_nome").value = usuario.nome_completo;
  document.getElementById("editar_apelido").value = usuario.apelido;
  document.getElementById("editar_email").value = usuario.email;
  document.getElementById("editar_celular").value = usuario.celular || "";
  document.getElementById("editar_tipo").value = usuario.tipo_usuario;

  // Mostra a área de edição.
  areaEdicao.classList.remove("escondido");

  // Mostra uma mensagem informando o modo edição.
  mensagem.textContent = "Editando usuário selecionado.";
  mensagem.className = "mensagem";

  // Leva a tela até a área de edição.
  areaEdicao.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

/*
  Evento de envio do formulário de edição.

  Quando o usuário clica em "Salvar edição",
  enviamos os dados atualizados para o backend.
*/
formEdicao.addEventListener("submit", async (evento) => {
  // Impede o recarregamento automático da página.
  evento.preventDefault();

  // Pega o ID do usuário que está sendo editado.
  const idUsuario = document.getElementById("editar_id").value;

  // Monta um objeto com os dados atualizados.
  const usuarioAtualizado = {
    nome_completo: document.getElementById("editar_nome").value,
    apelido: document.getElementById("editar_apelido").value,
    email: document.getElementById("editar_email").value,
    celular: document.getElementById("editar_celular").value,
    tipo_usuario: document.getElementById("editar_tipo").value,
  };

  try {
    // Envia os dados para a rota PUT /api/usuarios/:id.
    const resposta = await fetch(`/api/usuarios/${idUsuario}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(usuarioAtualizado),
    });

    // Converte a resposta em JSON.
    const dados = await resposta.json();

    // Se houver erro, mostra a mensagem retornada pelo backend.
    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem;
      mensagem.className = "mensagem erro";
      return;
    }

    // Mostra mensagem de sucesso.
    mensagem.textContent = dados.mensagem;
    mensagem.className = "mensagem sucesso";

    // Esconde a área de edição.
    areaEdicao.classList.add("escondido");

    // Limpa o formulário.
    formEdicao.reset();

    // Recarrega a lista para mostrar os dados atualizados.
    await carregarUsuarios();
  } catch (erro) {
    // Mostra erro técnico no console.
    console.error("Erro ao editar usuário:", erro);

    // Mostra erro amigável na tela.
    mensagem.textContent = "Erro ao conectar com o servidor.";
    mensagem.className = "mensagem erro";
  }
});

/*
  Evento do botão cancelar.

  Ele fecha a área de edição e limpa o formulário.
*/
btnCancelarEdicao.addEventListener("click", () => {
  areaEdicao.classList.add("escondido");

  formEdicao.reset();

  mensagem.textContent = "Edição cancelada.";
  mensagem.className = "mensagem";
});

/*
  Função responsável por excluir um usuário.

  Melhorias desta etapa:
  - mostra nome, apelido e e-mail na confirmação
  - evita exclusão acidental
  - fecha o formulário de edição se o usuário excluído estiver sendo editado
  - recarrega a lista após excluir
*/
async function excluirUsuario(idUsuario) {
  // Procura o usuário na lista carregada.
  const usuario = usuariosCarregados.find(
    (item) => item.id_usuario === idUsuario
  );

  // Caso não encontre o usuário na lista, mostra erro.
  if (!usuario) {
    mensagem.textContent = "Usuário não encontrado para exclusão.";
    mensagem.className = "mensagem erro";
    return;
  }

  // Monta uma mensagem de confirmação mais clara.
  const confirmar = confirm(
    `Tem certeza que deseja excluir este usuário?\n\n` +
    `ID: ${usuario.id_usuario}\n` +
    `Apelido: ${usuario.apelido}\n` +
    `Nome: ${usuario.nome_completo}\n` +
    `E-mail: ${usuario.email}\n\n` +
    `Essa ação não pode ser desfeita.`
  );

  // Se o usuário cancelar, paramos a função aqui.
  if (!confirmar) {
    mensagem.textContent = "Exclusão cancelada.";
    mensagem.className = "mensagem";
    return;
  }

  try {
    // Envia a requisição DELETE para o backend.
    const resposta = await fetch(`/api/usuarios/${idUsuario}`, {
      method: "DELETE",
    });

    // Converte a resposta em JSON.
    const dados = await resposta.json();

    // Se houver erro, mostra a mensagem retornada pelo backend.
    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem;
      mensagem.className = "mensagem erro";
      return;
    }

    // Verifica se o usuário excluído estava aberto no formulário de edição.
    const idEmEdicao = document.getElementById("editar_id").value;

    if (Number(idEmEdicao) === idUsuario) {
      // Esconde a área de edição.
      areaEdicao.classList.add("escondido");

      // Limpa o formulário de edição.
      formEdicao.reset();
    }

    // Mostra mensagem de sucesso.
    mensagem.textContent = dados.mensagem;
    mensagem.className = "mensagem sucesso";

    // Atualiza a lista depois da exclusão.
    await carregarUsuarios();
  } catch (erro) {
    // Mostra erro técnico no console.
    console.error("Erro ao excluir usuário:", erro);

    // Mostra erro amigável na tela.
    mensagem.textContent = "Erro ao conectar com o servidor.";
    mensagem.className = "mensagem erro";
  }
}

/*
  Função para formatar a data recebida do banco.
*/
function formatarData(dataRecebida) {
  // Caso não venha data do backend.
  if (!dataRecebida) {
    return "Data não informada";
  }

  // Cria um objeto Date com a data recebida.
  const data = new Date(dataRecebida);

  // Retorna a data no padrão brasileiro.
  return data.toLocaleString("pt-BR");
}

/*
  Sempre que o usuário digitar na busca,
  aplicamos os filtros novamente.
*/
buscaUsuario.addEventListener("input", aplicarFiltros);

/*
  Sempre que o usuário trocar o tipo no select,
  aplicamos os filtros novamente.
*/
filtroTipo.addEventListener("change", aplicarFiltros);

/*
  Quando clicar no botão recarregar,
  buscamos os dados novamente no banco.
*/
btnRecarregar.addEventListener("click", carregarUsuarios);

// Carrega os usuários automaticamente quando a página admin.html abre.
carregarUsuarios();
