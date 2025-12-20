import { Haptics, ImpactStyle } from '@capacitor/haptics';

export class ThereminAudio {
  constructor() {
    this.audioContext = null;
    this.oscillator = null;
    this.gainNode = null;
    this.filter = null;
    this.isPlaying = false;
    
    this.minFreq = 110;
    this.maxFreq = 660;
    
    this.baseVolume = 0.3;
    
    // Guardo la frecuencia objetivo actual para poder volver después del glitch
    this.targetFrequency = 440;
    this.targetVolume = this.baseVolume;
    
    // Genero escala pentatónica mayor en varias octavas
    this.pentatonicScale = this.generatePentatonicScale();
    this.useQuantization = true; // Puedo activar/desactivar la cuantización
  }

  // Genero las frecuencias de una escala pentatónica mayor
  generatePentatonicScale() {
    const baseFreq = 220; // A3
    const intervals = [0, 2, 4, 7, 9]; // Pentatónica mayor en semitonos
    const octaves = 3; // Genero 3 octavas
    const scale = [];
    
    for (let octave = 0; octave < octaves; octave++) {
      for (let interval of intervals) {
        // Calculo la frecuencia: freq = baseFreq * 2^(semitonos/12)
        const semitones = (octave * 12) + interval;
        const frequency = baseFreq * Math.pow(2, semitones / 12);
        scale.push(frequency);
      }
    }
    
    return scale.sort((a, b) => a - b);
  }

  // Encuentro la nota más cercana en la escala
  quantizeFrequency(targetFreq) {
    if (!this.useQuantization) {
      return targetFreq;
    }
    
    let closest = this.pentatonicScale[0];
    let minDiff = Math.abs(targetFreq - closest);
    
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
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      this.oscillator = this.audioContext.createOscillator();
      this.gainNode = this.audioContext.createGain();
      this.filter = this.audioContext.createBiquadFilter();
      
      this.oscillator.type = 'sine';
      this.oscillator.frequency.value = 440;
      
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 2000;
      this.filter.Q.value = 1;
      
      this.gainNode.gain.value = 0;
      
      this.oscillator.connect(this.filter);
      this.filter.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
      
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
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    this.gainNode.gain.setTargetAtTime(
      this.baseVolume, 
      this.audioContext.currentTime, 
      0.1
    );
    
    this.isPlaying = true;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.log('Haptics no disponible en este dispositivo');
    }
    
    console.log('Audio iniciado');
  }

  async stop() {
    if (!this.audioContext) return;
    
    this.gainNode.gain.setTargetAtTime(
      0, 
      this.audioContext.currentTime, 
      0.1
    );
    
    this.isPlaying = false;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.log('Haptics no disponible en este dispositivo');
    }
    
    console.log('Audio pausado');
  }

  update(tiltX, tiltY) {
    if (!this.isPlaying || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    const normalizedX = (tiltX + 1) / 2;
    const rawFrequency = this.minFreq + (normalizedX * (this.maxFreq - this.minFreq));
    
    // Cuantizo la frecuencia a la escala pentatónica
    const frequency = this.quantizeFrequency(rawFrequency);
    
    this.targetFrequency = frequency;
    this.oscillator.frequency.setTargetAtTime(frequency, now, 0.01);
    
    const normalizedY = (tiltY + 1) / 2;
    const filterFreq = 400 + (normalizedY * 1400);
    this.filter.frequency.setTargetAtTime(filterFreq, now, 0.02);
    
    const volume = this.baseVolume * (0.5 + normalizedY * 0.5);
    
    // Guardo el volumen objetivo también
    this.targetVolume = volume;
    //this.gainNode.gain.setTargetAtTime(volume, now, 0.01);
    this.gainNode.gain.setTargetAtTime(this.baseVolume, now, 0.02);
  }

  setWaveType(type) {
    if (['sine', 'square', 'sawtooth', 'triangle'].includes(type)) {
      this.oscillator.type = type;
      console.log('Tipo de onda cambiado a:', type);
    }
  }

  // Activo/desactivo la cuantización
  toggleQuantization() {
    this.useQuantization = !this.useQuantization;
    console.log('Cuantización:', this.useQuantization ? 'activada' : 'desactivada');
    return this.useQuantization;
  }

  async glitch() {
    if (!this.isPlaying || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    // Genero un salto de frecuencia más corto y controlado
    // En lugar de totalmente aleatorio, salto desde la frecuencia actual
    const glitchOffset = (Math.random() - 0.5) * 200; // ±100 Hz desde la actual
    const glitchFreq = Math.max(100, this.targetFrequency + glitchOffset);
    
    this.oscillator.frequency.setValueAtTime(glitchFreq, now);
    
    // Vuelvo a la frecuencia objetivo en menos tiempo
    this.oscillator.frequency.exponentialRampToValueAtTime(
      this.targetFrequency, 
      now + 0.05 // Reduzco de 0.1 a 0.05 segundos
    );
    
    // Pico de volumen más sutil
    this.gainNode.gain.setValueAtTime(this.baseVolume * 1.2, now); // Reduzco de 1.5 a 1.2
    
    // Vuelvo al volumen objetivo más rápido
    this.gainNode.gain.exponentialRampToValueAtTime(
      this.baseVolume, // Vuelvo al volumen base en lugar del objetivo variable
      now + 0.05
    );
    
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.log('Haptics no disponible en este dispositivo');
    }
    
    console.log('Efecto glitch aplicado');
  }

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