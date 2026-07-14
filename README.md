# amsec-api

API REST com autenticação (cadastro e login) e gerenciamento de grupos de amigo secreto (amigo oculto), usando JWT.

## Stack

- Node.js + TypeScript
- Express 5
- Prisma 7 (SQLite em desenvolvimento)
- Zod (validação)
- JWT + bcrypt (autenticação)
- Swagger / OpenAPI (documentação)

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Copie o arquivo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
   Preencha o `JWT_SECRET` com uma string aleatória de pelo menos 10 caracteres.

3. Rode as migrations do banco:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. Suba o servidor em modo desenvolvimento:
   ```bash
   npm run dev
   ```

## Documentação da API

Com o servidor rodando, acesse:

```
http://localhost:3333/docs
```

A documentação interativa (Swagger UI) lista todas as rotas disponíveis, seus parâmetros esperados e permite testar diretamente pelo navegador, incluindo rotas protegidas (via botão "Authorize").

## Rotas disponíveis

### Autenticação

- `POST /auth/register` — cadastro de usuário
- `POST /auth/login` — login (retorna JWT)
- `GET /auth/me` — dados do usuário logado (rota protegida)

### Grupos de amigo secreto

Todas as rotas abaixo exigem autenticação (JWT).

- `POST /groups` — cria um novo grupo. Quem cria vira automaticamente o responsável (owner) e já é adicionado como membro.
- `POST /groups/:id/invite` — gera (ou regenera) o link de convite do grupo. Apenas o responsável pode chamar essa rota. Cada grupo tem no máximo um convite ativo por vez, válido por 7 dias — gerar um novo invalida o anterior.
- `GET /groups/invite/:token` — pré-visualiza um grupo a partir do token de convite (nome, responsável e membros atuais), mesmo para quem ainda não é membro. É o único ponto de entrada em um grupo novo.
- `POST /groups/invite/:token/join` — aceita o convite e efetivamente entra no grupo.
- `GET /groups?owner=&name=` — busca **entre os grupos que o usuário já participa**, filtrando por nome do responsável e/ou nome do grupo (busca parcial). Retorna sempre uma lista, mesmo com um único resultado.
- `GET /groups/:id` — detalhes de um grupo específico (responsável e lista de membros). Só acessível a quem já é membro do grupo.

> Por privacidade, um usuário só consegue ver ou buscar grupos dos quais já faça parte. A única forma de descobrir e entrar em um grupo novo é através do link de convite (`token`), compartilhado pelo responsável fora da aplicação (WhatsApp, Telegram, e-mail, etc.).

## Modelo de dados

- **User** — usuário cadastrado na aplicação.
- **Group** — grupo de amigo secreto, com um responsável (`owner`).
- **GroupMember** — relação de participação entre `User` e `Group` (o responsável também é um membro).
- **GroupInvite** — convite ativo de um grupo, identificado por um token único e com data de expiração.

## Estrutura do projeto

```
src/
├── config/         # configuração de ambiente, Zod/OpenAPI (registry por domínio: auth, groups)
├── controllers/    # lógica de cada rota
├── middlewares/    # autenticação, validação, tratamento de erros
├── prisma/         # cliente do Prisma
├── routes/         # definição dos endpoints
├── schemas/        # schemas Zod (validação + documentação)
├── types/          # extensões de tipos (ex: req.userId)
└── server.ts       # ponto de entrada
```

## Roadmap

- [ ] Gerenciamento de grupo: transferência de responsável, remoção de membro
- [ ] Sorteio de amigo secreto
