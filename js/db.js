/**
 * SICEP - Capa de Base de Datos Multi-Usuario (Cloud & Local Database Layer)
 * =========================================================================
 * Proporciona persistencia híbrida:
 * 1. Nube (Firebase Firestore): Multi-usuario en tiempo real. Cada docente tiene sus propios
 *    grupos y alumnos bajo su propio ID de usuario / docente.
 * 2. Local (localStorage): Funciona como respaldo inmediato y modo offline cuando no hay internet
 *    o mientras no se hayan configurado credenciales en la nube.
 */

const AppDB = (function () {
  'use strict';

  const LOCAL_STORAGE_KEY = 'SICEP_6A_2026GM_STATE_V1';
  let firebaseApp = null;
  let firestore = null;
  let firebaseAuth = null;
  let currentMode = 'local'; // 'cloud' | 'local'
  let unsubscribeSnapshot = null;

  // Clave de grupo para multi-tenancy: normaliza ciclo y grupo (ej: "2026-2027_6A")
  function getGroupKey(schoolConfig) {
    if (!schoolConfig) return 'grupo_principal';
    const c = (schoolConfig.cycle || '2026-2027').replace(/[^a-zA-Z0-9]/g, '');
    const g = (schoolConfig.group || '6A').replace(/[^a-zA-Z0-9]/g, '');
    return `${c}_${g}`.toLowerCase();
  }

  // ID del docente para multi-usuario
  function getTeacherId(security, schoolConfig) {
    if (firebaseAuth && firebaseAuth.currentUser) {
      return firebaseAuth.currentUser.uid;
    }
    if (security && security.username) {
      return security.username.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');
    }
    return 'docente_cchavarria';
  }

  // Inicialización de Firebase si está configurado
  function init() {
    try {
      // 1. Verificar si hay credenciales guardadas en localStorage (configuradas desde la UI)
      let customConfig = null;
      try {
        const stored = localStorage.getItem('SICEP_CUSTOM_FIREBASE_CONFIG');
        if (stored) customConfig = JSON.parse(stored);
      } catch (e) {
        // Ignorar error de parsing
      }

      const activeConfig = customConfig || (typeof FIREBASE_CONFIG !== 'undefined' ? FIREBASE_CONFIG : null);

      const isConfigured = activeConfig && 
                           activeConfig.apiKey && 
                           activeConfig.apiKey !== 'TU_API_KEY_AQUI' && 
                           activeConfig.projectId && 
                           activeConfig.projectId !== 'tu-proyecto-id';

      if (isConfigured && typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
          firebaseApp = firebase.initializeApp(activeConfig);
        } else {
          firebaseApp = firebase.app();
        }
        firestore = firebase.firestore();
        firebaseAuth = firebase.auth();
        currentMode = 'cloud';
        console.log('✅ SICEP DB: Conectado a Firebase Firestore en modo MULTI-USUARIO.');
      } else {
        currentMode = 'local';
        console.log('ℹ️ SICEP DB: Operando en MODO LOCAL (localStorage).');
      }
    } catch (err) {
      console.warn('⚠️ SICEP DB: Error al inicializar Firebase, operando en modo local:', err);
      currentMode = 'local';
    }
    return currentMode;
  }

  // Carga de datos (Prioridad: Cloud -> LocalStorage -> Default)
  async function loadState(defaultStateBuilder) {
    // 1. Intentar cargar desde Firestore si está en modo Cloud
    if (currentMode === 'cloud' && firestore) {
      try {
        const teacherId = getTeacherId(null, null);
        const docRef = firestore.collection('docentes').doc(teacherId).collection('grupos').doc('6a_primaria');
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          const cloudData = docSnap.data();
          if (cloudData && cloudData.state) {
            console.log('☁️ SICEP DB: Datos cargados exitosamente desde la nube.');
            // Respaldar localmente
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudData.state));
            return { state: cloudData.state, source: 'cloud' };
          }
        }
      } catch (err) {
        console.warn('⚠️ SICEP DB: No se pudo leer de la nube, recurriendo a local:', err);
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

    // 3. Estado por defecto
    return { state: defaultStateBuilder(), source: 'default' };
  }

  // Guardado de datos
  async function saveState(state) {
    // 1. Siempre guardar en localStorage para disponibilidad instantánea y offline
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('⚠️ SICEP DB: Error guardando en localStorage:', err);
    }

    // 2. Si la nube está activa, sincronizar en Firestore bajo la estructura multi-usuario
    if (currentMode === 'cloud' && firestore) {
      try {
        const teacherId = getTeacherId(state.security, state.schoolConfig);
        const groupKey = getGroupKey(state.schoolConfig);

        const payload = {
          teacherId,
          groupKey,
          schoolConfig: state.schoolConfig,
          studentsCount: state.students ? state.students.length : 0,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedBy: state.schoolConfig ? state.schoolConfig.teacher : 'Docente',
          state: state
        };

        // Guardar bajo: docentes/{teacherId}/grupos/{groupKey}
        await firestore
          .collection('docentes')
          .doc(teacherId)
          .collection('grupos')
          .doc(groupKey)
          .set(payload, { merge: true });

        // También actualizar el perfil del docente
        await firestore.collection('docentes').doc(teacherId).set({
          teacherName: state.schoolConfig ? state.schoolConfig.teacher : 'Docente',
          cct: state.schoolConfig ? state.schoolConfig.cct : '',
          schoolName: state.schoolConfig ? state.schoolConfig.schoolName : '',
          lastActive: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        return { success: true, mode: 'cloud' };
      } catch (err) {
        console.error('⚠️ SICEP DB: Error guardando en Firebase Firestore:', err);
        return { success: false, mode: 'local', error: err };
      }
    }

    return { success: true, mode: 'local' };
  }

  // Escuchar cambios en tiempo real (Multi-dispositivo)
  function listenToRemoteChanges(state, onRemoteChangeCallback) {
    if (currentMode !== 'cloud' || !firestore) return;

    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
      unsubscribeSnapshot = null;
    }

    try {
      const teacherId = getTeacherId(state.security, state.schoolConfig);
      const groupKey = getGroupKey(state.schoolConfig);

      unsubscribeSnapshot = firestore
        .collection('docentes')
        .doc(teacherId)
        .collection('grupos')
        .doc(groupKey)
        .onSnapshot((doc) => {
          if (doc.metadata && doc.metadata.hasPendingWrites) {
            // Cambio local en curso, no sobreescribir
            return;
          }
          if (doc.exists) {
            const data = doc.data();
            if (data && data.state && typeof onRemoteChangeCallback === 'function') {
              onRemoteChangeCallback(data.state);
            }
          }
        }, (err) => {
          console.warn('⚠️ SICEP DB: Error en listener en tiempo real:', err);
        });
    } catch (e) {
      console.warn('⚠️ SICEP DB: No se pudo suscribir a cambios:', e);
    }
  }

  function getMode() {
    return currentMode;
  }

  function saveCustomFirebaseConfig(configObj) {
    try {
      localStorage.setItem('SICEP_CUSTOM_FIREBASE_CONFIG', JSON.stringify(configObj));
      init();
      return true;
    } catch (e) {
      return false;
    }
  }

  return {
    init,
    loadState,
    saveState,
    listenToRemoteChanges,
    getMode,
    saveCustomFirebaseConfig
  };
})();
