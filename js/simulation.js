// Monitor de estado del sistema
function monitorSystem() {
    const temperatures = [];
    const diskUtilization = [];

    for (let i = 0; i < diskCount; i++) {
        temperatures.push(Math.floor(Math.random() * 20) + 30); // 30-50°C
        diskUtilization.push(Math.floor(Math.random() * 40) + 60); // 60-100%
    }

    return {
        temperatures,
        diskUtilization,
        systemLoad: Math.floor(Math.random() * 30) + 70, // 70-100%
        iops: Math.floor(Math.random() * 5000) + 95000, // 95K-100K IOPS
    };
}

// Actualizar estadísticas en tiempo real
function updateRealTimeStats() {
    const stats = monitorSystem();
    const activeDisks = document.getElementById('activeDisks');
    const writeSpeed = document.getElementById('writeSpeed');

    // Actualizar solo si no hay fallos simulados
    if (!isSimulatingFailure) {
        activeDisks.textContent = diskCount;
        writeSpeed.textContent = `${(diskCount * 300).toLocaleString()} MB/s`;
    }
}

// Simular operaciones de E/S
function simulateIO() {
    if (!isSimulatingFailure) {
        const randomDisk = Math.floor(Math.random() * diskCount);
        const disks = document.getElementsByClassName('disk');
        const targetDisk = disks[randomDisk];

        // Simular operación de escritura
        const blocks = targetDisk.querySelectorAll('.data-block');
        blocks.forEach(block => {
            block.style.backgroundColor = '#45a049';
            setTimeout(() => {
                block.style.backgroundColor = '#4CAF50';
            }, 200);
        });
    }
}

// Métricas avanzadas del sistema
function showAdvancedMetrics() {
    const metrics = {
        stripeSize: 256, // KB
        blockSize: 64, // KB
        readLatency: 0.5, // ms
        writeLatency: 0.8, // ms
        queueDepth: 32,
        cacheSize: 64, // MB
    };

    const theoreticalMaxSpeed = diskCount * 300; // MB/s
    const actualSpeed = theoreticalMaxSpeed * 0.95; // 95% de eficiencia

    return {
        ...metrics,
        theoreticalMaxSpeed,
        actualSpeed,
        efficiency: 95, // %
    };
}

// Habilitar drag and drop para bloques de datos
function enableDragAndDrop() {
    const dataBlocks = document.querySelectorAll('.data-block');

    dataBlocks.forEach(block => {
        block.setAttribute('draggable', true);

        block.addEventListener('dragstart', (e) => {
            e.target.classList.add('dragging');
        });

        block.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });
    });

    const disks = document.querySelectorAll('.disk');

    disks.forEach(disk => {
        disk.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        disk.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggingBlock = document.querySelector('.dragging');
            if (draggingBlock) {
                disk.appendChild(draggingBlock);
                updateBlockDistribution();
            }
        });
    });
}

// Actualizar la distribución de bloques
function updateBlockDistribution() {
    const disks = document.querySelectorAll('.disk');
    let totalBlocks = 0;

    disks.forEach(disk => {
        const blocks = disk.querySelectorAll('.data-block');
        totalBlocks += blocks.length;
    });

    // Actualizar estadísticas
    updateStats();
}

// Operaciones de simulación (restauradas)
function simulateFailure() {
    if (!isSimulatingFailure) {
        const disks = document.getElementsByClassName('disk');
        const randomDisk = Math.floor(Math.random() * diskCount);
        disks[randomDisk].classList.add('failed');
        isSimulatingFailure = true;

        const message = currentRaidType === 'raid2'
            ? 'Fallo simulado en un disco de datos. El sistema continúa funcionando usando los discos de paridad.'
            : currentRaidType === 'raid1'
                ? 'Fallo simulado en un disco. El sistema continúa funcionando usando el disco espejo.'
                : '¡Fallo simulado! En RAID 0, la falla de un disco resulta en la pérdida total de datos.';
        showNotification(message, currentRaidType === 'raid0' ? 'error' : 'warning');
    }
}


// Inicialización periódica
window.onload = function () {
    calculateRAID();
    enableDragAndDrop();

    // Actualizaciones periódicas
    setInterval(updatePerformanceGraph, 1000);
    setInterval(updateRealTimeStats, 2000);
    setInterval(simulateIO, 3000);
};
