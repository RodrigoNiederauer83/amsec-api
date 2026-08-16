# amsec-api

API REST com autenticação (cadastro e login) e gerenciamento de grupos de amigo secreto (amigo oculto), usando JWT.

## Stack

- Node.js + TypeScript
- Express 5
- Prisma 7 (SQLite em desenvolvimento)
- Zod (validação)
- JWT + bcrypt (autenticação)
- Login social via Google OAuth 2.0 (google-auth-library)
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

   - `GOOGLE_CLIENT_ID` — Client ID OAuth 2.0 (tipo "Aplicativo da Web") criado no [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

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
- `DELETE /auth/me` — exclui a conta do usuário logado. Exige confirmação da senha atual no corpo da requisição. Bloqueada enquanto o usuário for responsável por algum grupo, ou participar de um sorteio cujo evento ainda não ocorreu.
- `PATCH /auth/me` — atualiza o nome do usuário logado.
- `POST /auth/change-email` — solicita a troca de e-mail. Exige a senha atual. Envia um link de confirmação para o **novo** e-mail (válido por 30 minutos) e um aviso para o e-mail **atual**, alertando sobre a solicitação.
- `POST /auth/confirm-email-change` — confirma a troca de e-mail usando o token recebido. Token de uso único.
- `PATCH /auth/phone` — atualiza o telefone do usuário logado. Exige a senha atual. Hoje a troca é direta (sem confirmação por código); confirmação via SMS/WhatsApp fica pendente até a integração de notificações ser implementada.
- `POST /auth/google` — login ou cadastro via conta Google. Recebe o `idToken` emitido pelo Google e verifica sua autenticidade. Cria a conta automaticamente no primeiro acesso (sem telefone, que precisa ser completado depois via `PATCH /auth/phone`) e reconhece a conta em acessos seguintes, sem duplicar. Contas Google não têm senha por padrão, mas podem definir uma posteriormente via `POST /auth/forgot-password` (o e-mail deixa claro que é para *definir*, não *redefinir*, uma senha), passando a aceitar os dois métodos de login.

> O envio de e-mail é feito através de uma interface (`EmailService`), desacoplada do provedor concreto (`ResendEmailService`). Trocar de provedor de e-mail no futuro não exige alterar os controllers, apenas criar uma nova implementação da interface.

> As rotas sensíveis (`login`, `google`, `forgot-password`, `reset-password`, `confirm-email-change`) têm limite de tentativas por IP (rate limiting), como proteção contra ataques de força bruta: 5 tentativas a cada 15 minutos para login, 3 a cada 15 minutos para as demais. Em desenvolvimento (`NODE_ENV` diferente de `production`), a janela é reduzida para 1 minuto, facilitando testes.

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
- `POST /groups/:id/dependents` — adiciona um dependente ao grupo: um participante sem conta própria (sem login, sem e-mail), vinculado a um responsável (guardião) que já é membro do grupo. Pensado para crianças pequenas ou idosos sem celular/e-mail. Apenas o responsável pelo grupo pode adicionar.
- `PATCH /groups/:id/transfer-ownership` — transfere a responsabilidade do grupo para outro membro. Apenas o responsável atual pode chamar. Aceita um `newOwnerId` opcional no corpo (precisa ser membro do grupo); se omitido, a responsabilidade passa automaticamente para o membro mais antigo do grupo. Se não houver outro membro, retorna erro sugerindo excluir o grupo.
- `DELETE /groups/:id/members/me` — o próprio membro sai do grupo voluntariamente. O responsável não pode sair por esta rota (precisa transferir a responsabilidade ou excluir o grupo antes). Bloqueada enquanto o membro participar de um sorteio cujo evento ainda não ocorreu.
- `DELETE /groups/:id/members/:userId` — o responsável remove outro membro do grupo. Não pode remover a si mesmo por esta rota. Bloqueada enquanto o membro participar de um sorteio cujo evento ainda não ocorreu.

### Exclusões (restrições do sorteio)

- `POST /groups/:id/exclusions` — cadastra um par de membros que não podem ser sorteados um para o outro. Apenas o responsável pode cadastrar. Ambos os usuários precisam já ser membros do grupo.
- `GET /groups/:id/exclusions` — lista as exclusões cadastradas no grupo. Aberto a qualquer membro, para dar transparência às regras do sorteio.
- `DELETE /groups/:id/exclusions/:exclusionId` — remove uma exclusão. Apenas o responsável.

> Exclusões podem ser criadas ou removidas a qualquer momento, mas só valem a partir do próximo sorteio (ou resorteio) — não afetam um resultado já gerado.

### Sorteio

- `POST /groups/:id/draw` — realiza o sorteio do grupo, respeitando as exclusões cadastradas. Apenas o responsável pode disparar. Requer no mínimo 3 membros e que o grupo já tenha uma data de evento cadastrada (via `PATCH /groups/:id/settings`). Pode ser refeito quantas vezes for necessário, **desde que nenhum participante ainda tenha visualizado o resultado** — a partir do primeiro acesso via `GET /groups/:id/assignment`, o sorteio fica travado. O responsável pode forçar um resorteio mesmo após alguém já ter visualizado, usando `?force=true`.
> Sempre que um sorteio é realizado (incluindo resorteios via `?force=true`), um e-mail é enviado a cada membro com conta própria avisando que o resultado está disponível — sem revelar quem tirou quem, apenas direcionando para a página do grupo. Dependentes não recebem e-mail; o aviso chega para o guardião, responsável por consultar o resultado em nome deles.
- `GET /groups/:id/assignment?participantId=` — cada membro consulta o próprio resultado (quem ele tirou). Com `participantId`, um guardião pode consultar o resultado de um dependente sob sua responsabilidade. Não existe rota que exponha todos os pares de uma vez — nem para o responsável — preservando o sigilo do sorteio.

O algoritmo de sorteio usa backtracking: monta o pareamento membro a membro, voltando atrás sempre que uma escolha impede o restante do grupo de fechar corretamente. Isso garante encontrar uma solução válida sempre que ela existir (considerando as exclusões), e retorna erro (`422`) apenas quando é matematicamente impossível de satisfazer todas as regras.

### Sugestões de presente

- `POST /groups/:id/suggestions` — cadastra uma sugestão de presente. Qualquer membro pode cadastrar as próprias sugestões (até 150 caracteres cada, podendo ter várias).
- `GET /groups/:id/suggestions?userId=` — lista as sugestões do grupo, ordenadas pelo nome de quem cadastrou. Aberto a qualquer membro. Com o parâmetro `userId`, filtra apenas as sugestões daquele membro específico; sem ele, retorna as de todos.
- `PATCH /groups/:id/suggestions/:suggestionId` — edita uma sugestão. Somente quem criou a sugestão pode editá-la (nem o responsável do grupo pode editar sugestões de terceiros).
- `DELETE /groups/:id/suggestions/:suggestionId` — remove uma sugestão. Somente quem criou.

> Por privacidade, um usuário só consegue ver ou buscar grupos dos quais já faça parte. A única forma de descobrir e entrar em um grupo novo é através do link de convite (`token`), compartilhado pelo responsável fora da aplicação (WhatsApp, Telegram, e-mail, etc.).

## Modelo de dados

- **User** — usuário cadastrado na aplicação (e-mail, senha, nome opcional, telefone único no formato internacional). Pode ser um dependente (`isDependent`), um participante sem conta própria vinculado a um responsável (`guardianId`) — usado para incluir no sorteio quem não tem celular/e-mail (crianças, idosos).
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
├── services/       # integrações externas por trás de interfaces (ex: envio de e-mail)
├── types/          # extensões de tipos (ex: req.userId)
├── utils/          # lógica de domínio pura (ex: algoritmo de sorteio)
└── server.ts       # ponto de entrada
```

## Roadmap

- [ ] Criptografia do resultado do sorteio a nível de banco (avaliar trade-offs com as garantias relacionais atuais)
- [ ] Notificações via WhatsApp/Telegram/SMS usando o telefone cadastrado
- [ ] Monorepo com app mobile (React Native) e/ou web (React), reaproveitando os schemas Zod já existentes
- [ ] Login via Apple (Sign in with Apple) — estrutura de `provider`/`providerId` já pronta no banco; falta a implementação, que depende de uma conta paga no Apple Developer Program (US$ 99/ano) para configurar Services ID e chaves.
- [ ] Adicionar confirmação por código (SMS/WhatsApp) na troca de telefone e também no cadastro inicial (`POST /auth/register`), quando a integração de notificações for implementada — hoje ambos ficam protegidos apenas pela senha/dados informados, sem verificar posse real do número.