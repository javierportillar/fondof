# Fondo Fortuna · Sistema de Gestión Cooperativa

Plataforma web integral para la administración financiera de **Fondo Fortuna**, una cooperativa de empleados. El sistema unifica en un solo frontend la tienda de productos de canasta familiar, la gestión de préstamos, el ahorro programado, pedidos por WhatsApp, y un asesor financiero impulsado por IA con Google Gemini.

Los usuarios asociados pueden comprar productos, solicitar préstamos, gestionar su ahorro programado, hacer seguimiento de pedidos y recibir consejos financieros personalizados. Los administradores gestionan usuarios, productos, préstamos, ahorros, pedidos y sugerencias desde un panel centralizado.

> **Estado**: Producción · Desplegado en Firebase Hosting + Supabase + Firebase Functions.

---

## Stack tecnológico

### Frontend

| Componente | Tecnología | Justificación |
|------------|-----------|---------------|
| **Framework** | React 19 + TypeScript 5.8 | Última versión estable con Server Components, Suspense y mejoras de rendimiento. |
| **Build tool** | Vite 6 | Dev server ultrarrápido con HMR, build optimizado con tree-shaking nativo. |
| **Routing** | React Router DOM v7 | Enrutador estándar con loaders, acciones y renderizado condicional por rol. |
| **Estilos** | Tailwind CSS v4 | Utility-first con configuración zero-config vía `@tailwindcss/vite`. |
| **Animaciones** | Framer Motion 12 | Transiciones fluidas y animaciones declarativas con `LayoutGroup` y `AnimatePresence`. |
| **Gráficos** | Recharts 3 | Charting declarativo para tendencias de ahorro y progreso de préstamos. |
| **Iconos** | Lucide React | Iconos SVG ligeros y consistentes. |
| **Drawer/Mobile** | Vaul | Drawer nativo mobile para carrito de compras. |

### Backend & Infraestructura

| Componente | Tecnología | Justificación |
|------------|-----------|---------------|
| **Base de datos** | Supabase (PostgreSQL 16) | Postgres administrado con API REST, Row Level Security, migraciones versionadas. |
| **Backend serverless** | Firebase Functions (Node 24) | Cloud Functions para lógica sensible (IA, secretos) sin servidor dedicado. |
| **Hosting** | Firebase Hosting | CDN global, despliegue automatizado, SSL gratuito. |
| **CI/CD** | GitHub Actions | Build + deploy automático a Firebase en push a `main`. |
| **Asesor IA** | Google Gemini 2.5 Flash (vía Firebase Functions) | Modelo rápido y económico para consejos financieros contextuales con datos reales del usuario. |
| **Auth** | Custom (hash SHA-256 + sesión local) | Sin dependencia de Supabase Auth; manejo manual de sesión vía `localStorage`. |

### Dependencias clave

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.13.0",
  "tailwindcss": "^4.1.17",
  "@supabase/supabase-js": "^2.93.3",
  "framer-motion": "^12.34.0",
  "recharts": "^3.4.1",
  "lucide-react": "^0.554.0",
  "@google/genai": "^1.30.0",
  "vaul": "^1.1.2"
}
```

---

## Arquitectura

```
                         ┌─────────────────────────────────────┐
                         │       Usuario (Browser)              │
                         │  React 19 + Tailwind + Framer Motion │
                         └──────────────┬──────────────────────┘
                                        │ HTTPS
                                        ▼
                   ┌─────────────────────────────────────────┐
                   │         Firebase Hosting (CDN)          │
                   │  fondofortuna.web.app                    │
                   │  /api/** → Firebase Functions            │
                   │  /**     → index.html (SPA fallback)     │
                   └──────────────┬──────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
        ┌─────────────────┐ ┌──────────┐ ┌──────────────┐
        │  Firebase        │ │ Supabase │ │  Gemini 2.5  │
        │  Functions       │ │ Postgres │ │  Flash API   │
        │  (Node 24)       │ │ (RLS)    │ │  (IA asesor) │
        │  /api/financial- │ │          │ │              │
        │  advice          │ │ 10 tabs  │ │              │
        └─────────────────┘ └──────────┘ └──────────────┘
```

### Flujo de datos — Asesor IA

```
Usuario escribe pregunta
       │
       ▼
Advisor.tsx → geminiService.ts → POST /api/financial-advice
       │                              │
       │                         Firebase Functions
       │                         buildPrompt(userContext, query)
       │                              │
       │                         Gemini 2.5 Flash API
       │                         (contexto: nombre, cupo,
       │                          ahorro, deuda activa,
       │                          detalle de préstamos)
       │                              │
       └──────────────────────────────┘
       │
       ▼
  Respuesta en markdown
  renderizada en el chat
```

---

## Estructura del repositorio

```text
fondof/
├── index.html                   ← Entry point HTML (SPA)
├── index.tsx                    ← Mount React + BrowserRouter
├── App.tsx                      ← Routes principales
├── types.ts                     ← Tipos compartidos (Loan, Product, Order, etc.)
├── constants.ts                 ← Datos mock de catálogo y usuarios
├── vite.config.ts               ← Vite + React + Tailwind + alias @
├── tsconfig.json                ← TypeScript config
├── package.json                 ← Dependencias y scripts
├── .env.example                 ← Variables de entorno de referencia
├── .gitignore
├── firebase.json                ← Firebase Hosting + Functions config
├── .firebaserc                  ← Proyecto: fondofortuna
│
├── lib/
│   └── supabase.ts              ← Cliente Supabase inicializado
│
├── contexts/
│   └── AuthContext.tsx           ← AuthProvider + useAuth hook
│
├── services/
│   ├── index.ts                 ← Barrel export de todos los servicios
│   ├── authService.ts           ← Login, signup, password reset, perfil
│   ├── productsService.ts       ← CRUD productos, búsqueda, estadísticas
│   ├── ordersService.ts         ← Pedidos WhatsApp/tienda
│   ├── loansService.ts          ← Préstamos, pagos, estadísticas
│   ├── savingsService.ts        ← Ahorros, aportes, retiros, interés, histórico
│   ├── usersService.ts          ← CRUD usuarios, metas de ahorro, búsqueda
│   └── geminiService.ts         ← Cliente para asesor IA
│
├── components/
│   ├── LoginScreen.tsx          ← Pantalla de inicio de sesión
│   ├── StoreSection.tsx         ← Tienda pública con carrito + WhatsApp
│   ├── Dashboard.tsx            ← Resumen financiero con gráficos
│   ├── LoanSection.tsx          ← Mis préstamos
│   ├── SavingsSection.tsx       ← Ahorro programado
│   ├── Advisor.tsx              ← Asesor IA conversacional
│   ├── UserOrders.tsx           ← Historial de pedidos del usuario
│   ├── UserLayout.tsx           ← Layout usuario con sidebar
│   ├── AdminDashboard.tsx       ← Dashboard administrativo
│   │
│   ├── auth/
│   │   ├── ForgotPassword.tsx   ← Recuperación de contraseña
│   │   └── ResetPassword.tsx    ← Restablecimiento de contraseña
│   │
│   └── admin/
│       ├── AdminLayout.tsx      ← Layout admin con navegación
│       ├── UserList.tsx         ← Gestión de usuarios
│       ├── UserForm.tsx         ← Crear/editar usuario
│       ├── ProductList.tsx      ← Catálogo de productos
│       ├── ProductForm.tsx      ← Crear/editar producto
│       ├── LoanManager.tsx      ← Administración de préstamos
│       ├── SavingsManager.tsx   ← Administración de ahorros
│       ├── SavingsForm.tsx      ← Registrar transacción de ahorro
│       ├── Orders.tsx           ← Pedidos recibidos
│       └── Suggestions.tsx      ← Sugerencias de productos
│
├── data/
│   ├── products.ts              ← Datos iniciales de productos
│   └── users.ts                 ← Datos iniciales de usuarios
│
├── functions/                   ← Firebase Functions (Node 24)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts             ← Cloud Function: /api/financial-advice
│
├── supabase/
│   └── migrations/
│       ├── 20260202T000000_initial_schema.sql
│       └── 20260204T180000_add_users_table.sql
│
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   └── google31d817b67908ae50.html   ← Google Search Console
│
├── .github/
│   └── workflows/
│       ├── deploy.yml               ← CI/CD: build + deploy a Firebase
│       └── firebase-hosting-pull-request.yml
│
├── DATABASE_SCHEMA.md            ← Documentación detallada del esquema
├── DEPLOY_INSTRUCTIONS.md        ← Instrucciones de despliegue
└── SUPABASE_INTEGRATION.md       ← Guía de integración Supabase
```

---

## Modelo de datos

El sistema usa Supabase (PostgreSQL 16) con **10 tablas**, RLS habilitado, y migraciones versionadas.

### Diagrama de relaciones

```
┌─────────────────┐
│     USERS       │
│─────────────────│
│ id (PK)         │◄──┐
│ cedula (UNIQUE) │   │
│ name            │   │
│ email           │   │
│ phone_number    │   │
│ role (ADMIN/USER)│  │
│ credit_limit    │   │
│ password_hash   │   │
│ created_at      │   │
└─────────────────┘   │
     │    │    │       │
     ▼    ▼    ▼       ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐
│SAVINGS │ │SAVINGS│ │SAVINGS│ │LOANS │ │PRODUCTS  │
│ACCOUNTS│ │HISTORY│ │GOALS  │ │      │ │(público) │
│  (1:1) │ │ (1:N) │ │ (1:1) │ │(1:N) │ │          │
└────────┘ └──────┘ └──────┘ └──────┘ └──────────┘
                                          │
                                          ▼
                                    ┌──────────┐
                                    │ PURCHASES│──► PURCHASE_ITEMS
                                    └──────────┘
┌──────────────────┐     ┌──────────────────────┐
│     ORDERS       │     │ PRODUCT_SUGGESTIONS  │
│ (WhatsApp/store) │     │ (sugerencias usuario)│
└──────────────────┘     └──────────────────────┘

┌──────────────────┐
│ PASSWORD_RESETS  │
│ (tokens efímeros)│
└──────────────────┘
```

> Documentación completa del esquema en [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md).

---

## Capacidades del sistema

### 👤 Usuarios (rol USER)

| Módulo | Componente | Descripción |
|--------|-----------|-------------|
| **Tienda** | `StoreSection.tsx` | Catálogo de productos con búsqueda, filtros por categoría, carrito de compras y envío del pedido por WhatsApp. Productos destacados ("Golden"). |
| **Dashboard** | `Dashboard.tsx` | Resumen financiero con gráficos de tendencia de ahorro, progreso de préstamos (BarChart), composición de deuda (PieChart), proyección a futuro. |
| **Préstamos** | `LoanSection.tsx` | Visualización de préstamos activos, historial de pagos, próxima cuota, simulador. |
| **Ahorro** | `SavingsSection.tsx` | Cuenta de ahorro programado con meta personalizada, aportes mensuales, interés acumulado, histórico de transacciones. |
| **Asesor IA** | `Advisor.tsx` | Chat conversacional con Google Gemini 2.5 Flash. El asesor conoce el contexto financiero del usuario (saldo, deuda, ahorro) y da recomendaciones personalizadas. |
| **Pedidos** | `UserOrders.tsx` | Historial de pedidos realizados vía tienda o WhatsApp. |

### 👨‍💼 Administradores (rol ADMIN)

| Módulo | Componente | Descripción |
|--------|-----------|-------------|
| **Usuarios** | `UserList.tsx` + `UserForm.tsx` | CRUD completo de usuarios, asignación de roles, cupo de crédito. |
| **Productos** | `ProductList.tsx` + `ProductForm.tsx` | CRUD del catálogo, gestión de stock, precios, categorías, productos Golden. |
| **Préstamos** | `LoanManager.tsx` | Administración de préstamos por usuario, registro de pagos. |
| **Ahorros** | `SavingsManager.tsx` + `SavingsForm.tsx` | Gestión de cuentas de ahorro, registro de transacciones (depósitos, retiros, intereses). |
| **Pedidos** | `Orders.tsx` | Bandeja de pedidos entrantes (WhatsApp/tienda), confirmación, cambio de estado. |
| **Sugerencias** | `Suggestions.tsx` | Productos sugeridos por usuarios con imagen. |

---

## Auth

El sistema implementa autenticación **custom** (sin Supabase Auth):

1. **Registro**: El admin crea usuarios con cédula, nombre, email, rol y cupo. La contraseña se hashea con SHA-256 en el cliente antes de almacenarse.
2. **Login**: El usuario ingresa email + contraseña. El servicio compara el hash contra la tabla `users`.
3. **Sesión**: Se guarda `session_user_id` en `localStorage`. Al recargar, `AuthContext` recupera el perfil completo desde Supabase.
4. **Password reset**: Flujo de dos pasos: (1) ingresa email → se solicita cédula, (2) se valida cédula → se genera token efímero (30 min) en tabla `password_resets`.

**Roles**: `ADMIN` y `USER`. Las rutas administrativas están protegidas por verificación de rol en `App.tsx`.

---

## Rutas de la aplicación (SPA)

| Ruta | Acceso | Componente |
|------|--------|-----------|
| `/` | Público | `StoreSection` (tienda pública) |
| `/store` | Público | `StoreSection` |
| `/login` | Público | `LoginScreen` |
| `/forgot-password` | Público | `ForgotPassword` |
| `/reset-password` | Público | `ResetPassword` |
| `/dashboard` | USER | `Dashboard` |
| `/loans` | USER | `LoanSection` |
| `/savings` | USER | `SavingsSection` |
| `/orders` | USER | `UserOrders` |
| `/advisor` | USER | `Advisor` |
| `/admin` | ADMIN | `AdminLayout` → `UserList` |
| `/admin/users/new` | ADMIN | `UserForm` |
| `/admin/products` | ADMIN | `ProductList` |
| `/admin/products/new` | ADMIN | `ProductForm` |
| `/admin/orders` | ADMIN | `Orders` |
| `/admin/suggestions` | ADMIN | `Suggestions` |
| `/admin/users/:userId/loans` | ADMIN | `LoanManager` |
| `/admin/users/:userId/savings` | ADMIN | `SavingsManager` |
| `/admin/users/:userId/savings/new` | ADMIN | `SavingsForm` |
| `/admin/users/:userId/savings/edit/:txnId` | ADMIN | `SavingsForm` |

---

## Instalación local

### Prerrequisitos

| Software | Versión | Cómo obtenerlo |
|----------|---------|----------------|
| Node.js | 20+ | `brew install node` o desde nodejs.org |
| npm | 10+ | Viene con Node.js |
| Firebase CLI | última | `npm install -g firebase-tools` |

### Bootstrap

```bash
# 1. Clonar
git clone git@github.com:tu-usuario/fondof.git
cd fondof

# 2. Instalar dependencias
npm install

# 3. Variables de entorno
cp .env.example .env.local
```

### Configuración del `.env.local`

```env
# Supabase (obligatorio)
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_ANON_KEY="tu-anon-key"

# Gemini API Key (opcional, para asesor IA local)
VITE_GOOGLE_AI_API_KEY="tu-api-key"

# Backend local (opcional, apunta a Firebase Emulator)
VITE_AI_API_URL="http://127.0.0.1:5001/fondofortuna/us-central1/api/financial-advice"
```

### 4. Inicializar Supabase

Aplicar migraciones desde `supabase/migrations/`:

```bash
# Usando Supabase CLI
supabase link --project-ref tu-project-ref
supabase db push
```

O ejecutar manualmente los SQL de migración desde el dashboard de Supabase.

### 5. Inicializar Firebase Functions (opcional, para asesor IA)

```bash
cd functions
npm install
cd ..

# Configurar secreto de Gemini
firebase functions:secrets:set GEMINI_API_KEY

# Iniciar emuladores
firebase emulators:start --only functions
```

### 6. Correr en desarrollo

```bash
npm run dev
# Abre http://localhost:3000
```

---

## Despliegue

### Firebase Hosting

```bash
npm run deploy
# Ejecuta: vite build && firebase deploy --only hosting
```

### CI/CD (GitHub Actions)

El archivo `.github/workflows/deploy.yml` despliega automáticamente a Firebase Hosting en cada push a `main`:

```yaml
# Build + deploy automático
# Secrets requeridos en GitHub:
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_ANON_KEY
#   VITE_GOOGLE_AI_API_KEY
#   FIREBASE_SERVICE_ACCOUNT
```

### Firebase Functions

```bash
cd functions
npm run deploy
# firebase deploy --only functions
```

---

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Anon key pública de Supabase |
| `VITE_GOOGLE_AI_API_KEY` | ❌ | API key de Google AI para asesor local |
| `VITE_AI_API_URL` | ❌ | URL del backend AI (default: `/api/financial-advice`) |
| `GEMINI_API_KEY` | ❌ | Secreto de Firebase Functions para Gemini |

---

## Decisiones técnicas

### D-01 — Auth custom sobre Supabase Auth

**Problema**: Supabase Auth requiere flujo de confirmación por email, lo que añade complejidad para una cooperativa pequeña donde los administradores crean usuarios manualmente.

**Decisión**: Implementar autenticación propia con hash SHA-256 en cliente y almacenamiento directo en tabla `users`. Sesión manejada vía `localStorage`.

**Consecuencia**: Menos dependencias externas, pero sin beneficios de Supabase Auth (MFA, OAuth, recovery automático). El hash SHA-256 del lado del cliente no es ideal para producción seria — para producción real se recomienda migrar a Supabase Auth o usar bcrypt server-side.

### D-02 — Firebase Functions para el asesor IA

**Problema**: Llamar a Gemini directamente desde el frontend expondría la API key.

**Decisión**: La API key de Gemini vive como secreto en Firebase Functions. El frontend llama a `/api/financial-advice` que construye el prompt con el contexto financiero del usuario (nombre, saldo, deuda, préstamos) y llama a Gemini 2.5 Flash.

**Tradeoff**: Latencia adicional del cold start de Cloud Functions, pero las API keys nunca llegan al cliente.

### D-03 — Un solo prompt rico para el asesor

**Problema**: El asesor IA necesita entender la situación financiera del usuario sin múltiples llamadas.

**Decisión**: El `buildPrompt()` en `functions/src/index.ts` construye un prompt único con: nombre, cupo de crédito, saldo de ahorro, aporte mensual, deuda total, y detalle completo de cada préstamo (monto, saldo, tasa, cuota, estado, próximo pago).

**Instrucciones del prompt**: Responder en español, ser conciso y práctico, usar markdown, priorizar ahorro si detecta endeudamiento alto, no inventar políticas internas.

### D-04 — Pedidos integrados vía WhatsApp

**Problema**: La cooperativa necesita recibir pedidos sin una pasarela de pago compleja.

**Decisión**: El carrito de compras arma un mensaje de texto con el detalle del pedido (productos, cantidades, total) y lo envía por WhatsApp vía `wa.me` link. El número configurable está en `WHATSAPP_NUMBER` dentro de `StoreSection.tsx`.

**Consecuencia**: Sin pasarela de pago integrada, pero el pedido queda registrado en la tabla `orders` de Supabase para que el administrador lo confirme manualmente.

### D-05 — RLS abierto (sin auth de Supabase)

**Problema**: Como no usamos Supabase Auth, `auth.uid()` no está disponible para RLS.

**Decisión**: Las políticas RLS permiten lectura/escritura a todos los usuarios autenticados vía la API anon key. La seguridad a nivel de aplicación se maneja en el frontend verificando el rol (`ADMIN` vs `USER`).

**Riesgo conocido**: Para producción con datos reales, se debe migrar a Supabase Auth y ajustar las políticas RLS para que usen `auth.uid()` correctamente.

### D-06 — Hash SHA-256 en cliente

**Problema**: Firebase Functions no tiene acceso a una librería de hashing de passwords, y no queríamos depender de un servidor para login.

**Decisión**: El hash SHA-256 se calcula en el cliente (`crypto.subtle.digest`) tanto en registro como en login.

**Advertencia**: SHA-256 no es un algoritmo de hashing de contraseñas apropiado (no tiene sal ni factor de trabajo). Para producción real, usar bcrypt o argon2 server-side.

### D-07 — Productos Golden

**Decisión**: Productos destacados con el flag `is_golden`. Se muestran con un ícono de estrella en la tienda y tienen su propia categoría de filtro. Útil para promociones, rotación de inventario o productos recomendados por la cooperativa.

---

## Troubleshooting

### Error: "No se pudo obtener respuesta de la IA"

Posibles causas:
- Firebase Functions no está desplegadas o el emulador no corre.
- El secreto `GEMINI_API_KEY` no está configurado.
- La cuota de Gemini se agotó.

Verificar:
```bash
firebase functions:secrets:get GEMINI_API_KEY
firebase deploy --only functions
```

### Error: "Invalid login credentials"

- Verificar que el usuario existe en la tabla `users` de Supabase.
- Si el usuario fue creado antes de la migración actual, podría no tener `password_hash`.
- El hash SHA-256 se genera en el cliente, asegurar que ambos extremos usan el mismo algoritmo.

### Error: "Failed to fetch" en la tienda

- Verificar que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están configuradas en `.env.local`.
- Verificar que las tablas existen en Supabase y tienen datos.
- Verificar CORS: la API anon key pública permite requests desde cualquier origen.

### El carrito no envía el mensaje de WhatsApp

- Verificar el número en `WHATSAPP_NUMBER` (código de país incluido, sin `+`).
- WhatsApp Web debe estar accesible en el dispositivo.
- Probar manualmente: `https://wa.me/573105830555?text=...`

---

## Pruebas y cobertura

El proyecto actualmente **no tiene tests automatizados**. Esta es una deuda técnica identificada:

| Área | Prioridad | Estado |
|------|-----------|--------|
| Tests unitarios de servicios | Alta | ❌ Pendiente |
| Tests de integración con Supabase | Alta | ❌ Pendiente |
| Tests de componentes React | Media | ❌ Pendiente |
| Tests E2E (Playwright) | Media | ❌ Pendiente |
| Smoke test del asesor IA | Alta | ✅ Manual |

> Los tests manuales se realizan contra el emulador local de Firebase y la base de datos de Supabase en desarrollo.

---

## Riesgos conocidos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Cuota gratuita de Gemini se agota | Media | Medio (asesor IA no responde) | Mostrar error amigable; implementar fallback a modelo local |
| Firebase Functions cold start > 5s | Alta | Medio (primera pregunta lenta) | Mantener una instancia activa con `minInstances` |
| Supabase anon key expuesta en cliente | Alta | Bajo (RLS + políticas restrictivas) | Las políticas RLS limitan el daño potencial |
| Pérdida de sesión por limpieza de localStorage | Media | Bajo (re-login) | El usuario puede volver a iniciar sesión |
| Hash SHA-256 interceptado en tránsito | Baja | Alto | Mitigado por HTTPS obligatorio en Firebase Hosting |

---

## Roadmap

```
✅ Fase 1   Frontend React + Tailwind + routing + mock data
✅ Fase 2   Supabase + migraciones + RLS + servicios
✅ Fase 3   Tienda con carrito + envío WhatsApp
✅ Fase 4   Gestión de préstamos y ahorros
✅ Fase 5   Panel administrativo completo
✅ Fase 6   Asesor IA con Gemini + Firebase Functions
✅ Fase 7   CI/CD + Firebase Hosting + despliegue
───────────────────────────────────────────────
⬜ V2       Migrar a Supabase Auth con MFA
⬜ V2       Bcrypt/argon2 server-side para passwords
⬜ V2       Tests automatizados (Vitest + Playwright)
⬜ V2       Dashboard con exportación de datos (CSV/PDF)
⬜ V2       Pagos integrados (Mercado Pago / Nequi API)
⬜ V2       Modo offline con Service Workers
```

---

## Cómo navegar este repo

| Vengo a... | Empiezo por |
|-----------|-------------|
| Entender el sistema completo | Este `README.md` |
| Ver el esquema de base de datos | [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) |
| Desplegar la aplicación | [`DEPLOY_INSTRUCTIONS.md`](DEPLOY_INSTRUCTIONS.md) |
| Integrar Supabase | [`SUPABASE_INTEGRATION.md`](SUPABASE_INTEGRATION.md) |
| Ver el código del asesor IA | `functions/src/index.ts` + `services/geminiService.ts` |
| Agregar un nuevo feature | Revisar `types.ts` → crear/actualizar servicio → crear componente → agregar ruta en `App.tsx` |
| Reportar un bug | Abrir issue en el repositorio |

---

## Reglas que no negocio

1. **Las API keys nunca van al código.** Viven en `.env.local` (gitignored) o como secrets de Firebase Functions.
2. **Cada usuario ve solo sus datos.** Aunque RLS está abierto, el frontend filtra por `userId` en todas las consultas.
3. **El asesor IA no inventa datos financieros.** El prompt incluye explícitamente "No inventes políticas internas ni aprobaciones de crédito".
4. **No hay datos sensibles en el repositorio.** `.env`, `node_modules`, `dist` están en `.gitignore`.
5. **Las migraciones SQL son el source of truth.** Cualquier cambio de esquema debe pasar por una migración versionada.

---

## Créditos

**Fondo Fortuna** — Sistema de gestión cooperativa desarrollado para la administración financiera de asociados, incluyendo tienda de canasta familiar, préstamos, ahorro programado y asesoría financiera con IA.

Desarrollado por **Javier Portilla Rosero** · 2026

---

*¿Preguntas o sugerencias? Los issues del repo están abiertos.*
