const { Usuario, Rol, UserProfile } = require('../models');
const { validationResult } = require('express-validator');

class UsuarioController {
  // Obtener todos los usuarios
  static async getAllUsuarios(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        include: [{
          model: Rol,
          as: 'rol',
          attributes: ['id', 'nombre', 'descripcion']
        }],
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: usuarios,
        count: usuarios.length
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Obtener un usuario por ID
  static async getUsuarioById(req, res) {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id, {
        include: [
          {
            model: Rol,
            as: 'rol',
            attributes: ['id', 'nombre', 'descripcion']
          },
          {
            model: Rol,
            as: 'roles',
            attributes: ['id', 'nombre', 'descripcion'],
            through: { attributes: [] }
          },
          {
            model: UserProfile,
            as: 'profile',
            attributes: ['id', 'bio', 'avatarUrl']
          }
        ],
        attributes: { exclude: ['password'] }
      });

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Crear un nuevo usuario
  static async createUsuario(req, res) {
    const transaction = await Usuario.sequelize.transaction();

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

      const { nombre, correo, password, rol_id } = req.body;

      // Verificar si el correo ya existe
      const usuarioExistente = await Usuario.findOne({
        where: { correo },
        transaction
      });

      if (usuarioExistente) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          message: 'El correo electrónico ya está registrado'
        });
      }

      // Verificar si el rol existe (si se proporciona)
      if (rol_id) {
        const rol = await Rol.findByPk(rol_id, { transaction });
        if (!rol) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'El rol especificado no existe'
          });
        }
      }

      // Crear el usuario
      const nuevoUsuario = await Usuario.create({
        nombre,
        correo,
        password,
        rol_id: rol_id || null
      }, { transaction });

      await transaction.commit();

      // Obtener el usuario creado con su rol
      const usuarioConRol = await Usuario.findByPk(nuevoUsuario.id, {
        include: [{
          model: Rol,
          as: 'rol',
          attributes: ['id', 'nombre', 'descripcion']
        }],
        attributes: { exclude: ['password'] }
      });

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuarioConRol
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Actualizar un usuario
  static async updateUsuario(req, res) {
    const transaction = await Usuario.sequelize.transaction();

    try {
      const { id } = req.params;
      const { nombre, correo, password, rol_id, activo } = req.body;

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

      // Buscar el usuario
      const usuario = await Usuario.findByPk(id, { transaction });
      if (!usuario) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Verificar si el correo ya existe en otro usuario
      if (correo && correo !== usuario.correo) {
        const usuarioExistente = await Usuario.findOne({
          where: {
            correo,
            id: { [Usuario.sequelize.Sequelize.Op.ne]: id }
          },
          transaction
        });

        if (usuarioExistente) {
          await transaction.rollback();
          return res.status(409).json({
            success: false,
            message: 'El correo electrónico ya está registrado'
          });
        }
      }

      // Verificar si el rol existe (si se proporciona)
      if (rol_id) {
        const rol = await Rol.findByPk(rol_id, { transaction });
        if (!rol) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: 'El rol especificado no existe'
          });
        }
      }

      // Actualizar el usuario
      await usuario.update({
        nombre: nombre || usuario.nombre,
        correo: correo || usuario.correo,
        password: password || usuario.password,
        rol_id: rol_id !== undefined ? rol_id : usuario.rol_id,
        activo: activo !== undefined ? activo : usuario.activo
      }, { transaction });

      await transaction.commit();

      // Obtener el usuario actualizado con su rol
      const usuarioActualizado = await Usuario.findByPk(id, {
        include: [{
          model: Rol,
          as: 'rol',
          attributes: ['id', 'nombre', 'descripcion']
        }],
        attributes: { exclude: ['password'] }
      });

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuarioActualizado
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Eliminar un usuario
  static async deleteUsuario(req, res) {
    const transaction = await Usuario.sequelize.transaction();

    try {
      const { id } = req.params;

      const usuario = await Usuario.findByPk(id, { transaction });
      if (!usuario) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      await usuario.destroy({ transaction });
      await transaction.commit();

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = UsuarioController;
