import { formatDate, formatUUID } from '../ui.js';

/**
 * Genera HTML para una fila de usuario en la tabla
 */
export function userRow(user) {
  const roles = user.roles || [];
  const rolesBadges = roles.map(role =>
    `<span class="badge bg-secondary me-1">${role.nombre}</span>`
  ).join('');

  return `
    <tr>
      <td>
        <div class="d-flex align-items-center">
          ${user.profile?.avatarUrl ?
            `<img src="${user.profile.avatarUrl}" alt="Avatar" class="rounded-circle me-2" style="width: 32px; height: 32px; object-fit: cover;">` :
            `<div class="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px;">
              <i class="bi bi-person text-white"></i>
            </div>`
          }
          <div>
            <div class="fw-bold">${user.nombre}</div>
            <small class="text-muted">${formatUUID(user.id)}</small>
          </div>
        </div>
      </td>
      <td>${user.correo}</td>
      <td>
        ${user.rol ? `<span class="badge bg-primary">${user.rol.nombre}</span>` : '<span class="text-muted">Sin rol</span>'}
      </td>
      <td>
        <div class="d-flex flex-wrap">
          ${rolesBadges || '<span class="text-muted">Sin roles adicionales</span>'}
        </div>
      </td>
      <td>
        <div class="btn-group btn-group-sm" role="group">
          <button type="button" class="btn btn-outline-info" onclick="viewUser('${user.id}')" title="Ver detalles" aria-label="Ver detalles del usuario">
            <i class="bi bi-eye"></i>
          </button>
          <button type="button" class="btn btn-outline-warning" onclick="editUser('${user.id}')" title="Editar" aria-label="Editar usuario">
            <i class="bi bi-pencil"></i>
          </button>
          <button type="button" class="btn btn-outline-danger" onclick="deleteUser('${user.id}')" title="Eliminar" aria-label="Eliminar usuario">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Genera HTML para una fila de rol en la tabla
 */
export function roleRow(role) {
  const userCount = role.usuarios ? role.usuarios.length : 0;

  return `
    <tr>
      <td>
        <div class="fw-bold">${role.nombre}</div>
        ${role.descripcion ? `<small class="text-muted">${role.descripcion}</small>` : ''}
      </td>
      <td>
        <span class="badge bg-info">${userCount} usuario${userCount !== 1 ? 's' : ''}</span>
      </td>
      <td>
        <div class="btn-group btn-group-sm" role="group">
          <button type="button" class="btn btn-outline-warning" onclick="editRole('${role.id}')" title="Editar" aria-label="Editar rol">
            <i class="bi bi-pencil"></i>
          </button>
          <button type="button" class="btn btn-outline-danger" onclick="deleteRole('${role.id}')" title="Eliminar" aria-label="Eliminar rol">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Genera HTML para una lista de badges de roles
 */
export function badgeList(roles) {
  if (!roles || roles.length === 0) {
    return '<span class="text-muted">Sin roles</span>';
  }

  return roles.map(role =>
    `<span class="badge bg-secondary me-1">${role.nombre}</span>`
  ).join('');
}

/**
 * Genera HTML para el formulario de usuario
 */
export function userForm({ initial = {}, mode = 'create' }) {
  const isEdit = mode === 'edit';

  return `
    <form id="user-form" novalidate>
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label for="nombre" class="form-label">Nombre *</label>
            <input type="text" class="form-control" id="nombre" name="nombre"
                   value="${initial.nombre || ''}" required>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label for="correo" class="form-label">Correo electrónico *</label>
            <input type="email" class="form-control" id="correo" name="correo"
                   value="${initial.correo || ''}" required>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">
          Contraseña ${isEdit ? '(opcional)' : '*'}
        </label>
        <input type="password" class="form-control" id="password" name="password"
               ${isEdit ? '' : 'required'}>
        <div class="form-text">
          ${isEdit ? 'Dejar vacío para mantener la contraseña actual' : 'Mínimo 6 caracteres'}
        </div>
      </div>

      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label for="rol_id" class="form-label">Rol principal</label>
            <select class="form-select" id="rol_id" name="rol_id">
              <option value="">Seleccionar rol...</option>
            </select>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label for="rolesIds" class="form-label">Roles adicionales</label>
            <select class="form-select" id="rolesIds" name="rolesIds" multiple>
            </select>
            <div class="form-text">Mantén presionado Ctrl para seleccionar múltiples roles</div>
          </div>
        </div>
      </div>

      <div class="mb-3">
        <label for="bio" class="form-label">Biografía</label>
        <textarea class="form-control" id="bio" name="bio" rows="3"
                  placeholder="Cuéntanos sobre ti...">${initial.profile?.bio || ''}</textarea>
        <div class="form-text">Máximo 1000 caracteres</div>
      </div>

      <div class="mb-3">
        <label for="avatarUrl" class="form-label">URL del avatar</label>
        <input type="url" class="form-control" id="avatarUrl" name="avatarUrl"
               value="${initial.profile?.avatarUrl || ''}"
               placeholder="https://ejemplo.com/avatar.jpg">
        <div class="form-text">URL de la imagen de perfil</div>
        <div id="avatar-preview" class="mt-2"></div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button type="submit" class="btn btn-primary">
          <i class="bi bi-check-lg me-1"></i>
          ${isEdit ? 'Actualizar' : 'Crear'} Usuario
        </button>
      </div>
    </form>
  `;
}

/**
 * Genera HTML para el formulario de rol
 */
export function roleForm({ initial = {}, mode = 'create' }) {
  return `
    <form id="role-form" novalidate>
      <div class="mb-3">
        <label for="nombre" class="form-label">Nombre del rol *</label>
        <input type="text" class="form-control" id="nombre" name="nombre"
               value="${initial.nombre || ''}" required>
      </div>

      <div class="mb-3">
        <label for="descripcion" class="form-label">Descripción</label>
        <textarea class="form-control" id="descripcion" name="descripcion" rows="3"
                  placeholder="Describe las responsabilidades de este rol...">${initial.descripcion || ''}</textarea>
        <div class="form-text">Máximo 500 caracteres</div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button type="submit" class="btn btn-primary">
          <i class="bi bi-check-lg me-1"></i>
          ${mode === 'edit' ? 'Actualizar' : 'Crear'} Rol
        </button>
      </div>
    </form>
  `;
}

/**
 * Genera HTML para la tarjeta de estadísticas del dashboard
 */
export function statsCard(title, value, icon, color = 'primary') {
  return `
    <div class="col-md-4">
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center">
          <div class="text-${color} mb-3">
            <i class="bi bi-${icon} fs-1"></i>
          </div>
          <h3 class="card-title">${value}</h3>
          <p class="card-text text-muted">${title}</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Genera HTML para el modal de usuario
 */
export function userModal(mode = 'create', userId = null) {
  const title = mode === 'create' ? 'Crear Usuario' : 'Editar Usuario';
  const modalId = `user-modal-${mode}`;

  return `
    <div id="${modalId}" class="modal fade" tabindex="-1" aria-labelledby="${modalId}-label" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="${modalId}-label" class="modal-title">
              <i class="bi bi-person-plus me-2"></i>${title}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div id="${modalId}-content">
              <!-- El contenido se carga dinámicamente -->
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Genera HTML para el modal de rol
 */
export function roleModal(mode = 'create', roleId = null) {
  const title = mode === 'create' ? 'Crear Rol' : 'Editar Rol';
  const modalId = `role-modal-${mode}`;

  return `
    <div id="${modalId}" class="modal fade" tabindex="-1" aria-labelledby="${modalId}-label" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="${modalId}-label" class="modal-title">
              <i class="bi bi-shield-check me-2"></i>${title}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div id="${modalId}-content">
              <!-- El contenido se carga dinámicamente -->
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
