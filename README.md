# Users & Roles – Node, Express, PostgreSQL y Sequelize (con Frontend Bootstrap)

## Introducción

Te explico qué hace este proyecto y por qué lo construí de esta manera. Este es un sistema completo de gestión de usuarios y roles que demuestra las mejores prácticas en desarrollo web moderno. Lo diseñé para mostrar cómo manejar relaciones complejas entre entidades de base de datos usando Sequelize como ORM.

Lo que hace especial a este proyecto es que implementa los tres tipos principales de relaciones de base de datos:
- **Relación 1:1** (uno a uno): Cada usuario puede tener un perfil personalizado
- **Relación 1:N** (uno a muchos): Un rol puede tener muchos usuarios asignados
- **Relación N:M** (muchos a muchos): Un usuario puede tener múltiples roles y un rol puede ser asignado a varios usuarios

Además, uso transacciones para asegurar que todas las operaciones complejas (como crear un usuario con perfil y roles múltiples) se ejecuten de manera atómica, manteniendo la integridad de los datos.

## Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web minimalista
- **PostgreSQL** - Base de datos relacional robusta
- **Sequelize** - ORM para manejo de base de datos
- **Joi** - Validación de esquemas
- **bcryptjs** - Hash de contraseñas
- **UUID** - Identificadores únicos universales

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos personalizados
- **Bootstrap 5** - Framework CSS responsivo
- **JavaScript ES6+** - Lógica del cliente con módulos
- **Fetch API** - Comunicación con el backend

## Requisitos Previos

Antes de empezar, necesitas tener instalado:
- Node.js (versión 16 o superior)
- npm (viene con Node.js)
- PostgreSQL (versión 12 o superior)

## Cómo Ejecutar el Proyecto

Te guío paso a paso para que puedas ejecutar el proyecto:

### 1. Clonar y configurar el proyecto
```bash
git clone <url-del-repositorio>
cd app-gestor-usuario
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de PostgreSQL:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestor_usuarios
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_DIALECT=postgres
PORT=3001
NODE_ENV=development
SALT_ROUNDS=10
```

### 4. Ejecutar migraciones
```bash
npm run db:migrate
```

### 5. Poblar con datos de ejemplo (opcional)
```bash
npm run db:seed
```

### 6. Iniciar el servidor
```bash
npm run dev
```

### 7. Abrir en el navegador
Visita `http://localhost:3001` para acceder al frontend.

## Estructura del Proyecto

Te explico cómo está organizado el código:

```
app-gestor-usuario/
├── config/
│   ├── config.js          # Configuración de Sequelize CLI
│   ├── config.json        # Configuración de base de datos
│   └── database.js        # Conexión a la base de datos
├── controllers/
│   ├── RolController.js   # Lógica de negocio para roles
│   └── UsuarioController.js # Lógica de negocio para usuarios
├── middleware/
│   ├── errorHandler.js    # Manejo centralizado de errores
│   └── validations.js     # Validación de requests
├── migrations/            # Migraciones de base de datos
├── models/
│   ├── index.js          # Configuración de modelos y asociaciones
│   ├── Rol.js            # Modelo de roles
│   ├── Usuario.js         # Modelo de usuarios
│   ├── UserProfile.js     # Modelo de perfiles (relación 1:1)
│   └── UserRoles.js       # Tabla pivote (relación N:M)
├── public/                # Frontend estático
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css # Estilos personalizados
│   │   └── js/
│   │       ├── api.js     # Funciones para llamadas API
│   │       ├── config.js  # Configuración del frontend
│   │       ├── ui.js      # Utilidades de interfaz
│   │       ├── validators.js # Validaciones del cliente
│   │       ├── users.js   # Lógica de gestión de usuarios
│   │       ├── user-detail.js # Detalle de usuario
│   │       ├── roles.js   # Lógica de gestión de roles
│   │       └── components/
│   │           └── templates.js # Plantillas HTML
│   ├── index.html         # Dashboard principal
│   ├── users.html         # Lista de usuarios
│   ├── user-detail.html   # Detalle de usuario
│   └── roles.html         # Gestión de roles
├── routes/
│   └── api.js             # Rutas de la API
├── schemas/
│   ├── roles.schema.js    # Esquemas de validación para roles
│   └── users.schema.js    # Esquemas de validación para usuarios
├── seeders/               # Datos de ejemplo
├── services/
│   └── TransaccionService.js # Servicios transaccionales
├── utils/
│   └── hash.js            # Utilidades para hash de contraseñas
├── app.js                 # Archivo principal del servidor
├── package.json           # Dependencias y scripts
└── README.md              # Este archivo
```

## Endpoints Principales de la API

Te explico los endpoints disponibles:

### Roles
- `GET /api/roles` - Listar todos los roles
- `GET /api/roles/:id` - Obtener un rol específico
- `POST /api/roles` - Crear un nuevo rol
- `PUT /api/roles/:id` - Actualizar un rol
- `DELETE /api/roles/:id` - Eliminar un rol

### Usuarios
- `GET /api/users` - Listar usuarios (con paginación)
- `GET /api/users/:id` - Obtener detalles de un usuario
- `POST /api/users` - Crear un nuevo usuario
- `PUT /api/users/:id` - Actualizar un usuario
- `DELETE /api/users/:id` - Eliminar un usuario

### Utilidades
- `GET /api/health` - Verificar estado del servidor

## Relaciones y Transacciones

Te explico cómo funcionan las relaciones y por qué uso transacciones:

### Relación 1:1 (Usuario ↔ Perfil)
Cada usuario puede tener un perfil personalizado con información adicional como biografía y avatar. Uso esta relación para demostrar cómo manejar datos opcionales de manera eficiente.

### Relación 1:N (Rol → Usuarios)
Un rol puede tener muchos usuarios asignados, pero cada usuario tiene un rol principal. Esta es la relación más común en sistemas de gestión de usuarios.

### Relación N:M (Usuarios ↔ Roles)
Un usuario puede tener múltiples roles adicionales, y un rol puede ser asignado a varios usuarios. Implemento esto con una tabla pivote `UserRoles` que almacena las relaciones.

### Transacciones
Uso transacciones en operaciones complejas como:
- **Crear usuario**: Crear usuario + perfil + asignar roles múltiples
- **Actualizar usuario**: Actualizar datos + sincronizar roles + actualizar perfil
- **Eliminar usuario**: Eliminar perfil + limpiar relaciones + eliminar usuario

Esto asegura que si cualquier parte de la operación falla, todo se revierte, manteniendo la integridad de los datos.

## Frontend

Te explico cómo funciona la interfaz de usuario:

### Dashboard
El dashboard muestra estadísticas generales del sistema: total de usuarios, total de roles y fecha del último usuario creado. También incluye acciones rápidas y estado del sistema.

### Gestión de Usuarios
- **Lista de usuarios**: Tabla responsiva con paginación, búsqueda y filtros
- **Crear usuario**: Modal con formulario completo incluyendo perfil y roles múltiples
- **Editar usuario**: Misma interfaz que crear, pero pre-poblada con datos existentes
- **Ver detalles**: Página dedicada con toda la información del usuario
- **Eliminar usuario**: Confirmación antes de eliminar

### Gestión de Roles
- **Lista de roles**: Tabla simple con acciones básicas
- **CRUD completo**: Crear, editar y eliminar roles con validaciones

### Características del Frontend
- **Responsivo**: Funciona perfectamente en móviles y tablets
- **Validaciones**: Validación tanto en cliente como servidor
- **Feedback visual**: Toasts para notificaciones, spinners para carga
- **Accesibilidad**: Labels apropiados, aria-labels, roles semánticos

## Pruebas Manuales Rápidas

Te muestro cómo probar el sistema:

### Con curl (API)
```bash
# Verificar estado del servidor
curl http://localhost:3001/api/health

# Crear un rol
curl -X POST http://localhost:3001/api/roles \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Editor","descripcion":"Puede editar contenido"}'

# Crear un usuario
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "nombre":"Juan Pérez",
    "correo":"juan@ejemplo.com",
    "password":"password123",
    "rol_id":"<id-del-rol>",
    "profile":{"bio":"Desarrollador frontend","avatarUrl":"https://example.com/avatar.jpg"}
  }'

# Listar usuarios
curl http://localhost:3001/api/users
```

### Con la Interfaz Web
1. Abre `http://localhost:3001`
2. Ve a "Roles" y crea un nuevo rol
3. Ve a "Usuarios" y crea un usuario con perfil
4. Haz clic en el ícono del ojo para ver detalles
5. Edita el usuario y cambia sus roles
6. Prueba la búsqueda y filtros

## Buenas Prácticas Aplicadas

Te explico las buenas prácticas que implementé:

### Seguridad
- **Hash de contraseñas**: Uso bcryptjs con salt rounds configurables
- **Validación de entrada**: Joi para validar todos los datos de entrada
- **Sanitización**: Limpieza de datos antes de guardar en base de datos

### Manejo de Errores
- **Middleware centralizado**: Un solo lugar para manejar errores
- **Logging**: Registro de errores para debugging
- **Respuestas consistentes**: Formato uniforme para errores y éxitos

### Base de Datos
- **Transacciones**: Para operaciones complejas
- **Índices únicos**: Para emails y nombres de roles
- **Cascadas**: Eliminación automática de datos relacionados
- **UUIDs**: Identificadores únicos universales

### Frontend
- **Modularidad**: Código JavaScript organizado en módulos
- **Responsive design**: Funciona en todos los dispositivos
- **Accesibilidad**: Cumple estándares de accesibilidad web
- **UX**: Feedback visual claro para todas las acciones

### Código Limpio
- **Separación de responsabilidades**: Controladores, servicios, modelos
- **Comentarios JSDoc**: Documentación en el código
- **Convenciones**: Nombres consistentes y estructura clara
- **Reutilización**: Funciones utilitarias compartidas

## Scripts Disponibles

```bash
npm start          # Iniciar en producción
npm run dev        # Iniciar en desarrollo con nodemon
npm run db:migrate # Ejecutar migraciones
npm run db:migrate:undo # Revertir última migración
npm run db:seed    # Poblar con datos de ejemplo
npm run db:seed:undo # Eliminar datos de ejemplo
```

## Créditos

**Desarrollado por:** Magdalena Inalaf

- **LinkedIn:** [https://www.linkedin.com/in/minalaf/](https://www.linkedin.com/in/minalaf/)
- **GitHub:** [https://github.com/MagdaIG](https://github.com/MagdaIG)
- **Sitio Web:** [https://inalaf.ca/](https://inalaf.ca/)

Este proyecto fue desarrollado como demostración de las mejores prácticas en desarrollo web moderno, mostrando cómo implementar un sistema completo de gestión de usuarios con relaciones complejas de base de datos y una interfaz de usuario profesional.
