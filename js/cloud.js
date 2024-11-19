let currentCloudType = 'public';
let cloudConfig = {
    capacity: 10,
    redundancyLevel: '2',
    locations: []
};

// Cambiar el tipo de nube
function switchCloudType(type) {
    currentCloudType = type;

    // Actualizar botones
    document.querySelectorAll('.cloud-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="switchCloudType('${type}')"]`).classList.add('active');

    // Actualizar configuraciones y métricas según el tipo de nube
    updateCloudConfigurations(type);
    updateCloudMetrics();
    updateCloudVisualizations();
}

// Actualizar configuraciones según el tipo de nube
function updateCloudConfigurations(type) {
    const redundancySelect = document.getElementById('redundancyLevel');
    const locationsSelect = document.getElementById('locations');

    switch (type) {
        case 'public':
            redundancySelect.innerHTML = `
                <option value="2">2x (Similar a RAID 1)</option>
                <option value="3">3x (Alta disponibilidad)</option>
                <option value="geo">Geo-redundante</option>
            `;
            locationsSelect.disabled = false;
            break;

        case 'private':
            redundancySelect.innerHTML = `
                <option value="2">2x (RAID 1)</option>
                <option value="5">RAID 5</option>
                <option value="6">RAID 6</option>
            `;
            locationsSelect.disabled = true;
            break;

        case 'hybrid':
            redundancySelect.innerHTML = `
                <option value="2">2x (Mixto)</option>
                <option value="geo">Geo-redundante híbrido</option>
            `;
            locationsSelect.disabled = false;
            break;
    }
}

// Actualizar métricas de nube
function updateCloudMetrics() {
    const capacity = parseFloat(document.getElementById('cloudCapacity').value);
    const redundancy = document.getElementById('redundancyLevel').value;
    const locations = Array.from(document.getElementById('locations').selectedOptions).map(opt => opt.value);

    // Calcular costos
    const storageCost = calculateStorageCost(capacity, redundancy, currentCloudType);
    const transferCost = calculateTransferCost(capacity, locations.length);
    const totalCost = storageCost + transferCost;

    // Actualizar métricas de costos
    document.getElementById('storageCost').textContent = storageCost.toFixed(2);
    document.getElementById('transferCost').textContent = transferCost.toFixed(2);
    document.getElementById('totalCost').textContent = totalCost.toFixed(2);

    // Calcular y actualizar métricas de rendimiento y disponibilidad
    updatePerformanceMetrics(currentCloudType, locations.length);
    updateAvailabilityMetrics(redundancy, locations.length);
}

// Calcular costo de almacenamiento
function calculateStorageCost(capacity, redundancy, cloudType) {
    const basePrice = {
        'public': 0.023,
        'private': 0.045,
        'hybrid': 0.035
    }[cloudType];

    const redundancyMultiplier = {
        '2': 2,
        '3': 3,
        'geo': 2.5,
        '5': 1.3,
        '6': 1.5
    }[redundancy];

    return capacity * basePrice * redundancyMultiplier;
}

// Calcular costo de transferencia
function calculateTransferCost(capacity, locationCount) {
    const baseTransferCost = 0.08; // Por GB
    return capacity * baseTransferCost * (locationCount || 1) * 0.3; // Asumiendo 30% de transferencia
}

// Actualizar métricas de rendimiento
function updatePerformanceMetrics(cloudType, locationCount) {
    const baseLatency = { 'public': 20, 'private': 5, 'hybrid': 15 }[cloudType];
    const baseIops = { 'public': 3000, 'private': 10000, 'hybrid': 5000 }[cloudType];
    const baseThroughput = { 'public': 125, 'private': 500, 'hybrid': 250 }[cloudType];

    const latencyMultiplier = locationCount > 1 ? Math.log2(locationCount) : 1;

    document.getElementById('latency').textContent = (baseLatency * latencyMultiplier).toFixed(1);
    document.getElementById('cloudIops').textContent = baseIops.toLocaleString();
    document.getElementById('throughput').textContent = baseThroughput.toFixed(0);
}

// Actualizar métricas de disponibilidad
function updateAvailabilityMetrics(redundancy, locationCount) {
    let baseSLA = 99.9;
    let baseRPO = 15;
    let baseRTO = 60;

    if (redundancy === 'geo' || locationCount > 1) {
        baseSLA = 99.99;
        baseRPO = 5;
        baseRTO = 30;
    }

    if (redundancy === '3') {
        baseSLA = 99.999;
        baseRPO = 1;
        baseRTO = 15;
    }

    document.getElementById('sla').textContent = baseSLA.toFixed(3);
    document.getElementById('rpo').textContent = baseRPO;
    document.getElementById('rto').textContent = baseRTO;
}

// Actualizar visualizaciones relacionadas con la nube
function updateCloudVisualizations() {
    updateCloudMap();
    updateDataFlow();
}

// Actualizar mapa de ubicaciones
function updateCloudMap() {
    const cloudMap = document.getElementById('cloudMap');
    const locations = Array.from(document.getElementById('locations').selectedOptions).map(opt => opt.value);

    cloudMap.innerHTML = `
        <div class="map-placeholder">
            <h4>Ubicaciones Activas</h4>
            <ul>
                ${locations.map(loc => `<li>${loc}</li>`).join('')}
            </ul>
        </div>`;
}

// Actualizar flujo de datos
function updateDataFlow() {
    const dataFlow = document.getElementById('dataFlow');

    dataFlow.innerHTML = `
        <div class="flow-placeholder">
            <h4>Flujo de Datos</h4>
            <p>Tipo: ${currentCloudType}</p>
            <p>Redundancia: ${document.getElementById('redundancyLevel').value}</p>
        </div>`;
}

// Inicialización de la simulación de nube
function initCloudSimulation() {
    switchCloudType('public');
    updateCloudMetrics();
    updateCloudVisualizations();

    // Agregar event listeners para los selectores de ubicación
    document.getElementById('locations').addEventListener('change', () => {
        updateCloudMetrics();
        updateCloudVisualizations();
    });
}
