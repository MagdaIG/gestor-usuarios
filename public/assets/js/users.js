/**
 * @fileoverview Módulo de gestión de usuarios
 * Maneja la lista, creación, edición y eliminación de usuarios con paginación y filtros
 */

import { apiGet, apiPost, apiPut, apiDelete } from './api.js';
import { showToast, showSpinner, hideSpinner, confirmDialog, debounce, renderPagination } from './ui.js';
import { validateUser, showValidationErrors, clearValidationErrors } from './validators.js';
import { userRow, userForm, userModal } from './components/templates.js';
import { PAGINATION_CONFIG, UI_CONFIG } from './config.js';

/**
 * Clase principal para gestionar usuarios
 * Maneja el estado de la aplicación, paginación, filtros y operaciones CRUD
 */
class UsersManager {
  constructor() {
    this.users = [];
    this.roles = [];
    this.currentPage = 1;
    this.limit = PAGINATION_CONFIG.DEFAULT_LIMIT;
    this.searchTerm = '';
    this.selectedRoleId = '';
    this.totalUsers = 0;

    this.init();
  }

  async init() {
    await this.loadRoles();
    this.setupEventListeners();
    await this.loadUsers();
  }

  async loadRoles() {
    try {
      const response = await apiGet('/roles');
      this.roles = response.data || [];
      this.populateRoleSelects();
    } catch (error) {
      console.error('Error cargando roles:', error);
      showToast('Error al cargar los roles', 'danger');
    }
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

  setupEventListeners() {
    // Búsqueda
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      const debouncedSearch = debounce(() => {
        this.searchTerm = searchInput.value;
        this.currentPage = 1;
        this.loadUsers();
      }, UI_CONFIG.DEBOUNCE_DELAY);

      searchInput.addEventListener('input', debouncedSearch);
    }

    // Filtro por rol
    const roleFilter = document.getElementById('role-filter');
    if (roleFilter) {
      roleFilter.addEventListener('change', () => {
        this.selectedRoleId = roleFilter.value;
        this.currentPage = 1;
        this.loadUsers();
      });
    }

    // Botón nuevo usuario
    const newUserBtn = document.getElementById('new-user-btn');
    if (newUserBtn) {
      newUserBtn.addEventListener('click', () => this.showCreateUserModal());
    }

    // Preview de avatar
    const avatarUrlInput = document.getElementById('avatarUrl');
    if (avatarUrlInput) {
      avatarUrlInput.addEventListener('input', this.updateAvatarPreview.bind(this));
    }
  }

  async loadUsers() {
    const container = document.getElementById('users-container');
    if (!container) {
      console.error('Contenedor users-container no encontrado');
      return;
    }

    const spinnerId = showSpinner(container);

    try {
      const params = {
        limit: this.limit,
        offset: (this.currentPage - 1) * this.limit
      };

      if (this.searchTerm) {
        params.search = this.searchTerm;
      }

      if (this.selectedRoleId) {
        params.roleId = this.selectedRoleId;
      }

      const response = await apiGet('/users', params);
      this.users = response.data || [];
      this.totalUsers = response.count || 0;

      this.renderUsers();
      this.renderPagination();

    } catch (error) {
      console.error('Error cargando usuarios:', error);
      showToast('Error al cargar los usuarios', 'danger');
    } finally {
      hideSpinner(container, spinnerId);
    }
  }

  renderUsers() {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) {
      console.error('Tabla users-table no encontrada');
      return;
    }

    if (this.users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-4">
            <i class="bi bi-person-x fs-1 d-block mb-2"></i>
            No se encontraron usuarios
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.users.map(user => userRow(user)).join('');
  }

  renderPagination() {
    const container = document.getElementById('pagination-container');
    if (!container) {
      console.error('Contenedor pagination-container no encontrado');
      return;
    }

    renderPagination(container, {
      limit: this.limit,
      offset: (this.currentPage - 1) * this.limit,
      total: this.totalUsers
    }, (page) => {
      this.currentPage = page;
      this.loadUsers();
    });
  }

  showCreateUserModal() {
    this.showUserModal('create');
  }

  async showUserModal(mode, userId = null) {
    const modalId = `user-modal-${mode}`;
    let modal = document.getElementById(modalId);

    if (!modal) {
      document.body.insertAdjacentHTML('beforeend', userModal(mode, userId));
      modal = document.getElementById(modalId);
    }

    const content = modal.querySelector(`#${modalId}-content`);
    let initialData = {};

    if (mode === 'edit' && userId) {
      try {
        const response = await apiGet(`/users/${userId}`);
        initialData = response.data || {};
      } catch (error) {
        console.error('Error cargando usuario:', error);
        showToast('Error al cargar los datos del usuario', 'danger');
        return;
      }
    }

    content.innerHTML = userForm({ initial: initialData, mode });

    // Poblar selects después de renderizar el formulario
    this.populateRoleSelects();

    // Configurar valores iniciales para roles adicionales
    if (mode === 'edit' && initialData.roles) {
      const rolesSelect = document.getElementById('rolesIds');
      if (rolesSelect) {
        initialData.roles.forEach(role => {
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
      this.handleUserSubmit(mode, userId);
    });

    // Mostrar modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Limpiar modal al cerrar
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  }

  async handleUserSubmit(mode, userId) {
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
    const validation = validateUser(payload, { mode });
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
      let response;
      if (mode === 'create') {
        response = await apiPost('/users', payload);
      } else {
        response = await apiPut(`/users/${userId}`, payload);
      }

      showToast(response.message, 'success');

      // Cerrar modal
      const modal = form.closest('.modal');
      const bsModal = bootstrap.Modal.getInstance(modal);
      bsModal.hide();

      // Recargar usuarios
      await this.loadUsers();

    } catch (error) {
      console.error('Error guardando usuario:', error);

      if (error.data && error.data.errors) {
        showValidationErrors(form, error.data.errors);
      } else {
        showToast(error.message || 'Error al guardar el usuario', 'danger');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
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

  async deleteUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    confirmDialog({
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de que quieres eliminar al usuario <strong>${user.nombre}</strong>? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          const response = await apiDelete(`/users/${userId}`);
          showToast(response.message, 'success');
          await this.loadUsers();
        } catch (error) {
          console.error('Error eliminando usuario:', error);
          showToast(error.message || 'Error al eliminar el usuario', 'danger');
        }
      }
    });
  }
}

// Funciones globales para los botones de la tabla
window.viewUser = (userId) => {
  window.location.href = `user-detail.html?id=${userId}`;
};

window.editUser = (userId) => {
  if (window.usersManager) {
    window.usersManager.showUserModal('edit', userId);
  }
};

window.deleteUser = (userId) => {
  if (window.usersManager) {
    window.usersManager.deleteUser(userId);
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.usersManager = new UsersManager();
});
