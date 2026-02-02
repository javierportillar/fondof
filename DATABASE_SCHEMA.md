# Estructura de Base de Datos - Fondo Fortuna

## Diagrama de Relaciones

```
┌─────────────────┐
│     USERS       │
│─────────────────│
│ id (PK)         │◄──┐
│ cedula (UNIQUE) │   │
│ name            │   │
│ email           │   │
│ phone_number    │   │
│ role            │   │
│ credit_limit    │   │
│ created_at      │   │
└─────────────────┘   │
         │            │
         │            │
    ┌────┴────┬───────┼────────┬──────────┐
    │         │       │        │          │
    ▼         ▼       ▼        ▼          ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐
│SAVINGS │ │SAVINGS│ │SAVINGS│ │LOANS │ │PRODUCTS  │
│ACCOUNTS│ │HISTORY│ │GOALS  │ │      │ │(Public)  │
└────────┘ └──────┘ └──────┘ └──────┘ └──────────┘
  (1:1)     (1:N)    (1:1)    (1:N)
```

## Tablas Detalladas

### 1️⃣ USERS (Usuarios)
**Propósito**: Almacena información de todos los usuarios del sistema.

| Campo          | Tipo        | Restricciones              | Descripción                    |
|----------------|-------------|----------------------------|--------------------------------|
| id             | uuid        | PRIMARY KEY                | Identificador único            |
| cedula         | text        | UNIQUE, NOT NULL           | Cédula (login)                 |
| name           | text        | NOT NULL                   | Nombre completo                |
| email          | text        | NOT NULL                   | Correo electrónico             |
| phone_number   | text        | NOT NULL                   | Teléfono                       |
| role           | text        | CHECK ('ADMIN', 'USER')    | Rol del usuario                |
| credit_limit   | numeric     | DEFAULT 0                  | Cupo de crédito                |
| created_at     | timestamptz | DEFAULT now()              | Fecha de registro              |

**Relaciones**:
- 1:1 con `savings_accounts`
- 1:N con `savings_history`
- 1:1 con `savings_goals`
- 1:N con `loans`

---

### 2️⃣ SAVINGS_ACCOUNTS (Cuentas de Ahorro)
**Propósito**: Una cuenta de ahorro por usuario.

| Campo                  | Tipo        | Restricciones              | Descripción                    |
|------------------------|-------------|----------------------------|--------------------------------|
| id                     | uuid        | PRIMARY KEY                | Identificador único            |
| user_id                | uuid        | UNIQUE, FK → users.id      | Dueño de la cuenta             |
| balance                | numeric     | DEFAULT 0                  | Saldo actual                   |
| monthly_contribution   | numeric     | DEFAULT 0                  | Aporte mensual configurado     |
| last_contribution_date | date        | NULL                       | Fecha del último aporte        |
| interest_earned        | numeric     | DEFAULT 0                  | Intereses ganados              |
| created_at             | timestamptz | DEFAULT now()              | Fecha de creación              |

**Relaciones**:
- N:1 con `users` (ON DELETE CASCADE)

---

### 3️⃣ SAVINGS_HISTORY (Historial de Ahorro)
**Propósito**: Registra todas las transacciones de ahorro.

| Campo      | Tipo        | Restricciones                           | Descripción                    |
|------------|-------------|-----------------------------------------|--------------------------------|
| id         | uuid        | PRIMARY KEY                             | Identificador único            |
| user_id    | uuid        | FK → users.id, NOT NULL                 | Usuario dueño                  |
| date       | date        | NOT NULL, DEFAULT CURRENT_DATE          | Fecha de transacción           |
| amount     | numeric     | NOT NULL                                | Monto de la transacción        |
| type       | text        | CHECK ('DEPOSIT','WITHDRAWAL','INTEREST')| Tipo de movimiento            |
| created_at | timestamptz | DEFAULT now()                           | Fecha de registro              |

**Relaciones**:
- N:1 con `users` (ON DELETE CASCADE)

**Índices**:
- `idx_savings_history_user` (user_id)
- `idx_savings_history_date` (date DESC)

---

### 4️⃣ SAVINGS_GOALS (Metas de Ahorro)
**Propósito**: Meta de ahorro personalizada (una por usuario).

| Campo         | Tipo        | Restricciones              | Descripción                    |
|---------------|-------------|----------------------------|--------------------------------|
| id            | uuid        | PRIMARY KEY                | Identificador único            |
| user_id       | uuid        | UNIQUE, FK → users.id      | Usuario dueño                  |
| name          | text        | NOT NULL                   | Nombre de la meta              |
| target_amount | numeric     | NOT NULL                   | Monto objetivo                 |
| created_at    | timestamptz | DEFAULT now()              | Fecha de creación              |

**Relaciones**:
- N:1 con `users` (ON DELETE CASCADE)

---

### 5️⃣ LOANS (Préstamos)
**Propósito**: Registra todos los préstamos otorgados.

| Campo             | Tipo        | Restricciones                        | Descripción                    |
|-------------------|-------------|--------------------------------------|--------------------------------|
| id                | uuid        | PRIMARY KEY                          | Identificador único            |
| user_id           | uuid        | FK → users.id, NOT NULL              | Usuario prestatario            |
| amount            | numeric     | NOT NULL                             | Monto original                 |
| remaining_amount  | numeric     | NOT NULL                             | Saldo pendiente                |
| interest_rate     | numeric     | NOT NULL                             | Tasa de interés (0.015 = 1.5%) |
| term_months       | integer     | NOT NULL                             | Plazo en meses                 |
| start_date        | date        | NOT NULL                             | Fecha de desembolso            |
| next_payment_date | date        | NOT NULL                             | Próxima fecha de pago          |
| monthly_payment   | numeric     | NOT NULL                             | Valor cuota mensual            |
| status            | text        | CHECK ('Activo','Pendiente','Pagado')| Estado del préstamo           |
| payments_made     | integer     | DEFAULT 0                            | Cuotas pagadas                 |
| created_at        | timestamptz | DEFAULT now()                        | Fecha de creación              |

**Relaciones**:
- N:1 con `users` (ON DELETE CASCADE)

**Índices**:
- `idx_loans_user` (user_id)
- `idx_loans_status` (status)

---

### 6️⃣ PRODUCTS (Productos)
**Propósito**: Catálogo de productos de la tienda solidaria.

| Campo       | Tipo        | Restricciones              | Descripción                    |
|-------------|-------------|----------------------------|--------------------------------|
| id          | uuid        | PRIMARY KEY                | Identificador único            |
| name        | text        | NOT NULL                   | Nombre del producto            |
| category    | text        | NOT NULL                   | Categoría                      |
| price       | numeric     | NOT NULL                   | Precio                         |
| image       | text        | DEFAULT placeholder        | URL de imagen                  |
| stock       | integer     | DEFAULT 0                  | Cantidad disponible            |
| rating      | numeric     | CHECK (0-5), DEFAULT 5.0   | Calificación                   |
| description | text        | NULL                       | Descripción                    |
| is_golden   | boolean     | DEFAULT false              | Producto destacado             |
| created_at  | timestamptz | DEFAULT now()              | Fecha de creación              |

**Relaciones**:
- Sin relaciones (tabla independiente)

**Índices**:
- `idx_products_category` (category)
- `idx_products_golden` (is_golden)

---

## Políticas de Seguridad (RLS)

### Reglas Generales
✅ **RLS HABILITADO** en todas las tablas
✅ Verificación de roles mediante JWT claims
✅ Protección de datos sensibles por usuario

### Permisos por Rol

#### 👤 USUARIOS (USER)
- ✅ Ver su propio perfil
- ✅ Ver su cuenta de ahorro
- ✅ Ver su historial de ahorro
- ✅ Ver/crear/editar su meta de ahorro
- ✅ Ver sus préstamos
- ✅ Ver productos (lectura)

#### 👨‍💼 ADMINISTRADORES (ADMIN)
- ✅ Ver/crear/editar TODOS los usuarios
- ✅ Ver/crear/editar TODAS las cuentas de ahorro
- ✅ Ver/crear/editar TODO el historial de ahorro
- ✅ Ver TODAS las metas de ahorro
- ✅ Ver/crear/editar TODOS los préstamos
- ✅ Ver/crear/editar/eliminar TODOS los productos

---

## Integridad Referencial

### Cascadas (ON DELETE CASCADE)
Cuando se elimina un usuario, automáticamente se eliminan:
- ✅ Su cuenta de ahorro
- ✅ Su historial de transacciones
- ✅ Su meta de ahorro
- ✅ Sus préstamos

Esto garantiza que no queden datos huérfanos en la base de datos.

---

## Índices de Rendimiento

Los siguientes índices optimizan las consultas frecuentes:

| Tabla            | Índice                       | Propósito                           |
|------------------|------------------------------|-------------------------------------|
| users            | idx_users_cedula             | Login rápido por cédula             |
| users            | idx_users_role               | Filtrado por rol                    |
| savings_accounts | idx_savings_user             | Búsqueda por usuario                |
| savings_history  | idx_savings_history_user     | Historial por usuario               |
| savings_history  | idx_savings_history_date     | Ordenamiento cronológico            |
| savings_goals    | idx_savings_goals_user       | Metas por usuario                   |
| loans            | idx_loans_user               | Préstamos por usuario               |
| loans            | idx_loans_status             | Filtrado por estado                 |
| products         | idx_products_category        | Búsqueda por categoría              |
| products         | idx_products_golden          | Productos destacados                |

---

## Próximos Pasos

Para conectar tu aplicación:

1. ✅ **Base de datos creada** - Todas las tablas están listas
2. 🔄 **Configurar cliente Supabase** - Instalar y configurar SDK
3. 🔄 **Migrar datos actuales** - Insertar datos de prueba
4. 🔄 **Actualizar componentes** - Conectar React con Supabase
