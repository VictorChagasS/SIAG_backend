# Projeto SIAG Back-end

Este repositório contém o código-fonte do back-end do **SIAG**, uma aplicação web desenvolvida para auxiliar tradutores, intérpretes e o público em geral na inclusão de acessibilidade em conteúdos multimídia. O back-end é responsável por gerenciar usuários, autenticação, e fornecer APIs RESTful para o front-end.

## Tecnologias Utilizadas

O back-end do **SIAG** foi desenvolvido utilizando as seguintes tecnologias e bibliotecas:

- **NestJS**: Framework Node.js progressivo para construir aplicações server-side eficientes e escaláveis.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
- **Prisma**: ORM moderno para Node.js e TypeScript.
- **PostgreSQL**: Sistema de gerenciamento de banco de dados relacional.
- **JWT**: JSON Web Tokens para autenticação e autorização.
- **Docker**: Containerização da aplicação e seus serviços.
- **Class Validator**: Biblioteca para validação de dados usando decorators.

## Arquitetura

O projeto segue os princípios da Clean Architecture e Domain-Driven Design (DDD), organizando o código em camadas bem definidas:

```
src/
├── modules/           # Módulos da aplicação (auth, users, etc.)
│   ├── auth/         # Módulo de autenticação
│   └── users/        # Módulo de usuários
├── common/           # Código compartilhado entre módulos
├── prisma/           # Configurações e schema do Prisma
└── config/           # Configurações da aplicação
```

## Pré-requisitos

Antes de começar, certifique-se de que você tem instalado em sua máquina:

- **Node.js**: Versão 18 ou superior
- **Docker**: Para rodar a aplicação em containers
- **npm**: Para gerenciamento de dependências
- **PostgreSQL**: Versão 15 ou superior (se não estiver usando Docker)

## Configuração do Ambiente

### Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure as variáveis no arquivo `.env`:
   ```env
   # Configuração do PostgreSQL
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=siag_db
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432

   # Configuração do JWT
   JWT_SECRET=seu_segredo_super_secreto_para_jwt
   JWT_EXPIRES_IN=1d

   # Configuração da aplicação
   PORT=3000
   NODE_ENV=development
   ```

## Configuração Docker

O projeto SIAG inclui configurações Docker para execução em ambientes de desenvolvimento e produção, incluindo o banco de dados PostgreSQL.

### Ambiente de Desenvolvimento

Para executar a aplicação em ambiente de desenvolvimento usando Docker:

```bash
# Executar aplicação e banco de dados PostgreSQL em desenvolvimento
docker-compose up -d
```

Esta configuração:
- Inicia o serviço `siag-api-dev` em modo de desenvolvimento
- Configura o banco de dados PostgreSQL com usuário e senha padrão
- Mapeia a porta 3000 para acesso à API
- Utiliza volumes para persistência de dados do PostgreSQL

### Ambiente de Produção

Para ambientes de produção:

```bash
# Executar aplicação e banco de dados PostgreSQL em produção
docker-compose -f docker-compose.prod.yml up -d
```

A configuração de produção:
- Inicia o serviço `siag-api-prod` otimizado para produção
- Configura o banco PostgreSQL com credenciais fixas
- Utiliza volume dedicado para persistência de dados

### Considerações

- Os bancos de dados têm volumes diferentes para desenvolvimento e produção, portanto os dados não são compartilhados
- Em um ambiente real de produção, você pode querer considerar:
  - Usar senhas mais seguras
  - Configurar backups para o volume do PostgreSQL
  - Utilizar HTTPS para comunicação com a API

## Rodando o Projeto

### Usando npm (Desenvolvimento Local)

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Execute as migrações do Prisma:
   ```bash
   npm run prisma:migrate
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run start:dev
   ```

### Usando Docker

1. Construa e inicie os containers:
   ```bash
   npm run docker:up
   ```

2. Para visualizar os logs:
   ```bash
   npm run docker:logs
   ```

3. Para parar os containers:
   ```bash
   npm run docker:down
   ```

## Endpoints da API

### Autenticação

- **POST /auth/login**: Login de usuário
  ```json
  {
    "email": "usuario@email.com",
    "password": "senha123"
  }
  ```

### Usuários

- **POST /users**: Criar novo usuário
- **GET /users/profile**: Obter perfil do usuário autenticado
- **GET /users**: Listar todos os usuários (requer admin)
- **PATCH /users/:id**: Atualizar usuário
- **DELETE /users/:id**: Deletar usuário

## Tratamento de Erros

A API utiliza um formato padronizado para retorno de erros:

```json
{
  "errors": [
    {
      "code": "INVALID_DATA",
      "title": "campo 'email' é inválido",
      "detail": [
        "formato de email inválido",
        "campo não pode ser vazio"
      ]
    }
  ]
}
```

## Scripts Disponíveis

- `npm run build`: Compila o projeto
- `npm run start:dev`: Inicia o servidor em modo desenvolvimento
- `npm run start:prod`: Inicia o servidor em modo produção
- `npm run lint`: Executa o linter
- `npm run test`: Executa os testes
- `npm run docker:up`: Inicia os containers Docker
- `npm run docker:down`: Para os containers Docker
- `npm run prisma:generate`: Gera o cliente Prisma
- `npm run prisma:migrate`: Executa as migrações do banco de dados
- `npm run prisma:studio`: Abre o Prisma Studio

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença [MIT](LICENSE).
