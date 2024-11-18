let diskCount = 2;
let isSimulatingFailure = false;
let currentRaidType = 'raid0';

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
    
    // Si es la pestaña de calculadora, recalcular los valores
    if (tabName === 'calculator') {
        calculateRAID();
        const diskType = document.getElementById('diskType').value;
        const diskCapacity = parseFloat(document.getElementById('diskCapacity').value);
        const raidType = document.getElementById('raidType').value;
        updateProductRecommendations(diskType, diskCapacity, raidType);
    }
    
    // Si es la pestaña de rendimiento, iniciar las actualizaciones
    if (tabName === 'performance') {
        updatePerformanceGraph();
        updateRealTimeStats();
    }
}

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
        
    function createParityContent(number) {
        return `
            <div class="disk-label">Paridad ${number - (diskCount - 3)}</div>
            <div class="data-block parity" onclick="showBlockInfo('P${number - (diskCount - 3)}')">Bloque P${number - (diskCount - 3)}</div>
        `;
    }

    function createOriginalContent(number) {
        return `
            <div class="disk-label">Disco ${number}</div>
            <div class="data-block" onclick="showBlockInfo('${number}1')">Bloque ${number}1</div>
            <div class="data-block" onclick="showBlockInfo('${number}2')">Bloque ${number}2</div>
            <div class="data-block" onclick="showBlockInfo('${number}3')">Bloque ${number}3</div>
        `;
    }

    function createMirrorContent(number) {
        const originalNumber = number - 1;
        return `
            <div class="disk-label">Espejo ${originalNumber}</div>
            <div class="data-block mirror" onclick="showBlockInfo('${originalNumber}1M')">Bloque ${originalNumber}1</div>
            <div class="data-block mirror" onclick="showBlockInfo('${originalNumber}2M')">Bloque ${originalNumber}2</div>
            <div class="data-block mirror" onclick="showBlockInfo('${originalNumber}3M')">Bloque ${originalNumber}3</div>
        `;
    }

    function addDisk() {
        const maxDisks = currentRaidType === 'raid1' ? 8 : 6; // Límite ajustado para RAID 1
        if (diskCount < maxDisks) {
            diskCount += currentRaidType === 'raid1' ? 2 : 1; // Agregar pares para RAID 1
            initializeDisks();
            updateStats();
        }
    }

    function removeDisk() {
        const minDisks = 2;
        if (diskCount > minDisks) {
            diskCount -= currentRaidType === 'raid1' ? 2 : 1; // Remover pares para RAID 1
            initializeDisks();
            updateStats();
        }
    }

    function simulateFailure() {
        if (!isSimulatingFailure) {
            const disks = document.getElementsByClassName('disk');
            const randomDisk = Math.floor(Math.random() * diskCount);
            disks[randomDisk].classList.add('failed');
            isSimulatingFailure = true;

            if (currentRaidType === 'raid2') {
                const message = 'Fallo simulado en un disco de datos. El sistema continúa funcionando usando los discos de paridad.';
                showNotification(message, 'warning');
            } else if (currentRaidType === 'raid1') {
                const message = 'Fallo simulado en un disco. El sistema continúa funcionando usando el disco espejo.';
                showNotification(message, 'warning');
            } else {
                const message = '¡Fallo simulado! En RAID 0, la falla de un disco resulta en la pérdida total de datos.';
                showNotification(message, 'error');
            }
        }
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

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

    function updateProductRecommendations(diskType, diskCapacity, raidType) {
        const products = getRecommendedProducts(diskType, diskCapacity, raidType);
        const productList = document.getElementById('productList');
        productList.innerHTML = '';

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

        function getRecommendedProducts(diskType, capacity, raidType) {
            let products = [];
            const isRaid1 = raidType === 'raid1';
            
            if (diskType === 'hdd') {
                products = [
                    {
                        name: "Seagate IronWolf Pro NAS HDD",
                        capacity: `${capacity}TB`,
                        price: (129.99 * capacity).toFixed(2),
                        features: [
                            "Optimizado para RAID",
                            "7200 RPM",
                            "Tecnología AgileArray",
                            isRaid1 ? "Ideal para RAID 1" : "Compatible RAID 0",
                            "5 años de garantía"
                        ]
                    },
                    {
                        name: "Western Digital Red Pro NAS",
                        capacity: `${capacity}TB`,
                        price: (134.99 * capacity).toFixed(2),
                        features: [
                            "NASware 3.0",
                            "7200 RPM",
                            isRaid1 ? "Enhanced Reliability" : "High Performance",
                            "Monitorio 3D Active Balance Plus",
                            "5 años de garantía"
                        ]
                    },
                    {
                        name: "Toshiba N300 Pro NAS HDD",
                        capacity: `${capacity}TB`,
                        price: (132.99 * capacity).toFixed(2),
                        features: [
                            "7200 RPM",
                            "Cache de 256MB",
                            isRaid1 ? "RV Sensors para RAID" : "Alto rendimiento",
                            "Diseñado para NAS empresarial",
                            "24/7 Reliability"
                        ]
                    }
                ];
            } else {
                products = [
                    {
                        name: "Samsung 870 PRO SATA SSD",
                        capacity: `${capacity}TB`,
                        price: (169.99 * capacity).toFixed(2),
                        features: [
                            "Velocidad de lectura 560MB/s",
                            "Tecnología V-NAND PRO",
                            isRaid1 ? "Optimizado para RAID 1" : "Ideal RAID 0",
                            "Samsung Magician Software",
                            "5 años de garantía"
                        ]
                    },
                    {
                        name: "Crucial P5 Plus NVMe SSD",
                        capacity: `${capacity}TB`,
                        price: (159.99 * capacity).toFixed(2),
                        features: [
                            "PCIe 4.0 NVMe",
                            isRaid1 ? "Alta durabilidad" : "Máximo rendimiento",
                            "Micron Advanced 3D NAND",
                            "Encryption AES 256-bit",
                            "5 años de garantía"
                        ]
                    },
                    {
                        name: "WD Black SN850X NVMe SSD",
                        capacity: `${capacity}TB`,
                        price: (179.99 * capacity).toFixed(2),
                        features: [
                            "PCIe Gen4 Technology",
                            isRaid1 ? "Fiabilidad empresarial" : "Gaming Grade",
                            "WD_BLACK Dashboard",
                            "Optimización térmica",
                            "5 años de garantía"
                        ]
                    }
                ];
            }

            return products.map(product => ({
                ...product,
                link: `https://amazon.com/${product.name.toLowerCase().replace(/ /g, '-')}`
            }));
        }

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

        function closeModal() {
            document.getElementById('infoModal').style.display = 'none';
        }

        // Gráfica de rendimiento en tiempo real
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

        // Función para actualizar las estadísticas en tiempo real
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

        // Función para calcular y mostrar métricas avanzadas
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

        // Manejador de eventos para el drag and drop de bloques
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

        // Función para actualizar la distribución de bloques
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

        // Función para simular operaciones de E/S
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

        // Inicialización y eventos periódicos
        window.onload = function() {
            calculateRAID();
            enableDragAndDrop();
            
            // Actualizaciones periódicas
            setInterval(updatePerformanceGraph, 1000);
            setInterval(updateRealTimeStats, 2000);
            setInterval(simulateIO, 3000);
        };

        // Evento para cerrar el modal al hacer clic fuera
        window.onclick = function(event) {
            const modal = document.getElementById('infoModal');
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        // Exportar configuración
        function exportConfiguration() {
            const config = {
                diskCount,
                stripeSize: 256,
                performance: performanceData,
                metrics: showAdvancedMetrics(),
                timestamp: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(config, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'raid0-configuration.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
}
        
    // Inicialización
    window.onload = function() {
        initializeDisks();
        calculateRAID();
        enableDragAndDrop();
        
        // Establecer la pestaña de simulación como activa por defecto
        switchTab('simulation');
        
        // Mostrar recomendaciones de productos con valores por defecto
        const defaultDiskType = document.getElementById('diskType').value;
        const defaultDiskCapacity = parseFloat(document.getElementById('diskCapacity').value);
        const defaultRaidType = document.getElementById('raidType').value;
        updateProductRecommendations(defaultDiskType, defaultDiskCapacity, defaultRaidType);
        
        // Actualizaciones periódicas
        setInterval(updatePerformanceGraph, 1000);
        setInterval(updateRealTimeStats, 2000);
        setInterval(simulateIO, 3000);
        
        // Inicializar los event listeners para las pestañas
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.getAttribute('onclick').match(/'(.*?)'/)[1];
                switchTab(tabName);
            });
        });
    };

    // Función switchTab actualizada para manejar recomendaciones de productos
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
        
        // Si es la pestaña de calculadora, recalcular los valores y mostrar recomendaciones
        if (tabName === 'calculator') {
            calculateRAID();
            // Obtener valores actuales para las recomendaciones
            const diskType = document.getElementById('diskType').value;
            const diskCapacity = parseFloat(document.getElementById('diskCapacity').value);
            const raidType = document.getElementById('raidType').value;
            updateProductRecommendations(diskType, diskCapacity, raidType);
        }
        
        // Si es la pestaña de rendimiento, iniciar las actualizaciones
        if (tabName === 'performance') {
            updatePerformanceGraph();
            updateRealTimeStats();
        }
    }

    // Asegurar que la función resetSimulation existe
    function resetSimulation() {
        isSimulatingFailure = false;
        const disks = document.getElementsByClassName('disk');
        Array.from(disks).forEach(disk => {
            disk.classList.remove('failed');
        });
        initializeDisks();
        updateStats();
    }