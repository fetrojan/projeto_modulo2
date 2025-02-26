# 📦 PharmaFlow

Este projeto faz parte da evolução do protótipo do app da PharmaFlow, trazendo agora uma API Restful para otimizar a gestão das movimentações de produtos entre filiais. O backend desenvolvido permite o processamento eficiente de dados, trabalahndo com gerenciamento de usuários, produtos e movimentações.

## 🚀 Tecnologias Utilizadas

Linguagem: TypeScript

Backend: Node.js + Express

Banco de Dados: PostgreSQL

ORM: TypeORM

Autenticação: JWT

Bibliotecas adicionais: bcrypt, winston, cpf-check, cpf-cnpj-validator

## 📖 Funcionalidades

✅ Autenticação e controle de acesso

✅ Criação e gerenciamento de usuário com senha

✅ Criação e atualização de movimentações entre filiais

✅ Controle de status da movimentação


## 🛠️ Como Executar o Projeto

🔧 **Pré-requisitos**

Antes de iniciar, você precisará ter instalado em sua máquina:

Node.js

PostgreSQL

Um gerenciador de pacotes como npm ou yarn

📥 **Clonar ou baixar o repositório**

📦 **Instalando as Dependências**

npm install  # ou yarn install

🔧 **Configuração do Banco de Dados**

Configure o arquivo .env com as credenciais do PostgreSQL.

**Execute as migrations:**

npm run typeorm migration:run  # ou yarn typeorm migration:run

**▶️ Rodando o Servidor**

npm run start  # ou yarn start

## 🏗️ Melhorias Futuras

🔹 Implementação de testes automatizados

🔹 Melhorias na interface de administração


✍️ Criado por **Felipe R. Trojan** 🚀