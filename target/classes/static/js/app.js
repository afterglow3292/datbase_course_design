console.log('index app.js loaded');

// ========== 通用登录状态和退出登录功能 ==========
function initAuthUI() {
    const currentUserEl = document.getElementById('currentUser');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // 显示当前用户 - 从localStorage读取user对象
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (currentUserEl) {
        currentUserEl.textContent = user ? `欢迎，${user.username}` : '未登录';
    }
    
    // 退出登录按钮事件
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('确定要退出登录吗？')) {
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        });
    }
}

// 页面加载时初始化认证UI
document.addEventListener('DOMContentLoaded', initAuthUI);

// 只在首页(index.html)初始化这些元素
const shipsTableBody = document.querySelector('#shipsTable tbody');
const cargoTableBody = document.querySelector('#cargoTable tbody');
const berthTableBody = document.querySelector('#berthTable tbody');
const voyageTableBody = document.querySelector('#voyageTable tbody');
const warehouseTableBody = document.querySelector('#warehouseTable tbody');

// 检查是否在首页
const isIndexPage = shipsTableBody || cargoTableBody || berthTableBody;

const statShips = document.getElementById('statShips');
const statShipsDetail = document.getElementById('statShipsDetail');
const statCargo = document.getElementById('statCargo');
const statCargoDetail = document.getElementById('statCargoDetail');
const statBerths = document.getElementById('statBerths');
const statBerthsDetail = document.getElementById('statBerthsDetail');
const lastUpdated = document.getElementById('lastUpdated');

// 限制显示条数
const MAX_DISPLAY_ROWS = 10;

let ships = [];
let cargo = [];
let berths = [];
let voyages = [];
let warehouses = [];

async function loadAll() {
    try {
        const [shipsResp, cargoResp, berthsResp, voyagesResp, warehousesResp] = await Promise.all([
            fetch('/api/ships'),
            fetch('/api/cargo'),
            fetch('/api/berths'),
            fetch('/api/voyages'),
            fetch('/api/warehouses')
        ]);
        if (!shipsResp.ok || !cargoResp.ok || !berthsResp.ok) {
            throw new Error('加载数据失败');
        }
        ships = await shipsResp.json();
        cargo = await cargoResp.json();
        berths = await berthsResp.json();
        voyages = voyagesResp.ok ? await voyagesResp.json() : [];
        warehouses = warehousesResp.ok ? await warehousesResp.json() : [];
        renderAll();
    } catch (error) {
        console.error(error);
        showLoadError();
    }
}

function renderAll() {
    renderShips();
    renderCargo();
    renderBerths();
    renderVoyages();
    renderWarehouses();
    renderStats();
    updateTimestamp();
}

function renderShips() {
    if (!shipsTableBody) return;
    shipsTableBody.innerHTML = '';
    ships.slice(0, MAX_DISPLAY_ROWS).forEach((ship) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-muted">${ship.id ?? '-'}</td>
            <td class="fw-semibold">${ship.name ?? '-'}</td>
            <td>${ship.imo ?? '-'}</td>
            <td>${ship.capacityTeu?.toLocaleString() ?? '-'}</td>
            <td><span class="badge rounded-pill bg-${statusTint(ship.status)}">${statusLabel(ship.status)}</span></td>
        `;
        shipsTableBody.appendChild(row);
    });
}

function renderCargo() {
    if (!cargoTableBody) return;
    cargoTableBody.innerHTML = '';
    cargo.slice(0, MAX_DISPLAY_ROWS).forEach((item) => {
        const statusInfo = item.shipId ? `已分配至 #${item.shipId}` : '待分配';
        const statusClass = item.shipId ? 'success' : 'warning text-dark';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-muted">${item.id ?? '-'}</td>
            <td class="fw-semibold">${item.description ?? '-'}</td>
            <td>${item.weight?.toFixed?.(2) ?? '-'}</td>
            <td>${item.destination ?? '-'}</td>
            <td><span class="badge rounded-pill bg-${statusClass}">${statusInfo}</span></td>
        `;
        cargoTableBody.appendChild(row);
    });
}

function renderBerths() {
    if (!berthTableBody) return;
    berthTableBody.innerHTML = '';
    berths.slice(0, MAX_DISPLAY_ROWS).forEach((item) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-muted">${item.id ?? '-'}</td>
            <td class="fw-semibold">${resolveShipName(item.shipId)}</td>
            <td>${item.berthNumber ?? '-'}</td>
            <td>${formatDateTime(item.arrivalTime ?? item.arrival)}</td>
            <td>${item.departureTime ? formatDateTime(item.departureTime) : '<span class="text-muted">待定</span>'}</td>
            <td><span class="badge rounded-pill bg-${statusTint(item.status)}">${statusLabel(item.status)}</span></td>
        `;
        berthTableBody.appendChild(row);
    });
}

function renderVoyages() {
    if (!voyageTableBody) return;
    voyageTableBody.innerHTML = '';
    voyages.slice(0, MAX_DISPLAY_ROWS).forEach((item) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-muted">${item.planId ?? item.id ?? '-'}</td>
            <td class="fw-semibold">${item.voyageNumber ?? '-'}</td>
            <td>${resolveShipName(item.shipId)}</td>
            <td>${item.departurePort ?? '-'}</td>
            <td>${item.arrivalPort ?? '-'}</td>
            <td>${formatDateTime(item.plannedDeparture ?? item.departureTime)}</td>
            <td><span class="badge rounded-pill bg-${voyageStatusTint(item.voyageStatus ?? item.status)}">${voyageStatusLabel(item.voyageStatus ?? item.status)}</span></td>
        `;
        voyageTableBody.appendChild(row);
    });
}

function renderWarehouses() {
    if (!warehouseTableBody) return;
    warehouseTableBody.innerHTML = '';
    warehouses.slice(0, MAX_DISPLAY_ROWS).forEach((item) => {
        const capacity = item.totalCapacity ?? item.capacity ?? 0;
        const used = item.usedCapacity ?? 0;
        const usageRate = capacity > 0 ? ((used / capacity) * 100).toFixed(1) : 0;
        const usageClass = usageRate > 80 ? 'danger' : usageRate > 50 ? 'warning' : 'success';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-muted">${item.warehouseId ?? item.id ?? '-'}</td>
            <td class="fw-semibold">${item.warehouseName ?? item.name ?? '-'}</td>
            <td>${warehouseTypeLabel(item.warehouseType ?? item.type)}</td>
            <td>${capacity?.toLocaleString() ?? '-'} m³</td>
            <td>${used?.toLocaleString() ?? '0'} m³</td>
            <td><span class="badge rounded-pill bg-${usageClass}">${usageRate}%</span></td>
        `;
        warehouseTableBody.appendChild(row);
    });
}

function voyageStatusTint(status) {
    switch (status) {
        case 'COMPLETED': return 'success';
        case 'IN_PROGRESS': return 'primary';
        case 'SCHEDULED': return 'info';
        case 'CANCELLED': return 'danger';
        default: return 'secondary';
    }
}

function voyageStatusLabel(status) {
    switch (status) {
        case 'COMPLETED': return '已完成';
        case 'IN_PROGRESS': return '进行中';
        case 'SCHEDULED': return '计划中';
        case 'CANCELLED': return '已取消';
        default: return status ?? '-';
    }
}

function warehouseTypeLabel(type) {
    switch (type) {
        case 'GENERAL': 
        case '普通仓库': 
            return '普通仓库';
        case 'COLD_STORAGE': 
        case 'COLD': 
        case '冷藏仓库': 
            return '冷藏仓库';
        case 'HAZARDOUS': 
        case 'DANGEROUS': 
        case '危险品仓库': 
            return '危险品仓库';
        case 'CONTAINER': 
        case '集装箱堆场': 
            return '集装箱堆场';
        default: return type ?? '-';
    }
}

function renderStats() {
    if (statShips) statShips.textContent = ships.length.toString();
    if (statShipsDetail) {
        const inPort = ships.filter((s) => s.status === 'ARRIVED' || s.status === 'CONFIRMED').length;
        statShipsDetail.textContent = `${inPort} 艘在港/已确认`;
    }

    if (statCargo) {
        const pendingCargo = cargo.filter((c) => !c.shipId).length;
        statCargo.textContent = cargo.length.toString();
        if (statCargoDetail) statCargoDetail.textContent = `${pendingCargo} 件待分配`;
    }

    if (statBerths) {
        const confirmed = berths.filter((b) => b.status === 'CONFIRMED').length;
        statBerths.textContent = berths.length.toString();
        if (statBerthsDetail) statBerthsDetail.textContent = `${confirmed} 条已确认`;
    }
}

function updateTimestamp() {
    if (!lastUpdated) return;
    const now = new Date();
    lastUpdated.textContent = `更新于 ${now.toLocaleString('zh-CN')}`;
}

function showLoadError() {
    [shipsTableBody, cargoTableBody, berthTableBody, voyageTableBody, warehouseTableBody].forEach((tbody) => {
        if (tbody) {
            tbody.innerHTML = `<tr><td class="text-danger" colspan="7">加载失败</td></tr>`;
        }
    });
}

function resolveShipName(shipId) {
    if (shipId == null) return '-';
    const ship = ships.find((s) => s.id === shipId);
    return ship ? ship.name : `船舶 #${shipId}`;
}

function statusTint(status) {
    switch (status) {
        case 'ARRIVED':
        case 'CONFIRMED':
            return 'success';
        case 'AT SEA':
        case 'PLANNED':
            return 'primary';
        case 'SCHEDULED':
            return 'info';
        case 'DELAYED':
            return 'danger';
        default:
            return 'secondary';
    }
}

function statusLabel(status) {
    switch (status) {
        case 'ARRIVED':
            return '已到港';
        case 'AT SEA':
        case 'AT_SEA':
            return '在航';
        case 'SCHEDULED':
        case 'PLANNED':
            return '计划';
        case 'CONFIRMED':
            return '已确认';
        case 'DELAYED':
            return '延迟';
        default:
            return status ?? '-';
    }
}

function formatDateTime(isoString) {
    if (!isoString) {
        return '-';
    }
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 只在首页加载数据
document.addEventListener('DOMContentLoaded', () => {
    if (isIndexPage) {
        console.log('首页检测到，加载数据...');
        loadAll();
    } else {
        console.log('非首页，跳过app.js数据加载');
    }
});
