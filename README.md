# URL Shortener API

API para encurtamento de URLs com autenticação JWT.

## Sobre o Projeto

Esta API permite que os usuários encurtem URLs, gerenciem suas URLs encurtadas e rastreiem cliques. Usuários autenticados podem gerenciar suas URLs com operações de CRUD.

## Tecnologias Utilizadas

- **NestJS** como framework principal
- **TypeORM** para gerenciamento do banco de dados
- **PostgreSQL** como banco de dados relacional
- **Docker & Docker Compose** para facilitar a configuração do ambiente
- **JWT** para autenticação segura
- **Swagger** para documentação interativa da API

---

## Como Clonar e Configurar o Projeto

### 1️ - **Clonar o Repositório**

```sh
 git clone https://github.com/MarlonAugusto/shortener-url-api.git
 cd shortener-url-api
```

### 2️ - **Configurar Variáveis de Ambiente**

Apague o nome do arquivo `development.env` para ficar com o nome `.env` na raiz do projeto, ele é o environment do sistema.

### 3️ - **Instalar Dependências**

```sh
npm install
```

### 4️ - **Rodar a API Localmente**

```sh
npm run start
```

A API estará disponível em `http://localhost:8000`.

---

## Executando com Docker

### 1 - **Subir os containers (API + Banco de Dados)**

```sh
docker-compose up --build
```

Isso irá iniciar o PostgreSQL e a aplicação automaticamente.

### 2 - **Acessar a API**

- API Base: `http://localhost:8000/api`
- Documentação Swagger: `http://localhost:8000/api/docs`

### 3 - **Parar os containers**

```sh
docker-compose down
```

---

## **Rotas da API**

### **Autenticação**

| Método | Rota             | Descrição                        |
| ------ | ---------------- | -------------------------------- |
| POST   | `/auth/register` | Registrar novo usuário           |
| POST   | `/auth/login`    | Fazer login e obter um token JWT |
| POST   | `/auth/logout`   | Fazer logout                     |

### **Usuário**

| Método | Rota         | Descrição                                |
| ------ | ------------ | ---------------------------------------- |
| GET    | `/user/info` | Obter informações do usuário autenticado |

### **Gerenciador de URLs**

| Método | Rota              | Descrição                         |
| ------ | ----------------- | --------------------------------- |
| POST   | `/short/url`      | Criar uma URL encurtada           |
| GET    | `/short/url`      | Listar URLs encurtadas do usuário |
| PUT    | `/short/url/{id}` | Atualizar URL encurtada           |
| DELETE | `/short/url/{id}` | Excluir URL encurtada             |
| GET    | `/short/url/{id}` | Obter detalhes da URL encurtada   |

---

## **Executando Testes**

Para rodar os testes unitários:

```sh
npm run test
```

Para rodar os testes com cobertura de código:

```sh
npm run test:nocache
```

---

## **Melhorias Futuras**

- Implementação de um **ambiente front-end** para gerenciar as URLs encurtadas
- Funcionalidade de **recuperação de senha** via e-mail
- Configuração para que o **Swagger só rode no ambiente de desenvolvimento**
- Melhorias na **segurança e validação** dos inputs
- Conseguir montar sua propria URL. Ex: localhost:8000/Marlon
---

## **Licença**

Nest está sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido por** [Marlon Augusto](https://github.com/MarlonAugusto)

