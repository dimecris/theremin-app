# Theremin Glitch

Aplicación experimental que explora la relación entre el movimiento del dispositivo y el sonido sintetizado, acompañada por visualizaciones generativas que evolucionan con el audio y el gesto.

## Descripción

Theremin Glitch es una experiencia audiovisual interactiva donde el móvil "toca" el sonido mediante el movimiento: **gesto → sonido → visual generativo**. No busca afinación perfecta, sino textura sonora y sorpresa visual.

## Características

- **Síntesis de audio reactiva**: Oscilador con filtro pasa-bajos controlado por inclinación
- **Cuantización musical**: Las frecuencias se ajustan a una escala pentatónica mayor
- **Sensores de movimiento**: Utiliza giroscopio mediante Capacitor Motion API
- **Feedback háptico**: Vibraciones mediante Capacitor Haptics API
- **Visualización generativa**: Sistema de partículas y ondas reactivas con p5.js
- **Almacenamiento local**: Configuración y sesiones guardadas en LocalStorage

## Tecnologías

- **Vite** - Build tool y dev server
- **Capacitor** - Framework para aplicaciones nativas
  - `@capacitor/motion` - Sensores de orientación
  - `@capacitor/haptics` - Feedback táctil
- **p5.js** - Visualización canvas
- **Web Audio API** - Síntesis de sonido

## Estructura del Proyecto

```
theremin/
├── public/
│   ├── p5.js
│   └── p5.sound.min.js
├── src/
│   ├── modules/
│   │   ├── audio.js      # Síntesis de audio y cuantización
│   │   ├── motion.js     # Lectura de sensores
│   │   └── storage.js    # Almacenamiento local
│   ├── css/
│   │   └── style.css
│   ├── sketch.js         # Visualización p5.js
│   └── main.js           # Orquestador principal
├── index.html
├── capacitor.config.json
├── package.json
└── vite.config.js
```

## Instalación

```bash
# Clonar el repositorio
git clone [URL_DEL_REPO]
cd theremin

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

## Build y Deploy en Android

```bash
# Compilar el proyecto
npm run build

# Sincronizar con Capacitor
npx cap sync

# Abrir en Android Studio
npx cap open android
```

## Controles

### En Navegador (Modo Debug)
- **Ratón**: Mover para simular inclinación del dispositivo
- **Teclas 1-4**: Cambiar tipo de onda (sine, square, sawtooth, triangle)
- **Teclas +/-**: Ajustar sensibilidad
- **Tecla Q**: Activar/desactivar cuantización musical

### En Dispositivo Móvil
- **Inclinación horizontal (eje X)**: Controla la frecuencia del tono
- **Inclinación vertical (eje Y)**: Controla el brillo del sonido (filtro) y volumen
- **Botón Iniciar/Detener**: Activa/desactiva el audio y sensores

## Mapeo Sensor → Audio

```javascript
// Eje X (izquierda/derecha) → Frecuencia (200-1000 Hz)
tiltX → frequency (cuantizada a escala pentatónica)

// Eje Y (adelante/atrás) → Filtro + Volumen
tiltY → filterFrequency (400-1800 Hz)
tiltY → volume (0.15-0.3)
```

## Configuración Guardada

El sistema almacena en LocalStorage:
- Tipo de onda del oscilador
- Sensibilidad de los sensores
- Modo visual
- Contador de sesiones
- Timestamp de última sesión

## Autor

Kris Darias - Grado Multimedia UOC

## Licencia

MIT