import { Motion } from '@capacitor/motion';

export class MotionSensor {
  constructor() {
    this.tiltX = 0;
    this.tiltY = 0;
    this.isActive = false;
    this.debugMode = false;
    this.listener = null;
  }

  async init() {
    // Detecto si estoy en entorno de desarrollo (desktop)
    const isDesktop = !('ontouchstart' in window);
    
    if (isDesktop) {
      this.enableMouseDebug();
      return true;
    }

    try {
      // Uso el plugin oficial de Capacitor para motion
      this.listener = await Motion.addListener('orientation', (event) => {
        // event.alpha: rotación en Z (0-360)
        // event.beta: inclinación adelante/atrás (-180 a 180)
        // event.gamma: inclinación izquierda/derecha (-90 a 90)
        
        // Normalizo a rango -1 a 1
        this.tiltX = this.clamp(event.gamma / 45, -1, 1);
        this.tiltY = this.clamp(event.beta / 45, -1, 1);
        
        this.isActive = true;
      });

      console.log('Motion sensor inicializado con Capacitor');
      return true;

    } catch (error) {
      console.error('Error al inicializar Motion sensor:', error);
      return false;
    }
  }

  // Modo debug para desarrollo en desktop
  enableMouseDebug() {
    this.debugMode = true;
    this.isActive = true;
    
    window.addEventListener('mousemove', (event) => {
      // Normalizo posición del ratón a -1 ... 1
      this.tiltX = (event.clientX / window.innerWidth) * 2 - 1;
      this.tiltY = (event.clientY / window.innerHeight) * 2 - 1;
    });

    console.log('Modo DEBUG activado: mueve el ratón para simular inclinación');
  }

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  getTiltX() {
    return this.tiltX;
  }

  getTiltY() {
    return this.tiltY;
  }

  isDebugMode() {
    return this.debugMode;
  }

  // Limpio el listener al destruir
  async dispose() {
    if (this.listener) {
      await this.listener.remove();
      console.log('Motion sensor desconectado');
    }
  }
}