// Cambiar de pestaña
function switchTab(tabName) {
    // Ocultar todos los contenidos de las pestañas
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remover la clase active de todas las pestañas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Mostrar el contenido de la pestaña seleccionada
    document.getElementById(tabName).classList.add('active');

    // Activar la pestaña seleccionada
    document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`).classList.add('active');

    // Si es la pestaña de calculadora, recalcular valores y actualizar recomendaciones
    if (tabName === 'calculator') {
        calculateRAID();
        const diskType = document.getElementById('diskType').value;
        const diskCapacity = parseFloat(document.getElementById('diskCapacity').value);
        const raidType = document.getElementById('raidType').value;
        updateProductRecommendations(diskType, diskCapacity, raidType);
    }


    // Si es la pestaña de rendimiento, iniciar actualizaciones
    if (tabName === 'performance') {
        updatePerformanceGraph();
        updateRealTimeStats();
    }
}

// Mostrar una notificación en la interfaz
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Mostrar información de un bloque en un modal
function showBlockInfo(blockId) {
    const modal = document.getElementById('infoModal');
    const blockInfo = document.getElementById('blockInfo');
    blockInfo.innerHTML = `
        <p><strong>ID del Bloque:</strong> ${blockId}</p>
        <p><strong>Tamaño:</strong> 64 KB</p>
        <p><strong>Estado:</strong> Activo</p>
        <p><strong>Último acceso:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Velocidad de acceso:</strong> 300 MB/s</p>
        <p><strong>Stripe Size:</strong> 256 KB</p>
    `;
    modal.style.display = 'flex';
}

// Cerrar el modal
function closeModal() {
    document.getElementById('infoModal').style.display = 'none';
}

// Actualizar gráfica de rendimiento en tiempo real
let performanceData = [];
const maxDataPoints = 50;

function updatePerformanceGraph() {
    const performanceValue = Math.random() * 30 + 70; // Valor entre 70 y 100
    performanceData.push(performanceValue);
    if (performanceData.length > maxDataPoints) {
        performanceData.shift();
    }

    const performanceMeter = document.querySelector('.performance-value');
    performanceMeter.style.width = `${performanceValue}%`;
}

// Actualizar métricas calculadas y recomendaciones de productos
async function updateProductRecommendations(diskType, diskCapacity, raidType) {
    const products = await getRecommendedProducts(diskType, diskCapacity, raidType);
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    if (products.length === 0) {
        productList.innerHTML = '<p>No se encontraron productos recomendados.</p>';
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <h4>${product.name}</h4>
            <p>Capacidad: ${product.capacity}</p>
            <p class="price">$${product.price}</p>
            <div class="raid-badge ${raidType}">${raidType.toUpperCase()}</div>
            <ul class="product-features">
                ${product.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            <a href="${product.link}" target="_blank" class="product-link">Ver en Amazon</a>
        `;
        productList.appendChild(productCard);
    });
}

// Obtener productos recomendados
async function getRecommendedProducts(diskType, capacity, raidType) {
    try {
        const response = await fetch('data/products.json');
        const productsData = await response.json();

        // Filtrar productos por tipo de RAID
        const products = (productsData[diskType] || []).filter(product =>
            product.raidCompatibility.includes(raidType)
        );

        // Ajustar los productos dinámicamente
        return products.map(product => ({
            ...product,
            capacity: `${capacity}TB`,
            price: (product.basePrice * capacity).toFixed(2)
        }));
    } catch (error) {
        console.error('Error al cargar los productos recomendados:', error);
        return [];
    }
}

// Evento para cerrar el modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('infoModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// Inicialización de pestañas y comportamientos predeterminados
window.onload = function() {
    // Establecer la pestaña de simulación como activa por defecto
    switchTab('simulation');

    // Inicializar listeners para las pestañas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('onclick').match(/'(.*?)'/)[1];
            switchTab(tabName);
        });
    });

    // Actualizaciones periódicas
    setInterval(updatePerformanceGraph, 1000);
    setInterval(updateRealTimeStats, 2000);
    setInterval(simulateIO, 3000);
};
