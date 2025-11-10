const shipsTableBody = document.querySelector('#shipsTable tbody');
const cargoTableBody = document.querySelector('#cargoTable tbody');
const berthTableBody = document.querySelector('#berthTable tbody');

const shipSelects = {
    cargo: document.querySelector('#cargoShip'),
    berth: document.querySelector('#berthShip')
};

const statShips = document.getElementById('statShips');
const statShipsDetail = document.getElementById('statShipsDetail');
const statCargo = document.getElementById('statCargo');
const statCargoDetail = document.getElementById('statCargoDetail');
const statBerths = document.getElementById('statBerths');
const statBerthsDetail = document.getElementById('statBerthsDetail');
const lastUpdated = document.getElementById('lastUpdated');

const shipModal = new bootstrap.Modal('#registerShipModal');
const cargoModal = new bootstrap.Modal('#assignCargoModal');
const berthModal = new bootstrap.Modal('#scheduleBerthModal');

document.getElementById('shipSubmitBtn').addEventListener('click', handleShipSubmit);
document.getElementById('cargoSubmitBtn').addEventListener('click', handleCargoSubmit);
document.getElementById('berthSubmitBtn').addEventListener('click', handleBerthSubmit);

const state = {
    ships: [
        { id: 1, name: 'Evergreen Aurora', imo: 'IMO1234567', capacityTeu: 20000, status: 'ARRIVED' },
        { id: 2, name: 'Pacific Trader', imo: 'IMO2345678', capacityTeu: 8500, status: 'AT SEA' },
        { id: 3, name: 'Harbor Breeze', imo: 'IMO3456789', capacityTeu: 12000, status: 'SCHEDULED' }
    ],
    cargo: [
        { id: 1, description: 'Electronics batch A', weight: 4500.5, destination: '上海', shipId: null },
        { id: 2, description: 'Automotive parts', weight: 7800.0, destination: '洛杉矶', shipId: null },
        { id: 3, description: 'Frozen seafood', weight: 3200.75, destination: '东京', shipId: 1 }
    ],
    berths: [
        {
            id: 1,
            shipId: 1,
            shipName: 'Evergreen Aurora',
            berthNumber: 'B-12',
            arrival: '2025-05-01T08:00',
            departure: '2025-05-02T02:00',
            status: 'CONFIRMED'
        },
        {
            id: 2,
            shipId: 3,
            shipName: 'Harbor Breeze',
            berthNumber: 'A-03',
            arrival: '2025-05-03T14:30',
            departure: null,
            status: 'PLANNED'
        }
    ]
};

function refreshAll() {
    renderShips();
    renderCargo();
    renderBerths();
    renderStats();
    populateShipSelects();
    updateTimestamp();
}

function renderShips() {
    shipsTableBody.innerHTML = '';
    state.ships.forEach((ship) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-muted">${ship.id}</td>
            <td class="fw-semibold">${ship.name}</td>
            <td>${ship.imo}</td>
            <td>${ship.capacityTeu.toLocaleString()}</td>
            <td><span class="badge rounded-pill bg-${statusTint(ship.status)}">${statusLabel(ship.status)}</span></td>
        `;
        shipsTableBody.appendChild(row);
    });
}

function renderCargo() {
    cargoTableBody.innerHTML = '';
    state.cargo.forEach((item) => {
        const statusInfo = item.shipId ? `已分配至船舶 #${item.shipId}` : '待分配';
        const statusClass = item.shipId ? 'success' : 'warning text-dark';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-muted">${item.id}</td>
            <td class="fw-semibold">${item.description}</td>
            <td>${item.weight.toFixed(2)}</td>
            <td>${item.destination}</td>
            <td><span class="badge rounded-pill bg-${statusClass}">${statusInfo}</span></td>
        `;
        cargoTableBody.appendChild(row);
    });
}

function renderBerths() {
    berthTableBody.innerHTML = '';
    state.berths.forEach((item) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-muted">${item.id}</td>
            <td class="fw-semibold">${item.shipName}</td>
            <td>${item.berthNumber}</td>
            <td>${formatDateTime(item.arrival)}</td>
            <td>${item.departure ? formatDateTime(item.departure) : '<span class="text-muted">待定</span>'}</td>
            <td><span class="badge rounded-pill bg-${statusTint(item.status)}">${statusLabel(item.status)}</span></td>
        `;
        berthTableBody.appendChild(row);
    });
}

function renderStats() {
    const activeCount = state.ships.filter((ship) => ship.status !== 'AT SEA').length;
    statShips.textContent = state.ships.length.toString();
    statShipsDetail.textContent = `${activeCount} 艘正在港区`;

    const pendingCargo = state.cargo.filter((item) => !item.shipId).length;
    statCargo.textContent = pendingCargo.toString();
    statCargoDetail.textContent = `${state.cargo.length - pendingCargo} 件已分配`;

    statBerths.textContent = state.berths.length.toString();
    const confirmed = state.berths.filter((item) => item.status === 'CONFIRMED').length;
    statBerthsDetail.textContent = `${confirmed} 条已确认，${state.berths.length - confirmed} 条待执行`;
}

function populateShipSelects() {
    Object.values(shipSelects).forEach((select) => {
        select.innerHTML = '';
        state.ships.forEach((ship) => {
            const option = document.createElement('option');
            option.value = ship.id;
            option.textContent = `#${ship.id} · ${ship.name}`;
            select.appendChild(option);
        });
    });
}

function handleShipSubmit() {
    const name = document.getElementById('shipName').value.trim();
    const imo = document.getElementById('shipImo').value.trim();
    const capacity = Number(document.getElementById('shipCapacity').value);
    const status = document.getElementById('shipStatus').value;
    if (!name || !imo || Number.isNaN(capacity)) {
        return;
    }
    const nextId = state.ships.length ? Math.max(...state.ships.map((s) => s.id)) + 1 : 1;
    state.ships.push({ id: nextId, name, imo, capacityTeu: capacity, status });
    shipModal.hide();
    document.getElementById('registerShipForm').reset();
    refreshAll();
}

function handleCargoSubmit() {
    const description = document.getElementById('cargoDescription').value.trim();
    const weight = Number(document.getElementById('cargoWeight').value);
    const destination = document.getElementById('cargoDestination').value.trim();
    const shipId = Number(document.getElementById('cargoShip').value);
    if (!description || Number.isNaN(weight) || !destination) {
        return;
    }
    const nextId = state.cargo.length ? Math.max(...state.cargo.map((c) => c.id)) + 1 : 1;
    state.cargo.push({ id: nextId, description, weight, destination, shipId });
    cargoModal.hide();
    document.getElementById('assignCargoForm').reset();
    refreshAll();
}

function handleBerthSubmit() {
    const shipId = Number(document.getElementById('berthShip').value);
    const berthNumber = document.getElementById('berthNumber').value.trim();
    const status = document.getElementById('berthStatus').value;
    const arrival = document.getElementById('arrivalTime').value;
    const departure = document.getElementById('departureTime').value || null;
    if (!shipId || !berthNumber || !arrival) {
        return;
    }
    const ship = state.ships.find((s) => s.id === shipId);
    const nextId = state.berths.length ? Math.max(...state.berths.map((b) => b.id)) + 1 : 1;
    state.berths.push({
        id: nextId,
        shipId,
        shipName: ship ? ship.name : `船舶 ${shipId}`,
        berthNumber,
        arrival,
        departure,
        status
    });
    berthModal.hide();
    document.getElementById('scheduleBerthForm').reset();
    refreshAll();
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
            return '在航';
        case 'SCHEDULED':
            return '计划中';
        case 'PLANNED':
            return '计划';
        case 'CONFIRMED':
            return '已确认';
        case 'DELAYED':
            return '延迟';
        default:
            return status;
    }
}

function formatDateTime(isoString) {
    if (!isoString) {
        return '';
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

function updateTimestamp() {
    const now = new Date();
    lastUpdated.textContent = `更新于 ${now.toLocaleString('zh-CN')}`;
}

refreshAll();
