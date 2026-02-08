# 🚀 Guia de Deploy - Vercel

## ✅ Pré-requisitos

- [ ] Conta no Vercel (https://vercel.com)
- [ ] Conta no Supabase com projeto criado (https://supabase.com)
- [ ] Repositório Git (GitHub, GitLab ou Bitbucket)

---

## 📋 PASSO 1: Preparar Variáveis de Ambiente

### 1.1 - Obter credenciais do Supabase

1. Acesse seu projeto no Supabase Dashboard
2. Vá em **Settings** > **API**
3. Copie as seguintes informações:
   - **Project URL** (ex: `https://abc123xyz.supabase.co`)
   - **anon public** key (chave longa começando com `eyJ...`)

### 1.2 - Criar arquivo `.env.local` (para testes locais)

```bash
# Supabase
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **NUNCA** commite este arquivo no Git!

---

## 🌐 PASSO 2: Configurar Vercel

### 2.1 - Importar Projeto

1. Acesse https://vercel.com/new
2. Conecte seu repositório Git
3. Clique em **Import** no projeto correto

### 2.2 - Configurar Build Settings

Na página de configuração do projeto:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 2.3 - Adicionar Variáveis de Ambiente

1. Vá em **Environment Variables**
2. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL = https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Marque as opções:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development** (opcional)

### 2.4 - Deploy

Clique em **Deploy** e aguarde o build terminar.

---

## 🔄 PASSO 3: Após o Deploy

### 3.1 - Verificar se está funcionando

1. Acesse a URL do seu deploy (ex: `https://seu-app.vercel.app`)
2. Tente fazer login
3. Acesse o painel admin
4. Teste alterar o nome do restaurante e salvar

### 3.2 - Se NÃO estiver salvando

Abra o console do navegador (F12) e procure por erros. Os logs vão mostrar:

```
🔵 [UPDATE] Starting update for: Nome do Restaurante
🔵 [UPDATE] Updates: { name: "Novo Nome", ... }
❌ [UPDATE] Supabase error: { code: "42501", message: "permission denied" }
```

**Se aparecer "permission denied":**
→ Problema de RLS no Supabase. Siga o [DIAGNOSTIC_CHECKLIST.md](./DIAGNOSTIC_CHECKLIST.md)

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to Supabase"

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
1. Vá em Vercel > Settings > Environment Variables
2. Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` existem
3. Se não existirem, adicione-as
4. **IMPORTANTE:** Faça um **redeploy** após adicionar variáveis:
   - Deployments > ⋯ (três pontos) > Redeploy

### Erro: "RLS policy violation" ou "permission denied"

**Causa:** Row Level Security bloqueando operações

**Solução:**
Execute no SQL Editor do Supabase:

```sql
-- Habilitar RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública
CREATE POLICY "Allow public read" ON restaurants FOR SELECT USING (true);

-- Permitir update apenas para o dono
CREATE POLICY "Allow owner update" ON restaurants FOR UPDATE 
USING (auth.uid() = user_id);
```

### Erro: "No rows returned" ao buscar restaurante

**Causa:** Slug vazio ou NULL no banco

**Solução:**
```sql
-- Verificar slugs
SELECT id, name, slug FROM restaurants;

-- Se slug for NULL, atualizar:
UPDATE restaurants 
SET slug = 'meu-restaurante' 
WHERE id = 'SEU_RESTAURANT_ID';
```

### Link do cardápio vai para 404

**Causa possível 1:** Slug inválido
```sql
-- Verificar se slug existe
SELECT slug FROM restaurants WHERE id = 'SEU_ID';
```

**Causa possível 2:** RLS bloqueando SELECT público
```sql
-- Permitir leitura pública
CREATE POLICY "Allow public read" ON restaurants 
FOR SELECT USING (true);
```

### Build falha com "Module not found"

**Causa:** Dependências não instaladas

**Solução:**
```bash
# Local
npm install

# Se persistir, delete node_modules e reinstale
rm -rf node_modules package-lock.json
npm install
```

---

## 🔄 Redeploy Após Mudanças

Sempre que você:
- ✅ Adicionar/alterar variáveis de ambiente
- ✅ Atualizar código no repositório
- ✅ Fazer mudanças no Supabase que afetam RLS

**Faça um redeploy:**

1. Vercel Dashboard > Seu Projeto > Deployments
2. Clique nos ⋯ (três pontos) do último deploy
3. Clique em **Redeploy**

---

## 📊 Monitoramento

### Logs em Tempo Real

1. Vercel Dashboard > Seu Projeto > Deployments
2. Clique no deployment ativo
3. Vá em **Functions** > **View Logs**

### Logs do Browser

Abra o console (F12) e procure por:
- 🔵 Logs azuis = operações normais
- ✅ Logs verdes = sucesso
- ⚠️ Logs amarelos = avisos
- ❌ Logs vermelhos = erros

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] RLS policies criadas no Supabase
- [ ] Login funciona
- [ ] Painel admin carrega
- [ ] Salvar configurações funciona
- [ ] Link do cardápio funciona
- [ ] Cardápio público mostra produtos

---

## 🆘 Suporte

Se nada acima resolver:

1. Verifique o [DIAGNOSTIC_CHECKLIST.md](./DIAGNOSTIC_CHECKLIST.md)
2. Olhe os logs no console do navegador
3. Verifique os logs no Vercel Dashboard
4. Teste as queries diretamente no SQL Editor do Supabase

---

## 📝 Notas Importantes

⚠️ **SEMPRE use `VITE_` como prefixo** para variáveis de ambiente em Vite
⚠️ **NUNCA** commite `.env.local` no Git
⚠️ **SEMPRE** faça redeploy após alterar variáveis de ambiente no Vercel
⚠️ **SLUG** deve ser único e sem caracteres especiais (apenas letras minúsculas, números e hífens)

---

## 🎉 Deploy Bem-Sucedido?

Se tudo funcionou:
1. ✅ Teste criar um produto
2. ✅ Teste criar uma categoria
3. ✅ Copie o link do cardápio e abra em aba anônima
4. ✅ Confirme que o cardápio público mostra os produtos

**Pronto! Seu MenuSaaS está no ar! 🚀**
