# 🚀 Guia de Deploy - Vercel

## Método Rápido (CLI)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Deploy para produção
vercel --prod
```

## Método Recomendado (GitHub + Vercel)

### Passo 1: Preparar Repositório

```bash
cd menusaas-refactored

# Inicializar Git (se ainda não fez)
git init
git add .
git commit -m "feat: initial commit - refactored MenuSaaS"

# Criar repositório no GitHub
# Vá em github.com e crie um novo repositório

# Conectar ao GitHub
git remote add origin https://github.com/SEU_USUARIO/NOME_REPO.git
git branch -M main
git push -u origin main
```

### Passo 2: Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **"Add New Project"**
4. **Import Git Repository** → Selecione seu repositório
5. Configure:

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Passo 3: Variáveis de Ambiente

Na seção **Environment Variables**, adicione:

```env
# Supabase
VITE_SUPABASE_URL=https://rhheregmvexxgqmegqoq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoaGVyZWdtdmV4eGdxbWVncW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTk1ODQsImV4cCI6MjA4NTk3NTU4NH0.J08qxjW69sH66pB6x2Jgg-k2_MzKmJ7avakgNacQVc8

# Gemini AI
VITE_GEMINI_API_KEY=PLACEHOLDER_API_KEY

# App Config (atualize depois do deploy)
VITE_APP_NAME=MenuSaaS
VITE_APP_URL=https://seu-projeto.vercel.app
```

**Importante:** Marque essas variáveis para:
- ✅ Production
- ✅ Preview
- ✅ Development

### Passo 4: Deploy

Clique em **"Deploy"** e aguarde! 🚀

## 🔄 Deploy Automático

Agora, toda vez que você fizer `git push`, o Vercel:
1. Detecta automaticamente
2. Faz build
3. Testa
4. Deploya em preview (branches)
5. Deploya em produção (main branch)

## 📊 Após o Deploy

### 1. Atualizar VITE_APP_URL

Após o primeiro deploy, você terá uma URL tipo:
```
https://menusaas.vercel.app
```

Volte em **Settings → Environment Variables** e atualize:
```
VITE_APP_URL=https://menusaas.vercel.app
```

Depois, force um redeploy:
```bash
# Via CLI
vercel --prod --force

# Ou no dashboard: Deployments → (três pontos) → Redeploy
```

### 2. Configurar Domínio Customizado (Opcional)

1. Vá em **Settings → Domains**
2. Adicione seu domínio (ex: `meucardapio.com`)
3. Configure DNS conforme instruções
4. Atualizar VITE_APP_URL novamente

### 3. Verificar CORS no Supabase

No Supabase Dashboard:
1. Vá em **Settings → API**
2. Em **URL Configuration**, adicione sua URL do Vercel:
   ```
   https://menusaas.vercel.app
   ```

## 🐛 Troubleshooting

### Erro: "Build failed"
```bash
# Verifique se build local funciona
npm run build

# Se funcionar localmente, veja logs no Vercel
```

### Erro: "404 on page refresh"
✅ **Já está resolvido!** O `vercel.json` que criamos lida com isso.

### Erro: "Environment variables not working"
- Certifique-se de que começam com `VITE_`
- Marque para todos os ambientes
- Redesploy após adicionar variáveis

### Página em branco
- Abra o console do navegador (F12)
- Verifique se há erros de CORS
- Confirme que variáveis de ambiente estão corretas

## 📈 Monitoramento

### Analytics do Vercel
Vercel oferece analytics gratuito:
- Acesse **Analytics** no dashboard
- Veja métricas de performance, tráfego, etc.

### Logs
- **Deployments** → Clique em um deploy → **View Function Logs**

## 🔒 Segurança

### 1. Proteger variáveis sensíveis
✅ Já feito! As variáveis estão no Vercel, não no código.

### 2. HTTPS automático
✅ Vercel fornece SSL/TLS gratuito automaticamente.

### 3. Preview Deployments
Cada PR/branch gera um preview único:
```
https://menusaas-git-feature-pr.vercel.app
```

## 💰 Planos

### Free (Hobby)
- ✅ Perfeito para começar
- 100GB bandwidth/mês
- Deployments ilimitados
- HTTPS automático

### Pro ($20/mês)
- Analytics avançado
- Mais recursos
- Suporte prioritário

## 📱 Preview Links

Cada commit gera um preview:
```
https://menusaas-abc123.vercel.app
```

Compartilhe para testar antes de ir para produção!

## 🎯 Checklist Final

- [ ] Repositório no GitHub criado
- [ ] Projeto importado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Primeiro deploy bem-sucedido
- [ ] VITE_APP_URL atualizado
- [ ] Testar autenticação em produção
- [ ] Testar criação de produtos
- [ ] Configurar domínio customizado (opcional)

## 🚀 Comandos Úteis

```bash
# Ver lista de deployments
vercel ls

# Ver logs em tempo real
vercel logs

# Remover um deployment
vercel rm [deployment-url]

# Ver domínios
vercel domains ls

# Listar variáveis de ambiente
vercel env ls

# Adicionar variável de ambiente
vercel env add VITE_NEW_VAR

# Redeploy com cache limpo
vercel --prod --force
```

## ✅ Pronto!

Seu MenuSaaS está agora rodando no Vercel com:
- ⚡ Deploy automático
- 🔒 HTTPS
- 🌍 CDN global
- 📊 Analytics
- 🔄 CI/CD

**URL de Exemplo:**
```
https://menusaas.vercel.app
```

Qualquer dúvida, consulte: https://vercel.com/docs
