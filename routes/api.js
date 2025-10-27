const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const RolController = require('../controllers/RolController');
const TransaccionService = require('../services/TransaccionService');
const {
  validateCreateRole,
  validateUpdateRole,
  validateCreateUser,
  validateUpdateUser
} = require('../middleware/validations');

// Health check
router.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Rutas para Roles
router.post('/roles', validateCreateRole, RolController.createRol);
router.get('/roles', RolController.getAllRoles);
router.get('/roles/:id', RolController.getRolById);
router.put('/roles/:id', validateUpdateRole, RolController.updateRol);
router.delete('/roles/:id', RolController.deleteRol);

// Rutas para Usuarios
router.post('/users', validateCreateUser, async (req, res, next) => {
  try {
    const result = await TransaccionService.createUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/users', UsuarioController.getAllUsuarios);
router.get('/users/:id', UsuarioController.getUsuarioById);

router.put('/users/:id', validateUpdateUser, async (req, res, next) => {
  try {
    const result = await TransaccionService.updateUser(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    const result = await TransaccionService.removeUser(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Rutas adicionales para obtener usuarios por rol
router.get('/roles/:id/users', RolController.getUsuariosByRol);

// Mantener rutas existentes para compatibilidad
router.get('/usuarios', UsuarioController.getAllUsuarios);
router.get('/usuarios/:id', UsuarioController.getUsuarioById);
router.post('/usuarios', validateCreateUser, UsuarioController.createUsuario);
router.put('/usuarios/:id', validateUpdateUser, UsuarioController.updateUsuario);
router.delete('/usuarios/:id', UsuarioController.deleteUsuario);

module.exports = router;
