# ⚡ Quick Start - MenuSaaS Refatorado

## 🚀 Começar em 3 Passos

### 1️⃣ Instalar Dependências
```bash
npm install
```

### 2️⃣ Configurar Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar .env.local e adicionar:
# - VITE_SUPABASE_URL (sua URL do Supabase)
# - VITE_SUPABASE_ANON_KEY (sua chave pública do Supabase)
# - VITE_GEMINI_API_KEY (sua chave da API Gemini)
```

### 3️⃣ Executar
```bash
npm run dev
```

Pronto! Acesse http://localhost:5173

## 📦 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build
npm run lint         # Verificar código
npm test             # Executar testes
npm run test:ui      # Testes com UI
```

## 🔑 Credenciais Supabase

### Onde encontrar:
1. Acesse seu projeto no [Supabase](https://supabase.com)
2. Vá em Settings > API
3. Copie:
   - `Project URL` → VITE_SUPABASE_URL
   - `anon public` key → VITE_SUPABASE_ANON_KEY

## 🤖 Gemini API Key

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma API key
3. Copie para VITE_GEMINI_API_KEY

## ⚠️ Problemas Comuns

**Erro: "Supabase credentials missing"**
→ Verifique se o .env.local está configurado

**Página em branco**
→ Abra o console do navegador para ver erros

**Imports não funcionam**
→ Reinicie o servidor de desenvolvimento

## 📱 Próximos Passos

1. Configure seu banco de dados no Supabase
2. Crie as tabelas necessárias (restaurants, categories, products)
3. Teste o sistema de autenticação
4. Adicione seu primeiro restaurante

Consulte README.md para documentação completa!
