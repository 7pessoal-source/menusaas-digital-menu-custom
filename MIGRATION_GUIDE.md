# 🔄 Guia de Migração do Projeto Original

## O que mudou?

### 1. Estrutura de Arquivos

**Antes:**
```
/
├── components/
├── services/
├── App.tsx
├── types.ts
└── mockData.ts
```

**Depois:**
```
src/
├── components/
│   ├── common/
│   ├── layout/
│   └── features/
├── pages/
├── services/
├── stores/
├── hooks/
├── utils/
├── constants/
└── types/
```

### 2. Gerenciamento de Estado

**Antes:** useState hooks locais
```typescript
const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
```

**Depois:** Zustand stores
```typescript
import { useRestaurantStore } from '@/stores/restaurantStore';
const { restaurants, setRestaurants } = useRestaurantStore();
```

### 3. Navegação

**Antes:** Estados para controlar views
```typescript
const [view, setView] = useState<'landing' | 'auth' | 'admin'>('landing');
```

**Depois:** React Router
```typescript
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/admin');
```

### 4. Componentes

**Antes:** Tudo em um arquivo App.tsx gigante

**Depois:** Separados por responsabilidade
- `src/components/common/` - Componentes reutilizáveis
- `src/components/features/` - Componentes específicos
- `src/pages/` - Páginas completas

### 5. Importações

**Antes:**
```typescript
import { Restaurant } from './types';
import { supabase } from './services/supabase';
```

**Depois:** Path aliases
```typescript
import { Restaurant } from '@types/index';
import { supabase } from '@services/supabase';
```

### 6. Variáveis de Ambiente

**Antes:** Direto no código
```typescript
const SUPABASE_URL = 'https://...';
```

**Depois:** .env files
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
```

## Como Migrar Seu Código

### 1. Mover Lógica de Estado

Se você tem:
```typescript
// Old
const [products, setProducts] = useState([]);
```

Mude para:
```typescript
// New
import { useRestaurantStore } from '@/stores/restaurantStore';
const { products, setProducts } = useRestaurantStore();
```

### 2. Converter Navegação

Se você tem:
```typescript
// Old
setView('admin');
```

Mude para:
```typescript
// New
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/admin');
```

### 3. Usar Hooks Personalizados

Em vez de ter toda a lógica no componente:
```typescript
// Old
const fetchProducts = async () => {
  const { data } = await supabase.from('products').select('*');
  setProducts(data);
};
```

Use hooks:
```typescript
// New
import { useProducts } from '@hooks/useProducts';
const { products, saveProduct, removeProduct } = useProducts();
```

### 4. Adicionar Tipagem Adequada

```typescript
// Old
const saveProduct = (data: any) => { ... }

// New
import { ProductFormData } from '@types/index';
const saveProduct = (data: ProductFormData) => { ... }
```

## Checklist de Migração

- [ ] Mover variáveis para .env.local
- [ ] Atualizar imports com path aliases
- [ ] Converter state local para Zustand stores
- [ ] Converter navegação para React Router
- [ ] Adicionar tipagem TypeScript adequada
- [ ] Mover lógica complexa para hooks personalizados
- [ ] Extrair componentes reutilizáveis
- [ ] Adicionar testes para novas funcionalidades

## Executando o Projeto Refatorado

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 3. Executar
npm run dev

# 4. Build
npm run build
```

## Problemas Comuns

### Erro: "Cannot find module @components"
**Solução:** Certifique-se de que o tsconfig.json e vite.config.ts têm os path aliases configurados.

### Erro: "Supabase credentials missing"
**Solução:** Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local

### Erro de imports
**Solução:** Use imports absolutos com @ ao invés de relativos:
```typescript
// ❌ Errado
import { Button } from '../../components/common/Button';

// ✅ Correto
import { Button } from '@components/common';
```

## Recursos Adicionais

- [Zustand Docs](https://zustand-demo.pmnd.rs)
- [React Router Docs](https://reactrouter.com)
- [Vite Docs](https://vitejs.dev)
