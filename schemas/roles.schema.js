const Joi = require('joi');

const roleSchema = {
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'El nombre del rol debe tener al menos 2 caracteres',
      'string.max': 'El nombre del rol no puede exceder 50 caracteres',
      'any.required': 'El nombre del rol es requerido'
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'La descripción no puede exceder 500 caracteres'
    })
};

const createRoleSchema = Joi.object({
  nombre: roleSchema.name,
  descripcion: roleSchema.description
});

const updateRoleSchema = Joi.object({
  nombre: roleSchema.name.optional(),
  descripcion: roleSchema.description,
  activo: Joi.boolean().optional()
});

module.exports = {
  createRoleSchema,
  updateRoleSchema
};
