/**
 * MÓDULO DE ALMACENAMIENTO LOCAL
 * 
 * Este módulo gestiona la persistencia de datos usando LocalStorage del navegador.
 * Guarda la configuración del usuario (tipo de onda, sensibilidad) y estadísticas
 * de uso (número de sesiones, última fecha de uso).
 * 
 * Permite que la configuración se mantenga entre sesiones y que el usuario
 * no tenga que reconfigurar la aplicación cada vez que la abre.
 */

export class ThereminStorage {
  constructor() {
    this.storageKey = 'theremin_settings';
    
    // Defino la configuración por defecto que se usará la primera vez
    this.defaultSettings = {
      waveType: 'sine', // Tipo de onda del oscilador
      sensitivity: 1.0, // Multiplicador de sensibilidad de los sensores
      visualMode: 1, // Modo de visualización (si hay varios)
      lastSession: null, // Timestamp de la última sesión
      sessionCount: 0 // Contador de veces que se ha usado la app
    };
  }

  // Cargo la configuración guardada o devuelvo los valores por defecto
  loadSettings() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      
      if (stored) {
        const settings = JSON.parse(stored);
        console.log('Configuración cargada:', settings);
        return settings;
      }
      
      console.log('No hay configuración guardada, usando valores por defecto');
      return { ...this.defaultSettings };
      
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      return { ...this.defaultSettings };
    }
  }

  // Guardo la configuración actual en LocalStorage
  saveSettings(settings) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
      console.log('Configuración guardada:', settings);
      return true;
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      return false;
    }
  }

  // Actualizo solo un campo específico sin tocar el resto
  updateSetting(key, value) {
    const settings = this.loadSettings();
    settings[key] = value;
    return this.saveSettings(settings);
  }

  // Registro una nueva sesión cada vez que se inicia la aplicación
  registerSession() {
    const settings = this.loadSettings();
    settings.sessionCount++;
    settings.lastSession = new Date().toISOString();
    this.saveSettings(settings);
    
    console.log(`Sesión ${settings.sessionCount} registrada`);
    return settings.sessionCount;
  }

  // Obtengo un valor específico sin cargar toda la configuración
  getSetting(key) {
    const settings = this.loadSettings();
    return settings[key];
  }

  // Reseteo toda la configuración a valores por defecto
  resetSettings() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('Configuración reseteada');
      return true;
    } catch (error) {
      console.error('Error al resetear configuración:', error);
      return false;
    }
  }

  // Exporto la configuración como JSON (útil para debugging)
  exportSettings() {
    return JSON.stringify(this.loadSettings(), null, 2);
  }

  // Importo configuración desde JSON (útil para compartir configuraciones)
  importSettings(jsonString) {
    try {
      const settings = JSON.parse(jsonString);
      return this.saveSettings(settings);
    } catch (error) {
      console.error('Error al importar configuración:', error);
      return false;
    }
  }
}