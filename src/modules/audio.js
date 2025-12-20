/**
 * MÓDULO DE SÍNTESIS DE AUDIO
 * 
 * Este módulo gestiona la generación y manipulación de sonido usando Web Audio API.
 * El theremin funciona mapeando la inclinación del dispositivo a parámetros de audio:
 * - Eje X (horizontal): controla la frecuencia (tono grave/agudo)
 * - Eje Y (vertical): controla el filtro pasa-bajos (brillo del sonido)
 * 
 * Incluye cuantización musical para que las frecuencias se ajusten a una escala
 * pentatónica mayor, lo que hace que el sonido sea más musical.
 * 
 * También integra feedback háptico usando @capacitor/haptics para mejorar
 * la experiencia táctil.
 */

import { Haptics, ImpactStyle } from '@capacitor/haptics';

export class ThereminAudio {
  constructor() {
    this.audioContext = null;
    this.oscillator = null; // Genera la onda de sonido
    this.gainNode = null; // Controla el volumen
    this.filter = null; // Filtro pasa-bajos para controlar el brillo
    this.isPlaying = false;
    
    // Defino el rango de frecuencias que usaré (200-1000 Hz)
    this.minFreq = 200;
    this.maxFreq = 1000;
    
    this.baseVolume = 0.3;
    
    // Guardo la frecuencia objetivo para poder volver correctamente después de un glitch
    this.targetFrequency = 440;
    this.targetVolume = this.baseVolume;
    
    // Genero la escala pentatónica mayor para cuantización musical
    this.pentatonicScale = this.generatePentatonicScale();
    this.useQuantization = true;
  }

  // Genero las frecuencias de una escala pentatónica mayor
  // La pentatónica mayor usa los intervalos: 0, 2, 4, 7, 9 semitonos
  // Por ejemplo: Do, Re, Mi, Sol, La
  generatePentatonicScale() {
    const baseFreq = 220; // Empiezo desde La (A3)
    const intervals = [0, 2, 4, 7, 9]; // Intervalos de la pentatónica mayor
    const octaves = 3; // Genero 3 octavas para tener suficiente rango
    const scale = [];
    
    for (let octave = 0; octave < octaves; octave++) {
      for (let interval of intervals) {
        // Calculo cada frecuencia usando la fórmula: freq = baseFreq * 2^(semitonos/12)
        const semitones = (octave * 12) + interval;
        const frequency = baseFreq * Math.pow(2, semitones / 12);
        scale.push(frequency);
      }
    }
    
    // Ordeno las frecuencias de menor a mayor
    return scale.sort((a, b) => a - b);
  }

  // Encuentro la nota más cercana en la escala pentatónica
  // Esto hace que el theremin suene más musical
  quantizeFrequency(targetFreq) {
    if (!this.useQuantization) {
      return targetFreq;
    }
    
    let closest = this.pentatonicScale[0];
    let minDiff = Math.abs(targetFreq - closest);
    
    // Busco la frecuencia de la escala más cercana a la objetivo
    for (let freq of this.pentatonicScale) {
      const diff = Math.abs(targetFreq - freq);
      if (diff < minDiff) {
        minDiff = diff;
        closest = freq;
      }
    }
    
    return closest;
  }

  async init() {
    try {
      // Creo el contexto de audio compatible con diferentes navegadores
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Creo los nodos de audio que necesito
      this.oscillator = this.audioContext.createOscillator();
      this.gainNode = this.audioContext.createGain();
      this.filter = this.audioContext.createBiquadFilter();
      
      // Configuro el oscilador con onda sinusoidal (la más suave)
      this.oscillator.type = 'sine';
      this.oscillator.frequency.value = 440; // La central (A4)
      
      // Configuro el filtro pasa-bajos para controlar el brillo del sonido
      // Frecuencias altas = sonido brillante, frecuencias bajas = sonido apagado
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 2000;
      this.filter.Q.value = 1; // Resonancia del filtro
      
      // Inicializo el volumen a 0 (silencio)
      this.gainNode.gain.value = 0;
      
      // Conecto los nodos en cadena: oscillator -> filter -> gain -> speakers
      this.oscillator.connect(this.filter);
      this.filter.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
      
      // Arranco el oscilador (aunque sin volumen todavía)
      this.oscillator.start();
      
      console.log('Audio inicializado correctamente');
      console.log('Escala pentatónica:', this.pentatonicScale.map(f => f.toFixed(1)));
      return true;
      
    } catch (error) {
      console.error('Error al inicializar el audio:', error);
      return false;
    }
  }

  async start() {
    if (!this.audioContext) return;
    
    // Reanudo el contexto si estaba suspendido (política de los navegadores)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Hago un fade in suave del volumen para evitar clicks
    this.gainNode.gain.setTargetAtTime(
      this.baseVolume, 
      this.audioContext.currentTime, 
      0.1
    );
    
    this.isPlaying = true;
    
    // Feedback háptico al iniciar
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.log('Haptics no disponible en este dispositivo');
    }
    
    console.log('Audio iniciado');
  }

  async stop() {
    if (!this.audioContext) return;
    
    // Hago un fade out suave
    this.gainNode.gain.setTargetAtTime(
      0, 
      this.audioContext.currentTime, 
      0.1
    );
    
    this.isPlaying = false;
    
    // Feedback háptico suave al detener
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.log('Haptics no disponible en este dispositivo');
    }
    
    console.log('Audio pausado');
  }

  // Actualizo los parámetros del audio según la inclinación del dispositivo
  // Este método se llama en cada frame del sketch
  update(tiltX, tiltY) {
    if (!this.isPlaying || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    // La inclinación horizontal (tiltX) controla la frecuencia
    // Normalizo de -1...1 a 0...1
    const normalizedX = (tiltX + 1) / 2;
    const rawFrequency = this.minFreq + (normalizedX * (this.maxFreq - this.minFreq));
    
    // Cuantizo la frecuencia a la escala pentatónica para que suene musical
    const frequency = this.quantizeFrequency(rawFrequency);
    
    // Guardo la frecuencia objetivo para poder volver después de un glitch
    this.targetFrequency = frequency;
    this.oscillator.frequency.setTargetAtTime(frequency, now, 0.01);
    
    // La inclinación vertical (tiltY) controla el filtro (brillo del sonido)
    const normalizedY = (tiltY + 1) / 2;
    const filterFreq = 400 + (normalizedY * 1400);
    this.filter.frequency.setTargetAtTime(filterFreq, now, 0.02);
  }

  // Cambio el tipo de onda del oscilador
  // Cada tipo de onda tiene un timbre diferente
  setWaveType(type) {
    if (['sine', 'square', 'sawtooth', 'triangle'].includes(type)) {
      this.oscillator.type = type;
      console.log('Tipo de onda cambiado a:', type);
    }
  }

  // Activo/desactivo la cuantización musical
  toggleQuantization() {
    this.useQuantization = !this.useQuantization;
    console.log('Cuantización:', this.useQuantization ? 'activada' : 'desactivada');
    return this.useQuantization;
  }

  // Efecto glitch: salto brusco de frecuencia y volumen
  // Vuelve suavemente a los valores objetivo guardados
  async glitch() {
    if (!this.isPlaying || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    // Genero un salto de frecuencia controlado (±100 Hz desde la actual)
    // en lugar de totalmente aleatorio para que sea menos agresivo
    const glitchOffset = (Math.random() - 0.5) * 200;
    const glitchFreq = Math.max(100, this.targetFrequency + glitchOffset);
    
    this.oscillator.frequency.setValueAtTime(glitchFreq, now);
    
    // Vuelvo a la frecuencia objetivo en 50ms
    this.oscillator.frequency.exponentialRampToValueAtTime(
      this.targetFrequency, 
      now + 0.05
    );
    
    // Pico de volumen sutil (1.2x en lugar de 1.5x)
    this.gainNode.gain.setValueAtTime(this.baseVolume * 1.2, now);
    
    // Vuelvo al volumen base rápidamente
    this.gainNode.gain.exponentialRampToValueAtTime(
      this.baseVolume,
      now + 0.05
    );
    
    // Vibración fuerte en el glitch
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.log('Haptics no disponible en este dispositivo');
    }
    
    console.log('Efecto glitch aplicado');
  }

  // Limpio los recursos al destruir el objeto
  dispose() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
    }
    if (this.gainNode) this.gainNode.disconnect();
    if (this.filter) this.filter.disconnect();
    if (this.audioContext) this.audioContext.close();
  }
}