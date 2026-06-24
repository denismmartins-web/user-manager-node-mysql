CREATE DATABASE IF NOT EXISTS user_manager_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE user_manager_db;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    apelido VARCHAR(50) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    celular VARCHAR(30),
    senha VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('usuario', 'admin') DEFAULT 'usuario',
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
