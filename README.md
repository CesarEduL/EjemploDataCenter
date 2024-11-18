# RAID Simulator - Curso Data Center

¡Bienvenido al repositorio del **Simulador Interactivo: RAID en Data Center**! Este proyecto forma parte de los ejercicios desarrollados en un curso universitario sobre **infraestructura de Data Centers**, con el objetivo de comprender y simular configuraciones RAID comunes, sus características, y su impacto en el rendimiento y la confiabilidad.

## 📋 Descripción del Proyecto

Este simulador web ofrece una interfaz interactiva para explorar las configuraciones RAID y sus efectos en términos de capacidad, velocidad, redundancia, y tolerancia a fallos. Incluye:
- **Simulaciones RAID (0, 1, 2):** Visualización de datos distribuidos en discos y manejo de fallos.
- **Calculadora RAID:** Herramienta para estimar métricas clave como capacidad total, velocidad, IOPS y confiabilidad.
- **Análisis de Rendimiento:** Métricas detalladas como latencia, throughput, y más.

## 🌟 Características Principales

1. **Simulador de RAID:**
   - Agrega y elimina discos.
   - Simula fallos en discos y muestra cómo afectan la redundancia.
   - Explica las características de RAID 0, RAID 1 y RAID 2.

2. **Calculadora Avanzada:**
   - Calcula capacidad, velocidad, y tolerancia según el tipo de RAID.
   - Estima métricas de confiabilidad y rendimiento según el número y tipo de discos.

3. **Análisis de Rendimiento:**
   - Visualización gráfica de métricas como IOPS, latencia y throughput.
   - Recomendaciones de productos según el tipo de configuración.

## 📂 Estructura del Proyecto

```plaintext
RAID-Simulator/
├── css/
│   ├── styles.css          # Estilos para la interfaz del simulador
├── js/
│   ├── script.js           # Lógica interactiva del simulador
├── index.html              # Página principal del simulador
