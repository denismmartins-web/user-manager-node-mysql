// Importa o Express para criar rotas separadas.
const express = require("express");

// Importa o bcryptjs para comparar a senha digitada com a senha criptografada.
const bcrypt = require("bcryptjs");

// Importa a conexão com o banco de dados.
const pool = require("../db");

// Cria o roteador do Express.
const router = express.Router();

/*
  ROTA POST /api/auth/login

  Objetivo:
  Fazer login do usuário.

  Fluxo:
  - Recebe e-mail e senha do frontend
  - Busca o usuário pelo e-mail no MySQL
  - Compara a senha digitada com a senha criptografada usando bcrypt
  - Se estiver correto, retorna os dados do usuário sem a senha
*/
router.post("/login", async (req, res) => {
  try {
    // Pega e-mail e senha enviados pelo frontend.
    let { email, senha } = req.body;

    // Limpa espaços extras e padroniza o e-mail em minúsculas.
    email = email ? email.trim().toLowerCase() : "";
    senha = senha ? senha.trim() : "";

    // Validação simples dos campos obrigatórios.
    if (!email || !senha) {
      return res.status(400).json({
        mensagem: "E-mail e senha são obrigatórios.",
      });
    }

    // Busca o usuário pelo e-mail.
    const [usuarios] = await pool.query(
      `
      SELECT 
        id_usuario,
        nome_completo,
        apelido,
        email,
        celular,
        senha,
        tipo_usuario,
        data_cadastro
      FROM usuarios
      WHERE email = ?
      `,
      [email]
    );

    // Se não encontrar usuário, retorna erro.
    if (usuarios.length === 0) {
      return res.status(401).json({
        mensagem: "E-mail ou senha inválidos.",
      });
    }

    // Pega o primeiro usuário encontrado.
    const usuario = usuarios[0];

    // Compara a senha digitada com a senha criptografada no banco.
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    // Se a senha estiver errada, retorna erro.
    if (!senhaCorreta) {
      return res.status(401).json({
        mensagem: "E-mail ou senha inválidos.",
      });
    }

    // Remove a senha antes de enviar os dados para o frontend.
    delete usuario.senha;

    // Retorna sucesso com os dados do usuário.
    res.json({
      mensagem: "Login realizado com sucesso!",
      usuario,
    });
  } catch (erro) {
    console.error("Erro ao fazer login:", erro);

    res.status(500).json({
      mensagem: "Erro interno ao fazer login.",
    });
  }
});

// Exporta as rotas para serem usadas no server.js.
module.exports = router;
