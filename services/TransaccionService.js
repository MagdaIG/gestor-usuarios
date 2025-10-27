const { Usuario, Rol, UserProfile, UserRoles } = require('../models');
const { hashPassword } = require('../utils/hash');

class TransaccionService {
  /**
   * Crear usuario con perfil y roles en una sola transacción
   * @param {Object} payload - Datos del usuario
   * @returns {Promise<Object>} - Usuario creado con relaciones
   */
  static async createUser(payload) {
    const transaction = await Usuario.sequelize.transaction();

    try {
      const { nombre, correo, password, rol_id, rolesIds, profile } = payload;

      // Verificar si el correo ya existe
      const usuarioExistente = await Usuario.findOne({
        where: { correo },
        transaction
      });

      if (usuarioExistente) {
        throw new Error('El correo electrónico ya está registrado');
      }

      // Verificar rol principal si se proporciona
      if (rol_id) {
        const rol = await Rol.findByPk(rol_id, { transaction });
        if (!rol) {
          throw new Error('El rol principal especificado no existe');
        }
      }

      // Verificar roles adicionales si se proporcionan
      if (rolesIds && rolesIds.length > 0) {
        const roles = await Rol.findAll({
          where: { id: rolesIds },
          transaction
        });
        if (roles.length !== rolesIds.length) {
          throw new Error('Algunos roles especificados no existen');
        }
      }

      // Hash de la contraseña
      const passwordHash = await hashPassword(password);

      // Crear usuario
      const nuevoUsuario = await Usuario.create({
        nombre,
        correo,
        password: passwordHash,
        rol_id: rol_id || null
      }, { transaction });

      // Crear perfil si se proporciona
      if (profile) {
        await UserProfile.create({
          userId: nuevoUsuario.id,
          bio: profile.bio || null,
          avatarUrl: profile.avatarUrl || null
        }, { transaction });
      }

      // Asignar roles adicionales si se proporcionan
      if (rolesIds && rolesIds.length > 0) {
        await nuevoUsuario.setRoles(rolesIds, { transaction });
      }

      await transaction.commit();

      // Obtener usuario completo con relaciones
      const usuarioCompleto = await Usuario.findByPk(nuevoUsuario.id, {
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

      return {
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuarioCompleto
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Actualizar usuario con perfil y roles en una sola transacción
   * @param {string} id - ID del usuario
   * @param {Object} payload - Datos a actualizar
   * @returns {Promise<Object>} - Usuario actualizado con relaciones
   */
  static async updateUser(id, payload) {
    const transaction = await Usuario.sequelize.transaction();

    try {
      const { nombre, correo, password, rol_id, rolesIds, profile, activo } = payload;

      // Buscar usuario
      const usuario = await Usuario.findByPk(id, { transaction });
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar correo único si se está cambiando
      if (correo && correo !== usuario.correo) {
        const usuarioExistente = await Usuario.findOne({
          where: {
            correo,
            id: { [Usuario.sequelize.Sequelize.Op.ne]: id }
          },
          transaction
        });

        if (usuarioExistente) {
          throw new Error('El correo electrónico ya está registrado');
        }
      }

      // Verificar rol principal si se proporciona
      if (rol_id) {
        const rol = await Rol.findByPk(rol_id, { transaction });
        if (!rol) {
          throw new Error('El rol principal especificado no existe');
        }
      }

      // Verificar roles adicionales si se proporcionan
      if (rolesIds && rolesIds.length > 0) {
        const roles = await Rol.findAll({
          where: { id: rolesIds },
          transaction
        });
        if (roles.length !== rolesIds.length) {
          throw new Error('Algunos roles especificados no existen');
        }
      }

      // Preparar datos de actualización
      const updateData = {};
      if (nombre) updateData.nombre = nombre;
      if (correo) updateData.correo = correo;
      if (password) updateData.password = await hashPassword(password);
      if (rol_id !== undefined) updateData.rol_id = rol_id;
      if (activo !== undefined) updateData.activo = activo;

      // Actualizar usuario
      await usuario.update(updateData, { transaction });

      // Actualizar o crear perfil
      if (profile) {
        const [userProfile] = await UserProfile.findOrCreate({
          where: { userId: id },
          defaults: {
            userId: id,
            bio: profile.bio || null,
            avatarUrl: profile.avatarUrl || null
          },
          transaction
        });

        await userProfile.update({
          bio: profile.bio !== undefined ? profile.bio : userProfile.bio,
          avatarUrl: profile.avatarUrl !== undefined ? profile.avatarUrl : userProfile.avatarUrl
        }, { transaction });
      }

      // Actualizar roles adicionales
      if (rolesIds !== undefined) {
        await usuario.setRoles(rolesIds, { transaction });
      }

      await transaction.commit();

      // Obtener usuario actualizado con relaciones
      const usuarioActualizado = await Usuario.findByPk(id, {
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

      return {
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuarioActualizado
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Eliminar usuario con todas sus relaciones en una sola transacción
   * @param {string} id - ID del usuario
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  static async removeUser(id) {
    const transaction = await Usuario.sequelize.transaction();

    try {
      // Buscar usuario
      const usuario = await Usuario.findByPk(id, { transaction });
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Eliminar perfil si existe
      await UserProfile.destroy({
        where: { userId: id },
        transaction
      });

      // Limpiar relaciones N:M
      await usuario.setRoles([], { transaction });

      // Eliminar usuario
      await usuario.destroy({ transaction });

      await transaction.commit();

      return {
        success: true,
        message: 'Usuario eliminado exitosamente'
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Métodos existentes actualizados para usar UUIDs
  static async asignarUsuariosARol(rolId, usuarioIds) {
    const transaction = await Usuario.sequelize.transaction();

    try {
      const rol = await Rol.findByPk(rolId, { transaction });
      if (!rol) {
        throw new Error('El rol especificado no existe');
      }

      const usuarios = await Usuario.findAll({
        where: { id: usuarioIds },
        transaction
      });

      if (usuarios.length !== usuarioIds.length) {
        throw new Error('Algunos usuarios no existen');
      }

      // Asignar roles usando la relación N:M
      for (const usuario of usuarios) {
        await usuario.addRole(rolId, { transaction });
      }

      await transaction.commit();

      return {
        success: true,
        message: `${usuarios.length} usuarios asignados al rol "${rol.nombre}" exitosamente`,
        rol: rol,
        usuariosAsignados: usuarios.length
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async transferirUsuariosDeRol(rolOrigenId, rolDestinoId) {
    const transaction = await Usuario.sequelize.transaction();

    try {
      const [rolOrigen, rolDestino] = await Promise.all([
        Rol.findByPk(rolOrigenId, { transaction }),
        Rol.findByPk(rolDestinoId, { transaction })
      ]);

      if (!rolOrigen) {
        throw new Error('El rol origen no existe');
      }
      if (!rolDestino) {
        throw new Error('El rol destino no existe');
      }

      // Obtener usuarios del rol origen usando la relación N:M
      const usuariosEnRolOrigen = await Usuario.findAll({
        include: [{
          model: Rol,
          as: 'roles',
          where: { id: rolOrigenId },
          through: { attributes: [] }
        }],
        transaction
      });

      if (usuariosEnRolOrigen.length === 0) {
        throw new Error('No hay usuarios en el rol origen para transferir');
      }

      // Transferir usuarios al rol destino
      for (const usuario of usuariosEnRolOrigen) {
        await usuario.removeRole(rolOrigenId, { transaction });
        await usuario.addRole(rolDestinoId, { transaction });
      }

      await transaction.commit();

      return {
        success: true,
        message: `${usuariosEnRolOrigen.length} usuarios transferidos de "${rolOrigen.nombre}" a "${rolDestino.nombre}"`,
        rolOrigen: rolOrigen,
        rolDestino: rolDestino,
        usuariosTransferidos: usuariosEnRolOrigen.length
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async eliminarRolYReasignarUsuarios(rolId, nuevoRolId = null) {
    const transaction = await Usuario.sequelize.transaction();

    try {
      const rol = await Rol.findByPk(rolId, {
        include: [{
          model: Usuario,
          as: 'usersMany',
          through: { attributes: [] }
        }],
        transaction
      });

      if (!rol) {
        throw new Error('El rol especificado no existe');
      }

      const usuariosEnRol = rol.usersMany || [];

      // Si hay usuarios en el rol y se especifica un nuevo rol
      if (usuariosEnRol.length > 0 && nuevoRolId) {
        const nuevoRol = await Rol.findByPk(nuevoRolId, { transaction });
        if (!nuevoRol) {
          throw new Error('El nuevo rol especificado no existe');
        }

        // Reasignar usuarios al nuevo rol
        for (const usuario of usuariosEnRol) {
          await usuario.removeRole(rolId, { transaction });
          await usuario.addRole(nuevoRolId, { transaction });
        }
      } else if (usuariosEnRol.length > 0 && !nuevoRolId) {
        // Si hay usuarios pero no se especifica nuevo rol, quitar el rol
        for (const usuario of usuariosEnRol) {
          await usuario.removeRole(rolId, { transaction });
        }
      }

      // Eliminar el rol
      await rol.destroy({ transaction });

      await transaction.commit();

      return {
        success: true,
        message: `Rol "${rol.nombre}" eliminado exitosamente`,
        usuariosAfectados: usuariosEnRol.length,
        nuevoRolId: nuevoRolId
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = TransaccionService;
