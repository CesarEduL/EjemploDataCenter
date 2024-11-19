let diskCount = 2;
let isSimulatingFailure = false;
let currentRaidType = 'raid0';

// Cambiar el tipo de RAID
function switchRaidType(raidType) {
    currentRaidType = raidType;
    document.querySelectorAll('.raid-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="switchRaidType('${raidType}')"]`).classList.add('active');

    // Mostrar información relevante del RAID
    document.getElementById('raid0Info').style.display = raidType === 'raid0' ? 'block' : 'none';
    document.getElementById('raid1Info').style.display = raidType === 'raid1' ? 'block' : 'none';
    document.getElementById('raid2Info').style.display = raidType === 'raid2' ? 'block' : 'none';

    // Resetear y reinicializar la simulación
    resetSimulation();
    initializeDisks();
    updateStats();
}

// Inicializar los discos
function initializeDisks() {
    const diskArray = document.getElementById('diskArray');
    diskArray.innerHTML = ''; // Limpiar discos existentes

    for (let i = 0; i < diskCount; i++) {
        const disk = createDisk(i + 1);
        diskArray.appendChild(disk);

        if (currentRaidType === 'raid1' && i % 2 === 1) {
            disk.classList.add('mirror');
        } else if (currentRaidType === 'raid2' && i >= diskCount - 3) {
            disk.classList.add('parity');
        }
    }
}

// Crear un disco
function createDisk(number) {
    const disk = document.createElement('div');
    disk.className = 'disk';

    let content;
    if (currentRaidType === 'raid1' && number % 2 === 1) {
        content = createMirrorContent(number);
    } else if (currentRaidType === 'raid2' && number >= diskCount - 3) {
        content = createParityContent(number);
    } else {
        content = createOriginalContent(number);
    }

    disk.innerHTML = content;
    return disk;
}

// Crear contenido de paridad
function createParityContent(number) {
    return `
        <div class="disk-label">Paridad ${number - (diskCount - 3)}</div>
        <div class="data-block parity" onclick="showBlockInfo('P${number - (diskCount - 3)}')">Bloque P${number - (diskCount - 3)}</div>
    `;
}

// Crear contenido original
function createOriginalContent(number) {
    return `
        <div class="disk-label">Disco ${number}</div>
        <div class="data-block" onclick="showBlockInfo('${number}1')">Bloque ${number}1</div>
        <div class="data-block" onclick="showBlockInfo('${number}2')">Bloque ${number}2</div>
        <div class="data-block" onclick="showBlockInfo('${number}3')">Bloque ${number}3</div>
    `;
}

// Crear contenido espejo
function createMirrorContent(number) {
    const originalNumber = number - 1;
    return `
        <div class="disk-label">Espejo ${originalNumber}</div>
        <div class="data-block mirror" onclick="showBlockInfo('${originalNumber}1M')">Bloque ${originalNumber}1</div>
        <div class="data-block mirror" onclick="showBlockInfo('${originalNumber}2M')">Bloque ${originalNumber}2</div>
        <div class="data-block mirror" onclick="showBlockInfo('${originalNumber}3M')">Bloque ${originalNumber}3</div>
    `;
}

// Simular un fallo en un disco
function simulateFailure() {
    if (!isSimulatingFailure) {
        const disks = document.getElementsByClassName('disk');
        const randomDisk = Math.floor(Math.random() * diskCount);
        disks[randomDisk].classList.add('failed');
        isSimulatingFailure = true;

        if (currentRaidType === 'raid2') {
            showNotification('Fallo simulado en un disco de datos. El sistema continúa funcionando usando los discos de paridad.', 'warning');
        } else if (currentRaidType === 'raid1') {
            showNotification('Fallo simulado en un disco. El sistema continúa funcionando usando el disco espejo.', 'warning');
        } else {
            showNotification('¡Fallo simulado! En RAID 0, la falla de un disco resulta en la pérdida total de datos.', 'error');
        }
    }
}

// Resetear la simulación
function resetSimulation() {
    isSimulatingFailure = false;
    const disks = document.getElementsByClassName('disk');
    Array.from(disks).forEach(disk => {
        disk.classList.remove('failed');
    });
    initializeDisks();
    updateStats();
}

// Actualizar estadísticas
function updateStats() {
    const capacityMultiplier = currentRaidType === 'raid1' ? 0.5 : 1;
    const speedMultiplier = currentRaidType === 'raid1' ? 1 : diskCount;

    const totalCapacity = Math.floor(diskCount * capacityMultiplier);
    const writeSpeed = 300 * speedMultiplier;

    document.getElementById('totalCapacity').textContent = `${totalCapacity} TB`;
    document.getElementById('writeSpeed').textContent = `${writeSpeed} MB/s`;
    document.getElementById('activeDisks').textContent = diskCount;
    document.getElementById('redundancyLevel').textContent = currentRaidType === 'raid1' ? 'Sí' : 'No';
}

// Calcular configuraciones de RAID
function calculateRAID() {
        const raidType = document.getElementById('raidType').value;
        const numDisks = parseInt(document.getElementById('numDisks').value);
        const diskCapacity = parseFloat(document.getElementById('diskCapacity').value);
        const diskSpeed = parseInt(document.getElementById('diskSpeed').value);
        const diskType = document.getElementById('diskType').value;
        const workloadType = document.getElementById('workloadType').value;

        let totalCapacity, readSpeed, writeSpeed, reliability, faultTolerance;
        
        if (raidType === 'raid1') {
            totalCapacity = diskCapacity * (numDisks / 2); // La mitad de la capacidad total
            readSpeed = diskSpeed * numDisks; // Mejora en lecturas por múltiples discos
            writeSpeed = diskSpeed; // La velocidad de escritura es igual a un disco
            reliability = (1 - Math.pow(1 - 0.999, 2)) * 100; // Mayor confiabilidad
            faultTolerance = `${Math.floor(numDisks / 2)} disco(s)`;
        } else if (raidType === 'raid2') {
            totalCapacity = diskCapacity * (numDisks - 3); // 3 discos de paridad
            readSpeed = diskSpeed * (numDisks - 3); // Lectura de datos útiles
            writeSpeed = diskSpeed; // Escritura lenta por cálculo de paridad
            reliability = Math.pow(0.999, numDisks - 3) * 100; // Discos de datos afectan la confiabilidad
            faultTolerance = `${Math.floor((numDisks - 3) / 2)} disco(s)`;
        } else {
            totalCapacity = diskCapacity * numDisks;
            readSpeed = writeSpeed = diskSpeed * numDisks;
            reliability = Math.pow(0.999, numDisks) * 100;
            faultTolerance = "0 discos";
        }

        // Cálculo de IOPS según tipo de RAID y carga de trabajo
        let baseIops = diskType === 'ssd' ? 100000 : 150;
        let workloadMultiplier = {
            'random': 0.7,
            'sequential': 1.2,
            'mixed': 1.0
        }[workloadType];

        let raidIopsMultiplier = raidType === 'raid1' ? 1.8 : 1; // RAID 1 mejora IOPS de lectura
        let estimatedIops = Math.floor(baseIops * numDisks * workloadMultiplier * raidIopsMultiplier);

        // Actualizar resultados
        document.getElementById('calcCapacity').textContent = `${totalCapacity.toFixed(1)} TB`;
        document.getElementById('calcReadSpeed').textContent = `${readSpeed.toLocaleString()} MB/s`;
        document.getElementById('calcWriteSpeed').textContent = `${writeSpeed.toLocaleString()} MB/s`;
        document.getElementById('calcIOPS').textContent = `${estimatedIops.toLocaleString()}`;
        document.getElementById('calcReliability').textContent = `${reliability.toFixed(2)}%`;
        document.getElementById('calcFaultTolerance').textContent = faultTolerance;

        // Actualizar advertencia según tipo de RAID
        const warningText = document.getElementById('warningText');
        if (raidType === 'raid1') {
            warningText.textContent = 'RAID 1 proporciona redundancia completa de datos. La falla de un disco en cada par espejo no afectará la disponibilidad de los datos.';
            document.getElementById('raidWarning').className = 'warning-card info';
        } else if (raidType === 'raid2') {
            warningText.textContent = 'RAID 2 proporciona redundancia mediante código de paridad Hamming. La falla de hasta la mitad de los discos de datos no afectará la disponibilidad de los datos.';
            document.getElementById('raidWarning').className = 'warning-card info';
        } else {
            warningText.textContent = 'RAID 0 no proporciona redundancia. La falla de un disco resultará en la pérdida total de datos.';
            document.getElementById('raidWarning').className = 'warning-card';
        }

        // Actualizar recomendaciones de productos
        updateProductRecommendations(diskType, diskCapacity, raidType);
    }

// Agregar un disco
function addDisk() {
    const maxDisks = currentRaidType === 'raid1' ? 8 : 6; // Límite ajustado para RAID 1
    if (diskCount < maxDisks) {
        diskCount += currentRaidType === 'raid1' ? 2 : 1; // Agregar pares para RAID 1
        initializeDisks();
        updateStats();
    }
}

// Quitar un disco
function removeDisk() {
    const minDisks = 2;
    if (diskCount > minDisks) {
        diskCount -= currentRaidType === 'raid1' ? 2 : 1; // Remover pares para RAID 1
        initializeDisks();
        updateStats();
    }
}

// Función para validar discos según el tipo de RAID
function validateDisks() {
    const raidType = document.getElementById('raidType').value;
    const numDisksInput = document.getElementById('numDisks');
    const diskHelp = document.getElementById('diskHelp');
    let numDisks = parseInt(numDisksInput.value);

    if (raidType === 'raid1') {
        // RAID 1 requiere un número par de discos
        if (numDisks % 2 !== 0) {
            numDisks = Math.floor(numDisks / 2) * 2;
            if (numDisks < 2) numDisks = 2;
            numDisksInput.value = numDisks;
            diskHelp.textContent = 'RAID 1 requiere un número par de discos';
        } else {
            diskHelp.textContent = '';
        }
    } else {
        diskHelp.textContent = '';
    }

    calculateRAID();
}
