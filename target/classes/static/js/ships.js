class ShipManager {
    constructor() {
        this.tableBody = document.querySelector('#shipManagementTable tbody');
        this.ships = [
            { id: 1, name: '海洋之星', imo: 'IMO1234567', type: '集装箱', capacity: 20000, status: 'ARRIVED' },
            { id: 2, name: '东方快车', imo: 'IMO2345678', type: '散货', capacity: 8500, status: 'AT SEA' },
            { id: 3, name: '北方巨人', imo: 'IMO3456789', type: '油轮', capacity: 12000, status: 'SCHEDULED' }
        ];
        this.render();
    }

    render() {
        this.tableBody.innerHTML = '';
        this.ships.forEach((ship) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-muted">${ship.id}</td>
                <td class="fw-semibold">${ship.name}</td>
                <td>${ship.imo}</td>
                <td>${ship.type}</td>
                <td>${ship.capacity.toLocaleString()}</td>
                <td>${this.renderStatus(ship.status)}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1">编辑</button>
                    <button class="btn btn-sm btn-outline-danger">退役</button>
                </td>
            `;
            this.tableBody.appendChild(row);
        });
    }

    renderStatus(status) {
        const map = {
            ARRIVED: '<span class="badge bg-success-subtle text-success">已到港</span>',
            AT SEA: '<span class="badge bg-warning-subtle text-warning">在航</span>',
            SCHEDULED: '<span class="badge bg-info-subtle text-info">计划</span>'
        };
        return map[status] || status;
    }
}

if (document.querySelector('#shipManagementTable')) {
    new ShipManager();
}
