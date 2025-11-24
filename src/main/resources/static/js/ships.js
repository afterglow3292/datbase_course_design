console.log('ships.js loaded');

let currentEditingShipId = null;
let shipTables = [];

class ShipTable {
    constructor(selector) {
        this.endpoint = '/api/ships';
        this.tableBody = document.querySelector(`${selector} tbody`);
        this.isActive = Boolean(this.tableBody);
        if (this.isActive) {
            this.loadShips();
        }
    }

    async loadShips() {
        if (!this.isActive) {
            return;
        }
        try {
            const response = await fetch(this.endpoint);
            if (!response.ok) {
                throw new Error(`加载船舶数据失败：${response.status}`);
            }
            const ships = await response.json();
            this.render(ships);
        } catch (error) {
            console.error(error);
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-danger">无法加载船舶数据，请稍后重试。</td>
                </tr>
            `;
        }
    }

    render(ships) {
        this.tableBody.innerHTML = '';
        ships.forEach((ship) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-muted">${ship.id ?? '-'}</td>
                <td class="fw-semibold">${ship.name ?? '-'}</td>
                <td>${ship.imo ?? '-'}</td>
                <td>${this.formatCapacity(ship.capacityTeu)}</td>
                <td>${this.renderStatus(ship.status)}</td>
            `;

            const actionCell = document.createElement('td');
            actionCell.className = 'text-end';
            actionCell.innerHTML = `
                <button class="btn btn-sm btn-outline-primary me-1">编辑</button>
                <button class="btn btn-sm btn-outline-danger">删除</button>
            `;
            row.appendChild(actionCell);

            const editBtn = actionCell.querySelector('.btn-outline-primary');
            editBtn.addEventListener('click', () => openEditShipModal(ship));

            const deleteBtn = actionCell.querySelector('.btn-outline-danger');
            deleteBtn.addEventListener('click', () => handleDeleteShip(ship.id));

            this.tableBody.appendChild(row);
        });
    }

    renderStatus(status) {
        const map = {
            ARRIVED: '<span class="badge bg-success-subtle text-success">已到港</span>',
            'AT SEA': '<span class="badge bg-warning-subtle text-warning">在航</span>',
            AT_SEA: '<span class="badge bg-warning-subtle text-warning">在航</span>',
            SCHEDULED: '<span class="badge bg-info-subtle text-info">计划</span>'
        };
        return map[status] || status || '-';
    }

    formatCapacity(value) {
        if (typeof value !== 'number') {
            return '-';
        }
        return value.toLocaleString();
    }
}

function setupCreateShipForm(shipTables) {
    const form = document.getElementById('createShipForm');
    const modalElement = document.getElementById('createShipModal');
    if (!form) {
        return;
    }

    const submitBtn = modalElement?.querySelector('.modal-footer .btn.btn-primary');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => form.requestSubmit());
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = {
            name: form.elements.name?.value?.trim() ?? '',
            imo: form.elements.imo?.value?.trim() ?? '',
            capacityTeu: Number(form.elements.capacityTeu?.value),
            status: form.elements.status?.value ?? 'ARRIVED'
        };

        if (!payload.name || !payload.imo || Number.isNaN(payload.capacityTeu)) {
            alert('请完整填写船名、IMO 和容量信息');
            return;
        }

        try {
            const response = await fetch('/api/ships', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
            form.reset();
            if (modalElement && window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal?.hide();
            }
            await Promise.all(shipTables.map((table) => table.loadShips()));
        } catch (error) {
            console.error(error);
            alert('创建船舶失败，请稍后重试。');
        }
    });
}

function openEditShipModal(ship) {
    const form = document.getElementById('editShipForm');
    const modalElement = document.getElementById('editShipModal');
    if (!form || !modalElement) {
        return;
    }

    const textInputs = form.querySelectorAll('input[type="text"]');
    const capacityInput = form.querySelector('input[type="number"]');
    const statusSelect = form.querySelector('select');

    if (textInputs[0]) {
        textInputs[0].value = ship.name ?? '';
    }
    if (textInputs[1]) {
        textInputs[1].value = ship.imo ?? '';
    }
    if (capacityInput) {
        capacityInput.value = ship.capacityTeu ?? '';
    }
    if (statusSelect) {
        statusSelect.value = ship.status ?? 'ARRIVED';
    }

    currentEditingShipId = ship.id;

    if (window.bootstrap) {
        window.bootstrap.Modal.getOrCreateInstance(modalElement).show();
    }
}

function setupEditShipForm(shipTables) {
    const form = document.getElementById('editShipForm');
    const modalElement = document.getElementById('editShipModal');
    if (!form || !modalElement) {
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!currentEditingShipId) {
            return;
        }

        const textInputs = form.querySelectorAll('input[type="text"]');
        const capacityInput = form.querySelector('input[type="number"]');
        const statusSelect = form.querySelector('select');

        const payload = {
            name: textInputs[0]?.value?.trim() ?? '',
            imo: textInputs[1]?.value?.trim() ?? '',
            capacityTeu: capacityInput ? Number(capacityInput.value) : 0,
            status: statusSelect?.value ?? 'ARRIVED'
        };

        if (!payload.name || !payload.imo || Number.isNaN(payload.capacityTeu)) {
            alert('请完整填写船名、IMO 和容量信息');
            return;
        }

        try {
            const response = await fetch(`/api/ships/${currentEditingShipId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(await response.text());
            }
            if (window.bootstrap) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal?.hide();
            }
            currentEditingShipId = null;
            await Promise.all(shipTables.map((table) => table.loadShips()));
        } catch (error) {
            console.error(error);
            alert('更新船舶失败，请稍后重试。');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    shipTables = ['#shipManagementTable', '#shipsTable']
        .map((selector) => new ShipTable(selector))
        .filter((table) => table.isActive);
    setupCreateShipForm(shipTables);
    setupEditShipForm(shipTables);
});

async function handleDeleteShip(shipId) {
    if (!shipId) {
        return;
    }
    const confirmed = window.confirm('确认删除该船舶吗？此操作无法撤销。');
    if (!confirmed) {
        return;
    }
    try {
        const response = await fetch(`/api/ships/${shipId}`, { method: 'DELETE' });
        if (!response.ok) {
            const msg = await response.text();
            if (response.status === 409 || response.status === 400) {
                alert('删除失败：该船舶存在关联的货物或泊位记录，请先解除关联后再删除。');
                return;
            }
            throw new Error(msg);
        }
        await Promise.all(shipTables.map((table) => table.loadShips()));
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.message) {
            alert(`删除船舶失败：${error.message}`);
        } else {
            alert('删除船舶失败，请稍后重试。');
        }
    }
}
