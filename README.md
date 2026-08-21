# Secretin

Aplicação de amigo secreto: crie grupos, convide participantes, defina regras (exclusões, data, valor do presente) e deixe o sorteio revelar quem tirou quem — cada pessoa só vê o próprio resultado.

Projeto desenvolvido como estudo full-stack, cobrindo API REST, aplicativo mobile nativo, PWA web e monorepo com código compartilhado.

## Estrutura do monorepo

```
amsec-api/
├── apps/
│   ├── api/       # API REST (Node.js, Express, Prisma) — detalhes completos em apps/api/README.md
│   ├── web/        # Site + PWA instalável (Next.js App Router)
│   └── mobile/     # App nativo Android/iOS (Expo, React Native, Expo Router)
└── packages/
    └── shared/     # Schemas Zod compartilhados entre API, web e mobile (@amsec/shared)
```

## Stack por aplicação

- **API** (`apps/api`): Node.js, TypeScript, Express, Prisma (SQLite em desenvolvimento), Zod, JWT + Google OAuth, Resend (e-mail), rate limiting. Documentação completa das rotas em [`apps/api/README.md`](apps/api/README.md).
- **Web / PWA** (`apps/web`): Next.js (App Router), Tailwind CSS v4, TanStack Query, React Hook Form, instalável como PWA (manifest + service worker via Serwist), funciona offline (cache básico).
- **Mobile** (`apps/mobile`): Expo + Expo Router, TanStack Query, React Hook Form, `expo-secure-store` para token, login local e via Google.
- **Compartilhado** (`packages/shared`): schemas Zod de validação (cadastro, login, grupos, etc.), reaproveitados pelos três consumidores acima — uma única fonte de verdade para as regras de validação.

## Como rodar

Na raiz do monorepo:
```bash
npm install
npm run dev
```
Isso sobe a API (porta 3333) e o site (porta 3000) juntos, via Turborepo.

O mobile roda separadamente:
```bash
cd apps/mobile
npx expo start
```

Consulte [`apps/api/README.md`](apps/api/README.md) para configuração de variáveis de ambiente da API (banco de dados, JWT, e-mail, Google OAuth).

## Funcionalidades principais

- Cadastro e login (e-mail/senha e Google), recuperação de senha, troca de e-mail/telefone com confirmação.
- Grupos: criação, convite (código manual no mobile, link clicável na web), busca, exclusão.
- Participantes sem conta própria ("dependentes"): crianças ou idosos sem celular/e-mail, com um responsável (guardião) que acessa o resultado em nome deles.
- Exclusões no sorteio (quem não pode tirar quem), com limite proporcional ao tamanho do grupo.
- Sorteio via algoritmo de backtracking, com aviso por e-mail (sem revelar o resultado) e resultado individual sigiloso.
- Transferência de responsável e remoção/saída de membros.
- PWA instalável (Android e iOS) com ícone, splash e funcionamento offline básico.

## Roadmap (visão geral do monorepo)

- [ ] Publicar a API em produção (hoje só roda em localhost/rede local)
- [ ] Build Android via EAS para distribuição real fora do emulador
- [ ] Apple Developer Program — desbloqueia Sign in with Apple, TestFlight/build iOS real e deep linking universal
- [ ] Sugestões de presente no mobile e na web (rota já existe na API, falta a tela nos dois)
- [ ] Notificações via WhatsApp/SMS (Zenvia) — em standby
- [ ] Migrar token da web de `localStorage` para cookie `HttpOnly`
- [ ] Explorar modelo de monetização (ver discussão registrada na conversa de desenvolvimento — B2B corporativo, freemium, cobrança por evento, entre outras opções avaliadas)

Itens de roadmap específicos da API (segurança, regras de negócio, etc.) estão detalhados em [`apps/api/README.md`](apps/api/README.md).