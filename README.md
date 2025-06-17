# **EasyManager**

**EasyManager** é uma aplicação de gerenciamento comercial construída com Next.js e HeroUI. Ela permite a gestão centralizada de lojas, produtos, serviços e documentos associados, oferecendo uma solução completa para equipes organizarem suas operações com eficiência.

## 🚀 Funcionalidades

* 📦 Cadastro e gerenciamento de **produtos**

  * Suporte a identificadores como **códigos de barras (EAN)** em tabela separada
* 🏬 Gerenciamento de **lojas**

  * Possibilidade de vincular produtos a lojas e definir preços específicos por loja
* 🧾 Registro de **serviços**

  * Cada serviço contém:

    * Informações do **cliente**
    * **Detalhes técnicos** do serviço
    * Upload de **anexos/documentos**
* 👥 Suporte a múltiplas equipes (multi-tenant) com escopo por `team_id`

## 🧱 Tecnologias Utilizadas

* [Next.js 14](https://nextjs.org/docs)
* [HeroUI v2](https://heroui.com)
* [Tailwind CSS](https://tailwindcss.com)
* [TypeScript](https://www.typescriptlang.org)
* [Framer Motion](https://www.framer.com/motion)
* [Supabase](https://supabase.com) – para banco de dados e autenticação
* [PostgreSQL](https://www.postgresql.org)

## 📁 Estrutura do Projeto

```
.
├── components          # Componentes reutilizáveis
├── constants           # Constantes da aplicação
├── config              # Configurações globais (ex: Supabase)
├── contexts            # Contextos React para estado global
├── hooks               # Custom hooks
├── layouts             # Layouts de páginas
├── pages               # Rotas da aplicação (Next.js Pages Router)
├── public              # Arquivos públicos
├── styles              # Estilos globais
├── supabase            # Arquivos relacionados ao Supabase
├── types               # Tipos TypeScript compartilhados
├── utils               # Funções utilitárias
```

## 🛠️ Como Usar

### 1. Instale as dependências

```bash
npm install
```

ou

```bash
yarn
```

### 2. Execute o servidor de desenvolvimento

```bash
npm run dev
```

### 3. Configure o Supabase

Crie um projeto no Supabase e configure as variáveis de ambiente necessárias (em `.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 4. Configuração opcional para `pnpm`

```bash
public-hoist-pattern[]=*@heroui/*
```

## 📦 Scripts Disponíveis

* `dev` – Inicia o servidor Next.js local
* `build` – Gera a aplicação para produção
* `start` – Inicia o servidor em modo produção
* `lint` – Verifica problemas de linting

## 📄 Licença

Distribuído sob a [licença MIT](./LICENSE).
