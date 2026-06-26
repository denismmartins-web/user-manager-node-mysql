// Importa o Express, que será usado para criar o servidor.
const express = require("express");

// Importa o CORS para permitir comunicação entre frontend e backend.
const cors = require("cors");

// Importa o path, recurso nativo do Node para trabalhar com caminhos de pastas.
const path = require("path");

// Carrega as variáveis do arquivo .env.
require("dotenv").config();

// Importa as rotas de usuários.
const usuariosRoutes = require("./routes/usuarios");

// Importa as rotas de autenticação/login.
const authRoutes = require("./routes/auth");

// Cria a aplicação Express.
const app = express();

// Define a porta do servidor.
// Se existir PORT no .env, usa ela. Caso contrário, usa 3000.
const PORT = process.env.PORT || 3000;

// Ativa o CORS.
app.use(cors());

// Permite que o servidor entenda JSON enviado pelo frontend.
app.use(express.json());

// Define a pasta frontend como pública.
// Isso permite abrir arquivos HTML, CSS e JS pelo navegador.
app.use(express.static(path.join(__dirname, "../frontend")));

// Rota inicial de teste da API.
app.get("/api", (req, res) => {
  res.json({
    mensagem: "API do User Manager rodando com sucesso!",
  });
});

// Conecta as rotas de usuários no caminho /api/usuarios.
app.use("/api/usuarios", usuariosRoutes);

// Conecta as rotas de autenticação no caminho /api/auth.
app.use("/api/auth", authRoutes);

// Rota principal do site.
// Quando acessar http://localhost:3000, abre o index.html.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Liga o servidor.
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
