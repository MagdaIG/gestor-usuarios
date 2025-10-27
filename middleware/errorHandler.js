const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // Error de validación de Sequelize
  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Error de validación de datos',
      errors
    });
  }

  // Error de restricción única de Sequelize
  if (error.name === 'SequelizeUniqueConstraintError') {
    const errors = error.errors.map(err => ({
      field: err.path,
      message: `${err.path} ya existe`,
      value: err.value
    }));

    return res.status(409).json({
      success: false,
      message: 'Conflicto de datos únicos',
      errors
    });
  }

  // Error de clave foránea de Sequelize
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Referencia a registro inexistente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // Error de conexión a base de datos
  if (error.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      message: 'Error de conexión a la base de datos'
    });
  }

  // Error de timeout de Sequelize
  if (error.name === 'SequelizeTimeoutError') {
    return res.status(408).json({
      success: false,
      message: 'Timeout en la operación de base de datos'
    });
  }

  // Error de JWT (si se usa en el futuro)
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  // Error de autorización JWT
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Error personalizado con código de estado
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }

  // Error genérico del servidor
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

module.exports = errorHandler;
