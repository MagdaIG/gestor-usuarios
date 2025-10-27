const express = require('express');
const router = express.Router();
const TransaccionService = require('../services/TransaccionService');
const { body, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Asignar múltiples usuarios a un rol
router.post('/asignar-usuarios-rol', [
  body('rolId').isInt({ min: 1 }).withMessage('El rolId debe ser un número entero positivo'),
  body('usuarioIds').isArray({ min: 1 }).withMessage('usuarioIds debe ser un array con al menos un elemento'),
  body('usuarioIds.*').isInt({ min: 1 }).withMessage('Cada usuarioId debe ser un número entero positivo')
], handleValidationErrors, async (req, res) => {
  try {
    const { rolId, usuarioIds } = req.body;
    const resultado = await TransaccionService.asignarUsuariosARol(rolId, usuarioIds);
    res.json(resultado);
  } catch (error) {
    console.error('Error en asignar usuarios a rol:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
});

// Transferir usuarios de un rol a otro
router.post('/transferir-usuarios-rol', [
  body('rolOrigenId').isInt({ min: 1 }).withMessage('El rolOrigenId debe ser un número entero positivo'),
  body('rolDestinoId').isInt({ min: 1 }).withMessage('El rolDestinoId debe ser un número entero positivo')
], handleValidationErrors, async (req, res) => {
  try {
    const { rolOrigenId, rolDestinoId } = req.body;
    const resultado = await TransaccionService.transferirUsuariosDeRol(rolOrigenId, rolDestinoId);
    res.json(resultado);
  } catch (error) {
    console.error('Error en transferir usuarios de rol:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
});

// Eliminar rol y reasignar usuarios
router.delete('/eliminar-rol-reasignar/:rolId', [
  body('nuevoRolId').optional().isInt({ min: 1 }).withMessage('El nuevoRolId debe ser un número entero positivo')
], handleValidationErrors, async (req, res) => {
  try {
    const { rolId } = req.params;
    const { nuevoRolId } = req.body;
    const resultado = await TransaccionService.eliminarRolYReasignarUsuarios(rolId, nuevoRolId);
    res.json(resultado);
  } catch (error) {
    console.error('Error en eliminar rol y reasignar usuarios:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
});

// Crear usuario con rol en una sola operación
router.post('/crear-usuario-con-rol', [
  body('datosUsuario.nombre').notEmpty().withMessage('El nombre del usuario es requerido'),
  body('datosUsuario.correo').isEmail().withMessage('El correo debe ser válido'),
  body('datosUsuario.password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('datosRol.nombre').notEmpty().withMessage('El nombre del rol es requerido')
], handleValidationErrors, async (req, res) => {
  try {
    const { datosUsuario, datosRol } = req.body;
    const resultado = await TransaccionService.crearUsuarioConRol(datosUsuario, datosRol);
    res.status(201).json(resultado);
  } catch (error) {
    console.error('Error en crear usuario con rol:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor'
    });
  }
});

module.exports = router;
