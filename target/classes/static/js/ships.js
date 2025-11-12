console.log('ships.js loaded');
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
                    <td colspan="6" class="text-danger">无法加载船舶数据，请稍后重试。</td>
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
                <td>${ship.type ?? '-'}</td>
                <td>${this.formatCapacity(ship.capacityTeu)}</td>
                <td>${this.renderStatus(ship.status)}</td>
            `;

            const actionCell = document.createElement('td');
            actionCell.className = 'text-end';
            actionCell.innerHTML = `
                <button class="btn btn-sm btn-outline-primary me-1" disabled>编辑</button>
                <button class="btn btn-sm btn-outline-danger" disabled>退役</button>
            `;

            if (row.children.length < 7) {
                row.appendChild(actionCell);
            }

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
            name: form.elements.name.value.trim(),
            imo: form.elements.imo.value.trim(),
            capacityTeu: Number(form.elements.capacityTeu.value),
            status: form.elements.status.value
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

document.addEventListener('DOMContentLoaded', () => {
    const tables = ['#shipManagementTable', '#shipsTable']
        .map((selector) => new ShipTable(selector))
        .filter((table) => table.isActive);
    setupCreateShipForm(tables);
});
