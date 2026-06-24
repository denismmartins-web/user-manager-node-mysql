
// Importa a biblioteca mysql2 usando o modo "promise".
// Esse modo permite usar async/await nas consultas ao banco.
const mysql = require("mysql2/promise");

// Carrega as variáveis do arquivo .env.
// Exemplo: DB_HOST, DB_USER, DB_PASSWORD e DB_NAME.
require("dotenv").config();

// Cria uma "piscina" de conexões com o banco.
// Pool significa que o Node pode reutilizar conexões em vez de abrir uma nova toda hora.
const pool = mysql.createPool({
  host: process.env.DB_HOST, // Endereço do banco. No nosso caso: localhost.
  user: process.env.DB_USER, // Usuário do MySQL. Normalmente: root.
  password: process.env.DB_PASSWORD, // Senha do MySQL.
  database: process.env.DB_NAME, // Nome do banco que criamos.
  waitForConnections: true, // Espera uma conexão livre caso todas estejam ocupadas.
  connectionLimit: 10, // Limite de conexões simultâneas.
  queueLimit: 0, // Sem limite de fila para aguardar conexão.
});

// Exporta o pool para outros arquivos usarem.
// Assim, as rotas podem consultar o banco usando esse mesmo arquivo.
module.exports = pool;
