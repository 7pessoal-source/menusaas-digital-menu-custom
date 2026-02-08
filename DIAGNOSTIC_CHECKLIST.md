# 🔍 Checklist de Diagnóstico - MenuSaaS

## ✅ FASE 1: Variáveis de Ambiente

### Local (`.env.local`)
- [ ] `VITE_SUPABASE_URL` existe e não está vazio
- [ ] `VITE_SUPABASE_ANON_KEY` existe e não está vazio
- [ ] Valores começam com `https://` e são válidos

### Vercel (Production)
- [ ] `VITE_SUPABASE_URL` configurada em Settings > Environment Variables
- [ ] `VITE_SUPABASE_ANON_KEY` configurada em Settings > Environment Variables
- [ ] Variáveis marcadas como "Production" e "Preview"
- [ ] **CRÍTICO:** Redeploy foi feito após adicionar variáveis?

**Como verificar no Vercel:**
```bash
# No dashboard do projeto
Settings > Environment Variables > Add New
```

---

## 🔐 FASE 2: Supabase RLS (Row Level Security)

### Tabela: `restaurants`
Execute no SQL Editor do Supabase:

```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'restaurants';

-- Se rowsecurity = false, habilitar:
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Criar policy de SELECT (público pode ler)
CREATE POLICY "Allow public read access" 
ON restaurants FOR SELECT 
USING (true);

-- Criar policy de UPDATE (apenas usuário autenticado pode atualizar seu restaurante)
CREATE POLICY "Allow authenticated users to update their restaurant" 
ON restaurants FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Criar policy de INSERT (usuário autenticado pode criar)
CREATE POLICY "Allow authenticated users to insert" 
ON restaurants FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

### Tabela: `categories`
```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
ON categories FOR SELECT 
USING (true);

CREATE POLICY "Allow restaurant owner to manage categories" 
ON categories FOR ALL 
USING (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE user_id = auth.uid()
  )
);
```

### Tabela: `products`
```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
ON products FOR SELECT 
USING (true);

CREATE POLICY "Allow restaurant owner to manage products" 
ON products FOR ALL 
USING (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE user_id = auth.uid()
  )
);
```

---

## 🧪 FASE 3: Teste de Conexão

### Teste 1: Verificar se Supabase está conectando
Abra o console do navegador (F12) e execute:

```javascript
// Cole isso no console quando estiver na página admin
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Anon Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**Resultado esperado:**
- URL deve aparecer (ex: `https://abc123.supabase.co`)
- Anon Key deve mostrar `true`

### Teste 2: Verificar autenticação
```javascript
// Cole no console
const { data: { session } } = await supabase.auth.getSession();
console.log('User logged in:', !!session);
console.log('User ID:', session?.user?.id);
```

**Resultado esperado:**
- `User logged in: true`
- `User ID: [algum UUID]`

### Teste 3: Testar UPDATE direto
```javascript
// Cole no console (substitua com ID real do seu restaurante)
const { data, error } = await supabase
  .from('restaurants')
  .update({ name: 'TESTE DE UPDATE' })
  .eq('id', 'SEU_RESTAURANT_ID_AQUI')
  .select();

console.log('Update result:', data);
console.log('Update error:', error);
```

**Resultado esperado:**
- `error: null`
- `data: [{ id: ..., name: 'TESTE DE UPDATE', ... }]`

**Se der erro:**
- `error: { code: '42501', message: 'permission denied' }` → **PROBLEMA DE RLS**
- `error: { code: 'PGRST116', message: 'no rows returned' }` → **ID errado ou filtro incorreto**

---

## 🚨 PROBLEMAS COMUNS

### Problema: "Error loading restaurant data"
**Causas possíveis:**
1. ❌ Variáveis de ambiente não configuradas
2. ❌ RLS bloqueando SELECT
3. ❌ Tabela não existe no Supabase

**Solução:**
```sql
-- Verificar se tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Problema: "Update não salva nada"
**Causas possíveis:**
1. ❌ RLS bloqueando UPDATE
2. ❌ `user_id` na tabela não bate com `auth.uid()`
3. ❌ Hook com loop infinito (resolver na Fase 2)

**Solução:**
```sql
-- Verificar user_id na tabela
SELECT id, name, user_id 
FROM restaurants 
LIMIT 5;

-- Verificar auth.uid() atual
SELECT auth.uid();
```

### Problema: "Link do cardápio vai pra home"
**Causas possíveis:**
1. ❌ `slug` está NULL ou vazio no banco
2. ❌ Rota `/menu/:slug` não encontra restaurante
3. ❌ Redirect prematuro

**Solução:**
```sql
-- Verificar slugs
SELECT id, name, slug 
FROM restaurants;

-- Se slug for NULL, atualizar manualmente para testar
UPDATE restaurants 
SET slug = 'meu-restaurante-teste' 
WHERE id = 'SEU_ID';
```

---

## ✅ CHECKLIST FINAL

Antes de prosseguir para Fase 2 (correção do código):

- [ ] Variáveis de ambiente configuradas (local E Vercel)
- [ ] RLS policies criadas para `restaurants`, `categories`, `products`
- [ ] Teste de UPDATE no SQL Editor funcionou
- [ ] Teste de UPDATE no console do navegador funcionou
- [ ] `slug` não está NULL no banco

**Se TODOS os itens acima estiverem OK e ainda assim não funcionar:**
→ **Problema está no código (useRestaurant hook)** → Seguir para Fase 2

**Se algum item falhar:**
→ **Resolver primeiro antes de mexer no código**

---

## 📞 DEBUG AVANÇADO

Se nada acima resolver, adicione logs no código:

```typescript
// Adicionar em useRestaurant.ts linha 96
const updateRestaurant = async (updates: Partial<Restaurant>) => {
  console.log('🔵 [UPDATE] Starting update with data:', updates);
  console.log('🔵 [UPDATE] Current restaurant ID:', currentRestaurant?.id);
  
  if (!currentRestaurant) {
    console.error('❌ [UPDATE] No currentRestaurant defined');
    return;
  }

  setLoading(true);
  try {
    const { created_at, ...cleanUpdates } = updates as any;
    
    console.log('🔵 [UPDATE] Sending to Supabase:', cleanUpdates);
    
    const { data, error } = await supabase
      .from('restaurants')
      .update(cleanUpdates)
      .eq('id', currentRestaurant.id)
      .select()
      .single();

    console.log('🟢 [UPDATE] Supabase response:', { data, error });

    if (error) throw error;
    
    console.log('✅ [UPDATE] Success! New data:', data);
    setCurrentRestaurant(data as Restaurant);
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ [UPDATE] Error:', error);
    setError(error.message);
    return { success: false, error: error.message };
  } finally {
    setLoading(false);
  }
};
```

**Salve, recarregue a página admin, tente alterar o nome e veja os logs no console.**

---

## 🎯 PRÓXIMOS PASSOS

Se este checklist confirmar que Supabase está OK:
→ **Problema é no código** → Avançar para correção do `useRestaurant.ts`

Se este checklist encontrar problemas:
→ **Resolver infraestrutura primeiro** → Não mexer no código ainda
