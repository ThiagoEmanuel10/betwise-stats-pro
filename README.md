
# Previsão de Jogos - Aplicativo de Futebol

## Visão Geral do Projeto

Esta é uma aplicação web progressiva (PWA) para previsões de jogos de futebol, que permite aos usuários fazer previsões, acompanhar estatísticas e interagir com outros entusiastas de futebol.

**URL**: https://lovable.dev/projects/25eb8964-8a9b-40d8-9883-0f46436e88de

## Funcionalidades Principais

- **Previsões de Jogos**: Faça previsões para jogos de futebol de diversas ligas.
- **Estatísticas Avançadas**: Acesse estatísticas detalhadas e visualizações de dados.
- **Jogos com Alta Probabilidade**: Veja jogos com maior probabilidade estatística de acerto.
- **Chat Comunitário**: Interaja com outros usuários e compartilhe insights.
- **Planos de Assinatura**: Acesse recursos premium com planos pagos.
- **PWA**: Instale a aplicação em dispositivos móveis para acesso offline.
- **Acessibilidade**: Compatível com diretrizes WCAG para garantir acesso a todos os usuários.

## Tecnologias

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- Recharts

### Backend
- Supabase (PostgreSQL)
- Edge Functions
- API de futebol
- Integração com Stripe

## Como Executar o Projeto

### Pré-requisitos
- Node.js & npm - [Instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Passos para Execução Local

```sh
# Passo 1: Clone o repositório
git clone <URL_DO_REPOSITÓRIO>

# Passo 2: Navegue até o diretório do projeto
cd <NOME_DO_PROJETO>

# Passo 3: Instale as dependências
npm i

# Passo 4: Execute o servidor de desenvolvimento
npm run dev
```

## Estrutura do Projeto

```
project-root/
├── public/             # Arquivos estáticos
├── src/
│   ├── components/     # Componentes React
│   │   ├── ui/         # Componentes UI básicos
│   │   ├── dashboard/  # Componentes do dashboard
│   │   └── statistics/ # Componentes de estatísticas
│   ├── hooks/          # Hooks personalizados
│   ├── integrations/   # Integrações externas
│   ├── lib/            # Utilitários
│   ├── pages/          # Páginas da aplicação
│   └── tests/          # Testes
└── supabase/
    └── functions/      # Edge Functions
```

## Guia para Desenvolvedores

### Convenções de Código

- **Commits**: Seguimos o padrão Conventional Commits (feat, fix, docs, etc.)
- **Componentes**: Criamos componentes pequenos e focados
- **TypeScript**: Usamos tipos explícitos e evitamos `any`
- **Acessibilidade**: Seguimos as diretrizes WCAG para acessibilidade
- **Estilo**: Código formatado com ESLint e Prettier

### Fluxo de Trabalho Git

1. Crie uma branch a partir da `main`: `git checkout -b feature/nome-da-feature`
2. Faça suas alterações e adicione testes quando aplicável
3. Execute os testes: `npm test`
4. Faça commit e push: `git push origin feature/nome-da-feature`
5. Abra um Pull Request para a `main`

### Banco de Dados

O projeto utiliza o Supabase como backend, com as seguintes tabelas principais:
- `profiles`: Perfis de usuários
- `match_predictions`: Previsões dos usuários
- `favorite_teams`: Times favoritos
- `favorite_matches`: Partidas favoritadas
- `user_notifications`: Notificações dos usuários
- `user_rankings`: Ranking dos usuários

### Edge Functions

O projeto utiliza Edge Functions do Supabase para:
- Integração com API de futebol
- Processamento de pagamentos via Stripe
- Envio de notificações

## Documentação para Usuários

Para acessar a documentação completa para usuários, visite a [página de documentação](https://lovable.dev/projects/25eb8964-8a9b-40d8-9883-0f46436e88de/documentation) no aplicativo.

## Como Contribuir

Contribuições são bem-vindas! Para contribuir:

1. Abra uma issue descrevendo a feature ou correção
2. Crie um fork do repositório
3. Crie uma branch para sua feature
4. Adicione suas alterações e commit
5. Abra um pull request

## Licença

Este projeto está licenciado sob os termos da licença MIT.
