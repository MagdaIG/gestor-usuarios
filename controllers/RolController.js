const { Rol, Usuario } = require('../models');
const { validationResult } = require('express-validator');

class RolController {
  // Obtener todos los roles
  static async getAllRoles(req, res) {
    try {
      const roles = await Rol.findAll({
        include: [{
          model: Usuario,
          as: 'usuarios',
          attributes: ['id', 'nombre', 'correo', 'activo'],
          required: false
        }],
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: roles,
        count: roles.length
      });
    } catch (error) {
      console.error('Error al obtener roles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener un rol por ID
  static async getRolById(req, res) {
    try {
      const { id } = req.params;

      const rol = await Rol.findByPk(id, {
        include: [{
          model: Usuario,
          as: 'usuarios',
          attributes: ['id', 'nombre', 'correo', 'activo'],
          required: false
        }]
      });

      if (!rol) {
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }

      res.json({
        success: true,
        data: rol
      });
    } catch (error) {
      console.error('Error al obtener rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Crear un nuevo rol
  static async createRol(req, res) {
    const transaction = await Rol.sequelize.transaction();

    try {
      // Validar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      const { nombre, descripcion } = req.body;

      // Verificar si el nombre del rol ya existe
      const rolExistente = await Rol.findOne({
        where: { nombre },
        transaction
      });

      if (rolExistente) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          message: 'El nombre del rol ya existe'
        });
      }

      // Crear el rol
      const nuevoRol = await Rol.create({
        nombre,
        descripcion: descripcion || null
      }, { transaction });

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Rol creado exitosamente',
        data: nuevoRol
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Actualizar un rol
  static async updateRol(req, res) {
    const transaction = await Rol.sequelize.transaction();

    try {
      const { id } = req.params;
      const { nombre, descripcion, activo } = req.body;

      // Validar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errors.array()
        });
      }

      // Buscar el rol
      const rol = await Rol.findByPk(id, { transaction });
      if (!rol) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }

      // Verificar si el nombre ya existe en otro rol
      if (nombre && nombre !== rol.nombre) {
        const rolExistente = await Rol.findOne({
          where: {
            nombre,
            id: { [Rol.sequelize.Sequelize.Op.ne]: id }
          },
          transaction
        });

        if (rolExistente) {
          await transaction.rollback();
          return res.status(409).json({
            success: false,
            message: 'El nombre del rol ya existe'
          });
        }
      }

      // Actualizar el rol
      await rol.update({
        nombre: nombre || rol.nombre,
        descripcion: descripcion !== undefined ? descripcion : rol.descripcion,
        activo: activo !== undefined ? activo : rol.activo
      }, { transaction });

      await transaction.commit();

      res.json({
        success: true,
        message: 'Rol actualizado exitosamente',
        data: rol
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error al actualizar rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Eliminar un rol
  static async deleteRol(req, res) {
    const transaction = await Rol.sequelize.transaction();

    try {
      const { id } = req.params;

      const rol = await Rol.findByPk(id, {
        include: [{
          model: Usuario,
          as: 'usuarios',
          required: false
        }],
        transaction
      });

      if (!rol) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }

      // Verificar si el rol tiene usuarios asignados
      if (rol.usuarios && rol.usuarios.length > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar el rol porque tiene usuarios asignados',
          usuariosAsignados: rol.usuarios.length
        });
      }

      await rol.destroy({ transaction });
      await transaction.commit();

      res.json({
        success: true,
        message: 'Rol eliminado exitosamente'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error al eliminar rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener usuarios por rol
  static async getUsuariosByRol(req, res) {
    try {
      const { id } = req.params;

      const rol = await Rol.findByPk(id, {
        include: [{
          model: Usuario,
          as: 'usuarios',
          attributes: { exclude: ['password'] },
          required: false
        }]
      });

      if (!rol) {
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }

      res.json({
        success: true,
        data: {
          rol: {
            id: rol.id,
            nombre: rol.nombre,
            descripcion: rol.descripcion
          },
          usuarios: rol.usuarios
        },
        count: rol.usuarios.length
      });
    } catch (error) {
      console.error('Error al obtener usuarios por rol:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = RolController;
