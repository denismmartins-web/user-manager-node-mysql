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

// Captura o botão de mostrar formulário de alteração de senha.
const btnMostrarSenha = document.getElementById("btn-mostrar-senha");

// Captura o botão de cancelar edição do perfil.
const btnCancelarPerfil = document.getElementById("btn-cancelar-perfil");

// Captura o botão de cancelar alteração de senha.
const btnCancelarSenha = document.getElementById("btn-cancelar-senha");

// Captura o botão de sair.
const btnSair = document.getElementById("btn-sair");

// Captura o formulário de edição do perfil.
const formPerfil = document.getElementById("form-perfil");

// Captura o formulário de alteração de senha.
const formSenha = document.getElementById("form-senha");

// Captura a área de edição do perfil.
const areaEdicaoPerfil = document.getElementById("area-edicao-perfil");

// Captura a área de alteração de senha.
const areaAlterarSenha = document.getElementById("area-alterar-senha");

// Captura o link para área administrativa.
const linkAdminPainel = document.getElementById("link-admin-painel");

// Busca o usuário salvo no localStorage usando a função do auth.js.
let usuarioLogado = obterUsuarioLogado();

/*
  Conferência de segurança para evitar erro silencioso.

  Se algum ID estiver diferente no HTML, mostramos no console.
*/
function conferirElementosPainel() {
  const elementos = {
    boasVindas,
    dadosUsuario,
    mensagem,
    btnMostrarEdicao,
    btnMostrarSenha,
    btnCancelarPerfil,
    btnCancelarSenha,
    btnSair,
    formPerfil,
    formSenha,
    areaEdicaoPerfil,
    areaAlterarSenha,
    linkAdminPainel,
  };

  const elementosFaltando = Object.entries(elementos)
    .filter(([, elemento]) => !elemento)
    .map(([nome]) => nome);

  if (elementosFaltando.length > 0) {
    console.error("Elementos não encontrados no painel:", elementosFaltando);

    return false;
  }

  return true;
}

/*
  Função que renderiza os dados do usuário no painel.
*/
function renderizarPainel() {
  boasVindas.textContent = `Bem-vindo, ${usuarioLogado.apelido}! Você está logado como ${usuarioLogado.tipo_usuario}.`;

  if (usuarioLogado.tipo_usuario === "admin") {
    linkAdminPainel.classList.remove("escondido");
  } else {
    linkAdminPainel.classList.add("escondido");
  }

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
  Mostra somente o formulário de perfil.
*/
function mostrarFormularioPerfil() {
  preencherFormularioPerfil();

  areaEdicaoPerfil.classList.remove("escondido");
  areaAlterarSenha.classList.add("escondido");

  mensagem.textContent = "Edite seus dados e clique em salvar.";
  mensagem.className = "mensagem";

  areaEdicaoPerfil.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

/*
  Mostra somente o formulário de alteração de senha.
*/
function mostrarFormularioSenha() {
  formSenha.reset();

  areaAlterarSenha.classList.remove("escondido");
  areaEdicaoPerfil.classList.add("escondido");

  mensagem.textContent = "Digite sua senha atual e escolha uma nova senha.";
  mensagem.className = "mensagem";

  areaAlterarSenha.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

/*
  Cancela a edição do perfil.
*/
function cancelarPerfil() {
  areaEdicaoPerfil.classList.add("escondido");

  formPerfil.reset();

  mensagem.textContent = "Edição cancelada.";
  mensagem.className = "mensagem";
}

/*
  Cancela a alteração de senha.
*/
function cancelarSenha() {
  areaAlterarSenha.classList.add("escondido");

  formSenha.reset();

  mensagem.textContent = "Alteração de senha cancelada.";
  mensagem.className = "mensagem";
}

/*
  Envia a atualização dos próprios dados para o backend.
*/
async function salvarPerfil(evento) {
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

    usuarioLogado = {
      ...usuarioLogado,
      nome_completo: dadosAtualizados.nome_completo.trim(),
      apelido: dadosAtualizados.apelido.trim(),
      email: dadosAtualizados.email.trim().toLowerCase(),
      celular: dadosAtualizados.celular.trim(),
    };

    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

    renderizarPainel();

    areaEdicaoPerfil.classList.add("escondido");

    mensagem.textContent = dados.mensagem;
    mensagem.className = "mensagem sucesso";
  } catch (erro) {
    console.error("Erro ao atualizar perfil:", erro);

    mensagem.textContent = "Erro ao conectar com o servidor.";
    mensagem.className = "mensagem erro";
  }
}

/*
  Envia a alteração de senha para o backend.
*/
async function salvarSenha(evento) {
  evento.preventDefault();

  const dadosSenha = {
    senha_atual: document.getElementById("senha_atual").value,
    nova_senha: document.getElementById("nova_senha").value,
    confirmar_senha: document.getElementById("confirmar_senha").value,
  };

  try {
    const resposta = await fetch(`/api/usuarios/${usuarioLogado.id_usuario}/senha`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(dadosSenha),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem;
      mensagem.className = "mensagem erro";
      return;
    }

    formSenha.reset();

    areaAlterarSenha.classList.add("escondido");

    mensagem.textContent = dados.mensagem;
    mensagem.className = "mensagem sucesso";
  } catch (erro) {
    console.error("Erro ao alterar senha:", erro);

    mensagem.textContent = "Erro ao conectar com o servidor.";
    mensagem.className = "mensagem erro";
  }
}

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

/*
  Inicializa os eventos da página.
*/
function inicializarPainel() {
  if (!usuarioLogado) {
    window.location.href = "./login.html";
    return;
  }

  if (!conferirElementosPainel()) {
    return;
  }

  btnMostrarEdicao.addEventListener("click", mostrarFormularioPerfil);
  btnMostrarSenha.addEventListener("click", mostrarFormularioSenha);
  btnCancelarPerfil.addEventListener("click", cancelarPerfil);
  btnCancelarSenha.addEventListener("click", cancelarSenha);
  formPerfil.addEventListener("submit", salvarPerfil);
  formSenha.addEventListener("submit", salvarSenha);

  btnSair.addEventListener("click", () => {
    sairDoSistema();
  });

  renderizarPainel();
}

// Inicializa o painel assim que o arquivo é carregado.
inicializarPainel();
