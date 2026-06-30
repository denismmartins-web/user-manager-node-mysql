// Importa o Express para criar rotas separadas.
const express = require("express");

// Importa o bcryptjs para criptografar senhas.
const bcrypt = require("bcryptjs");

// Importa a conexão com o banco de dados.
const pool = require("../db");

// Cria um roteador do Express.
// Ele permite separar as rotas de usuários em um arquivo próprio.
const router = express.Router();

/*
  ROTA GET /api/usuarios

  Objetivo:
  Buscar todos os usuários cadastrados no banco.

  Observação:
  Não retornamos a senha, mesmo criptografada.
*/
router.get("/", async (req, res) => {
  try {
    const [usuarios] = await pool.query(`
      SELECT 
        id_usuario,
        nome_completo,
        apelido,
        email,
        celular,
        tipo_usuario,
        data_cadastro
      FROM usuarios
      ORDER BY id_usuario DESC
    `);

    res.json(usuarios);
  } catch (erro) {
    console.error("Erro ao buscar usuários:", erro);

    res.status(500).json({
      mensagem: "Erro interno ao buscar usuários.",
    });
  }
});

/*
  ROTA POST /api/usuarios

  Objetivo:
  Cadastrar um novo usuário no banco.
*/
router.post("/", async (req, res) => {
  try {
    let { nome_completo, apelido, email, celular, senha } = req.body;

    // Remove espaços extras do começo e do final dos textos.
    nome_completo = nome_completo ? nome_completo.trim() : "";
    apelido = apelido ? apelido.trim() : "";
    email = email ? email.trim().toLowerCase() : "";
    celular = celular ? celular.trim() : "";

    // Validação simples para impedir cadastro incompleto.
    if (!nome_completo || !apelido || !email || !senha) {
      return res.status(400).json({
        mensagem: "Nome, apelido, e-mail e senha são obrigatórios.",
      });
    }

    // Verifica se o e-mail já existe no banco.
    const [emailExistente] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE email = ?",
      [email]
    );

    if (emailExistente.length > 0) {
      return res.status(400).json({
        mensagem: "Este e-mail já está cadastrado.",
      });
    }

    // Criptografa a senha antes de salvar.
    // O número 10 representa o custo da criptografia.
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Insere o usuário no banco.
    const [resultado] = await pool.query(
      `
      INSERT INTO usuarios 
      (nome_completo, apelido, email, celular, senha)
      VALUES (?, ?, ?, ?, ?)
      `,
      [nome_completo, apelido, email, celular, senhaCriptografada]
    );

    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      id_usuario: resultado.insertId,
    });
  } catch (erro) {
    console.error("Erro ao cadastrar usuário:", erro);

    res.status(500).json({
      mensagem: "Erro interno ao cadastrar usuário.",
    });
  }
});

/*
  ROTA PUT /api/usuarios/:id

  Objetivo:
  Atualizar dados de um usuário existente.

  Nesta etapa estamos fortalecendo a edição:
  - valida ID
  - valida campos obrigatórios
  - limpa espaços extras
  - valida tipo de usuário
  - impede e-mail duplicado
*/
router.put("/:id", async (req, res) => {
  try {
    // Pega o ID enviado pela URL.
    const { id } = req.params;

    // Converte o ID para número.
    const idUsuario = Number(id);

    // Se o ID não for um número válido, retorna erro.
    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        mensagem: "ID de usuário inválido.",
      });
    }

    // Pega os dados enviados pelo frontend.
    let { nome_completo, apelido, email, celular, tipo_usuario } = req.body;

    // Remove espaços extras do começo e do final dos textos.
    nome_completo = nome_completo ? nome_completo.trim() : "";
    apelido = apelido ? apelido.trim() : "";
    email = email ? email.trim().toLowerCase() : "";
    celular = celular ? celular.trim() : "";
    tipo_usuario = tipo_usuario ? tipo_usuario.trim() : "usuario";

    // Valida campos obrigatórios.
    if (!nome_completo || !apelido || !email) {
      return res.status(400).json({
        mensagem: "Nome, apelido e e-mail são obrigatórios.",
      });
    }

    // Valida se o tipo de usuário é permitido.
    const tiposPermitidos = ["usuario", "admin"];

    if (!tiposPermitidos.includes(tipo_usuario)) {
      return res.status(400).json({
        mensagem: "Tipo de usuário inválido.",
      });
    }

    // Verifica se o usuário existe antes de tentar atualizar.
    const [usuarioEncontrado] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ?",
      [idUsuario]
    );

    if (usuarioEncontrado.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado.",
      });
    }

    // Verifica se existe outro usuário usando o mesmo e-mail.
    const [emailExistente] = await pool.query(
      `
      SELECT id_usuario 
      FROM usuarios 
      WHERE email = ? AND id_usuario != ?
      `,
      [email, idUsuario]
    );

    if (emailExistente.length > 0) {
      return res.status(400).json({
        mensagem: "Este e-mail já pertence a outro usuário.",
      });
    }

    // Atualiza o usuário no banco.
    await pool.query(
      `
      UPDATE usuarios
      SET 
        nome_completo = ?,
        apelido = ?,
        email = ?,
        celular = ?,
        tipo_usuario = ?
      WHERE id_usuario = ?
      `,
      [nome_completo, apelido, email, celular, tipo_usuario, idUsuario]
    );

    res.json({
      mensagem: "Usuário atualizado com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao atualizar usuário:", erro);

    res.status(500).json({
      mensagem: "Erro interno ao atualizar usuário.",
    });
  }
});

/*
  ROTA PUT /api/usuarios/:id/senha

  Objetivo:
  Permitir que um usuário altere a própria senha.

  Segurança básica aplicada:
  - valida ID
  - verifica se o usuário existe
  - compara a senha atual com bcrypt
  - valida tamanho mínimo da nova senha
  - criptografa a nova senha antes de salvar
*/
router.put("/:id/senha", async (req, res) => {
  try {
    // Pega o ID enviado pela URL.
    const { id } = req.params;

    // Converte o ID para número.
    const idUsuario = Number(id);

    // Valida se o ID é um número inteiro positivo.
    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        mensagem: "ID de usuário inválido.",
      });
    }

    // Pega os dados enviados pelo frontend.
    let { senha_atual, nova_senha, confirmar_senha } = req.body;

    // Garante que os campos tenham valor em texto.
    senha_atual = senha_atual ? senha_atual.trim() : "";
    nova_senha = nova_senha ? nova_senha.trim() : "";
    confirmar_senha = confirmar_senha ? confirmar_senha.trim() : "";

    // Valida campos obrigatórios.
    if (!senha_atual || !nova_senha || !confirmar_senha) {
      return res.status(400).json({
        mensagem: "Senha atual, nova senha e confirmação são obrigatórias.",
      });
    }

    // Valida tamanho mínimo da nova senha.
    if (nova_senha.length < 6) {
      return res.status(400).json({
        mensagem: "A nova senha deve ter pelo menos 6 caracteres.",
      });
    }

    // Confere se a nova senha e a confirmação são iguais.
    if (nova_senha !== confirmar_senha) {
      return res.status(400).json({
        mensagem: "A nova senha e a confirmação não conferem.",
      });
    }

    // Busca o usuário no banco, incluindo a senha criptografada.
    const [usuarios] = await pool.query(
      `
      SELECT 
        id_usuario,
        senha
      FROM usuarios
      WHERE id_usuario = ?
      `,
      [idUsuario]
    );

    // Se não encontrou usuário, retorna erro.
    if (usuarios.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado.",
      });
    }

    // Pega o usuário encontrado.
    const usuario = usuarios[0];

    // Compara a senha atual digitada com a senha criptografada no banco.
    const senhaAtualCorreta = await bcrypt.compare(senha_atual, usuario.senha);

    // Se a senha atual estiver errada, bloqueia a alteração.
    if (!senhaAtualCorreta) {
      return res.status(401).json({
        mensagem: "Senha atual incorreta.",
      });
    }

    // Criptografa a nova senha.
    const novaSenhaCriptografada = await bcrypt.hash(nova_senha, 10);

    // Atualiza a senha no banco.
    await pool.query(
      `
      UPDATE usuarios
      SET senha = ?
      WHERE id_usuario = ?
      `,
      [novaSenhaCriptografada, idUsuario]
    );

    // Retorna sucesso.
    res.json({
      mensagem: "Senha alterada com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao alterar senha:", erro);

    res.status(500).json({
      mensagem: "Erro interno ao alterar senha.",
    });
  }
});

/*
  ROTA DELETE /api/usuarios/:id

  Objetivo:
  Excluir um usuário do banco.
*/
/*
  ROTA DELETE /api/usuarios/:id

  Objetivo:
  Excluir um usuário do banco.

  Melhorias desta etapa:
  - valida se o ID é um número válido
  - verifica se o usuário existe antes de excluir
  - retorna uma mensagem mais clara
*/
router.delete("/:id", async (req, res) => {
  try {
    // Pega o ID enviado pela URL.
    const { id } = req.params;

    // Converte o ID para número.
    const idUsuario = Number(id);

    // Valida se o ID é um número inteiro positivo.
    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        mensagem: "ID de usuário inválido.",
      });
    }

    // Verifica se o usuário existe antes de excluir.
    const [usuariosEncontrados] = await pool.query(
      `
      SELECT 
        id_usuario,
        apelido,
        email
      FROM usuarios
      WHERE id_usuario = ?
      `,
      [idUsuario]
    );

    // Se não encontrar usuário, retorna erro 404.
    if (usuariosEncontrados.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado.",
      });
    }

    // Guarda o usuário encontrado para usar na mensagem final.
    const usuario = usuariosEncontrados[0];

    // Exclui o usuário do banco.
    await pool.query(
      "DELETE FROM usuarios WHERE id_usuario = ?",
      [idUsuario]
    );

    // Retorna mensagem de sucesso.
    res.json({
      mensagem: `Usuário "${usuario.apelido}" excluído com sucesso!`,
    });
  } catch (erro) {
    console.error("Erro ao excluir usuário:", erro);

    res.status(500).json({
      mensagem: "Erro interno ao excluir usuário.",
    });
  }
});

/*
  ROTA PUT /api/usuarios/:id/senha

  Objetivo:
  Permitir que um usuário altere a própria senha.
*/
router.put("/:id/senha", async (req, res) => {
  try {
    const { id } = req.params;

    const idUsuario = Number(id);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      return res.status(400).json({
        mensagem: "ID de usuário inválido.",
      });
    }

    let { senha_atual, nova_senha, confirmar_senha } = req.body;

    senha_atual = senha_atual ? senha_atual.trim() : "";
    nova_senha = nova_senha ? nova_senha.trim() : "";
    confirmar_senha = confirmar_senha ? confirmar_senha.trim() : "";

    if (!senha_atual || !nova_senha || !confirmar_senha) {
      return res.status(400).json({
        mensagem: "Senha atual, nova senha e confirmação são obrigatórias.",
      });
    }

    if (nova_senha.length < 6) {
      return res.status(400).json({
        mensagem: "A nova senha deve ter pelo menos 6 caracteres.",
      });
    }

    if (nova_senha !== confirmar_senha) {
      return res.status(400).json({
        mensagem: "A nova senha e a confirmação não conferem.",
      });
    }

    const [usuarios] = await pool.query(
      `
      SELECT 
        id_usuario,
        senha
      FROM usuarios
      WHERE id_usuario = ?
      `,
      [idUsuario]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado.",
      });
    }

    const usuario = usuarios[0];

    const senhaAtualCorreta = await bcrypt.compare(senha_atual, usuario.senha);

    if (!senhaAtualCorreta) {
      return res.status(401).json({
        mensagem: "Senha atual incorreta.",
      });
    }

    const novaSenhaCriptografada = await bcrypt.hash(nova_senha, 10);

    await pool.query(
      `
      UPDATE usuarios
      SET senha = ?
      WHERE id_usuario = ?
      `,
      [novaSenhaCriptografada, idUsuario]
    );

    res.json({
      mensagem: "Senha alterada com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao alterar senha:", erro);

    res.status(500).json({
      mensagem: "Erro interno ao alterar senha.",
    });
  }
});


// Exporta as rotas para serem usadas no server.js.
module.exports = router;
