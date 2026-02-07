# MenuSaaS - Digital Menu Platform (Refactored)

## 🚀 Melhorias Implementadas

### 1. **Estrutura de Projeto Escalável**
```
src/
├── components/
│   ├── common/          # Componentes reutilizáveis (Button, Input, Modal)
│   ├── layout/          # Layouts (Header, Sidebar, Footer)
│   └── features/        # Componentes específicos de funcionalidades
├── pages/               # Páginas principais
├── services/
│   ├── api/            # Serviços de API
│   ├── auth/           # Autenticação
│   └── storage/        # LocalStorage
├── stores/             # Zustand stores (estado global)
├── hooks/              # Custom React hooks
├── utils/              # Funções utilitárias
├── constants/          # Constantes da aplicação
├── types/              # TypeScript types
└── styles/             # Estilos globais
```

### 2. **Gerenciamento de Estado com Zustand**
- `authStore`: Gerencia autenticação e sessão do usuário
- `restaurantStore`: Gerencia dados de restaurantes, categorias e produtos
- `appStore`: Gerencia estado global da aplicação

### 3. **Roteamento com React Router**
- Rotas protegidas para área administrativa
- Rotas públicas para visualização de cardápios
- Navegação programática

### 4. **Hooks Personalizados**
- `useRestaurant`: Gerencia operações de restaurante
- `useProducts`: Gerencia CRUD de produtos
- Hooks reutilizáveis para lógica compartilhada

### 5. **Componentes Reutilizáveis**
- Button, Input, Modal com variantes e tamanhos
- Sistema de design consistente
- TypeScript para type safety

### 6. **Serviços Refatorados**
- Supabase com singleton pattern
- Gemini AI com error handling melhorado
- API service com Axios e interceptors

### 7. **Utilitários**
- Formatação de moeda, data, telefone
- Validações (email, WhatsApp)
- Class name utility (cn)

### 8. **Variáveis de Ambiente**
- Configuração centralizada
- Suporte a múltiplos ambientes
- Feature flags

### 9. **TypeScript Melhorado**
- Path aliases (@components, @services, etc)
- Tipos bem definidos
- Strict mode habilitado

### 10. **Ferramentas de Desenvolvimento**
- ESLint para linting
- Vitest para testes
- TailwindCSS configurado
- PostCSS

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local

# Editar .env.local e adicionar suas chaves
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_GEMINI_API_KEY

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com UI
npm run test:ui

# Coverage
npm run test:coverage
```

## 🔒 Segurança

- Variáveis de ambiente nunca commitadas
- Validação de inputs
- Sanitização de dados
- CORS configurado
- Rate limiting (implementar no backend)

## 📝 Próximos Passos

### Backend
- [ ] Criar API REST ou GraphQL
- [ ] Implementar autenticação JWT
- [ ] Rate limiting
- [ ] Logging e monitoramento

### Frontend
- [ ] Testes unitários completos
- [ ] Testes E2E com Cypress
- [ ] PWA (Progressive Web App)
- [ ] Internacionalização (i18n)

### DevOps
- [ ] CI/CD com GitHub Actions
- [ ] Docker & Docker Compose
- [ ] Deploy automático
- [ ] Monitoramento (Sentry)

### Features
- [ ] Integração com Stripe para pagamentos
- [ ] Analytics (Posthog/Mixpanel)
- [ ] Notificações push
- [ ] Chat de suporte

## 🏗️ Arquitetura

### Padrões Utilizados
- **Singleton**: Supabase client
- **Factory**: Serviços
- **Observer**: Zustand stores
- **Facade**: API service

### Boas Práticas
- Separação de responsabilidades
- DRY (Don't Repeat Yourself)
- SOLID principles
- Clean Code

## 📚 Documentação

Para mais informações sobre as tecnologias utilizadas:

- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Zustand](https://zustand-demo.pmnd.rs)
- [React Router](https://reactrouter.com)
- [Supabase](https://supabase.com)

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
