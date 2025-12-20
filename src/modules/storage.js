export class ThereminStorage {
  constructor() {
    this.storageKey = 'theremin_settings';
    
    // Configuración por defecto
    this.defaultSettings = {
      waveType: 'sine',
      sensitivity: 1.0,
      visualMode: 1,
      lastSession: null,
      sessionCount: 0
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

  // Guardo la configuración actual
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

  // Actualizo un campo específico
  updateSetting(key, value) {
    const settings = this.loadSettings();
    settings[key] = value;
    return this.saveSettings(settings);
  }

  // Registro una nueva sesión
  registerSession() {
    const settings = this.loadSettings();
    settings.sessionCount++;
    settings.lastSession = new Date().toISOString();
    this.saveSettings(settings);
    
    console.log(`Sesión ${settings.sessionCount} registrada`);
    return settings.sessionCount;
  }

  // Obtengo un valor específico
  getSetting(key) {
    const settings = this.loadSettings();
    return settings[key];
  }

  // Reseteo toda la configuración
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

  // Exporto la configuración como JSON (para debugging)
  exportSettings() {
    return JSON.stringify(this.loadSettings(), null, 2);
  }

  // Importo configuración desde JSON
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