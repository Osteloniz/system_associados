# Seleto

Catálogo de produtos afiliados com vitrine pública e painel administrativo para gestão de itens, categorias e links.

## Visão geral

O **Seleto** é uma aplicação web construída com Next.js (App Router) para publicar ofertas de produtos afiliados.

Você tem:

- Área pública com:
  - página inicial com destaques e categorias;
  - listagem por categoria;
  - página de detalhes do produto.
- Área administrativa com:
  - login protegido por cookie JWT;
  - CRUD de produtos;
  - ativação/desativação de produtos;
  - importação em lote por CSV;
  - exportação de catálogo (CSV e PDF).

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- PostgreSQL (Neon recomendado)
- `@neondatabase/serverless` para acesso ao banco
- `jose` + `bcryptjs` para autenticação

## Requisitos

- Node.js `24.x`
- `pnpm` `10.29.3`
- Banco PostgreSQL
- Cliente `psql` (para executar o script SQL)

## Instalação local

### 1. Instalar dependências

```bash
corepack enable
pnpm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:5432/DB?sslmode=require"
JWT_SECRET="uma-chave-longa-e-segura"
ADMIN_EMAIL="admin@seuemail.com"
ADMIN_PASSWORD_HASH="\$2a\$10\$..."
```

### 3. Gerar hash da senha do admin

Para usar no `.env.local` (com escape de `$`):

```bash
node -e "const bcrypt=require('bcryptjs');const h=bcrypt.hashSync('SuaSenhaForte123!',10);console.log(h.replace(/\$/g,'\\$'));"
```

Para usar na Vercel (valor normal, sem escape):

```bash
node -e "const bcrypt=require('bcryptjs');console.log(bcrypt.hashSync('SuaSenhaForte123!',10));"
```

### 4. Criar estrutura e seed do banco

```bash
psql "$DATABASE_URL" -f "./scripts/001-create-products-table.sql"
```

No Windows (exemplo):

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" "$env:DATABASE_URL" -f ".\scripts\001-create-products-table.sql"
```

> O script é idempotente: pode ser executado novamente sem quebrar a base.

### 5. Rodar o projeto

```bash
pnpm dev
```

Abra: `http://localhost:3000`

## Login admin

- URL: `http://localhost:3000/admin/login`
- E-mail: valor de `ADMIN_EMAIL`
- Senha: a senha em texto usada para gerar `ADMIN_PASSWORD_HASH`

## Importação em lote (CSV)

Fluxo recomendado para cadastro inicial:

1. Acesse `http://localhost:3000/admin/dashboard`.
2. Clique em **Modelo CSV** para baixar o arquivo de exemplo.
3. Preencha os produtos na planilha.
4. Clique em **Importar CSV** e selecione o arquivo.

### Regras do CSV

- Cabeçalhos esperados:
  - `title`
  - `slug`
  - `description`
  - `comment`
  - `image_url`
  - `price_from`
  - `price_to`
  - `affiliate_link`
  - `theme`
  - `active`
- O import aceita CSV com separador `,` ou `;` (compatível com Excel PT-BR).
- Coluna `active` aceita: `true/false`, `1/0`, `sim/não`.
- O import faz **upsert por `slug`**:
  - se o slug já existir, atualiza o produto;
  - se não existir, cria um novo produto.
- Linhas inválidas retornam erro com número da linha para correção rápida.

## Scripts

```bash
pnpm dev     # ambiente de desenvolvimento
pnpm build   # build de produção
pnpm start   # sobe build de produção
pnpm lint    # lint
```

## Rotas principais

### Públicas

- `/`
- `/catalogo/[tema]`
- `/produto/[slug]`
- `/p/[slug]`

### Admin

- `/admin/login`
- `/admin/dashboard`

### API

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/themes`
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/[id]`
- `PATCH /api/products/[id]`
- `DELETE /api/products/[id]`
- `GET /api/products/export-pdf`
- `GET /api/products/export-csv`
- `GET /api/products/export-template`
- `POST /api/products/import-csv`

## Deploy na Vercel

1. Suba este repositório no GitHub.
2. Importe o projeto na Vercel.
3. Configure as variáveis de ambiente em **Production** e **Preview**:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD_HASH`
4. Faça o deploy.
5. Execute o script SQL no banco de produção (`scripts/001-create-products-table.sql`).
6. Valide login no `/admin/login` e importação de um CSV teste.

## Segurança

- Nunca versione `.env.local`.
- Em produção, use `JWT_SECRET` forte e exclusivo.
- Login admin com limite de tentativas (rate limit).
- Rotas administrativas e de export/import protegidas por sessão.
- Revogue e gere novos segredos se algum valor sensível for exposto.

## Troubleshooting

### `npm` bloqueado no PowerShell (ExecutionPolicy)

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
```

### `pnpm` não reconhecido

```bash
corepack enable
pnpm -v
```

### Erro no push: `src refspec main does not match any`

```bash
git add .
git commit -m "feat: setup inicial"
git branch -M main
git push -u origin main
```
