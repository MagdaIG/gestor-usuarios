import { apiGet, checkApiHealth } from './api.js';
import { showToast, formatDate } from './ui.js';

class DashboardManager {
  constructor() {
    this.init();
  }

  async init() {
    await this.checkApiStatus();
    await this.loadStats();
  }

  async checkApiStatus() {
    const statusElement = document.getElementById('api-status');
    const statusText = document.getElementById('api-status-text');
    const statusDetail = document.getElementById('api-status-detail');

    try {
      const isHealthy = await checkApiHealth();

      if (isHealthy) {
        statusElement.className = 'text-success';
        statusElement.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
        statusText.textContent = 'API Conectada';
        statusText.className = 'fw-bold text-success';
        statusDetail.textContent = 'Sistema funcionando correctamente';
      } else {
        throw new Error('API no disponible');
      }
    } catch (error) {
      statusElement.className = 'text-danger';
      statusElement.innerHTML = '<i class="bi bi-x-circle-fill"></i>';
      statusText.textContent = 'API Desconectada';
      statusText.className = 'fw-bold text-danger';
      statusDetail.textContent = 'Error de conexión con el servidor';
    }
  }

  async loadStats() {
    try {
      // Cargar estadísticas de usuarios y roles en paralelo
      const [usersResponse, rolesResponse] = await Promise.all([
        apiGet('/users', { limit: 1, sort: 'createdAt:desc' }),
        apiGet('/roles')
      ]);

      // Actualizar total de usuarios
      const totalUsers = usersResponse.count || 0;
      document.getElementById('total-users').textContent = totalUsers;

      // Actualizar total de roles
      const totalRoles = rolesResponse.count || 0;
      document.getElementById('total-roles').textContent = totalRoles;

      // Actualizar fecha del último usuario
      const lastUserDate = usersResponse.data && usersResponse.data.length > 0
        ? formatDate(usersResponse.data[0].createdAt)
        : 'N/A';
      document.getElementById('last-user-date').textContent = lastUserDate;

    } catch (error) {
      console.error('Error cargando estadísticas:', error);

      // Mostrar valores por defecto en caso de error
      document.getElementById('total-users').textContent = 'Error';
      document.getElementById('total-roles').textContent = 'Error';
      document.getElementById('last-user-date').textContent = 'N/A';

      showToast('Error al cargar las estadísticas', 'warning');
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new DashboardManager();
});
