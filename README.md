# API de Autenticação — Boilerplate

Base de API REST com autenticação (cadastro e login) usando JWT, pensada para ser ponto de partida de novos projetos.

## Stack

- Node.js + TypeScript
- Express 5
- Prisma 7 (SQLite em desenvolvimento)
- Zod (validação)
- JWT + bcrypt (autenticação)
- Swagger / OpenAPI (documentação)

## Como rodar

1. Instale as dependências:
   \`\`\`bash
   npm install
   \`\`\`

2. Copie o arquivo de variáveis de ambiente:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Preencha o `JWT_SECRET` com uma string aleatória de pelo menos 10 caracteres.

3. Rode as migrations do banco:
   \`\`\`bash
   npx prisma migrate dev
   npx prisma generate
   \`\`\`

4. Suba o servidor em modo desenvolvimento:
   \`\`\`bash
   npm run dev
   \`\`\`

## Documentação da API

Com o servidor rodando, acesse:

\`\`\`
http://localhost:3333/docs
\`\`\`

A documentação interativa (Swagger UI) lista todas as rotas disponíveis, seus parâmetros esperados e permite testar diretamente pelo navegador, incluindo rotas protegidas (via botão "Authorize").

## Rotas disponíveis

- `POST /auth/register` — cadastro de usuário
- `POST /auth/login` — login (retorna JWT)
- `GET /auth/me` — dados do usuário logado (rota protegida)

## Estrutura do projeto

\`\`\`
src/
├── config/         # configuração de ambiente, Zod/OpenAPI
├── controllers/    # lógica de cada rota
├── middlewares/     # autenticação, validação, tratamento de erros
├── prisma/          # cliente do Prisma
├── routes/          # definição dos endpoints
├── schemas/         # schemas Zod (validação + documentação)
└── server.ts         # ponto de entrada
\`\`\`

## Usando este projeto como base

Este repositório foi pensado como ponto de partida para novos projetos. Para reutilizar:

1. Clone (ou use como template no GitHub)
2. Ajuste o `name` no `package.json`
3. Configure um novo `.env` com suas próprias credenciais
4. Adicione novos models no `prisma/schema.prisma` conforme a necessidade do novo projeto