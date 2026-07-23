# amsec-api

API REST com autenticação (cadastro e login) e gerenciamento de grupos de amigo secreto (amigo oculto), usando JWT.

## Stack

- Node.js + TypeScript
- Express 5
- Prisma 7 (SQLite em desenvolvimento)
- Zod (validação)
- JWT + bcrypt (autenticação)
- Resend (envio de e-mail transacional)
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
   Preencha:
   - `JWT_SECRET` — string aleatória com no mínimo 10 caracteres.
   - `RESEND_API_KEY` — chave de API criada em [resend.com](https://resend.com).
   - `EMAIL_FROM` — endereço remetente dos e-mails (em modo teste do Resend, pode usar `onboarding@resend.dev`).
   - `FRONTEND_URL` — URL base do frontend, usada para montar o link de redefinição de senha (ex: `http://localhost:3000`).

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

- `POST /auth/register` — cadastro de usuário. Requer e-mail, senha, telefone (formato internacional E.164, ex: `+5511999998888`, obrigatório e único) e nome (opcional).
- `POST /auth/login` — login (retorna JWT)
- `GET /auth/me` — dados do usuário logado (rota protegida)
- `POST /auth/forgot-password` — solicita recuperação de senha. Sempre responde com a mesma mensagem genérica, independente do e-mail existir ou não (evita expor quais e-mails têm conta cadastrada). Se existir, envia um e-mail com um link contendo um token válido por 15 minutos.
- `POST /auth/reset-password` — redefine a senha usando o token recebido por e-mail. O token só pode ser usado uma vez.

> O envio de e-mail é feito através de uma interface (`EmailService`), desacoplada do provedor concreto (`ResendEmailService`). Trocar de provedor de e-mail no futuro não exige alterar os controllers, apenas criar uma nova implementação da interface.

### Grupos de amigo secreto

Todas as rotas abaixo exigem autenticação (JWT).

- `POST /groups` — cria um novo grupo. Quem cria vira automaticamente o responsável (owner) e já é adicionado como membro.
- `POST /groups/:id/invite` — gera (ou regenera) o link de convite do grupo. Apenas o responsável pode chamar essa rota. Cada grupo tem no máximo um convite ativo por vez, válido por 7 dias — gerar um novo invalida o anterior.
- `GET /groups/invite/:token` — pré-visualiza um grupo a partir do token de convite (nome, responsável e membros atuais), mesmo para quem ainda não é membro. É o único ponto de entrada em um grupo novo.
- `POST /groups/invite/:token/join` — aceita o convite e efetivamente entra no grupo.
- `GET /groups?owner=&name=` — busca **entre os grupos que o usuário já participa**, filtrando por nome do responsável e/ou nome do grupo (busca parcial). Retorna sempre uma lista, mesmo com um único resultado.
- `GET /groups/:id` — detalhes de um grupo específico (responsável e lista de membros). Só acessível a quem já é membro do grupo.
- `PATCH /groups/:id/settings` — atualiza as configurações do grupo (data/hora do evento, valores mínimo/máximo de presente, endereço e coordenadas do evento). Apenas o responsável. Todos os campos são opcionais e podem ser enviados parcialmente; o servidor sempre valida a combinação final dos valores (ex: mínimo não pode ficar maior que o máximo, latitude e longitude precisam ser fornecidas juntas).
- `DELETE /groups/:id` — O responsável pelo grupo (owner) pode excluir o grupo a qualquer momento.

### Exclusões (restrições do sorteio)

- `POST /groups/:id/exclusions` — cadastra um par de membros que não podem ser sorteados um para o outro. Apenas o responsável pode cadastrar. Ambos os usuários precisam já ser membros do grupo.
- `GET /groups/:id/exclusions` — lista as exclusões cadastradas no grupo. Aberto a qualquer membro, para dar transparência às regras do sorteio.
- `DELETE /groups/:id/exclusions/:exclusionId` — remove uma exclusão. Apenas o responsável.

> Exclusões podem ser criadas ou removidas a qualquer momento, mas só valem a partir do próximo sorteio (ou resorteio) — não afetam um resultado já gerado.

### Sorteio

- `POST /groups/:id/draw` — realiza o sorteio do grupo, respeitando as exclusões cadastradas. Apenas o responsável pode disparar. Requer no mínimo 3 membros. Pode ser refeito quantas vezes for necessário, **desde que nenhum participante ainda tenha visualizado o resultado** — a partir do primeiro acesso via `GET /groups/:id/assignment`, o sorteio fica travado. O responsável pode forçar um resorteio mesmo após alguém já ter visualizado, usando `?force=true`.
- `GET /groups/:id/assignment` — cada membro consulta **apenas o próprio resultado** (quem ele tirou). Não existe rota que exponha todos os pares de uma vez — nem para o responsável — preservando o sigilo do sorteio.

O algoritmo de sorteio usa backtracking: monta o pareamento membro a membro, voltando atrás sempre que uma escolha impede o restante do grupo de fechar corretamente. Isso garante encontrar uma solução válida sempre que ela existir (considerando as exclusões), e retorna erro (`422`) apenas quando é matematicamente impossível de satisfazer todas as regras.

### Sugestões de presente

- `POST /groups/:id/suggestions` — cadastra uma sugestão de presente. Qualquer membro pode cadastrar as próprias sugestões (até 150 caracteres cada, podendo ter várias).
- `GET /groups/:id/suggestions?userId=` — lista as sugestões do grupo, ordenadas pelo nome de quem cadastrou. Aberto a qualquer membro. Com o parâmetro `userId`, filtra apenas as sugestões daquele membro específico; sem ele, retorna as de todos.
- `PATCH /groups/:id/suggestions/:suggestionId` — edita uma sugestão. Somente quem criou a sugestão pode editá-la (nem o responsável do grupo pode editar sugestões de terceiros).
- `DELETE /groups/:id/suggestions/:suggestionId` — remove uma sugestão. Somente quem criou.

> Por privacidade, um usuário só consegue ver ou buscar grupos dos quais já faça parte. A única forma de descobrir e entrar em um grupo novo é através do link de convite (`token`), compartilhado pelo responsável fora da aplicação (WhatsApp, Telegram, e-mail, etc.).

## Modelo de dados

- **User** — usuário cadastrado na aplicação (e-mail, senha, nome opcional, telefone único no formato internacional).
- **Group** — grupo de amigo secreto, com um responsável (`owner`) e configurações opcionais (data/hora do evento, valores mínimo/máximo de presente em centavos, endereço e coordenadas do evento).
- **GroupMember** — relação de participação entre `User` e `Group` (o responsável também é um membro).
- **GroupInvite** — convite ativo de um grupo, identificado por um token único e com data de expiração.
- **GroupExclusion** — par de membros que não podem ser sorteados entre si.
- **Assignment** — resultado do sorteio: quem (`giver`) tirou quem (`receiver`), com controle de visualização (`viewedAt`).
- **GiftSuggestion** — sugestão de presente cadastrada por um membro, vinculada ao grupo e ao autor.
- **PasswordReset** — token ativo de recuperação de senha de um usuário, com expiração de 15 minutos e uso único.

## Estrutura do projeto

```
src/
├── config/         # configuração de ambiente, Zod/OpenAPI (registry por domínio: auth, groups)
├── controllers/    # lógica de cada rota
├── middlewares/    # autenticação, validação, tratamento de erros
├── prisma/         # cliente do Prisma
├── routes/         # definição dos endpoints
├── schemas/        # schemas Zod (validação + documentação)
├── services/        # integrações externas por trás de interfaces (ex: envio de e-mail)
├── types/          # extensões de tipos (ex: req.userId)
├── utils/          # lógica de domínio pura (ex: algoritmo de sorteio)
└── server.ts       # ponto de entrada
```

## Roadmap

- [ ] Gerenciamento de grupo: transferência de responsável, remoção de membro
- [ ] Criptografia do resultado do sorteio a nível de banco (avaliar trade-offs com as garantias relacionais atuais)
- [ ] Links de lojas parceiras nas sugestões de presente
- [ ] Notificações via WhatsApp/Telegram/SMS usando o telefone cadastrado
- [ ] Monorepo com app mobile (React Native) e/ou web (React), reaproveitando os schemas Zod já existentes
- [ ] Alterar nome do usuário
- [ ] Alterar e-mail — exige fluxo de confirmação em duas etapas (link de confirmação enviado ao **novo** e-mail antes de efetivar a troca), para evitar sequestro de conta via sessão comprometida. Avaliar exigir a senha atual como camada extra.
- [ ] Alterar telefone — exige confirmação (ex: código via SMS/WhatsApp) antes de efetivar, especialmente relevante quando a feature de notificações existir (evita notificar o número errado em caso de reciclagem de número).
- [ ] Excluir cadastro — já parcialmente coberto pela regra `onDelete: Restrict` em `Group.owner` (impede excluir conta enquanto for responsável por algum grupo). Falta decidir a regra de negócio para `Assignment`: hoje o `onDelete: Cascade` apaga silenciosamente os pares de sorteio de um membro comum que se exclui após o sorteio já ter ocorrido, o que pode quebrar a dinâmica do grupo sem aviso. Avaliar bloquear a exclusão de conta enquanto houver sorteio ativo no grupo, ou notificar o responsável quando isso acontecer.