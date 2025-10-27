const Joi = require('joi');

const userSchema = {
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'any.required': 'El nombre es requerido'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Debe ser un correo electrónico válido',
      'any.required': 'El correo es requerido'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es requerida'
    }),
  roleId: Joi.string()
    .uuid()
    .optional()
    .allow(null)
    .messages({
      'string.uuid': 'El roleId debe ser un UUID válido'
    }),
  rolesIds: Joi.array()
    .items(Joi.string().uuid())
    .optional()
    .allow(null)
    .messages({
      'array.base': 'rolesIds debe ser un array',
      'string.uuid': 'Cada roleId debe ser un UUID válido'
    }),
  profile: Joi.object({
    bio: Joi.string()
      .max(1000)
      .optional()
      .allow('', null)
      .messages({
        'string.max': 'La biografía no puede exceder 1000 caracteres'
      }),
    avatarUrl: Joi.string()
      .uri()
      .max(500)
      .optional()
      .allow('', null)
      .messages({
        'string.uri': 'Debe ser una URL válida',
        'string.max': 'La URL del avatar no puede exceder 500 caracteres'
      })
  }).optional()
};

const createUserSchema = Joi.object({
  nombre: userSchema.name,
  correo: userSchema.email,
  password: userSchema.password,
  rol_id: userSchema.roleId,
  rolesIds: userSchema.rolesIds,
  profile: userSchema.profile
});

const updateUserSchema = Joi.object({
  nombre: userSchema.name.optional(),
  correo: userSchema.email.optional(),
  password: Joi.string()
    .min(6)
    .optional()
    .allow('', null)
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres'
    }),
  rol_id: userSchema.roleId,
  rolesIds: userSchema.rolesIds,
  profile: userSchema.profile,
  activo: Joi.boolean().optional()
});

module.exports = {
  createUserSchema,
  updateUserSchema
};
