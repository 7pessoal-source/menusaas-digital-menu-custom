# 🔧 Correção: Erro "updated_at"

## ❌ Problema:
```
Erro ao salvar: record "new" has no field "updated_at"
```

## ✅ Causa:
O código estava tentando salvar campos que não devem ser enviados para o banco:
- `updated_at` (gerado automaticamente pelo banco)
- `created_at` (gerado automaticamente)
- `user_id` (não deve ser alterado)
- `id` (não deve ser alterado)

## 🔧 Correção Aplicada:

### Arquivo 1: `useRestaurant.ts`
**O que mudou:**
```typescript
// ❌ ANTES
const { created_at, user_id, ...cleanUpdates } = updates as any;

// ✅ AGORA
const { created_at, updated_at, user_id, id, ...cleanUpdates } = updates as any;
```

**Resultado:** Agora remove TODOS os campos readonly antes de salvar.

### Arquivo 2: `RestaurantSettings.tsx`
**O que mudou:**
- Adicionou `useEffect` para sincronizar o `formData` quando o restaurante mudar
- Garante que APENAS campos editáveis sejam incluídos no formulário

**Resultado:** Formulário sempre tem apenas os campos corretos.

---

## 📥 Como Aplicar:

### Para você:
1. ✅ Baixe os 2 arquivos acima
2. ✅ Mande para a Manus substituir:
   - `useRestaurant.ts` → em `src/hooks/`
   - `RestaurantSettings.tsx` → em `src/components/features/`
3. ✅ Faça redeploy no Vercel

### Para a Manus:
Substitua estes arquivos no projeto e faça redeploy.

---

## ✅ Teste Depois:

1. Entre no painel admin
2. Vá em **Configurações**
3. Altere o **Nome do Restaurante**
4. Clique em **Salvar Alterações**
5. Deve mostrar: **"✅ Configurações salvas com sucesso!"**

---

## 🎯 Campos que PODEM ser alterados:

- ✅ Nome do Restaurante
- ✅ Slug (URL)
- ✅ Descrição
- ✅ Logo
- ✅ WhatsApp
- ✅ Telefone
- ✅ Endereço
- ✅ Pedido Mínimo
- ✅ Loja Aberta/Fechada
- ✅ Delivery Ativo/Inativo

---

**Pronto! Agora deve salvar sem erros.** 🎉
