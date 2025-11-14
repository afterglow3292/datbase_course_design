class CargoTable {
    constructor(selector) {
        this.endpoint = '/api/cargo';
        this.tableBody = document.querySelector(`${selector} tbody`);
        this.isActive = Boolean(this.tableBody);
        if (this.isActive) {
            this.loadCargo();
        }
    }

    async loadCargo() {
        if (!this.isActive) {
            return;
        }
        try {
            const response = await fetch(this.endpoint);
            if (!response.ok) {
                throw new Error(`加载货物失败：${response.status}`);
            }
            const data = await response.json();
            this.render(data);
        } catch (error) {
            console.error(error);
            this.tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-danger">无法加载货物数据，请稍后重试。</td>
                </tr>
            `;
        }
    }

    render(items) {
        this.tableBody.innerHTML = '';
        items.forEach((item) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-muted">${item.id ?? '-'}</td>
                <td class="fw-semibold">${item.description ?? '-'}</td>
                <td>${this.formatWeight(item.weight)}</td>
                <td>${item.destination ?? '-'}</td>
                <td>${this.resolveShip(item.shipId)}</td>
                <td>${this.renderStatus(item.shipId)}</td>
            `;

            const actionCell = document.createElement('td');
            actionCell.className = 'text-end';
            actionCell.innerHTML = `
                <button class="btn btn-sm btn-outline-primary me-1" disabled>编辑</button>
                <button class="btn btn-sm btn-outline-danger" disabled>删除</button>
            `;

            if (row.children.length < 7) {
                row.appendChild(actionCell);
            }

            this.tableBody.appendChild(row);
        });
    }

    renderStatus(shipId) {
        if (shipId == null) {
            return '<span class="badge bg-warning-subtle text-warning">待分配</span>';
        }
        return '<span class="badge bg-success-subtle text-success">已分配</span>';
    }

    resolveShip(shipId) {
        if (shipId == null) {
            return '待分配';
        }
        return `船舶 #${shipId}`;
    }

    formatWeight(value) {
        if (typeof value !== 'number') {
            return '-';
        }
        return value.toFixed(2);
    }
}

async function populateShipOptions() {
    const select = document.querySelector('#createCargoModal select[name="shipId"]');
    if (!select) {
        return;
    }
    select.innerHTML = '<option value="">暂不分配</option>';
    try {
        const resp = await fetch('/api/ships');
        if (!resp.ok) {
            throw new Error('加载船舶列表失败');
        }
        const ships = await resp.json();
        ships.forEach((ship) => {
            const option = document.createElement('option');
            option.value = ship.id;
            option.textContent = `#${ship.id} · ${ship.name}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error(error);
        select.innerHTML = '<option value="">无法获取船舶列表</option>';
    }
}

function setupCreateCargoForm(tables) {
    const form = document.getElementById('createCargoForm');
    const modalElement = document.getElementById('createCargoModal');
    if (!form) {
        return;
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = {
            description: form.elements.description.value.trim(),
            weight: Number(form.elements.weight.value),
            destination: form.elements.destination.value.trim(),
            shipId: form.elements.shipId.value ? Number(form.elements.shipId.value) : null
        };

        if (!payload.description || !payload.destination || Number.isNaN(payload.weight)) {
            alert('请完整填写描述、目的地与重量');
            return;
        }

        try {
            const response = await fetch('/api/cargo', {
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
            await Promise.all(tables.map((table) => table.loadCargo()));
        } catch (error) {
            console.error(error);
            alert('创建货物失败，请稍后重试。');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const tables = ['#cargoManagementTable', '#cargoTable']
        .map((selector) => new CargoTable(selector))
        .filter((table) => table.isActive);
    setupCreateCargoForm(tables);
    populateShipOptions();
});
