// Configuración inicial y tipos de nube
let currentCloudType = 'public';
let cloudConfig = {
    capacity: 10,
    redundancyLevel: '2',
    locations: [],
    dataTypes: {
        structured: 40,
        unstructured: 30,
        backup: 30
    }
};

// Constantes para cálculos
const CLOUD_CONSTANTS = {
    public: {
        basePrice: 0.023,
        baseLatency: 20,
        baseIops: 3000,
        baseThroughput: 125,
        availability: 99.9
    },
    private: {
        basePrice: 0.045,
        baseLatency: 5,
        baseIops: 10000,
        baseThroughput: 500,
        availability: 99.95
    },
    hybrid: {
        basePrice: 0.035,
        baseLatency: 15,
        baseIops: 5000,
        baseThroughput: 250,
        availability: 99.99
    }
};

// Cambiar el tipo de nube
function switchCloudType(type) {
    currentCloudType = type;
    updateUIForCloudType(type);
    updateCloudMetrics();
    updateCloudVisualizations();
}

// Actualizar UI según el tipo de nube
function updateUIForCloudType(type) {
    // Actualizar botones
    document.querySelectorAll('.cloud-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="switchCloudType('${type}')"]`).classList.add('active');

    // Actualizar opciones de redundancia
    const redundancySelect = document.getElementById('redundancyLevel');
    const redundancyOptions = getRedundancyOptionsForType(type);
    redundancySelect.innerHTML = redundancyOptions.map(opt => 
        `<option value="${opt.value}">${opt.label}</option>`
    ).join('');

    // Habilitar/deshabilitar ubicaciones según el tipo
    const locationsSelect = document.getElementById('locations');
    locationsSelect.disabled = type === 'private';
}

// Obtener opciones de redundancia según el tipo
function getRedundancyOptionsForType(type) {
    const options = {
        public: [
            { value: '2', label: '2x (Similar a RAID 1)' },
            { value: '3', label: '3x (Alta disponibilidad)' },
            { value: 'geo', label: 'Geo-redundante' }
        ],
        private: [
            { value: '2', label: '2x (RAID 1)' },
            { value: '5', label: 'RAID 5' },
            { value: '6', label: 'RAID 6' }
        ],
        hybrid: [
            { value: '2', label: '2x (Mixto)' },
            { value: 'geo', label: 'Geo-redundante híbrido' }
        ]
    };
    return options[type];
}

// Actualizar métricas de nube
function updateCloudMetrics() {
    const config = getCloudConfiguration();
    
    // Calcular todas las métricas
    const metrics = calculateCloudMetrics(config);
    
    // Actualizar UI con las métricas
    updateMetricsDisplay(metrics);
}

// Obtener configuración actual
function getCloudConfiguration() {
    return {
        capacity: parseFloat(document.getElementById('cloudCapacity').value),
        redundancy: document.getElementById('redundancyLevel').value,
        locations: Array.from(document.getElementById('locations').selectedOptions).map(opt => opt.value),
        type: currentCloudType
    };
}

// Calcular métricas de la nube
function calculateCloudMetrics(config) {
    const baseMetrics = CLOUD_CONSTANTS[config.type];
    const locationCount = config.locations.length || 1;
    
    // Cálculos de costos
    const storageCost = calculateStorageCost(config);
    const transferCost = calculateTransferCost(config);
    const totalCost = storageCost + transferCost;
    
    // Cálculos de rendimiento
    const latency = calculateLatency(baseMetrics.baseLatency, locationCount);
    const iops = calculateIOPS(baseMetrics.baseIops, config.redundancy);
    const throughput = calculateThroughput(baseMetrics.baseThroughput, locationCount);
    
    // Cálculos de disponibilidad
    const availability = calculateAvailability(config);
    
    return {
        costs: { storageCost, transferCost, totalCost },
        performance: { latency, iops, throughput },
        availability: {
            sla: availability,
            rpo: calculateRPO(config),
            rto: calculateRTO(config)
        }
    };
}

// Funciones de cálculo específicas
function calculateStorageCost(config) {
    const basePrice = CLOUD_CONSTANTS[config.type].basePrice;
    const redundancyMultiplier = getRedundancyMultiplier(config.redundancy);
    return config.capacity * basePrice * redundancyMultiplier;
}

function calculateTransferCost(config) {
    const baseTransferCost = 0.08; // Por GB
    const locationCount = config.locations.length || 1;
    return config.capacity * baseTransferCost * locationCount * 0.3;
}

function calculateLatency(baseLatency, locationCount) {
    return baseLatency * (locationCount > 1 ? Math.log2(locationCount) : 1);
}

function calculateIOPS(baseIops, redundancy) {
    const redundancyImpact = redundancy === '3' ? 1.5 : 
                            redundancy === 'geo' ? 0.8 : 1;
    return Math.floor(baseIops * redundancyImpact);
}

function calculateThroughput(baseThroughput, locationCount) {
    return baseThroughput * (locationCount > 1 ? 0.8 : 1);
}

function calculateAvailability(config) {
    const baseAvailability = CLOUD_CONSTANTS[config.type].availability;
    const redundancyBonus = config.redundancy === '3' ? 0.099 :
                           config.redundancy === 'geo' ? 0.09 : 0;
    return Math.min(99.9999, baseAvailability + redundancyBonus);
}

function calculateRPO(config) {
    const baseRPO = config.redundancy === 'geo' ? 5 :
                    config.redundancy === '3' ? 1 : 15;
    return baseRPO;
}

function calculateRTO(config) {
    const baseRTO = config.redundancy === 'geo' ? 30 :
                    config.redundancy === '3' ? 15 : 60;
    return baseRTO;
}

// Funciones de ayuda
function getRedundancyMultiplier(redundancy) {
    const multipliers = {
        '2': 2,
        '3': 3,
        'geo': 2.5,
        '5': 1.3,
        '6': 1.5
    };
    return multipliers[redundancy] || 1;
}

// Actualizar visualizaciones
function updateCloudVisualizations() {
    updateCloudMap();
    updateDataFlow();
    updatePerformanceGraphs();
}

function updateCloudMap() {
    const cloudMap = document.getElementById('cloudMap');
    const locations = Array.from(document.getElementById('locations').selectedOptions);
    
    const mapHtml = `
        <div class="map-container">
            <div class="world-map">
                ${locations.map(loc => `
                    <div class="location-marker" style="left: ${getLocationCoordinates(loc.value).x}%; top: ${getLocationCoordinates(loc.value).y}%">
                        <div class="marker-dot"></div>
                        <div class="marker-label">${loc.text}</div>
                    </div>
                `).join('')}
            </div>
            <div class="connection-lines">
                ${generateConnectionLines(locations)}
            </div>
        </div>
    `;
    
    cloudMap.innerHTML = mapHtml;
}

function updateDataFlow() {
    const dataFlow = document.getElementById('dataFlow');
    const config = getCloudConfiguration();
    const metrics = calculateCloudMetrics(config);
    
    const flowHtml = `
        <div class="data-flow-container">
            <div class="flow-diagram">
                <div class="flow-node source">
                    <span>Origen</span>
                    <div class="flow-stats">
                        <div>↑ ${metrics.performance.throughput} MB/s</div>
                        <div>← ${metrics.performance.latency.toFixed(1)} ms</div>
                    </div>
                </div>
                ${generateFlowNodes(config)}
                <div class="flow-node destination">
                    <span>Destino</span>
                    <div class="flow-stats">
                        <div>↓ ${metrics.performance.throughput} MB/s</div>
                        <div>SLA: ${metrics.availability.sla}%</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    dataFlow.innerHTML = flowHtml;
}

// Funciones de ayuda para visualizaciones
function getLocationCoordinates(location) {
    const coordinates = {
        'us-east': { x: 25, y: 40 },
        'us-west': { x: 15, y: 40 },
        'eu-central': { x: 48, y: 35 },
        'asia-pacific': { x: 75, y: 45 }
    };
    return coordinates[location] || { x: 50, y: 50 };
}

function generateConnectionLines(locations) {
    if (locations.length < 2) return '';
    
    return locations.map((loc, i) => {
        if (i === locations.length - 1) return '';
        const start = getLocationCoordinates(loc.value);
        const end = getLocationCoordinates(locations[i + 1].value);
        return `
            <svg class="connection-line">
                <line 
                    x1="${start.x}%" 
                    y1="${start.y}%" 
                    x2="${end.x}%" 
                    y2="${end.y}%" 
                    stroke="#0066cc" 
                    stroke-width="2"
                />
            </svg>
        `;
    }).join('');
}

function generateFlowNodes(config) {
    const redundancyNodes = config.redundancy === 'geo' ? 
        config.locations.map(loc => `
            <div class="flow-node redundancy">
                <span>${loc}</span>
                <div class="flow-stats">
                    <div>RPO: ${calculateRPO(config)} min</div>
                    <div>RTO: ${calculateRTO(config)} min</div>
                </div>
            </div>
        `).join('') :
        `<div class="flow-node redundancy">
            <span>Redundancia ${config.redundancy}x</span>
            <div class="flow-stats">
                <div>IOPS: ${calculateIOPS(CLOUD_CONSTANTS[config.type].baseIops, config.redundancy)}</div>
            </div>
        </div>`;
    
    return redundancyNodes;
}

// Inicialización
function initCloudSimulation() {
    switchCloudType('public');
    
    // Agregar event listeners
    document.getElementById('cloudCapacity').addEventListener('input', updateCloudMetrics);
    document.getElementById('redundancyLevel').addEventListener('change', updateCloudMetrics);
    document.getElementById('locations').addEventListener('change', () => {
        updateCloudMetrics();
        updateCloudVisualizations();
    });
    
    // Inicializar visualizaciones
    updateCloudMetrics();
    updateCloudVisualizations();
}