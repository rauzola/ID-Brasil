## ID Brasil — Desafio: Plataforma de Gerenciamento de Usuários

Este teste foi desenhado para simular um dia de desenvolvimento na ID Brasil, permitindo demonstrar habilidades técnicas em um cenário prático e relevante. O objetivo é escrever código limpo, legível, bem estruturado e alinhado a boas práticas, utilizando as tecnologias do nosso dia a dia.

### API de referência
Base: `https://dummyjson.com`
- Autenticação: `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`
- Usuários: `GET /users`, `GET /users/{id}`, `POST /users/add`, `PUT /users/{id}`, `DELETE /users/{id}`


## Stack utilizada
- React 19 + TypeScript (Next.js 15, App Router)
- Ant Design 5
- Axios
- TanStack React Query 5
- Context API para tema e autenticação

Observação: embora o enunciado mencione React Router DOM, este projeto utiliza o roteamento do Next.js (App Router) para navegação e proteção de rotas.


## Nota sobre incompatibilidade React x Ant Design
Durante a criação do projeto, houve incompatibilidade entre o React 19 e o Ant Design 5. Para mitigar, foi aplicado o pacote `@ant-design/v5-patch-for-react-19`, que ajusta o comportamento do AntD em ambientes com React 19. Essa dependência está listada no `package.json` e é carregada junto com o AntD.


## Arquitetura (relevante)
- `src/app` — rotas (Next.js App Router), incluindo `login`, `dashboard` e `dashboard/users/[id]`
- `src/components` — componentes como tabela de usuários, modais e header com troca de tema
- `src/contexts` — `AuthContext` e `ThemeContext`
- `src/services/api.ts` — cliente Axios, interceptors, serviços de autenticação e usuários
- `src/providers/QueryProvider.tsx` — configuração do React Query
- `src/types` — tipagens de usuário


## Autenticação e sessão
- Login em `/login` utilizando `POST /auth/login`.
- Token JWT armazenado em `localStorage` e injetado via interceptor do Axios.
- Renovação de sessão via `POST /auth/refresh` (quando aplicável), com tratamento global de `401` para redirecionar ao login.
- Identificação de nível de acesso (Admin | User). Se o role não for suportado, o login falha com: "Usuário não cadastrado no sistema".
- Rota protegida: `/dashboard` (apenas autenticados).

Credenciais de teste (DummyJSON):
- Usuário: `kminchelle`
- Senha: `0lelplR`


## Dashboard de Usuários
- Cabeçalho fixo com informações do usuário logado, botão de sair e seletor de tema (light/dark).
- Tabela de usuários com paginação controlada pelo backend.
- Filtro de visibilidade por role: `User` vê apenas `User`; `Admin` vê todos.
- Ações por linha: Detalhes (todas as roles). Editar/Excluir (apenas Admin).


## Página de Detalhes `/dashboard/users/:id`
- Roteamento dinâmico via `app/dashboard/users/[id]/page.tsx`.
- Busca do usuário por id com `GET /users/{id}`.
- Botão "Voltar" para retornar ao dashboard.


## CRUD de usuários (observação importante)
A API do DummyJSON é voltada para testes e nem sempre persiste alterações. Para cumprir o fluxo do desafio e prover uma UX consistente:
- Os dados são carregados da API (`GET /users`) e copiados para um array mantido localmente no estado.
- Ações de criar/editar/excluir atualizam esse array local e refletem imediatamente na tela.
- As chamadas remotas (`POST /users/add`, `PUT /users/{id}`, `DELETE /users/{id}`) podem ser disparadas para manter a semântica, porém o estado fonte de verdade para a UI é o array local, pois a API não salva de forma definitiva.
- Notificações de sucesso são exibidas após operações concluídas com sucesso (no estado local).

Criação/Edição:
- Feitas via modal de formulário; ao confirmar, o modal fecha e a listagem é atualizada.

Exclusão:
- Exige confirmação em modal; ao confirmar, o item é removido da lista local.


## Tema (light/dark)
Há um seletor no cabeçalho que alterna o tema global (light/dark). O estado é persistido e aplicado via contexto e classes globais.


## Como rodar o projeto
Pré-requisitos:
- Node.js 18.18+ (recomendado 20+)
- Yarn ou NPM

Instalação:
```bash
# na raiz do projeto
yarn
# ou
npm install
```

Ambiente (opcional):
- Não há variáveis obrigatórias no momento; o `baseURL` da API está configurado em `src/services/api.ts` como `https://dummyjson.com`.

Ambiente de desenvolvimento:
```bash
yarn dev
# ou
npm run dev
```
Acesse `http://localhost:3000`.

Build de produção:
```bash
yarn build
yarn start
# ou
npm run build
npm run start
```

Scripts úteis:
- `dev`: inicia o servidor de desenvolvimento
- `build`: gera o build de produção
- `start`: serve o build de produção
- `lint`: executa o ESLint


## Decisões e limitações
- Roteamento: foi utilizado o App Router do Next.js no lugar do React Router DOM, mantendo a mesma ideia de rotas públicas e protegidas.
- AntD x React 19: mitigado com `@ant-design/v5-patch-for-react-19` devido a incompatibilidades conhecidas.
- CRUD: devido à falta de persistência real do DummyJSON, a aplicação utiliza um array local como fonte de verdade para refletir as alterações imediatamente ao usuário.


## Entrega
- Publique este repositório como público no GitHub e envie o link ao final.
- Qualquer mudança de prazo/escopo, por favor, comunique-se conosco.


## Critérios de avaliação (do enunciado)
- Funcionalidades implementadas corretamente
- Qualidade do código (legibilidade, organização de pastas, nomes semânticos)
- Domínio técnico (TypeScript, React, bibliotecas da stack)

— Boa sorte!


## Autor e Links
- Autor: **Raul Sigoli**
- GitHub (perfil): [`https://github.com/rauzola`](https://github.com/rauzola)
- LinkedIn: [`https://www.linkedin.com/in/raul-sigoli-137bb4173/`](https://www.linkedin.com/in/raul-sigoli-137bb4173/)
- Repositório do projeto: [`https://github.com/rauzola/ID-Brasil`](https://github.com/rauzola/ID-Brasil)
- Projeto online: [`https://idbrasil.vercel.app/`](https://idbrasil.vercel.app/)
