/**
 * MÓDULO DE SENSORES DE MOVIMIENTO
 * 
 * Este módulo gestiona la lectura de los sensores de orientación del dispositivo
 * utilizando el plugin oficial de Capacitor (@capacitor/motion).
 * 
 * En móvil lee los valores reales del giroscopio.
 * En desktop (desarrollo) simula la inclinación con la posición del ratón.
 * 
 * Los valores de inclinación se normalizan entre -1 y 1 para facilitar
 * su uso en el control de audio y visualización.
 */

import { Motion } from '@capacitor/motion';

export class MotionSensor {
  constructor() {
    // Almaceno los valores de inclinación normalizados
    this.tiltX = 0; // Inclinación horizontal (izquierda/derecha)
    this.tiltY = 0; // Inclinación vertical (adelante/atrás)
    this.isActive = false;
    this.debugMode = false; // Indica si estamos en modo desarrollo
    this.listener = null; // Referencia al listener de Capacitor
  }

  async init() {
    // Detecto si estoy en un entorno de escritorio para activar el modo debug
    const isDesktop = !('ontouchstart' in window);
    
    if (isDesktop) {
      this.enableMouseDebug();
      return true;
    }

    try {
      // Inicio el listener de orientación usando el plugin de Capacitor
      // Este método funciona tanto en Android como iOS
      this.listener = await Motion.addListener('orientation', (event) => {
        // event.gamma: inclinación izquierda/derecha (-90 a 90 grados)
        // event.beta: inclinación adelante/atrás (-180 a 180 grados)
        
        // Normalizo dividiendo por 45 grados para obtener un rango -1 a 1
        // que es más cómodo para mapear a frecuencias y parámetros visuales
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

  // Modo debug para desarrollo en navegador de escritorio
  // Permite probar la aplicación sin necesidad de un dispositivo móvil
  enableMouseDebug() {
    this.debugMode = true;
    this.isActive = true;
    
    window.addEventListener('mousemove', (event) => {
      // Convierto la posición del ratón a valores entre -1 y 1
      // Esto simula la inclinación del dispositivo
      this.tiltX = (event.clientX / window.innerWidth) * 2 - 1;
      this.tiltY = (event.clientY / window.innerHeight) * 2 - 1;
    });

    console.log('Modo DEBUG activado: mueve el ratón para simular inclinación');
  }

  // Limito un valor entre un mínimo y un máximo
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

  // Limpio el listener cuando ya no lo necesito
  async dispose() {
    if (this.listener) {
      await this.listener.remove();
      console.log('Motion sensor desconectado');
    }
  }
}