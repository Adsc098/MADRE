/**
 * SICEP - Configuración de Base de Datos en la Nube (Firebase Firestore)
 * ======================================================================
 * Esta configuración permite conectar el sistema a la nube de Google Firebase.
 * Diseñado con arquitectura MULTI-USUARIO: cada docente tiene sus propios
 * grupos, alumnos y calificaciones aislados de forma segura.
 * 
 * INSTRUCCIONES RÁPIDAS PARA ACTIVAR LA NUBE GRATIS:
 * 1. Ve a https://console.firebase.google.com/ e inicia sesión con tu cuenta Google.
 * 2. Haz clic en "Crear un proyecto" (ej. "sicep-calificaciones").
 * 3. En el menú izquierdo, ve a "Firestore Database" y haz clic en "Crear base de datos"
 *    (inicia en "Modo de prueba").
 * 4. En el menú izquierdo, ve a "Autenticación" y activa el método "Correo/Contraseña".
 * 5. En "Configuración del proyecto" (ícono de engrane), añade una app Web (</>) y 
 *    copia las claves en este archivo reemplazando los valores abajo.
 * 
 * NOTA: Mientras no se configuren las claves reales, el sistema funciona 
 * automáticamente al 100% en MODO LOCAL (localStorage).
 */

const FIREBASE_CONFIG = {
  // Reemplaza estos valores con los de tu proyecto de Firebase cuando los tengas:
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Variable para verificar si las credenciales ya fueron personalizadas
function isFirebaseConfigured() {
  return FIREBASE_CONFIG && 
         FIREBASE_CONFIG.apiKey && 
         FIREBASE_CONFIG.apiKey !== "TU_API_KEY_AQUI" && 
         FIREBASE_CONFIG.projectId &&
         FIREBASE_CONFIG.projectId !== "tu-proyecto-id";
}
