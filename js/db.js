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
  let apiUrl = localStorage.getItem('SICEP_MYSQL_API_URL') || 'http://localhost:3000/api';
  let currentMode = 'local'; // 'mysql' | 'local'

  // Verifica el estado del servidor MySQL
  async function checkServerHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(`${apiUrl}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        currentMode = 'mysql';
        console.log('🐬 SICEP DB: Conectado exitosamente al servidor MySQL:', data);
        return true;
      }
    } catch (e) {
      currentMode = 'local';
      console.log('ℹ️ SICEP DB: Servidor MySQL offline. Operando en MODO LOCAL (localStorage).');
    }
    return false;
  }

  // Inicializa la capa de base de datos
  async function init() {
    await checkServerHealth();
    return currentMode;
  }

  // Carga de datos
  async function loadState(defaultStateBuilder) {
    // 1. Intentar cargar desde MySQL si el servidor está disponible
    if (currentMode === 'mysql') {
      try {
        const res = await fetch(`${apiUrl}/estado`);
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

  return {
    init,
    loadState,
    saveState,
    getMode,
    getApiUrl,
    setApiUrl,
    checkServerHealth
  };
})();
