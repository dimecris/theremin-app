export const createSketch = (motionSensor, thereminAudio, storage) => {
  return new p5((p) => {
    let particles = [];
    const numParticles = 100;
    let settings;

    p.setup = () => {
      let cnv = p.createCanvas(p.windowWidth, p.windowHeight);
      cnv.parent('p5-container');

      settings = storage.loadSettings();

      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    p.draw = () => {
      p.background(18, 50);

      const tiltX = motionSensor.getTiltX();
      const tiltY = motionSensor.getTiltY();

      const adjustedTiltX = tiltX * settings.sensitivity;
      const adjustedTiltY = tiltY * settings.sensitivity;

      thereminAudio.update(adjustedTiltX, adjustedTiltY);

      p.fill(255);
      p.noStroke();
      p.textSize(14);
      const mode = motionSensor.isDebugMode() ? 'MOUSE' : 'SENSOR';
      const audioStatus = thereminAudio.isPlaying ? 'ON' : 'OFF';
      p.text(`Modo: ${mode} | Audio: ${audioStatus} | Sesiones: ${settings.sessionCount}`, 10, 20);
      p.text(`Wave: ${settings.waveType} | Sensibilidad: ${settings.sensitivity}`, 10, 40);

      for (let particle of particles) {
        particle.update(adjustedTiltX, adjustedTiltY);
        particle.display();
      }

      if (settings.visualMode === 1) {
        drawWaves(adjustedTiltX, adjustedTiltY);
      }
    };

     p.keyPressed = () => {
      const waveTypes = ['sine', 'square', 'sawtooth', 'triangle'];
      
      if (p.key >= '1' && p.key <= '4') {
        const index = parseInt(p.key) - 1;
        settings.waveType = waveTypes[index];
        thereminAudio.setWaveType(settings.waveType);
        storage.updateSetting('waveType', settings.waveType);
      }
      
      if (p.key === '+' || p.key === '=') {
        settings.sensitivity = Math.min(2.0, settings.sensitivity + 0.1);
        storage.updateSetting('sensitivity', settings.sensitivity);
      }
      if (p.key === '-' || p.key === '_') {
        settings.sensitivity = Math.max(0.1, settings.sensitivity - 0.1);
        storage.updateSetting('sensitivity', settings.sensitivity);
      }
      
      // Tecla Q para activar/desactivar cuantización
      if (p.key === 'q' || p.key === 'Q') {
        thereminAudio.toggleQuantization();
      }
    };

    function drawWaves(tiltX, tiltY) {
      p.noFill();
      p.stroke(100, 200, 255, 100);
      p.strokeWeight(2);

      for (let i = 0; i < 3; i++) {
        p.beginShape();
        for (let x = 0; x < p.width; x += 10) {
          let amplitude = 50 + tiltY * 50;
          let frequency = 0.01 + tiltX * 0.01;
          let offset = i * 50;
          
          let y = p.height / 2 + offset + 
                  p.sin(x * frequency + p.millis() * 0.001) * amplitude;
          
          p.vertex(x, y);
        }
        p.endShape();
      }
    }

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = p.random(p.width);
        this.y = p.random(p.height);
        this.vx = 0;
        this.vy = 0;
        this.size = p.random(2, 8);
        this.alpha = 255;
      }

      update(tiltX, tiltY) {
        this.vx += tiltX * 0.5;
        this.vy += tiltY * 0.5;

        this.vx *= 0.95;
        this.vy *= 0.95;

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > p.width) {
          this.vx *= -0.8;
          this.x = p.constrain(this.x, 0, p.width);
        }
        if (this.y < 0 || this.y > p.height) {
          this.vy *= -0.8;
          this.y = p.constrain(this.y, 0, p.height);
        }
      }

      display() {
        p.noStroke();
        p.fill(255, 100, 150, this.alpha);
        p.ellipse(this.x, this.y, this.size);
      }
    }
  });
};