/**
 * SICEP - Capa de Base de Datos y Conexión MySQL / Local
 * ========================================================
 * Conecta la interfaz web con el servidor backend MySQL (API REST).
 * Si el servidor MySQL no está encendido o no hay conexión de red,
 * el sistema recurre de forma transparente a almacenamiento local (localStorage)
 * garantizando que la página nunca se bloquee ni pierda datos.
 */

const AppDB = (function () {
  'use strict';

  const LOCAL_STORAGE_KEY = 'SICEP_6A_2026GM_STATE_V1';
  
  // Detección inteligente de URL de la API:
  // Si la página se abrió desde http:// o https:// (servidor integrado), usa el mismo origen.
  // Si se abrió como archivo local (file://), usa http://localhost:3000/api
  let apiUrl = localStorage.getItem('SICEP_MYSQL_API_URL');
  if (!apiUrl) {
    if (typeof window !== 'undefined' && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
      apiUrl = `${window.location.origin}/api`;
    } else {
      apiUrl = 'http://localhost:3000/api';
    }
  }

  let currentMode = 'local'; // 'mysql' | 'local'
  let pollInterval = null;

  // Verifica el estado del servidor MySQL
  async function checkServerHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${apiUrl}/health?_t=${Date.now()}`, { 
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const prevMode = currentMode;
        currentMode = 'mysql';
        if (prevMode !== 'mysql') {
          console.log('🐬 SICEP DB: Conectado exitosamente al servidor MySQL:', data);
          window.dispatchEvent(new CustomEvent('sicep:db_status_changed', { detail: { mode: 'mysql', data } }));
        }
        return true;
      }
    } catch (e) {
      const prevMode = currentMode;
      currentMode = 'local';
      if (prevMode !== 'local') {
        console.log('ℹ️ SICEP DB: Servidor MySQL offline. Operando en MODO LOCAL (localStorage).');
        window.dispatchEvent(new CustomEvent('sicep:db_status_changed', { detail: { mode: 'local' } }));
      }
    }
    return false;
  }

  // Auto-reconectador en segundo plano: sondea cada 3.5 segundos si estamos en modo local
  function startAutoReconnect() {
    if (pollInterval) return;
    pollInterval = setInterval(async () => {
      if (currentMode !== 'mysql') {
        await checkServerHealth();
      }
    }, 3500);
  }

  // Inicializa la capa de base de datos
  async function init() {
    await checkServerHealth();
    startAutoReconnect();
    return currentMode;
  }

  // Carga de datos
  async function loadState(defaultStateBuilder) {
    // 1. Intentar cargar desde MySQL si el servidor está disponible
    if (currentMode === 'mysql') {
      try {
        const res = await fetch(`${apiUrl}/estado?_t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const cloudData = await res.json();
          if (cloudData && Array.isArray(cloudData.students) && cloudData.students.length > 0) {
            console.log('🐬 SICEP DB: Datos cargados desde MySQL.');
            // Guardar copia local en caso de desconexión posterior
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudData));
            return { state: cloudData, source: 'mysql' };
          }
        }
      } catch (err) {
        console.warn('⚠️ SICEP DB: Error al cargar de MySQL, recurriendo a local:', err);
      }
    }

    // 2. Cargar desde LocalStorage
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.students) && parsed.students.length > 0) {
          return { state: parsed, source: 'local' };
        }
      }
    } catch (err) {
      console.warn('⚠️ SICEP DB: Error leyendo localStorage:', err);
    }

    // 3. Estado por defecto (Semilla oficial)
    return { state: defaultStateBuilder(), source: 'default' };
  }

  // Guardado de datos
  async function saveState(state) {
    // 1. Siempre guardar en localStorage como respaldo inmediato
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('⚠️ SICEP DB: Error guardando en localStorage:', err);
    }

    // 2. Si el servidor MySQL está activo, enviar por API REST
    if (currentMode === 'mysql') {
      try {
        const res = await fetch(`${apiUrl}/guardar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolConfig: state.schoolConfig,
            security: state.security,
            students: state.students
          })
        });

        if (res.ok) {
          return { success: true, mode: 'mysql' };
        }
      } catch (err) {
        console.warn('⚠️ SICEP DB: Error guardando en MySQL:', err);
        return { success: false, mode: 'local', error: err };
      }
    }

    return { success: true, mode: 'local' };
  }

  function getMode() {
    return currentMode;
  }

  function getApiUrl() {
    return apiUrl;
  }

  function setApiUrl(newUrl) {
    apiUrl = newUrl;
    localStorage.setItem('SICEP_MYSQL_API_URL', newUrl);
    return checkServerHealth();
  }

  async function login(username, password) {
    if (currentMode === 'mysql') {
      try {
        const res = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        if (res.ok) {
          const data = await res.json();
          return { success: true, docente: data.docente };
        } else {
          const errData = await res.json().catch(() => ({}));
          return { success: false, error: errData.error || 'Usuario o contraseña incorrectos' };
        }
      } catch (e) {
        console.warn('⚠️ Error de autenticación API MySQL:', e);
      }
    }
    return null; // Requiere validación local
  }

  async function createIncident(data) {
    if (currentMode === 'mysql') {
      try {
        const res = await fetch(`${apiUrl}/incidencias/crear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          const jsonRes = await res.json();
          return jsonRes.incidencia;
        }
      } catch (e) {
        console.warn('⚠️ Error al crear incidencia en MySQL:', e);
      }
    }
    // Fallback ID local
    return {
      id_incidencia: 'local_' + Date.now(),
      ...data
    };
  }

  async function deleteIncident(id_incidencia) {
    if (currentMode === 'mysql') {
      try {
        await fetch(`${apiUrl}/incidencias/eliminar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_incidencia })
        });
      } catch (e) {
        console.warn('⚠️ Error al eliminar incidencia en MySQL:', e);
      }
    }
    return true;
  }

  return {
    init,
    loadState,
    saveState,
    login,
    createIncident,
    deleteIncident,
    getMode,
    getApiUrl,
    setApiUrl,
    checkServerHealth
  };
})();
