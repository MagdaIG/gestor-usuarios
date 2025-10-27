const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './config.env' });

// Importar configuración de base de datos y modelos
const { testConnection, closeConnection } = require('./config/database');
const { Usuario, Rol } = require('./models');

// Importar rutas
const apiRoutes = require('./routes/api');
const transaccionRoutes = require('./routes/transacciones');

// Importar middleware de manejo de errores
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api', apiRoutes);
app.use('/api/transacciones', transaccionRoutes);

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta principal - servir el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta de información de la API (mover a /api/info)
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    message: 'API de Gestión de Usuarios y Roles',
    version: '1.0.0',
    endpoints: {
      usuarios: {
        'GET /api/usuarios': 'Obtener todos los usuarios',
        'GET /api/usuarios/:id': 'Obtener usuario por ID',
        'POST /api/usuarios': 'Crear nuevo usuario',
        'PUT /api/usuarios/:id': 'Actualizar usuario',
        'DELETE /api/usuarios/:id': 'Eliminar usuario'
      },
      roles: {
        'GET /api/roles': 'Obtener todos los roles',
        'GET /api/roles/:id': 'Obtener rol por ID',
        'POST /api/roles': 'Crear nuevo rol',
        'PUT /api/roles/:id': 'Actualizar rol',
        'DELETE /api/roles/:id': 'Eliminar rol',
        'GET /api/roles/:id/usuarios': 'Obtener usuarios por rol'
      },
      transacciones: {
        'POST /api/transacciones/asignar-usuarios-rol': 'Asignar múltiples usuarios a un rol',
        'POST /api/transacciones/transferir-usuarios-rol': 'Transferir usuarios de un rol a otro',
        'DELETE /api/transacciones/eliminar-rol-reasignar/:rolId': 'Eliminar rol y reasignar usuarios',
        'POST /api/transacciones/crear-usuario-con-rol': 'Crear usuario con rol en una operación'
      }
    }
  });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Middleware global para manejo de errores
app.use(errorHandler);

// Función para inicializar la aplicación
const initializeApp = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();

    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Sincronizando modelos con la base de datos...');
      await Usuario.sync({ alter: false });
      await Rol.sync({ alter: false });
      console.log('✅ Modelos sincronizados correctamente');
    }

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
      console.log(`🌐 Frontend disponible en http://localhost:${PORT}`);
      console.log(`📖 API disponible en http://localhost:${PORT}/api`);
      console.log(`🏥 Health check en http://localhost:${PORT}/health`);
    });

    // Manejo de cierre graceful
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Recibida señal ${signal}. Cerrando servidor...`);

      server.close(async () => {
        console.log('🔒 Servidor HTTP cerrado');
        await closeConnection();
        console.log('👋 Aplicación cerrada correctamente');
        process.exit(0);
      });
    };

    // Escuchar señales de cierre
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Error al inicializar la aplicación:', error);
    process.exit(1);
  }
};

// Inicializar aplicación
initializeApp();

module.exports = app;
