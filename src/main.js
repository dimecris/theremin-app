import './css/style.css';
import { MotionSensor } from './modules/motion.js';
import { ThereminAudio } from './modules/audio.js';
import { ThereminStorage } from './modules/storage.js';
import { createSketch } from './modules/sketch.js';

const motionSensor = new MotionSensor();
const thereminAudio = new ThereminAudio();
const storage = new ThereminStorage();

const settings = storage.loadSettings();
console.log('Configuración inicial:', settings);

const startBtn = document.getElementById('startBtn');
startBtn.textContent = 'Iniciar Theremin';

let isRunning = false;

startBtn.addEventListener('click', async () => {
  if (!isRunning) {
    const motionOk = await motionSensor.init();
    const audioOk = await thereminAudio.init();
    
    if (motionOk && audioOk) {
      thereminAudio.setWaveType(settings.waveType);
      
      await thereminAudio.start();
      startBtn.textContent = 'Detener';
      isRunning = true;
      
      storage.registerSession();
      
      console.log('Theremin activo con plugins de Capacitor');
    } else {
      startBtn.textContent = 'Error - Reintentar';
    }
  } else {
    await thereminAudio.stop();
    startBtn.textContent = 'Iniciar Theremin';
    isRunning = false;
  }
});

createSketch(motionSensor, thereminAudio, storage);

// Limpio recursos al cerrar
window.addEventListener('beforeunload', async () => {
  await motionSensor.dispose();
  thereminAudio.dispose();
});