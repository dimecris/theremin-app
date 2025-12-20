export const createSketch = (motionSensor, thereminAudio, storage) => {
  return new p5((p) => {
    let particles = [];
    const numParticles = 100;
    let settings;
    let showHUD = false;

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

      if (showHUD || motionSensor.isDebugMode()) {
        p.fill(255);
        p.noStroke();
        p.textSize(14);
        const mode = motionSensor.isDebugMode() ? 'MOUSE' : 'SENSOR';
        const audioStatus = thereminAudio.isPlaying ? 'ON' : 'OFF';
        p.text(`Modo: ${mode} | Audio: ${audioStatus} | Sesiones: ${settings.sessionCount}`, 10, 20);
        p.text(`Wave: ${settings.waveType} | Sensibilidad: ${settings.sensitivity.toFixed(1)}`, 10, 40);
      }

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
      
      if (p.key === 'q' || p.key === 'Q') {
        thereminAudio.toggleQuantization();
      }
      
      if (p.key === 'h' || p.key === 'H') {
        showHUD = !showHUD;
        console.log('HUD:', showHUD ? 'visible' : 'oculto');
      }
    };

    function drawWaves(tiltX, tiltY) {
      // Calculo valores reactivos antes de dibujar
      const waveAmplitude = p.map(Math.abs(tiltY), 0, 1, 8, 28);
      const waveGap = p.map(Math.abs(tiltX), 0, 1, 22, 36);
      const waveAlpha = thereminAudio.isPlaying ? 160 : 80;

      // Dibujo tres ondas con efecto neon
      for (let i = 0; i < 3; i++) {
        const yOffset = p.height / 2 + (i - 1) * waveGap;

        // Halo exterior (efecto neon)
        p.stroke(120, 210, 255, waveAlpha * 0.3);
        p.strokeWeight(6);
        drawWave(yOffset, waveAmplitude);

        // Núcleo brillante
        p.stroke(120, 210, 255, waveAlpha);
        p.strokeWeight(2);
        drawWave(yOffset, waveAmplitude);
      }
    }

    function drawWave(yOffset, amplitude) {
      p.noFill();
      p.beginShape();
      for (let x = 0; x <= p.width; x += 12) {
        const y = yOffset + p.sin(x * 0.015 + p.frameCount * 0.02) * amplitude;
        p.vertex(x, y);
      }
      p.endShape();
    }

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    class Particle {
      constructor() {
        this.reset();
        this.disperseFactor = p.random(0.5, 1.5);
        this.noiseOffsetX = p.random(1000);
        this.noiseOffsetY = p.random(1000);
      }

      reset() {
        this.x = p.random(p.width);
        this.y = p.random(p.height);
        this.vx = p.random(-1, 1);
        this.vy = p.random(-1, 1);
        this.size = p.random(2, 8);
        this.alpha = 255;
      }

      update(tiltX, tiltY) {
        const noiseX = p.noise(this.noiseOffsetX) * 2 - 1;
        const noiseY = p.noise(this.noiseOffsetY) * 2 - 1;
        
        this.noiseOffsetX += 0.01;
        this.noiseOffsetY += 0.01;
        
        this.vx += (tiltX * 0.5 + noiseX * 0.2) * this.disperseFactor;
        this.vy += (tiltY * 0.5 + noiseY * 0.2) * this.disperseFactor;

        this.vx *= 0.95;
        this.vy *= 0.95;

        this.x += this.vx;
        this.y += this.vy;

        if (this.x <= 0) {
          this.x = 0;
          this.vx = Math.abs(this.vx) * 0.8;
        } else if (this.x >= p.width) {
          this.x = p.width;
          this.vx = -Math.abs(this.vx) * 0.8;
        }

        if (this.y <= 0) {
          this.y = 0;
          this.vy = Math.abs(this.vy) * 0.8;
        } else if (this.y >= p.height) {
          this.y = p.height;
          this.vy = -Math.abs(this.vy) * 0.8;
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