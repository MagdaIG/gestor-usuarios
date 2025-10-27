const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './config.env' });

// Configuración de la conexión (SQLite para pruebas, PostgreSQL para producción)
const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || './database.sqlite',
  // Configuración para PostgreSQL (si se especifica)
  ...(process.env.DB_DIALECT === 'postgres' && {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'gestor_usuarios',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error.message);
    process.exit(1);
  }
};

// Función para cerrar la conexión
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('🔒 Conexión a PostgreSQL cerrada correctamente');
  } catch (error) {
    console.error('❌ Error al cerrar la conexión:', error.message);
  }
};

module.exports = {
  sequelize,
  testConnection,
  closeConnection
};
