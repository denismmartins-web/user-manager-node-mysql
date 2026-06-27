// Protege o painel contra acesso sem login.
protegerPaginaLogada();

// Captura a área de boas-vindas.
const boasVindas = document.getElementById("boas-vindas");

// Captura a área onde os dados do usuário serão exibidos.
const dadosUsuario = document.getElementById("dados-usuario");

// Captura a área de mensagens.
const mensagem = document.getElementById("mensagem");

// Captura o botão de mostrar formulário de edição.
const btnMostrarEdicao = document.getElementById("btn-mostrar-edicao");

// Captura o botão de cancelar edição do perfil.
const btnCancelarPerfil = document.getElementById("btn-cancelar-perfil");

// Captura o botão de sair.
const btnSair = document.getElementById("btn-sair");

// Captura o formulário de edição do perfil.
const formPerfil = document.getElementById("form-perfil");

// Captura a área de edição do perfil.
const areaEdicaoPerfil = document.getElementById("area-edicao-perfil");

// Captura o link para área administrativa.
const linkAdminPainel = document.getElementById("link-admin-painel");

// Busca o usuário salvo no localStorage usando a função do auth.js.
let usuarioLogado = obterUsuarioLogado();

/*
  Se por algum motivo não existir usuário logado,
  enviamos para login.
*/
if (!usuarioLogado) {
  window.location.href = "./login.html";
}

/*
  Função que renderiza os dados do usuário no painel.
*/
function renderizarPainel() {
  // Atualiza a mensagem de boas-vindas.
  boasVindas.textContent = `Bem-vindo, ${usuarioLogado.apelido}! Você está logado como ${usuarioLogado.tipo_usuario}.`;

  // Mostra link da área administrativa somente para admin.
  if (usuarioLogado.tipo_usuario === "admin") {
    linkAdminPainel.classList.remove("escondido");
  } else {
    linkAdminPainel.classList.add("escondido");
  }

  // Monta o card principal com os dados do usuário.
  dadosUsuario.innerHTML = `
    <article class="usuario-card painel-card">
      <div class="usuario-topo">
        <div>
          <h3>${usuarioLogado.apelido}</h3>
          <span class="badge-tipo">${usuarioLogado.tipo_usuario}</span>
        </div>

        <span class="usuario-id">ID #${usuarioLogado.id_usuario}</span>
      </div>

      <div class="grade-dados">
        <p><strong>Nome completo:</strong> ${usuarioLogado.nome_completo}</p>
        <p><strong>E-mail:</strong> ${usuarioLogado.email}</p>
        <p><strong>Celular:</strong> ${usuarioLogado.celular || "Não informado"}</p>
        <p><strong>Cadastro:</strong> ${formatarData(usuarioLogado.data_cadastro)}</p>
      </div>
    </article>
  `;
}

/*
  Função que preenche o formulário com os dados atuais do usuário.
*/
function preencherFormularioPerfil() {
  document.getElementById("perfil_nome").value = usuarioLogado.nome_completo;
  document.getElementById("perfil_apelido").value = usuarioLogado.apelido;
  document.getElementById("perfil_email").value = usuarioLogado.email;
  document.getElementById("perfil_celular").value = usuarioLogado.celular || "";
}

/*
  Mostra a área de edição dos próprios dados.
*/
btnMostrarEdicao.addEventListener("click", () => {
  preencherFormularioPerfil();

  areaEdicaoPerfil.classList.remove("escondido");

  mensagem.textContent = "Edite seus dados e clique em salvar.";
  mensagem.className = "mensagem";

  areaEdicaoPerfil.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

/*
  Cancela a edição e esconde o formulário.
*/
btnCancelarPerfil.addEventListener("click", () => {
  areaEdicaoPerfil.classList.add("escondido");

  formPerfil.reset();

  mensagem.textContent = "Edição cancelada.";
  mensagem.className = "mensagem";
});

/*
  Envia a atualização dos próprios dados para o backend.

  Observação:
  Enviamos tipo_usuario junto para preservar o tipo atual do usuário.
  Isso evita que um admin vire "usuario" ao editar o próprio perfil.
*/
formPerfil.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const dadosAtualizados = {
    nome_completo: document.getElementById("perfil_nome").value,
    apelido: document.getElementById("perfil_apelido").value,
    email: document.getElementById("perfil_email").value,
    celular: document.getElementById("perfil_celular").value,
    tipo_usuario: usuarioLogado.tipo_usuario,
  };

  try {
    const resposta = await fetch(`/api/usuarios/${usuarioLogado.id_usuario}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(dadosAtualizados),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem;
      mensagem.className = "mensagem erro";
      return;
    }

    // Atualiza os dados salvos no navegador.
    usuarioLogado = {
      ...usuarioLogado,
      nome_completo: dadosAtualizados.nome_completo.trim(),
      apelido: dadosAtualizados.apelido.trim(),
      email: dadosAtualizados.email.trim().toLowerCase(),
      celular: dadosAtualizados.celular.trim(),
    };

    // Salva novamente no localStorage.
    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

    // Atualiza o painel visualmente.
    renderizarPainel();

    // Esconde o formulário.
    areaEdicaoPerfil.classList.add("escondido");

    // Mostra mensagem de sucesso.
    mensagem.textContent = dados.mensagem;
    mensagem.className = "mensagem sucesso";
  } catch (erro) {
    console.error("Erro ao atualizar perfil:", erro);

    mensagem.textContent = "Erro ao conectar com o servidor.";
    mensagem.className = "mensagem erro";
  }
});

/*
  Evento do botão sair.

  Usa a função sairDoSistema() criada no auth.js.
*/
btnSair.addEventListener("click", () => {
  sairDoSistema();
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

// Renderiza o painel assim que a página abre.
renderizarPainel();
