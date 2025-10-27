const Joi = require('joi');

// Middleware para validar con Joi
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors
      });
    }

    req.body = value;
    next();
  };
};

// Importar schemas
const { createRoleSchema, updateRoleSchema } = require('../schemas/roles.schema');
const { createUserSchema, updateUserSchema } = require('../schemas/users.schema');

// Validaciones para roles
const validateCreateRole = validate(createRoleSchema);
const validateUpdateRole = validate(updateRoleSchema);

// Validaciones para usuarios
const validateCreateUser = validate(createUserSchema);
const validateUpdateUser = validate(updateUserSchema);

module.exports = {
  validateCreateRole,
  validateUpdateRole,
  validateCreateUser,
  validateUpdateUser
};
