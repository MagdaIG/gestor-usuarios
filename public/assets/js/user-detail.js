import { apiGet, apiPut, apiDelete } from './api.js';
import { showToast, confirmDialog, formatDate, showSpinner, hideSpinner } from './ui.js';
import { validateUser, showValidationErrors, clearValidationErrors } from './validators.js';
import { userForm, userModal } from './components/templates.js';

class UserDetailManager {
  constructor() {
    this.userId = this.getUserIdFromUrl();
    this.user = null;
    this.roles = [];

    if (this.userId) {
      this.init();
    } else {
      this.showError('ID de usuario no válido');
    }
  }

  getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  async init() {
    await this.loadRoles();
    await this.loadUser();
    this.setupEventListeners();
  }

  async loadRoles() {
    try {
      const response = await apiGet('/roles');
      this.roles = response.data || [];
    } catch (error) {
      console.error('Error cargando roles:', error);
      showToast('Error al cargar los roles', 'danger');
    }
  }

  async loadUser() {
    const container = document.getElementById('user-detail-container');
    const spinnerId = showSpinner(container);

    try {
      const response = await apiGet(`/users/${this.userId}`);
      this.user = response.data;
      this.renderUser();
    } catch (error) {
      console.error('Error cargando usuario:', error);
      this.showError('Error al cargar los datos del usuario');
    } finally {
      hideSpinner(container, spinnerId);
    }
  }

  renderUser() {
    if (!this.user) return;

    const container = document.getElementById('user-detail-container');

    const rolesBadges = this.user.roles ?
      this.user.roles.map(role => `<span class="badge bg-secondary me-1">${role.nombre}</span>`).join('') :
      '<span class="text-muted">Sin roles adicionales</span>';

    container.innerHTML = `
      <div class="row">
        <div class="col-md-4">
          <div class="card">
            <div class="card-body text-center">
              ${this.user.profile?.avatarUrl ?
                `<img src="${this.user.profile.avatarUrl}" alt="Avatar" class="rounded-circle mb-3" style="width: 150px; height: 150px; object-fit: cover;">` :
                `<div class="bg-primary rounded-circle d-flex align-items-center justify-content-center mb-3 mx-auto" style="width: 150px; height: 150px;">
                  <i class="bi bi-person text-white fs-1"></i>
                </div>`
              }
              <h4 class="card-title">${this.user.nombre}</h4>
              <p class="text-muted">${this.user.correo}</p>
              <div class="btn-group" role="group">
                <button type="button" class="btn btn-warning" onclick="editUser()">
                  <i class="bi bi-pencil me-1"></i>Editar
                </button>
                <button type="button" class="btn btn-danger" onclick="deleteUser()">
                  <i class="bi bi-trash me-1"></i>Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="bi bi-info-circle me-2"></i>Información del Usuario
              </h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-sm-3"><strong>ID:</strong></div>
                <div class="col-sm-9"><code>${this.user.id}</code></div>
              </div>

              <div class="row mb-3">
                <div class="col-sm-3"><strong>Estado:</strong></div>
                <div class="col-sm-9">
                  <span class="badge bg-${this.user.activo ? 'success' : 'danger'}">
                    ${this.user.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-sm-3"><strong>Rol Principal:</strong></div>
                <div class="col-sm-9">
                  ${this.user.rol ?
                    `<span class="badge bg-primary">${this.user.rol.nombre}</span>` :
                    '<span class="text-muted">Sin rol asignado</span>'
                  }
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-sm-3"><strong>Roles Adicionales:</strong></div>
                <div class="col-sm-9">${rolesBadges}</div>
              </div>

              <div class="row mb-3">
                <div class="col-sm-3"><strong>Creado:</strong></div>
                <div class="col-sm-9">${formatDate(this.user.createdAt)}</div>
              </div>

              <div class="row mb-3">
                <div class="col-sm-3"><strong>Actualizado:</strong></div>
                <div class="col-sm-9">${formatDate(this.user.updatedAt)}</div>
              </div>
            </div>
          </div>

          ${this.user.profile ? `
            <div class="card mt-3">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="bi bi-person-badge me-2"></i>Perfil
                </h5>
              </div>
              <div class="card-body">
                ${this.user.profile.bio ? `
                  <div class="mb-3">
                    <strong>Biografía:</strong>
                    <p class="mt-2">${this.user.profile.bio}</p>
                  </div>
                ` : ''}

                ${this.user.profile.avatarUrl ? `
                  <div>
                    <strong>Avatar URL:</strong>
                    <p class="mt-2">
                      <a href="${this.user.profile.avatarUrl}" target="_blank" class="text-decoration-none">
                        ${this.user.profile.avatarUrl}
                        <i class="bi bi-box-arrow-up-right ms-1"></i>
                      </a>
                    </p>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Preview de avatar en el modal de edición
    document.addEventListener('input', (e) => {
      if (e.target.id === 'avatarUrl') {
        this.updateAvatarPreview();
      }
    });
  }

  async showEditModal() {
    const modalId = 'user-modal-edit';
    let modal = document.getElementById(modalId);

    if (!modal) {
      document.body.insertAdjacentHTML('beforeend', userModal('edit', this.userId));
      modal = document.getElementById(modalId);
    }

    const content = modal.querySelector(`#${modalId}-content`);
    content.innerHTML = userForm({ initial: this.user, mode: 'edit' });

    // Poblar selects de roles
    this.populateRoleSelects();

    // Configurar valores iniciales para roles adicionales
    if (this.user.roles) {
      const rolesSelect = document.getElementById('rolesIds');
      if (rolesSelect) {
        this.user.roles.forEach(role => {
          const option = rolesSelect.querySelector(`option[value="${role.id}"]`);
          if (option) option.selected = true;
        });
      }
    }

    // Configurar preview de avatar
    this.updateAvatarPreview();

    // Configurar evento del formulario
    const form = document.getElementById('user-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleUserSubmit();
    });

    // Mostrar modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Limpiar modal al cerrar
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  }

  populateRoleSelects() {
    const roleSelects = document.querySelectorAll('#rol_id, #rolesIds');
    roleSelects.forEach(select => {
      const currentValue = select.value;
      select.innerHTML = '<option value="">Seleccionar rol...</option>';

      this.roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.id;
        option.textContent = role.nombre;
        select.appendChild(option);
      });

      if (currentValue) {
        select.value = currentValue;
      }
    });
  }

  updateAvatarPreview() {
    const avatarUrlInput = document.getElementById('avatarUrl');
    const previewContainer = document.getElementById('avatar-preview');

    if (!avatarUrlInput || !previewContainer) return;

    const url = avatarUrlInput.value.trim();

    if (url && this.isValidUrl(url)) {
      previewContainer.innerHTML = `
        <div class="text-center">
          <img src="${url}" alt="Preview" class="rounded-circle"
               style="width: 64px; height: 64px; object-fit: cover;"
               onerror="this.style.display='none'">
          <div class="small text-muted mt-1">Vista previa</div>
        </div>
      `;
    } else {
      previewContainer.innerHTML = '';
    }
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }

  async handleUserSubmit() {
    const form = document.getElementById('user-form');
    const formData = new FormData(form);

    const selectedRoles = Array.from(document.getElementById('rolesIds').selectedOptions).map(option => option.value).filter(id => id !== '');

    const payload = {
      nombre: formData.get('nombre'),
      correo: formData.get('correo'),
      password: formData.get('password'),
      rol_id: formData.get('rol_id') || null,
      profile: {
        bio: formData.get('bio') && formData.get('bio').trim() !== '' ? formData.get('bio').trim() : null,
        avatarUrl: formData.get('avatarUrl') && formData.get('avatarUrl').trim() !== '' ? formData.get('avatarUrl').trim() : null
      }
    };

    // Solo agregar rolesIds si hay roles seleccionados
    if (selectedRoles.length > 0) {
      payload.rolesIds = selectedRoles;
    }

    // Validar datos
    const validation = validateUser(payload, { mode: 'edit' });
    if (!validation.valid) {
      showValidationErrors(form, validation.errors);
      return;
    }

    clearValidationErrors(form);

    // Deshabilitar formulario
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Procesando...';

    try {
      const response = await apiPut(`/users/${this.userId}`, payload);
      showToast(response.message, 'success');

      // Cerrar modal
      const modal = form.closest('.modal');
      const bsModal = bootstrap.Modal.getInstance(modal);
      bsModal.hide();

      // Recargar usuario
      await this.loadUser();

    } catch (error) {
      console.error('Error actualizando usuario:', error);

      if (error.data && error.data.errors) {
        showValidationErrors(form, error.data.errors);
      } else {
        showToast(error.message || 'Error al actualizar el usuario', 'danger');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  async deleteUser() {
    if (!this.user) return;

    confirmDialog({
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de que quieres eliminar al usuario <strong>${this.user.nombre}</strong>? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          const response = await apiDelete(`/users/${this.userId}`);
          showToast(response.message, 'success');

          // Redirigir a la lista de usuarios después de un breve delay
          setTimeout(() => {
            window.location.href = 'users.html';
          }, 1500);

        } catch (error) {
          console.error('Error eliminando usuario:', error);
          showToast(error.message || 'Error al eliminar el usuario', 'danger');
        }
      }
    });
  }

  showError(message) {
    const container = document.getElementById('user-detail-container');
    container.innerHTML = `
      <div class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>
        ${message}
        <div class="mt-3">
          <a href="users.html" class="btn btn-primary">
            <i class="bi bi-arrow-left me-1"></i>Volver a Usuarios
          </a>
        </div>
      </div>
    `;
  }
}

// Funciones globales para los botones
window.editUser = () => {
  if (window.userDetailManager) {
    window.userDetailManager.showEditModal();
  }
};

window.deleteUser = () => {
  if (window.userDetailManager) {
    window.userDetailManager.deleteUser();
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.userDetailManager = new UserDetailManager();
});
