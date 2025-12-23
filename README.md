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
│   │   ├── storage.js    # Almacenamiento local
│   │   └── sketch.js     # Visualización p5.js
│   ├── css/
│   │   └── style.css
│   └── main.js           # Orquestador principal
├── index.html
├── capacitor.config.json
├── package.json
└── vite.config.js
```

## Instalación desde cero

### 1. Verificar entorno

```bash
# Verificar Node.js y npm instalados
node -v
npm -v
```
### 2. Crear proyecto con Vite

```bash
# Crear proyecto (template vanilla)
npm create vite@latest theremin -- --template vanilla

# Entrar al directorio e instalar dependencias
cd theremin
npm install
```

### 3. Instalar Capacitor
```bash
# Instalar Capacitor Core y CLI
npm install @capacitor/core @capacitor/cli --save

# Inicializar Capacitor (modo interactivo)
npx cap init

# O setear todas las opciones en un comando
npx cap init "Theremin" "com.theremin.app" --web-dir dist
## Build y Deploy en Android

```
### 4. Añadir plataforma Android
```bash
# Añadir plataforma Android
npm install @capacitor/android
npx cap add android
```
### 5. Instalar plugins de Capacitor
```bash
# Instalar Motion y Haptics
npm install @capacitor/motion @capacitor/haptics
```
### 5. Compilar el proyecto y testearlo en Android studio
```bash
# Compilar el proyecto
npm run build

# Sincronizar con Capacitor
npx cap sync

# Abrir en Android Studio
npx cap open android
```

## Controles

### En Navegador (Modo Debug Desktop)
- **Ratón**: Mover para simular inclinación del dispositivo


> **Nota**: Los controles de teclado solo funcionan en navegador para testing. En dispositivo móvil no están disponibles.

### En Dispositivo Móvil
- **Inclinación horizontal (eje X)**: Controla la frecuencia del tono
- **Inclinación vertical (eje Y)**: Controla el brillo del sonido (filtro) y volumen
- **Botón "Iniciar Theremin"**: Activa sensores y audio (requerido por políticas del navegador)
- **Botón "Detener"**: Pausa el audio

**Configuración en móvil**: La configuración (tipo de onda, sensibilidad) se carga desde LocalStorage. Para cambiarla, modifica los valores en navegador y se sincronizarán al dispositivo.

## Mapeo Sensor → Audio

```javascript
// Eje X (izquierda/derecha) → Frecuencia (200-1000 Hz)
tiltX → frequency (cuantizada a escala pentatónica mayor)

// Eje Y (adelante/atrás) → Filtro
tiltY → filterFrequency (400-1400 Hz)
```

> **Nota**: El volumen está fijo en 0.3. La inclinación vertical solo modifica el brillo del sonido mediante el filtro pasa-bajos.

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