# Sistema de Transações Bancárias

## Descrição

Este é um projeto de API desenvolvido em Node.js com NestJS e Docker, projetado para suportar múltiplas transações bancárias concorrentes, garantindo a integridade do saldo da conta em todas as operações.

## Funcionalidades

### Cadastro de Conta Bancária
- Permite a criação de novas contas bancárias com um saldo inicial.
- Cada conta possui um número único e um saldo associado.

### Transações
- Implementa funcionalidades para depósito, saque e transferência entre contas.
- As transações são atomicamente seguras, mesmo em cenários de concorrência.

### Concorrência de Transações
- O sistema é capaz de lidar com múltiplas transações ocorrendo simultaneamente.
- Garante que a concorrência não corrompa o saldo das contas ou leve a inconsistências.

## Pré-requisitos
- Node.js
- Docker
- Postgres

## Instalação

1 - Clone o projeto

```bash
git clone https://github.com/Rafa-gre/concurrency-bank-transactions.git

```
2 - Navegue até o diretório do projeto

```bash
cd concurrency-bank-transactions
```

3 - Crie um arquivo .env com as variáveis de ambiente relacionadas ao banco de dados (Veja o arquivo env.example para um exemplo).

4 - Instale as dependências do projeto

```bash
npm install
```

## Rodando a Aplicação

### Docker 

Rode o seguinte comando para subir a aplicação via docker. Caso opte por iniciar a aplicação dessa forma, não é necessário seguir a instalação acima.
```bash
$ docker compose up -d
```

### Local

Inicialize o banco de dados

```bash
$ docker compose up -d database
```

Rode um dos seguintes comandos
```bash
# desenvolvimento
$ npm run start

# watch mode
$ npm run start:dev

# produção
$ npm run start:prod
```

## Testes

Para rodar os testes, use um dos seguintes comandos:

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Documentação da api

A Documentação da API está disponível [localhost:3000/api-docs](http://localhost:3000/api-docs).

## Suporte

Se você encontrar algum problema ou tiver alguma sugestão, por favor, abra uma [issue](https://github.com/Rafa-gre/concurrency-bank-transactions/issues) no GitHub.

## Licença

Este projeto está licenciado sob a licença MIT. 
