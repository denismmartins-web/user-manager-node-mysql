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
    const { nome_completo, apelido, email, celular, senha } = req.body;

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
*/
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_completo, apelido, email, celular, tipo_usuario } = req.body;

    if (!nome_completo || !apelido || !email) {
      return res.status(400).json({
        mensagem: "Nome, apelido e e-mail são obrigatórios.",
      });
    }

    // Verifica se existe outro usuário usando o mesmo e-mail.
    const [emailExistente] = await pool.query(
      `
      SELECT id_usuario 
      FROM usuarios 
      WHERE email = ? AND id_usuario != ?
      `,
      [email, id]
    );

    if (emailExistente.length > 0) {
      return res.status(400).json({
        mensagem: "Este e-mail já pertence a outro usuário.",
      });
    }

    const [resultado] = await pool.query(
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
      [nome_completo, apelido, email, celular, tipo_usuario, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado.",
      });
    }

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
  ROTA DELETE /api/usuarios/:id

  Objetivo:
  Excluir um usuário do banco.
*/
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query(
      "DELETE FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado.",
      });
    }

    res.json({
      mensagem: "Usuário excluído com sucesso!",
    });
  } catch (erro) {
    console.error("Erro ao excluir usuário:", erro);

    res.status(500).json({
      mensagem: "Erro interno ao excluir usuário.",
    });
  }
});

// Exporta as rotas para serem usadas no server.js.
module.exports = router;
