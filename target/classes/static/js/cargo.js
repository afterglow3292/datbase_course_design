class CargoTable {
    constructor(selector) {
        this.endpoint = '/api/cargo';
        this.tableBody = document.querySelector(`${selector} tbody`);
        if (!this.tableBody) {
            return;
        }
        this.loadCargo();
    }

    async loadCargo() {
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
        return `${value.toFixed(2)}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ['#cargoManagementTable', '#cargoTable'].forEach((selector) => {
        new CargoTable(selector);
    });
});
